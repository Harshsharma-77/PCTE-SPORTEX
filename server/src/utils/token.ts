import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';
import { JwtPayload } from '../types';
import { UserRoleEnum } from '@prisma/client';

export function generateAccessToken(payload: {
  userId: string;
  email: string;
  role: UserRoleEnum;
  name: string;
}): string {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function generateRefreshToken(): { token: string; tokenHash: string; expiresAt: Date } {
  // Generate a high-entropy random hex token
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(token);
  // Default 7 days expiration
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  return { token, tokenHash, expiresAt };
}

export function generatePasswordResetToken(): { token: string; tokenHash: string; expiresAt: Date } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(token);
  // Reset token expires in 1 hour
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  return { token, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtPayload;
}
