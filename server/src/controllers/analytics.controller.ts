import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

export class AnalyticsController {
  static async getLeaderboards(req: Request, res: Response, next: NextFunction) {
    try {
      const sportId = req.query.sportId as string | undefined;
      const limit = req.query.limit ? Number(req.query.limit) : 10;

      const leaderboards = await AnalyticsService.getLeaderboards(sportId, limit);
      return res.status(200).json({
        success: true,
        data: leaderboards,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPerformanceAnalytics(_req: Request, res: Response, next: NextFunction) {
    try {
      const analytics = await AnalyticsService.getPerformanceAnalytics();
      return res.status(200).json({
        success: true,
        data: analytics,
      });
    } catch (error) {
      next(error);
    }
  }
}
