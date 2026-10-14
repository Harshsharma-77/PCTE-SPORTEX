import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types';
import { UserRoleEnum } from '@prisma/client';
import { prisma } from '../config/database';
import { sendError } from '../utils/response';
import { HTTP_STATUS } from '../constants';

/**
 * Enforce role-based access control against a list of allowed UserRoleEnum values.
 */
export const authorizeRoles = (...allowedRoles: UserRoleEnum[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(
        res,
        'Authentication required to access this resource.',
        HTTP_STATUS.UNAUTHORIZED,
        'UnauthorizedError'
      );
    }

    // Super Admin has universal bypass for all role checks
    if (req.user.role === UserRoleEnum.SUPER_ADMIN) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(
        res,
        `Access denied. Role '${req.user.role}' is not authorized to perform this operation.`,
        HTTP_STATUS.FORBIDDEN,
        'ForbiddenRoleError'
      );
    }

    next();
  };
};

/**
 * Enforce granular capability permissions against the database role-permission matrix.
 */
export const requirePermissions = (...requiredPermissions: string[]) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return sendError(
          res,
          'Authentication required to access this resource.',
          HTTP_STATUS.UNAUTHORIZED,
          'UnauthorizedError'
        );
      }

      // Super Admin bypass
      if (req.user.role === UserRoleEnum.SUPER_ADMIN) {
        return next();
      }

      // Fetch user's role and associated permission codes
      const userWithPermissions = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      const grantedPermissions =
        userWithPermissions?.role?.permissions.map((rp) => rp.permission.code) || [];

      const hasAllPermissions = requiredPermissions.every((perm) =>
        grantedPermissions.includes(perm)
      );

      if (!hasAllPermissions) {
        return sendError(
          res,
          `Access denied. Missing required permission(s): ${requiredPermissions.join(', ')}`,
          HTTP_STATUS.FORBIDDEN,
          'MissingPermissionError'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
