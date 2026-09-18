import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const HOSTINGER_DB_URL =
  process.env.DATABASE_URL ||
  'mysql://u931854669_aapno_khano:RudraWebX%4012@srv2143.hstgr.io:3306/u931854669_aapno_khano';

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: HOSTINGER_DB_URL,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
