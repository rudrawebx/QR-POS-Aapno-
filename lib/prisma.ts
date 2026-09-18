import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let rawDbUrl =
  process.env.DATABASE_URL ||
  'mysql://u931854669_aapno_khano:RudraWebX%4012@srv2143.hstgr.io:3306/u931854669_aapno_khano';

if (!rawDbUrl.includes('connection_limit')) {
  rawDbUrl += (rawDbUrl.includes('?') ? '&' : '?') + 'connection_limit=15&pool_timeout=10';
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: rawDbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = prisma;

export default prisma;

