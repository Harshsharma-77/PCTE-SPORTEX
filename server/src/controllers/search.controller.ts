import { Request, Response, NextFunction } from 'express';
import { SearchService } from '../services/search.service';

export class SearchController {
  static async omnisearch(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query.q as string;
      const limit = req.query.limit ? Number(req.query.limit) : 5;

      const results = await SearchService.omnisearch(query, limit);
      return res.status(200).json({
        success: true,
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }
}
