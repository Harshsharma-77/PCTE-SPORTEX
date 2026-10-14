import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Equipment catalog lookup
router.get('/', authenticateJwt, InventoryController.getAllEquipment);
router.get('/issues', authenticateJwt, InventoryController.getEquipmentIssues);

// Equipment mutations
router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  InventoryController.createEquipment
);

router.post(
  '/issue',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  InventoryController.issueEquipment
);

router.post(
  '/issues/:issueId/return',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  InventoryController.returnEquipment
);

export default router;
