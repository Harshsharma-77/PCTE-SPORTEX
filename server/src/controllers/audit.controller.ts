import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service';

export class AuditController {
  static async getAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await AuditService.getAuditLogs(req.query as any);
      return res.status(200).json({
        success: true,
        data: logs,
      });
    } catch (error) {
      next(error);
    }
  }
}
