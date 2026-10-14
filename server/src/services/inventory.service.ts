import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { EquipmentCondition, IssueStatus } from '@prisma/client';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class InventoryService {
  /**
   * 1. Get All Equipment with low-stock indicator
   */
  static async getAllEquipment(filters?: { sportId?: string; lowStockOnly?: boolean }) {
    const where: any = {};
    if (filters?.sportId) where.sportId = filters.sportId;

    const items = await prisma.equipment.findMany({
      where,
      include: {
        sport: { select: { id: true, name: true, category: true } },
        _count: { select: { issues: { where: { status: IssueStatus.ISSUED } } } },
      },
      orderBy: { name: 'asc' },
    });

    const enriched = items.map((item) => ({
      ...item,
      isLowStock: item.availableQuantity <= 2,
      activeIssuesCount: item._count.issues,
    }));

    if (filters?.lowStockOnly) {
      return enriched.filter((i) => i.isLowStock);
    }

    return enriched;
  }

  /**
   * 2. Create Equipment Item
   */
  static async createEquipment(
    userId: string,
    data: {
      name: string;
      sku: string;
      sportId: string;
      totalQuantity: number;
      condition?: EquipmentCondition;
      storageLocation?: string;
      costPerItem?: number;
      notes?: string;
    }
  ) {
    const existingSku = await prisma.equipment.findUnique({ where: { sku: data.sku } });
    if (existingSku) throw new AppError('An equipment item with this SKU already exists.', 409);

    const equipment = await prisma.equipment.create({
      data: {
        name: data.name,
        sku: data.sku,
        sportId: data.sportId,
        totalQuantity: data.totalQuantity,
        availableQuantity: data.totalQuantity,
        condition: data.condition || EquipmentCondition.GOOD,
        storageLocation: data.storageLocation,
        costPerItem: data.costPerItem,
        notes: data.notes,
      },
      include: { sport: true },
    });

    await AuditService.recordLog({
      userId,
      action: 'EQUIPMENT_CREATED',
      entity: 'Equipment',
      entityId: equipment.id,
      changesDiff: { sku: data.sku, name: data.name, totalQuantity: data.totalQuantity },
    });

    return equipment;
  }

  /**
   * 3. Issue Equipment to Student Athlete or Coach
   */
  static async issueEquipment(
    approvedByUserId: string,
    data: {
      equipmentId: string;
      issuedToUserId: string;
      quantity: number;
      dueDate: Date;
      remarks?: string;
    }
  ) {
    const equipment = await prisma.equipment.findUnique({ where: { id: data.equipmentId } });
    if (!equipment) throw new AppError('Equipment item not found.', 404);

    if (equipment.availableQuantity < data.quantity) {
      throw new AppError(
        `Insufficient inventory. Requested ${data.quantity} units, but only ${equipment.availableQuantity} available.`,
        400
      );
    }

    const recipient = await prisma.user.findUnique({ where: { id: data.issuedToUserId } });
    if (!recipient) throw new AppError('Recipient user not found.', 404);

    const issue = await prisma.$transaction(async (tx) => {
      // 1. Decrement available quantity
      await tx.equipment.update({
        where: { id: data.equipmentId },
        data: { availableQuantity: { decrement: data.quantity } },
      });

      // 2. Create Issue record
      const createdIssue = await tx.equipmentIssue.create({
        data: {
          equipmentId: data.equipmentId,
          issuedToUserId: data.issuedToUserId,
          approvedByUserId,
          quantity: data.quantity,
          dueDate: data.dueDate,
          status: IssueStatus.ISSUED,
          remarks: data.remarks,
        },
        include: {
          equipment: true,
          issuedTo: { select: { name: true, email: true } },
        },
      });

      return createdIssue;
    });

    // Send notification
    try {
      await NotificationService.createNotification(data.issuedToUserId, {
        title: '📦 Sports Equipment Issued',
        message: `You have been issued ${data.quantity}x ${equipment.name} (SKU: ${equipment.sku}). Return due by ${new Date(data.dueDate).toLocaleDateString()}.`,
        type: 'EQUIPMENT',
        actionUrl: '/inventory',
      });
    } catch (err) {
      console.warn('Failed to send issue notification:', err);
    }

    await AuditService.recordLog({
      userId: approvedByUserId,
      action: 'EQUIPMENT_ISSUED',
      entity: 'EquipmentIssue',
      entityId: issue.id,
      changesDiff: { equipmentId: data.equipmentId, issuedTo: recipient.name, quantity: data.quantity },
    });

    return issue;
  }

  /**
   * 4. Return Equipment & Restore Available Quantity
   */
  static async returnEquipment(
    approvedByUserId: string,
    issueId: string,
    data: {
      returnCondition?: EquipmentCondition;
      fineAmount?: number;
      remarks?: string;
    }
  ) {
    const issue = await prisma.equipmentIssue.findUnique({
      where: { id: issueId },
      include: { equipment: true, issuedTo: true },
    });
    if (!issue) throw new AppError('Equipment loan issue record not found.', 404);
    if (issue.status === IssueStatus.RETURNED) {
      throw new AppError('This equipment has already been returned.', 400);
    }

    const updatedIssue = await prisma.$transaction(async (tx) => {
      // 1. Restore equipment quantity
      await tx.equipment.update({
        where: { id: issue.equipmentId },
        data: {
          availableQuantity: { increment: issue.quantity },
          condition: data.returnCondition || issue.equipment.condition,
        },
      });

      // 2. Mark issue as returned
      return tx.equipmentIssue.update({
        where: { id: issueId },
        data: {
          status: IssueStatus.RETURNED,
          returnDate: new Date(),
          returnCondition: data.returnCondition || EquipmentCondition.GOOD,
          fineAmount: data.fineAmount || 0,
          remarks: data.remarks || issue.remarks,
        },
        include: {
          equipment: true,
          issuedTo: { select: { name: true, email: true } },
        },
      });
    });

    await AuditService.recordLog({
      userId: approvedByUserId,
      action: 'EQUIPMENT_RETURNED',
      entity: 'EquipmentIssue',
      entityId: issueId,
      changesDiff: { equipmentName: issue.equipment.name, returnedBy: issue.issuedTo.name },
    });

    return updatedIssue;
  }

  /**
   * 5. Get Equipment Loan Records
   */
  static async getEquipmentIssues(filters?: { status?: IssueStatus; userId?: string }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.userId) where.issuedToUserId = filters.userId;

    const issues = await prisma.equipmentIssue.findMany({
      where,
      include: {
        equipment: { select: { name: true, sku: true, sport: { select: { name: true } } } },
        issuedTo: { select: { id: true, name: true, email: true, roleEnum: true } },
        approvedBy: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return issues;
  }
}
