import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service';

export class TeamController {
  static async getAllTeams(req: Request, res: Response, next: NextFunction) {
    try {
      const sportId = req.query.sportId as string | undefined;
      const department = req.query.department as string | undefined;
      const teams = await TeamService.getAllTeams({ sportId, department });
      return res.status(200).json({ success: true, data: teams });
    } catch (error) {
      next(error);
    }
  }

  static async getTeamById(req: Request, res: Response, next: NextFunction) {
    try {
      const team = await TeamService.getTeamById(req.params.id as string);
      return res.status(200).json({ success: true, data: team });
    } catch (error) {
      next(error);
    }
  }

  static async createTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const team = await TeamService.createTeam(userId, req.body);
      return res.status(201).json({ success: true, message: 'Team created', data: team });
    } catch (error) {
      next(error);
    }
  }

  static async updateTeam(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const team = await TeamService.updateTeam(userId, req.params.id as string, req.body);
      return res.status(200).json({ success: true, message: 'Team updated', data: team });
    } catch (error) {
      next(error);
    }
  }

  static async addMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const member = await TeamService.addTeamMember(userId, req.params.id as string, req.body);
      return res.status(201).json({ success: true, message: 'Player added to squad roster', data: member });
    } catch (error) {
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const result = await TeamService.removeTeamMember(userId, req.params.id as string, req.params.memberId as string);
      return res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
