import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { HTTP_STATUS } from '../constants';
import { sendError } from '../utils/response';
import { env } from '../config/env';

export class AppError extends Error {
  statusCode: number;
  errorType: string;
  details?: any;

  constructor(message: string, statusCode: number = HTTP_STATUS.BAD_REQUEST, errorType = 'AppError', details?: any) {
    super(message);
    this.statusCode = statusCode;
    this.errorType = errorType;
    this.details = details;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  // Log error in non-test environments
  if (env.NODE_ENV !== 'test') {
    console.error(`[Error] [${req.method} ${req.originalUrl}]`, err);
  }

  // 1. Zod Validation Error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    return sendError(
      res,
      'Validation failed for incoming payload',
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      'ValidationError',
      formattedErrors
    );
  }

  // 2. Custom AppError
  if (err instanceof AppError) {
    return sendError(res, err.message, err.statusCode, err.errorType, err.details);
  }

  // 3. Prisma Known Request Error
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return sendError(
        res,
        `A unique constraint failed on ${target}. This value already exists.`,
        HTTP_STATUS.CONFLICT,
        'DuplicateEntryError'
      );
    }
    if (err.code === 'P2025') {
      return sendError(res, 'Record requested was not found.', HTTP_STATUS.NOT_FOUND, 'RecordNotFoundError');
    }
  }

  // 4. JWT Authentication Errors
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Invalid authentication token provided.', HTTP_STATUS.UNAUTHORIZED, 'InvalidTokenError');
  }
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Authentication token has expired.', HTTP_STATUS.UNAUTHORIZED, 'TokenExpiredError');
  }

  // 5. Default Fallback Internal Server Error
  const message = env.NODE_ENV === 'production' ? 'An unexpected internal server error occurred.' : err.message || 'Internal Server Error';
  return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR, 'InternalServerError');
};
