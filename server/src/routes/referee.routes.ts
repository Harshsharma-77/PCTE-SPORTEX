import { Router } from 'express';
import { RefereeController } from '../controllers/referee.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Referee routes protected with authentication and Referee/Admin role
router.use(authenticateJwt);
router.use(authorizeRoles('REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN'));

router.get('/dashboard', RefereeController.getDashboard);
router.get('/matches/:matchId', RefereeController.getMatchDetails);
router.post('/matches/:matchId/start', RefereeController.startMatch);
router.patch('/matches/:matchId/status', RefereeController.updateMatchStatus);
router.post('/matches/:matchId/events', RefereeController.logMatchEvent);
router.post('/matches/:matchId/submit-report', RefereeController.submitMatchReport);

export default router;
