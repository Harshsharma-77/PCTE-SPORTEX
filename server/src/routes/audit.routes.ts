import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Only SUPER_ADMIN and SPORTS_ADMIN can inspect audit compliance trails
router.get(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  AuditController.getAuditLogs
);

export default router;
