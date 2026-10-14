import { Router } from 'express';
import { SportController } from '../controllers/sport.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', SportController.getAllSports);
router.get('/:id', SportController.getSportById);

router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  SportController.createSport
);

router.patch(
  '/:id',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  SportController.updateSport
);

router.delete(
  '/:id',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  SportController.deleteSport
);

export default router;
