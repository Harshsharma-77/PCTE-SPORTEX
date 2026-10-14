import { Router } from 'express';
import { FixtureController } from '../controllers/fixture.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', FixtureController.getAllFixtures);

router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  FixtureController.createFixture
);

router.patch(
  '/:id',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  FixtureController.updateFixture
);

router.delete(
  '/:id',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  FixtureController.deleteFixture
);

export default router;
