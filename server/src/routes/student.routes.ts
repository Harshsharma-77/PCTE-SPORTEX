import { Router } from 'express';
import { StudentController } from '../controllers/student.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// All student routes require valid JWT authentication
router.use(authenticateJwt);
router.use(authorizeRoles('STUDENT', 'SUPER_ADMIN', 'SPORTS_ADMIN'));

// Student Portal Routes
router.get('/dashboard', StudentController.getDashboard);
router.patch('/profile', StudentController.updateProfile);
router.patch('/notifications/:notificationId/read', StudentController.markNotificationRead);

export default router;
