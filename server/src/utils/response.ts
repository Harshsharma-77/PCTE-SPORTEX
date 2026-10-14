import { Response } from 'express';
import { HTTP_STATUS } from '../constants';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode: number = HTTP_STATUS.OK,
  meta?: ApiResponse['meta']
): Response => {
  const payload: ApiResponse<T> = {
    success: true,
    statusCode,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
  return res.status(statusCode).json(payload);
};

export const sendError = (
  res: Response,
  message = 'An error occurred',
  statusCode: number = HTTP_STATUS.INTERNAL_SERVER_ERROR,
  error = 'InternalServerError',
  details?: any
): Response => {
  const payload: ApiResponse = {
    success: false,
    statusCode,
    message,
    error,
    ...(details ? { details } : {}),
  };
  return res.status(statusCode).json(payload);
};
