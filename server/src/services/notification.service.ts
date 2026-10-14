import { prisma } from '../config/database';
import { getIO } from '../config/socket';
import { SOCKET_EVENTS } from '../constants';
import { AppError } from '../middleware/error.middleware';
import { Priority } from '@prisma/client';

export class NotificationService {
  /**
   * 1. Get User Notifications and Unread Count
   */
  static async getUserNotifications(userId: string, limit = 30) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      prisma.notification.count({
        where: { userId, isRead: false },
      }),
    ]);

    return {
      unreadCount,
      notifications,
    };
  }

  /**
   * 2. Mark Single Notification as Read
   */
  static async markAsRead(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found.', 404);
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  /**
   * 3. Mark All Notifications as Read for User
   */
  static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { message: 'All notifications marked as read.' };
  }

  /**
   * 4. Delete Notification
   */
  static async deleteNotification(userId: string, notificationId: string) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification || notification.userId !== userId) {
      throw new AppError('Notification not found.', 404);
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return { message: 'Notification deleted successfully.' };
  }

  /**
   * 5. Create and Emit In-App Notification
   */
  static async createNotification(
    userId: string,
    data: {
      title: string;
      message: string;
      type?: string;
      actionUrl?: string;
    }
  ) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title: data.title,
        message: data.message,
        type: data.type || 'SYSTEM',
        actionUrl: data.actionUrl,
      },
    });

    // Real-time WebSocket emission to user room
    try {
      const io = getIO();
      io.emit(SOCKET_EVENTS.NOTIFICATION_NEW, {
        userId,
        notification,
      });
    } catch (err) {
      console.warn('Socket notification broadcast failed:', err);
    }

    return notification;
  }

  /**
   * 6. Create and Broadcast Campus Announcement
   */
  static async createAnnouncement(
    authorId: string,
    data: {
      title: string;
      content: string;
      priority?: Priority;
      targetAudience?: string;
      isPinned?: boolean;
      expiresAt?: Date;
    }
  ) {
    const announcement = await prisma.announcement.create({
      data: {
        authorId,
        title: data.title,
        content: data.content,
        priority: data.priority || Priority.MEDIUM,
        targetAudience: data.targetAudience || 'ALL',
        isPinned: data.isPinned || false,
        expiresAt: data.expiresAt,
      },
      include: {
        author: { select: { name: true, email: true } },
      },
    });

    // Real-time broadcast
    try {
      const io = getIO();
      io.emit(SOCKET_EVENTS.ANNOUNCEMENT_NEW, announcement);
    } catch (err) {
      console.warn('Socket announcement broadcast failed:', err);
    }

    return announcement;
  }

  /**
   * 7. Get Active Announcements
   */
  static async getAnnouncements(targetAudience?: string) {
    const audienceFilter = targetAudience && targetAudience !== 'ALL'
      ? { in: ['ALL', targetAudience] }
      : undefined;

    const announcements = await prisma.announcement.findMany({
      where: {
        targetAudience: audienceFilter,
        OR: [{ expiresAt: null }, { expiresAt: { gte: new Date() } }],
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      include: {
        author: { select: { name: true } },
      },
    });

    return announcements;
  }
}
