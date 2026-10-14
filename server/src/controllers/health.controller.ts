import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';
import { env } from '../config/env';

export const getHealthStatus = async (req: Request, res: Response) => {
  const startTime = Date.now();
  let dbStatus = 'DISCONNECTED';
  let dbLatencyMs = 0;

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    dbLatencyMs = Date.now() - dbStart;
    dbStatus = 'CONNECTED';
  } catch (error: any) {
    dbStatus = 'ERROR';
    console.warn('Database health check warning:', error?.message || error);
  }

  const responseTimeMs = Date.now() - startTime;

  const healthData = {
    service: 'PCTE SPORTEX Backend API',
    status: 'HEALTHY',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      provider: 'PostgreSQL (Prisma)',
      status: dbStatus,
      latencyMs: dbLatencyMs,
    },
    performance: {
      responseTimeMs,
      memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    },
  };

  return sendSuccess(res, healthData, 'System is operational');
};
