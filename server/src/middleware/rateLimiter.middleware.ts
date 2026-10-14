import rateLimit from 'express-rate-limit';
import { HTTP_STATUS } from '../constants';
import { sendError } from '../utils/response';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many requests from this IP. Please try again after 15 minutes.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'RateLimitExceeded'
    );
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit sensitive auth endpoints (login/register) to 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    return sendError(
      res,
      'Too many authentication attempts. Please try again after 15 minutes.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
      'AuthRateLimitExceeded'
    );
  },
});
