import { Request, Response, NextFunction } from 'express';
import { StudentService } from '../services/student.service';

export class StudentController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const targetStudentId = req.query.studentId as string | undefined;

      const dashboardData = await StudentService.getStudentDashboard(userId, targetStudentId);
      return res.status(200).json({
        success: true,
        data: dashboardData,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const updated = await StudentService.updateStudentProfile(userId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Profile information updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markNotificationRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const notificationId = req.params.notificationId as string;
      const updated = await StudentService.markNotificationRead(userId, notificationId);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
