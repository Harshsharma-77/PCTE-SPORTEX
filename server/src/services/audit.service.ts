import { prisma } from '../config/database';

export class AuditService {
  static async recordLog(data: {
    userId?: string;
    action: string;
    entity: string;
    entityId?: string;
    ipAddress?: string;
    userAgent?: string;
    changesDiff?: any;
  }) {
    try {
      return await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          changesDiff: data.changesDiff,
        },
      });
    } catch (err) {
      console.warn('Failed to persist audit log:', err);
      return null;
    }
  }

  static async getAuditLogs(filters?: {
    userId?: string;
    action?: string;
    entity?: string;
    limit?: number;
  }) {
    const where: any = {};
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.action) where.action = filters.action;
    if (filters?.entity) where.entity = filters.entity;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, roleEnum: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: filters?.limit || 100,
    });

    return logs;
  }
}
