import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getUserNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const data = await NotificationService.getUserNotifications(userId);
      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const notificationId = req.params.id as string;
      const updated = await NotificationService.markAsRead(userId, notificationId);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await NotificationService.markAllAsRead(userId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const notificationId = req.params.id as string;
      const result = await NotificationService.deleteNotification(userId, notificationId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const announcement = await NotificationService.createAnnouncement(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Announcement published successfully',
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const targetAudience = req.query.audience as string | undefined;
      const announcements = await NotificationService.getAnnouncements(targetAudience);
      return res.status(200).json({
        success: true,
        data: announcements,
      });
    } catch (error) {
      next(error);
    }
  }
}
