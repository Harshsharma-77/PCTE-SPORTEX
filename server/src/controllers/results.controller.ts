import { Request, Response, NextFunction } from 'express';
import { ResultsService } from '../services/results.service';

export class ResultsController {
  static async getCompletedResults(req: Request, res: Response, next: NextFunction) {
    try {
      const results = await ResultsService.getCompletedResults(req.query);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getMatchDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = req.params.matchId as string;
      const match = await ResultsService.getMatchDetails(matchId);
      return res.status(200).json({
        success: true,
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getTournamentStandings(req: Request, res: Response, next: NextFunction) {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      const sportId = req.query.sportId as string | undefined;

      const standings = await ResultsService.getTournamentStandings(tournamentId, sportId);
      return res.status(200).json({
        success: true,
        data: standings,
      });
    } catch (error) {
      next(error);
    }
  }

  static async syncMatchFinalization(req: Request, res: Response, next: NextFunction) {
    try {
      const matchId = req.params.matchId as string;
      const syncResult = await ResultsService.syncMatchFinalization(matchId);
      return res.status(200).json({
        success: true,
        message: 'Standings and player statistics synchronized successfully',
        data: syncResult,
      });
    } catch (error) {
      next(error);
    }
  }
}
