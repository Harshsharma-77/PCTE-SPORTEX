import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { verifyAccessToken } from '../utils/token';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants';

export const authenticateJwt = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    let token: string | undefined;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'] as string;
    }

    if (!token) {
      return sendError(
        res,
        'Access denied. No authentication token provided.',
        HTTP_STATUS.UNAUTHORIZED,
        'UnauthorizedError'
      );
    }

    let decoded;
    try {
      decoded = verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        return sendError(
          res,
          'Authentication token has expired. Please refresh your session.',
          HTTP_STATUS.UNAUTHORIZED,
          'TokenExpiredError'
        );
      }
      return sendError(
        res,
        'Invalid authentication token provided.',
        HTTP_STATUS.UNAUTHORIZED,
        'InvalidTokenError'
      );
    }

    // Verify user exists and is active in database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, roleEnum: true, isActive: true },
    });

    if (!user) {
      return sendError(
        res,
        'The account belonging to this token no longer exists.',
        HTTP_STATUS.UNAUTHORIZED,
        'UserNotFoundError'
      );
    }

    if (!user.isActive) {
      return sendError(
        res,
        'Your user account has been deactivated. Please contact the Sports Admin.',
        HTTP_STATUS.FORBIDDEN,
        'AccountDeactivatedError'
      );
    }

    req.user = {
      userId: user.id,
      email: user.email,
      role: user.roleEnum,
      name: user.name,
    };

    next();
  } catch (error) {
    next(error);
  }
};
