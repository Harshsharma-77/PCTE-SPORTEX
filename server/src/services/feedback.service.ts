import { prisma } from '../config/database';
import { AppError } from '../middleware/error.middleware';
import { FeedbackCategory, Priority, FeedbackStatus } from '@prisma/client';
import { AuditService } from './audit.service';
import { NotificationService } from './notification.service';

export class FeedbackService {
  /**
   * 1. Submit Feedback / Complaint / Suggestion
   */
  static async submitFeedback(
    userId: string,
    data: {
      category: FeedbackCategory;
      priority?: Priority;
      subject: string;
      description: string;
      attachmentUrl?: string;
    }
  ) {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketNumber = `TKT-2026-${randomSuffix}`;

    const feedback = await prisma.feedback.create({
      data: {
        ticketNumber,
        userId,
        category: data.category || FeedbackCategory.OTHER,
        priority: data.priority || Priority.MEDIUM,
        subject: data.subject,
        description: data.description,
        attachmentUrl: data.attachmentUrl,
        status: FeedbackStatus.PENDING,
      },
      include: {
        user: { select: { id: true, name: true, email: true, roleEnum: true } },
      },
    });

    await AuditService.recordLog({
      userId,
      action: 'FEEDBACK_SUBMITTED',
      entity: 'Feedback',
      entityId: feedback.id,
      changesDiff: { ticketNumber, subject: data.subject, category: data.category },
    });

    return feedback;
  }

  /**
   * 2. Get User's Own Tickets
   */
  static async getUserFeedback(userId: string) {
    const tickets = await prisma.feedback.findMany({
      where: { userId },
      include: {
        assignedTo: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return tickets;
  }

  /**
   * 3. Get All Grievance Tickets (Admin Desk)
   */
  static async getAllFeedback(filters?: {
    status?: FeedbackStatus;
    category?: FeedbackCategory;
    priority?: Priority;
  }) {
    const where: any = {};
    if (filters?.status) where.status = filters.status;
    if (filters?.category) where.category = filters.category;
    if (filters?.priority) where.priority = filters.priority;

    const tickets = await prisma.feedback.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, roleEnum: true } },
        assignedTo: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return tickets;
  }

  /**
   * 4. Respond to & Resolve Feedback Ticket
   */
  static async respondToFeedback(
    assignedToUserId: string,
    feedbackId: string,
    data: {
      status: FeedbackStatus;
      resolutionNotes: string;
    }
  ) {
    const feedback = await prisma.feedback.findUnique({
      where: { id: feedbackId },
      include: { user: true },
    });
    if (!feedback) throw new AppError('Feedback ticket not found.', 404);

    const updated = await prisma.feedback.update({
      where: { id: feedbackId },
      data: {
        status: data.status,
        resolutionNotes: data.resolutionNotes,
        assignedToUserId,
        resolvedAt: data.status === FeedbackStatus.RESOLVED ? new Date() : null,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { name: true } },
      },
    });

    // Notify ticket author
    try {
      await NotificationService.createNotification(feedback.userId, {
        title: `💬 Grievance Ticket ${feedback.ticketNumber} Updated`,
        message: `Status: ${data.status}. Resolution: "${data.resolutionNotes}"`,
        type: 'FEEDBACK',
        actionUrl: '/feedback',
      });
    } catch (err) {
      console.warn('Failed to dispatch feedback notification:', err);
    }

    await AuditService.recordLog({
      userId: assignedToUserId,
      action: 'FEEDBACK_RESOLVED',
      entity: 'Feedback',
      entityId: feedbackId,
      changesDiff: { ticketNumber: feedback.ticketNumber, status: data.status },
    });

    return updated;
  }
}
