import { Router } from 'express';
import { CoachController } from '../controllers/coach.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Coach routes protected with authentication and Coach/Admin role
router.use(authenticateJwt);
router.use(authorizeRoles('COACH', 'SUPER_ADMIN', 'SPORTS_ADMIN'));

router.get('/dashboard', CoachController.getDashboard);
router.post('/attendance', CoachController.markAttendance);
router.post('/players', CoachController.addPlayerToSquad);
router.patch('/players/:memberId', CoachController.updateSquadPlayer);

export default router;
