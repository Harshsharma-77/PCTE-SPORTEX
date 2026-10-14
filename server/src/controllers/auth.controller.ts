import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants';
import { AuthenticatedRequest } from '../types';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const clientInfo = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      const result = await AuthService.registerStudent(req.body, clientInfo);

      // Set Refresh Token in secure HttpOnly cookie
      res.cookie('sportex_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      return sendSuccess(
        res,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        'Student athlete registered successfully',
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { identifier, password } = req.body;
      const clientInfo = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      const result = await AuthService.login(identifier, password, clientInfo);

      // Set Refresh Token cookie
      res.cookie('sportex_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(
        res,
        { user: result.user, accessToken: result.accessToken, refreshToken: result.refreshToken },
        'Authentication successful',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const rawToken = req.body.refreshToken || req.cookies?.sportex_refresh_token;

      if (!rawToken) {
        return sendError(
          res,
          'Refresh token is required to refresh session.',
          HTTP_STATUS.BAD_REQUEST,
          'MissingRefreshTokenError'
        );
      }

      const clientInfo = {
        ip: req.ip || req.socket.remoteAddress,
        userAgent: req.get('user-agent'),
      };

      const result = await AuthService.refreshSession(rawToken, clientInfo);

      res.cookie('sportex_refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return sendSuccess(
        res,
        { accessToken: result.accessToken, refreshToken: result.refreshToken },
        'Session refreshed successfully',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const rawToken = req.body.refreshToken || req.cookies?.sportex_refresh_token;
      const userId = req.user?.userId;

      await AuthService.logout(rawToken, userId);

      res.clearCookie('sportex_refresh_token');

      return sendSuccess(res, null, 'Logged out successfully', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }

      const user = await AuthService.getCurrentUser(req.user.userId);
      return sendSuccess(res, user, 'User profile retrieved', HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
      }

      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.userId, currentPassword, newPassword);

      res.clearCookie('sportex_refresh_token');

      return sendSuccess(res, result, result.message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = req.body;
      const result = await AuthService.forgotPassword(email);
      return sendSuccess(res, result, result.message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = req.body;
      const result = await AuthService.resetPassword(token, newPassword);
      return sendSuccess(res, null, result.message, HTTP_STATUS.OK);
    } catch (error) {
      next(error);
    }
  }
}
