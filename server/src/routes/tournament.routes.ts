import { Router } from 'express';
import { TournamentController } from '../controllers/tournament.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

router.get('/', TournamentController.getAllTournaments);
router.get('/:id', TournamentController.getTournamentById);

router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  TournamentController.createTournament
);

router.post(
  '/:id/register-team',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN', 'COACH'),
  TournamentController.registerTeam
);

router.post(
  '/:id/generate-fixtures',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  TournamentController.generateFixtures
);

export default router;
