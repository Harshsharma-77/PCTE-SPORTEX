import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../services/feedback.service';

export class FeedbackController {
  static async submitFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const feedback = await FeedbackService.submitFeedback(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Feedback/Grievance ticket created successfully',
        data: feedback,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getUserFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const tickets = await FeedbackService.getUserFeedback(userId);
      return res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAllFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const tickets = await FeedbackService.getAllFeedback(req.query as any);
      return res.status(200).json({
        success: true,
        data: tickets,
      });
    } catch (error) {
      next(error);
    }
  }

  static async respondToFeedback(req: Request, res: Response, next: NextFunction) {
    try {
      const assignedToUserId = (req as any).user.userId;
      const feedbackId = req.params.id as string;
      const updated = await FeedbackService.respondToFeedback(assignedToUserId, feedbackId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Grievance ticket response and resolution recorded',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
