import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service';

export class InventoryController {
  static async getAllEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const sportId = req.query.sportId as string | undefined;
      const lowStockOnly = req.query.lowStock === 'true';

      const items = await InventoryService.getAllEquipment({ sportId, lowStockOnly });
      return res.status(200).json({
        success: true,
        data: items,
      });
    } catch (error) {
      next(error);
    }
  }

  static async createEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const equipment = await InventoryService.createEquipment(userId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Equipment catalog item created',
        data: equipment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async issueEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const approvedByUserId = (req as any).user.userId;
      const issue = await InventoryService.issueEquipment(approvedByUserId, req.body);
      return res.status(201).json({
        success: true,
        message: 'Equipment issued to recipient',
        data: issue,
      });
    } catch (error) {
      next(error);
    }
  }

  static async returnEquipment(req: Request, res: Response, next: NextFunction) {
    try {
      const approvedByUserId = (req as any).user.userId;
      const issueId = req.params.issueId as string;
      const returned = await InventoryService.returnEquipment(approvedByUserId, issueId, req.body);
      return res.status(200).json({
        success: true,
        message: 'Equipment successfully returned and inventory restored',
        data: returned,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getEquipmentIssues(req: Request, res: Response, next: NextFunction) {
    try {
      const status = req.query.status as any;
      const userId = req.query.userId as string | undefined;

      const issues = await InventoryService.getEquipmentIssues({ status, userId });
      return res.status(200).json({
        success: true,
        data: issues,
      });
    } catch (error) {
      next(error);
    }
  }
}
