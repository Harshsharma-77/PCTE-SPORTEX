import { Request, Response, NextFunction } from 'express';
import { LiveScoreService } from '../services/liveScore.service';

export class LiveScoreController {
  static async getLiveMatchesFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const feed = await LiveScoreService.getLiveMatchesFeed();
      return res.status(200).json({
        success: true,
        data: feed,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getLiveMatchById(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = req.params.matchId as string;
      const match = await LiveScoreService.getLiveMatchById(matchId);
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

      const started = await LiveScoreService.startMatch(userId, matchId);
      return res.status(200).json({
        success: true,
        message: 'Match kicked off and broadcast to all live spectators',
        data: started,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateScoreAndLogEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const result = await LiveScoreService.updateScoreAndLogEvent(userId, matchId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Score and event updated and emitted in real-time',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncClock(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const updated = await LiveScoreService.syncClock(userId, matchId, req.body);
      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async undoLastEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;
      const eventId = req.params.eventId as string;

      const result = await LiveScoreService.undoLastEvent(userId, matchId, eventId);
      return res.status(200).json({
        success: true,
        message: 'Event undone and score reversed',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async concludeMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const matchId = req.params.matchId as string;

      const completed = await LiveScoreService.concludeMatch(userId, matchId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Match completed and final score report broadcasted',
        data: completed,
      });
    } catch (error) {
      next(error);
    }
  }
}
