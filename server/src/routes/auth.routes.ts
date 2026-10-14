import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import {
  loginSchema,
  registerStudentSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} from '../validators/auth.validator';

const router = Router();

// Public Authentication Endpoints (Rate Limited)
router.post('/register', authLimiter, validateRequest(registerStudentSchema), AuthController.register);
router.post('/login', authLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/refresh-token', validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.post('/forgot-password', authLimiter, validateRequest(forgotPasswordSchema), AuthController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(resetPasswordSchema), AuthController.resetPassword);

// Authenticated Endpoints (Requires Valid Access Token)
router.get('/me', authenticateJwt, AuthController.getMe);
router.post('/logout', authenticateJwt, AuthController.logout);
router.post('/change-password', authenticateJwt, validateRequest(changePasswordSchema), AuthController.changePassword);

export default router;
