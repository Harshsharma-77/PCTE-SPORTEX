import { Request, Response, NextFunction } from 'express';
import { VenueService } from '../services/venue.service';

export class VenueController {
  static async getAllVenues(_req: Request, res: Response, next: NextFunction) {
    try {
      const venues = await VenueService.getAllVenues();
      return res.status(200).json({
        success: true,
        data: venues,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createVenue(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const venue = await VenueService.createVenue(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Venue created successfully',
        data: venue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async checkConflict(req: Request, res: Response, next: NextFunction) {
    try {
      const venueId = req.params.id as string;
      const scheduledDate = new Date(req.query.date as string);
      const duration = req.query.duration ? Number(req.query.duration) : 120;
      const excludeMatchId = req.query.excludeMatchId as string | undefined;

      const result = await VenueService.checkVenueConflict(venueId, scheduledDate, duration, excludeMatchId);
      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getVenueSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const venueId = req.params.id as string;
      const schedule = await VenueService.getVenueSchedule(venueId);
      return res.status(200).json({
        success: true,
        data: schedule,
      });
    } catch (error) {
      next(error);
    }
  }
}
