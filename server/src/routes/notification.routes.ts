import { Router } from 'express';
import { NotificationController } from '../controllers/notification.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Public / Authenticated Announcement routes
router.get('/announcements', NotificationController.getAnnouncements);
router.post(
  '/announcements',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  NotificationController.createAnnouncement
);

// User in-app notifications
router.get('/', authenticateJwt, NotificationController.getUserNotifications);
router.patch('/read-all', authenticateJwt, NotificationController.markAllAsRead);
router.patch('/:id/read', authenticateJwt, NotificationController.markAsRead);
router.delete('/:id', authenticateJwt, NotificationController.deleteNotification);

export default router;
