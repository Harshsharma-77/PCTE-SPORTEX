import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('5000').transform((val) => parseInt(val, 10)),
  HOST: z.string().default('0.0.0.0'),
  CLIENT_URL: z.string().default('http://localhost:5173'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(8, 'JWT_SECRET must be at least 8 characters long'),
  JWT_REFRESH_SECRET: z.string().min(8, 'JWT_REFRESH_SECRET must be at least 8 characters long'),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  UPLOAD_DIR: z.string().default('./uploads'),
  SUPERADMIN_EMAIL: z.string().email().default('superadmin@pcte.edu.in'),
  SUPERADMIN_PASSWORD: z.string().default('AdminPassword@2026'),
  SUPERADMIN_NAME: z.string().default('PCTE Director of Sports'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Environment configuration validation failed:');
    console.error(result.error.format());
    // In development, provide fallback defaults to avoid hard crashes during initial setup
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ Falling back to default development environment configuration.');
      return {
        NODE_ENV: 'development' as const,
        PORT: 5000,
        HOST: '0.0.0.0',
        CLIENT_URL: 'http://localhost:5173',
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pcte_sportex?schema=public',
        JWT_SECRET: process.env.JWT_SECRET || 'sportex_jwt_access_secret_key_pcte_btech_cse_2026',
        JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'sportex_jwt_refresh_secret_key_pcte_btech_cse_2026',
        JWT_EXPIRES_IN: '15m',
        JWT_REFRESH_EXPIRES_IN: '7d',
        UPLOAD_DIR: './uploads',
        SUPERADMIN_EMAIL: 'superadmin@pcte.edu.in',
        SUPERADMIN_PASSWORD: 'AdminPassword@2026',
        SUPERADMIN_NAME: 'PCTE Director of Sports',
      };
    }
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
