import { Request, Response, NextFunction } from 'express';
import { RefereeService } from '../services/referee.service';

export class RefereeController {
  static async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const targetRefereeId = req.query.refereeId as string | undefined;

      const dashboard = await RefereeService.getRefereeDashboard(userId, targetRefereeId);
      return res.status(200).json({
        success: true,
        data: dashboard,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMatchDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const match = await RefereeService.getMatchDetails(userId, matchId);
      return res.status(200).json({
        success: true,
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }

  static async startMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const match = await RefereeService.startMatch(userId, matchId);
      return res.status(200).json({
        success: true,
        message: 'Match started and clock initiated',
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateMatchStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const match = await RefereeService.updateMatchStatus(userId, matchId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Match state updated successfully',
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }

  static async logMatchEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const event = await RefereeService.logMatchEvent(userId, matchId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Live match event recorded and score synchronized',
        data: event,
      });
    } catch (error) {
      next(error);
    }
  }

  static async submitMatchReport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const completed = await RefereeService.submitMatchReport(userId, matchId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Official match report finalized and signed off',
        data: completed,
      });
    } catch (error) {
      next(error);
    }
  }
}
