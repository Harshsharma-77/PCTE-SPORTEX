import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  static async getAdminSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const summary = await DashboardService.getAdminSummary();
      return res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getAdminCharts(req: Request, res: Response, next: NextFunction) {
    try {
      const charts = await DashboardService.getAdminCharts();
      return res.status(200).json({
        success: true,
        data: charts,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getQuickLookups(req: Request, res: Response, next: NextFunction) {
    try {
      const lookups = await DashboardService.getQuickLookups();
      return res.status(200).json({
        success: true,
        data: lookups,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getInstitutionalDirectory(req: Request, res: Response, next: NextFunction) {
    try {
      const directory = await DashboardService.getInstitutionalDirectory();
      return res.status(200).json({
        success: true,
        data: directory,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickAddSport(req: Request, res: Response, next: NextFunction) {
    try {
      const sport = await DashboardService.quickAddSport(req.body);
      return res.status(201).json({
        success: true,
        message: 'Sport created successfully',
        data: sport,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickAddTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await DashboardService.quickAddTeam(req.body);
      return res.status(201).json({
        success: true,
        message: 'Team created successfully',
        data: team,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickAddPlayer(req: Request, res: Response, next: NextFunction) {
    try {
      const player = await DashboardService.quickAddPlayer(req.body);
      return res.status(201).json({
        success: true,
        message: 'Player enrolled into team roster successfully',
        data: player,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickRegisterAthlete(req: Request, res: Response, next: NextFunction) {
    try {
      const athlete = await DashboardService.quickRegisterAthlete(req.body);
      return res.status(201).json({
        success: true,
        message: 'Student athlete registered successfully into varsity registry',
        data: athlete,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickCreateTournament(req: Request, res: Response, next: NextFunction) {
    try {
      const tournament = await DashboardService.quickCreateTournament(req.body);
      return res.status(201).json({
        success: true,
        message: 'Tournament created successfully',
        data: tournament,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickScheduleMatch(req: Request, res: Response, next: NextFunction) {
    try {
      const match = await DashboardService.quickScheduleMatch(req.body);
      return res.status(201).json({
        success: true,
        message: 'Match fixture scheduled successfully',
        data: match,
      });
    } catch (error) {
      next(error);
    }
  }

  static async quickPublishAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const announcement = await DashboardService.quickPublishAnnouncement(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Announcement published successfully',
        data: announcement,
      });
    } catch (error) {
      next(error);
    }
  }
}
