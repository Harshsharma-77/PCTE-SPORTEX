import { Request, Response, NextFunction } from 'express';
import { CoachService } from '../services/coach.service';

export class CoachController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const targetCoachId = req.query.coachId as string | undefined;

      const dashboard = await CoachService.getCoachDashboard(userId, targetCoachId);
      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  static async markAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await CoachService.markAttendance(userId, req.body);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async addPlayerToSquad(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const member = await CoachService.addPlayerToSquad(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Player enrolled into squad roster successfully',
        data: member,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateSquadPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const memberId = req.params.memberId as string;
      const updated = await CoachService.updateSquadPlayer(userId, memberId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Roster details updated successfully',
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
