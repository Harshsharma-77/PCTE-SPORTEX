import { Router } from 'express';
import { ResultsController } from '../controllers/results.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Public routes for spectators and students to view results & standings
router.get('/', ResultsController.getCompletedResults);
router.get('/standings', ResultsController.getTournamentStandings);
router.get('/:matchId', ResultsController.getMatchDetails);

// Admin/Referee trigger to manually sync standings and player telemetry
router.post(
  '/:matchId/sync',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN', 'REFEREE'),
  ResultsController.syncMatchFinalization
);

export default router;
