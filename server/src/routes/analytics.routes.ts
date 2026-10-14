import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();

// Public analytics endpoints for campus dashboards and spectators
router.get('/leaderboards', AnalyticsController.getLeaderboards);
router.get('/performance', AnalyticsController.getPerformanceAnalytics);

export default router;
