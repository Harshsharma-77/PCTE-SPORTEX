import { Request, Response, NextFunction } from 'express';
import { SportService } from '../services/sport.service';

export class SportController {
  static async getAllSports(_req: Request, res: Response, next: NextFunction) {
    try {
      const sports = await SportService.getAllSports();
      return res.status(200).json({ success: true, data: sports });
    } catch (error) {
      next(error);
    }
  }

  static async getSportById(req: Request, res: Response, next: NextFunction) {
    try {
      const sport = await SportService.getSportById(req.params.id as string);
      return res.status(200).json({ success: true, data: sport });
    } catch (error) {
      next(error);
    }
  }

  static async createSport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const sport = await SportService.createSport(userId, req.body);
      return res.status(201).json({ success: true, message: 'Sport discipline created', data: sport });
    } catch (error) {
      next(error);
    }
  }

  static async updateSport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const sport = await SportService.updateSport(userId, req.params.id as string, req.body);
      return res.status(200).json({ success: true, message: 'Sport updated', data: sport });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSport(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await SportService.deleteSport(userId, req.params.id as string);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
