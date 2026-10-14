import { Request, Response, NextFunction } from 'express';
import { CertificateService } from '../services/certificate.service';

export class CertificateController {
  static async generateCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const certificate = await CertificateService.generateCertificate(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Certificate generated, signed, and registered successfully',
        data: certificate,
      });
    } catch (error) {
      next(error);
    }
  }

  static async verifyCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const identifier = req.params.identifier as string;
      const verification = await CertificateService.verifyCertificate(identifier);
      return res.status(200).json({
        success: true,
        data: verification,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllCertificates(req: Request, res: Response, next: NextFunction) {
    try {
      const certificates = await CertificateService.getAllCertificates(req.query as any);
      return res.status(200).json({
        success: true,
        data: certificates,
      });
    } catch (error) {
      next(error);
    }
  }

  static async revokeCertificate(req: Request, res: Response, next: NextFunction) {
    try {
      const certificateId = req.params.id as string;
      const revoked = await CertificateService.revokeCertificate(certificateId);
      return res.status(200).json({
        success: true,
        message: 'Certificate revoked from official ledger',
        data: revoked,
      });
    } catch (error) {
      next(error);
    }
  }
}
