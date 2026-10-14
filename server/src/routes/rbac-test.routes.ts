import { Router, Response } from 'express';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles, requirePermissions } from '../middleware/rbac.middleware';
import { UserRoleEnum } from '@prisma/client';
import { sendSuccess } from '../utils/response';
import { AuthenticatedRequest } from '../types';

const router = Router();

// All routes in this router require authentication
router.use(authenticateJwt);

router.get('/superadmin-only', authorizeRoles(UserRoleEnum.SUPER_ADMIN), (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, { user: req.user, scope: 'SUPER_ADMIN_CONTROL_CENTER' }, 'Authorized for Super Admin');
});

router.get(
  '/admin-only',
  authorizeRoles(UserRoleEnum.SUPER_ADMIN, UserRoleEnum.SPORTS_ADMIN),
  (req: AuthenticatedRequest, res: Response) => {
    return sendSuccess(res, { user: req.user, scope: 'SPORTS_ADMIN_OPERATIONS' }, 'Authorized for Sports Administration');
  }
);

router.get('/coach-only', authorizeRoles(UserRoleEnum.COACH), (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, { user: req.user, scope: 'COACH_MANAGEMENT_HUB' }, 'Authorized for Team Coach');
});

router.get('/student-only', authorizeRoles(UserRoleEnum.STUDENT), (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, { user: req.user, scope: 'STUDENT_ATHLETE_PORTAL' }, 'Authorized for Student Athlete');
});

router.get('/referee-only', authorizeRoles(UserRoleEnum.REFEREE), (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, { user: req.user, scope: 'REFEREE_MATCH_CONSOLE' }, 'Authorized for Match Official');
});

router.get('/permission-scoring', requirePermissions('live_score:update'), (req: AuthenticatedRequest, res: Response) => {
  return sendSuccess(res, { user: req.user, permission: 'live_score:update' }, 'Granted access via live_score:update permission');
});

export default router;
