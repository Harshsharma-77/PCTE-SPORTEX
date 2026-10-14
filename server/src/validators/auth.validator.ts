import { z } from 'zod';
import { Gender } from '@prisma/client';

export const loginSchema = z.object({
  body: z.object({
    identifier: z.string().min(1, 'Email or Roll Number is required'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

export const registerStudentSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Full name must be at least 2 characters long').max(100),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters long')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    rollNumber: z.string().min(3, 'Roll Number must be at least 3 characters long').max(20),
    department: z.string().min(2, 'Department is required (e.g. CSE, IT, ME, BBA, BPHARM)'),
    batchYear: z.number().int().min(2015).max(2035),
    semester: z.number().int().min(1).max(8),
    gender: z.nativeEnum(Gender).default(Gender.MALE),
    phone: z.string().optional(),
    bloodGroup: z.string().optional(),
    emergencyContact: z.string().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z
    .object({
      currentPassword: z.string().min(1, 'Current password is required'),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters long')
        .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'New password must contain at least one number'),
      confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'New passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Please provide a valid email address'),
  }),
});

export const resetPasswordSchema = z.object({
  body: z
    .object({
      token: z.string().min(1, 'Reset token is required'),
      newPassword: z
        .string()
        .min(8, 'New password must be at least 8 characters long')
        .regex(/[A-Z]/, 'New password must contain at least one uppercase letter')
        .regex(/[0-9]/, 'New password must contain at least one number'),
      confirmPassword: z.string().min(1, 'Password confirmation is required'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});
