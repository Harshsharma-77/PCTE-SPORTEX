import { Router } from 'express';
import { LiveScoreController } from '../controllers/liveScore.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// ============================================================================
// Public Spectator Endpoints (No login required for viewing matches)
// ============================================================================
router.get('/matches', LiveScoreController.getLiveMatchesFeed);
router.get('/matches/:matchId', LiveScoreController.getLiveMatchById);

// ============================================================================
// Referee & Administrator Live Scoring Mutations (Protected)
// ============================================================================
router.post(
  '/matches/:matchId/start',
  authenticateJwt,
  authorizeRoles('REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN'),
  LiveScoreController.startMatch
);

router.post(
  '/matches/:matchId/score',
  authenticateJwt,
  authorizeRoles('REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN'),
  LiveScoreController.updateScoreAndLogEvent
);

router.patch(
  '/matches/:matchId/clock',
  authenticateJwt,
  authorizeRoles('REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN'),
  LiveScoreController.syncClock
);

router.delete(
  '/matches/:matchId/events/:eventId',
  authenticateJwt,
  authorizeRoles('REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN'),
  LiveScoreController.undoLastEvent
);

router.post(
  '/matches/:matchId/conclude',
  authenticateJwt,
  authorizeRoles('REFEREE', 'SUPER_ADMIN', 'SPORTS_ADMIN'),
  LiveScoreController.concludeMatch
);

export default router;
