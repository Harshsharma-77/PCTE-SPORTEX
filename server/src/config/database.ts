import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  // eslint-disable-next-line no-var
  var prismaClientGlobal: PrismaClient | undefined;
}

export const prisma =
  global.prismaClientGlobal ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  global.prismaClientGlobal = prisma;
}

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ PostgreSQL Database connected successfully via Prisma.');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to PostgreSQL Database:');
    console.error(error);
    return false;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 PostgreSQL Database disconnected.');
}
