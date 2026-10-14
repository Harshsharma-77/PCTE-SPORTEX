import { Router } from 'express';
import { VenueController } from '../controllers/venue.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// Public & student venue schedules
router.get('/', VenueController.getAllVenues);
router.get('/:id/schedule', VenueController.getVenueSchedule);
router.get('/:id/conflict', VenueController.checkConflict);

// Admin venue management
router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  VenueController.createVenue
);

export default router;
