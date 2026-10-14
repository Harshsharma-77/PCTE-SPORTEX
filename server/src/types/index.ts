import { Request } from 'express';
import { UserRoleEnum } from '@prisma/client';

export interface JwtPayload {
  userId: string;
  email: string;
  role: UserRoleEnum;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: any;
  };
  error?: string;
  details?: any;
}
