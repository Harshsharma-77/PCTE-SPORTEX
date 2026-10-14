import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { env } from './config/env';
import { globalLimiter } from './middleware/rateLimiter.middleware';
import { errorHandler } from './middleware/error.middleware';
import v1Router from './routes';
import { getHealthStatus } from './controllers/health.controller';
import { HTTP_STATUS } from './constants';
import { sendError } from './utils/response';

export function createApp(): Application {
  const app = express();

  // 1. Security Headers
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      crossOriginEmbedderPolicy: false,
    })
  );

  // 2. CORS Guard
  app.use(
    cors({
      origin: (requestOrigin, callback) => {
        if (!requestOrigin) return callback(null, true);
        if (
          requestOrigin === env.CLIENT_URL ||
          requestOrigin.includes('localhost') ||
          requestOrigin.includes('127.0.0.1') ||
          requestOrigin.endsWith('.vercel.app') ||
          requestOrigin.endsWith('.onrender.com') ||
          requestOrigin.endsWith('.netlify.app')
        ) {
          return callback(null, true);
        }
        return callback(null, true);
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // 3. Request Logging
  if (env.NODE_ENV !== 'test') {
    app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
  }

  // 4. Body Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 5. Rate Limiting
  app.use(globalLimiter);

  // 6. Static Uploads Folder
  const uploadPath = path.resolve(env.UPLOAD_DIR);
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }
  app.use('/uploads', express.static(uploadPath));

  // 7. Base Health Checks (Supports both /api/health and /api/v1/health)
  app.get('/api/health', getHealthStatus);
  app.get('/health', getHealthStatus);

  // 8. API v1 Master Router Mount
  app.use('/api/v1', v1Router);

  // 9. Root Welcome & API Metadata
  app.get('/', (req: Request, res: Response) => {
    res.json({
      name: 'PCTE SPORTEX API Engine',
      status: 'ONLINE',
      version: '1.0.0',
      description: 'College Sports Management Platform API for PCTE Group of Institutes',
      endpoints: {
        health: '/api/health',
        apiV1: '/api/v1',
      },
    });
  });

  // 10. 404 Route Catch-All
  app.use((req: Request, res: Response) => {
    sendError(res, `Route ${req.method} ${req.originalUrl} not found`, HTTP_STATUS.NOT_FOUND, 'RouteNotFoundError');
  });

  // 11. Centralized Global Error Handler
  app.use(errorHandler);

  return app;
}
