import { Router } from 'express';
import { TeamController } from '../controllers/team.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', TeamController.getAllTeams);
router.get('/:id', TeamController.getTeamById);

router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN', 'COACH'),
  TeamController.createTeam
);

router.patch(
  '/:id',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN', 'COACH'),
  TeamController.updateTeam
);

router.post(
  '/:id/members',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN', 'COACH'),
  TeamController.addMember
);

router.delete(
  '/:id/members/:memberId',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN', 'COACH'),
  TeamController.removeMember
);

export default router;
