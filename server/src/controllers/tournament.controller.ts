import { Request, Response, NextFunction } from 'express';
import { TournamentService } from '../services/tournament.service';

export class TournamentController {
  static async getAllTournaments(req: Request, res: Response, next: NextFunction) {
    try {
      const sportId = req.query.sportId as string | undefined;
      const status = req.query.status as any;
      const tournaments = await TournamentService.getAllTournaments({ sportId, status });
      return res.status(200).json({ success: true, data: tournaments });
    } catch (error) {
      next(error);
    }
  }

  static async getTournamentById(req: Request, res: Response, next: NextFunction) {
    try {
      const tournament = await TournamentService.getTournamentById(req.params.id as string);
      return res.status(200).json({ success: true, data: tournament });
    } catch (error) {
      next(error);
    }
  }

  static async createTournament(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const tournament = await TournamentService.createTournament(userId, req.body);
      return res.status(201).json({ success: true, message: 'Tournament cup created', data: tournament });
    } catch (error) {
      next(error);
    }
  }

  static async registerTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const reg = await TournamentService.registerTeam(userId, req.params.id as string, req.body);
      return res.status(201).json({ success: true, message: 'Team registered for tournament', data: reg });
    } catch (error) {
      next(error);
    }
  }

  static async generateFixtures(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await TournamentService.generateFixtures(userId, req.params.id as string);
      return res.status(201).json({ success: true, ...result });
    } catch (error) {
      next(error);
    }
  }
}
