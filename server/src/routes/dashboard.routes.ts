import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// All dashboard endpoints require authentication and Admin role
router.use(authenticateJwt);
router.use(authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'));

// Summary & Charts
router.get('/admin/summary', DashboardController.getAdminSummary);
router.get('/admin/charts', DashboardController.getAdminCharts);
router.get('/admin/quick-lookups', DashboardController.getQuickLookups);
router.get('/admin/directory', DashboardController.getInstitutionalDirectory);

// Quick Actions
router.post('/admin/quick-sport', DashboardController.quickAddSport);
router.post('/admin/quick-team', DashboardController.quickAddTeam);
router.post('/admin/quick-player', DashboardController.quickAddPlayer);
router.post('/admin/quick-athlete', DashboardController.quickRegisterAthlete);
router.post('/admin/quick-tournament', DashboardController.quickCreateTournament);
router.post('/admin/quick-match', DashboardController.quickScheduleMatch);
router.post('/admin/quick-announcement', DashboardController.quickPublishAnnouncement);

export default router;
