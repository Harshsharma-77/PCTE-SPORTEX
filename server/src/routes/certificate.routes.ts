import { Router } from 'express';
import { CertificateController } from '../controllers/certificate.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { authorizeRoles } from '../middleware/rbac.middleware';

const router = Router();

// ============================================================================
// Public Zero-Auth Verification Portal Endpoint
// ============================================================================
router.get('/verify/:identifier', CertificateController.verifyCertificate);

// ============================================================================
// Admin Certificate Management & Generation Endpoints (Protected)
// ============================================================================
router.get(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  CertificateController.getAllCertificates
);

router.post(
  '/',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  CertificateController.generateCertificate
);

router.patch(
  '/:id/revoke',
  authenticateJwt,
  authorizeRoles('SUPER_ADMIN', 'SPORTS_ADMIN'),
  CertificateController.revokeCertificate
);

export default router;
