import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { CertificateType } from '@prisma/client';
import { NotificationService } from './notification.service';
import crypto from 'crypto';

export class CertificateService {
  /**
   * 1. Generate & Issue Official Digital Certificate
   */
  static async generateCertificate(
    _issuedByUserId: string,
    data: {
      studentId: string;
      tournamentId: string;
      sportId: string;
      type: CertificateType;
      title: string;
      achievement: string;
      issuedByAdmin?: string;
    }
  ) {
    const student = await prisma.student.findUnique({
      where: { id: data.studentId },
      include: { user: true },
    });
    if (!student) throw new AppError('Student athlete not found.', 404);

    const tournament = await prisma.tournament.findUnique({
      where: { id: data.tournamentId },
      include: { sport: true },
    });
    if (!tournament) throw new AppError('Tournament not found.', 404);

    // Auto-generate Unique Certificate Number: SPORTEX/2026/SPORT/XXXX
    const sportCode = (tournament.sport.name.slice(0, 3)).toUpperCase();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const certificateNo = `SPORTEX/2026/${sportCode}/${randomSuffix}`;

    // Auto-generate UUID verification token
    const verificationUuid = crypto.randomUUID();

    const certificate = await prisma.certificate.create({
      data: {
        certificateNo,
        verificationUuid,
        studentId: data.studentId,
        tournamentId: data.tournamentId,
        sportId: data.sportId || tournament.sportId,
        type: data.type || CertificateType.PARTICIPATION,
        title: data.title,
        achievement: data.achievement,
        issuedByAdmin: data.issuedByAdmin || 'PCTE Director of Sports',
      },
      include: {
        student: { include: { user: { select: { name: true, email: true } } } },
        tournament: { select: { name: true } },
        sport: { select: { name: true } },
      },
    });

    // Send in-app notification to student
    try {
      await NotificationService.createNotification(student.userId, {
        title: '🏆 New Certificate Awarded!',
        message: `You have been issued a Certificate of ${certificate.type} for ${tournament.name} (${tournament.sport.name}).`,
        type: 'CERTIFICATE',
        actionUrl: `/student/certificates`,
      });
    } catch (err) {
      console.warn('Failed to dispatch certificate notification:', err);
    }

    return certificate;
  }

  /**
   * 2. Verify Certificate (Public Zero-Auth Verification Portal)
   */
  static async verifyCertificate(identifier: string) {
    const certificate = await prisma.certificate.findFirst({
      where: {
        OR: [
          { verificationUuid: identifier },
          { certificateNo: identifier },
          { id: identifier },
        ],
      },
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true, avatarUrl: true } },
          },
        },
        tournament: {
          include: { sport: true },
        },
        sport: true,
      },
    });

    if (!certificate) {
      return {
        isValid: false,
        isRevoked: false,
        message: 'No certificate matching this ID or verification token was found on the official SPORTEX registry.',
        certificate: null,
      };
    }

    if (certificate.isRevoked) {
      return {
        isValid: false,
        isRevoked: true,
        message: 'This certificate has been revoked by the university sports directorate.',
        certificate: {
          certificateNo: certificate.certificateNo,
          title: certificate.title,
          studentName: certificate.student.user.name,
          revokedAt: certificate.createdAt,
        },
      };
    }

    return {
      isValid: true,
      isRevoked: false,
      message: 'Certificate successfully verified against official PostgreSQL institutional ledger.',
      certificate: {
        id: certificate.id,
        certificateNo: certificate.certificateNo,
        verificationUuid: certificate.verificationUuid,
        type: certificate.type,
        title: certificate.title,
        achievement: certificate.achievement,
        issueDate: certificate.issueDate,
        issuedByAdmin: certificate.issuedByAdmin,
        student: {
          name: certificate.student.user.name,
          rollNumber: certificate.student.rollNumber,
          department: certificate.student.department,
          batchYear: certificate.student.batchYear,
        },
        tournament: {
          name: certificate.tournament.name,
          academicYear: certificate.tournament.academicYear,
        },
        sport: {
          name: certificate.sport.name,
          category: certificate.sport.category,
        },
      },
      verifiedAt: new Date(),
    };
  }

  /**
   * 3. Get All Certificates (Admin Management)
   */
  static async getAllCertificates(filters?: {
    tournamentId?: string;
    sportId?: string;
    studentId?: string;
    type?: CertificateType;
  }) {
    const where: any = {};
    if (filters?.tournamentId) where.tournamentId = filters.tournamentId;
    if (filters?.sportId) where.sportId = filters.sportId;
    if (filters?.studentId) where.studentId = filters.studentId;
    if (filters?.type) where.type = filters.type;

    const certificates = await prisma.certificate.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { name: true, email: true } },
          },
        },
        tournament: { select: { id: true, name: true } },
        sport: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return certificates;
  }

  /**
   * 4. Revoke Certificate
   */
  static async revokeCertificate(certificateId: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });

    if (!cert) throw new AppError('Certificate not found.', 404);

    const revoked = await prisma.certificate.update({
      where: { id: certificateId },
      data: { isRevoked: true },
    });

    return revoked;
  }
}
