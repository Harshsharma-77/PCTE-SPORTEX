import { Request, Response, NextFunction } from 'express';
import { FixtureService } from '../services/fixture.service';

export class FixtureController {
  static async getAllFixtures(req: Request, res: Response, next: NextFunction) {
    try {
      const tournamentId = req.query.tournamentId as string | undefined;
      const status = req.query.status as any;
      const venueId = req.query.venueId as string | undefined;
      const refereeId = req.query.refereeId as string | undefined;

      const fixtures = await FixtureService.getAllFixtures({ tournamentId, status, venueId, refereeId });
      return res.status(200).json({ success: true, data: fixtures });
    } catch (error) {
      next(error);
    }
  }

  static async createFixture(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const fixture = await FixtureService.createFixture(userId, req.body);
      return res.status(201).json({ success: true, message: 'Match fixture created', data: fixture });
    } catch (error) {
      next(error);
    }
  }

  static async updateFixture(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const fixture = await FixtureService.updateFixture(userId, req.params.id as string, req.body);
      return res.status(200).json({ success: true, message: 'Match fixture updated', data: fixture });
    } catch (error) {
      next(error);
    }
  }

  static async deleteFixture(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await FixtureService.deleteFixture(userId, req.params.id as string);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
