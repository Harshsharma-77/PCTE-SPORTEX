import { Router } from 'express';
import { FeedbackController } from '../controllers/feedback.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Student / Coach ticket actions
router.post('/', authenticateJwt, FeedbackController.submitFeedback);
router.get('/my-tickets', authenticateJwt, FeedbackController.getUserFeedback);

// Admin desk actions
router.get(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  FeedbackController.getAllFeedback
);

router.patch(
  '/:id/respond',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  FeedbackController.respondToFeedback
);

export default router;
