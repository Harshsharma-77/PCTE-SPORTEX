import { prisma } from '../config/database';
import { hashPassword, comparePassword } from '../utils/password';
import {
  generateAccessToken,
  generateRefreshToken,
  generatePasswordResetToken,
  hashToken,
} from '../utils/token';
import { AppError } from '../middleware/error.middleware';
import { HTTP_STATUS } from '../constants';
import { UserRoleEnum, Gender } from '@prisma/client';

export interface RegisterStudentDTO {
  name: string;
  email: string;
  password: string;
  rollNumber: string;
  department: string;
  batchYear: number;
  semester: number;
  gender: Gender;
  phone?: string;
  bloodGroup?: string;
  emergencyContact?: string;
}

export class AuthService {
  /**
   * Register a new student athlete account with student profile.
   */
  static async registerStudent(data: RegisterStudentDTO, clientInfo?: { ip?: string; userAgent?: string }) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase().trim() },
    });
    if (existingEmail) {
      throw new AppError('An account with this email address already exists.', HTTP_STATUS.CONFLICT, 'DuplicateEmailError');
    }

    const existingRoll = await prisma.student.findUnique({
      where: { rollNumber: data.rollNumber.trim().toUpperCase() },
    });
    if (existingRoll) {
      throw new AppError('A student with this roll number is already registered.', HTTP_STATUS.CONFLICT, 'DuplicateRollNumberError');
    }

    // Fetch STUDENT role record
    const studentRole = await prisma.role.findUnique({
      where: { name: UserRoleEnum.STUDENT },
    });

    const passwordHash = await hashPassword(data.password);

    // Create User + Student in single transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase().trim(),
          passwordHash,
          name: data.name.trim(),
          roleId: studentRole?.id,
          roleEnum: UserRoleEnum.STUDENT,
          phone: data.phone,
          isVerified: true,
          student: {
            create: {
              rollNumber: data.rollNumber.trim().toUpperCase(),
              department: data.department.trim().toUpperCase(),
              batchYear: data.batchYear,
              semester: data.semester,
              gender: data.gender,
              bloodGroup: data.bloodGroup,
              emergencyContact: data.emergencyContact,
            },
          },
        },
        include: {
          student: true,
        },
      });

      // Log registration in Audit Trail
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'STUDENT_REGISTERED',
          entity: 'User',
          entityId: user.id,
          ipAddress: clientInfo?.ip,
          userAgent: clientInfo?.userAgent,
          changesDiff: { rollNumber: data.rollNumber, department: data.department },
        },
      });

      return user;
    });

    const accessToken = generateAccessToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.roleEnum,
      name: newUser.name,
    });

    const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: newUser.id,
        userAgent: clientInfo?.userAgent,
        ipAddress: clientInfo?.ip,
        expiresAt,
      },
    });

    return {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.roleEnum,
        student: newUser.student,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Authenticate user with either email or roll number.
   */
  static async login(
    identifier: string,
    plainPassword: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ) {
    const trimmed = identifier.trim().toLowerCase();

    // Check if identifier is email or roll number
    let user = await prisma.user.findUnique({
      where: { email: trimmed },
      include: {
        student: true,
        coach: true,
        referee: true,
        role: true,
      },
    });

    // If not found by email, check student roll number
    if (!user) {
      const student = await prisma.student.findUnique({
        where: { rollNumber: identifier.trim().toUpperCase() },
        include: {
          user: {
            include: {
              student: true,
              coach: true,
              referee: true,
              role: true,
            },
          },
        },
      });
      if (student?.user) {
        user = student.user;
      }
    }

    if (!user) {
      throw new AppError('Invalid credentials. Please check your email/roll number and password.', HTTP_STATUS.UNAUTHORIZED, 'InvalidCredentialsError');
    }

    const isPasswordValid = await comparePassword(plainPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials. Please check your email/roll number and password.', HTTP_STATUS.UNAUTHORIZED, 'InvalidCredentialsError');
    }

    if (!user.isActive) {
      throw new AppError('This user account has been deactivated. Please contact the administrator.', HTTP_STATUS.FORBIDDEN, 'AccountDeactivatedError');
    }

    // Update lastLoginAt
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.roleEnum,
      name: user.name,
    });

    const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash,
        userId: user.id,
        userAgent: clientInfo?.userAgent,
        ipAddress: clientInfo?.ip,
        expiresAt,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'USER_LOGIN',
        entity: 'User',
        entityId: user.id,
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
      },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.roleEnum,
        avatarUrl: user.avatarUrl,
        student: user.student,
        coach: user.coach,
        referee: user.referee,
      },
      accessToken,
      refreshToken,
    };
  }

  /**
   * Rotate Refresh Token and return new Access Token.
   */
  static async refreshSession(
    rawRefreshToken: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ) {
    const tokenHash = hashToken(rawRefreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken || storedToken.isRevoked || storedToken.expiresAt < new Date()) {
      throw new AppError('Invalid or expired refresh token. Please sign in again.', HTTP_STATUS.UNAUTHORIZED, 'InvalidRefreshTokenError');
    }

    if (!storedToken.user.isActive) {
      throw new AppError('Account deactivated.', HTTP_STATUS.FORBIDDEN, 'AccountDeactivatedError');
    }

    // Token rotation: Revoke old token
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // Issue new access and refresh tokens
    const accessToken = generateAccessToken({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      role: storedToken.user.roleEnum,
      name: storedToken.user.name,
    });

    const { token: newRefreshToken, tokenHash: newHash, expiresAt } = generateRefreshToken();
    await prisma.refreshToken.create({
      data: {
        tokenHash: newHash,
        userId: storedToken.user.id,
        userAgent: clientInfo?.userAgent,
        ipAddress: clientInfo?.ip,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Invalidate refresh token session on logout.
   */
  static async logout(rawRefreshToken?: string, userId?: string) {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } else if (userId) {
      await prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      });
    }

    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'USER_LOGOUT',
          entity: 'User',
          entityId: userId,
        },
      });
    }
  }

  /**
   * Get Current Authenticated User with profiles and granted permissions.
   */
  static async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        student: true,
        coach: true,
        referee: true,
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND, 'UserNotFoundError');
    }

    const permissions =
      user.role?.permissions.map((rp) => rp.permission.code) || [];

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.roleEnum,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      isVerified: user.isVerified,
      createdAt: user.createdAt,
      student: user.student,
      coach: user.coach,
      referee: user.referee,
      permissions,
    };
  }

  /**
   * Change user password securely.
   */
  static async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND, 'UserNotFoundError');
    }

    const isMatch = await comparePassword(currentPass, user.passwordHash);
    if (!isMatch) {
      throw new AppError('Current password entered is incorrect.', HTTP_STATUS.BAD_REQUEST, 'InvalidCurrentPasswordError');
    }

    const newHash = await hashPassword(newPass);

    // Update password and revoke all active sessions for security
    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
      }),
      prisma.refreshToken.updateMany({
        where: { userId, isRevoked: false },
        data: { isRevoked: true },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: 'PASSWORD_CHANGED',
          entity: 'User',
          entityId: userId,
        },
      }),
    ]);

    return { message: 'Password changed successfully. All previous sessions have been invalidated.' };
  }

  /**
   * Generate password reset token.
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success message to prevent user enumeration attacks
      return { message: 'If an account with that email exists, a password reset link has been sent.' };
    }

    const { token, tokenHash, expiresAt } = generatePasswordResetToken();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: tokenHash,
        passwordResetExpires: expiresAt,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'PASSWORD_RESET_REQUESTED',
        entity: 'User',
        entityId: user.id,
      },
    });

    return {
      message: 'Password reset token generated successfully.',
      // In development/demo environment, we provide the resetToken in the response for direct testing
      resetToken: token,
    };
  }

  /**
   * Reset password with valid token.
   */
  static async resetPassword(token: string, newPass: string) {
    const tokenHash = hashToken(token);

    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired.', HTTP_STATUS.BAD_REQUEST, 'InvalidResetTokenError');
    }

    const newHash = await hashPassword(newPass);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          passwordHash: newHash,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      }),
      prisma.refreshToken.updateMany({
        where: { userId: user.id, isRevoked: false },
        data: { isRevoked: true },
      }),
      prisma.auditLog.create({
        data: {
          userId: user.id,
          action: 'PASSWORD_RESET_COMPLETED',
          entity: 'User',
          entityId: user.id,
        },
      }),
    ]);

    return { message: 'Password has been successfully reset. You can now login with your new password.' };
  }
}
