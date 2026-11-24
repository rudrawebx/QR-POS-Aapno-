import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let rawDbUrl =
  process.env.DATABASE_URL ||
  'mysql://u931854669_aapno_khano:RudraWebX%4012@195.35.61.22:3306/u931854669_aapno_khano';

// Force IPv4 address for Hostinger MySQL to avoid IPv6 DNS timeouts in Node/Prisma
if (rawDbUrl.includes('srv2143.hstgr.io')) {
  rawDbUrl = rawDbUrl.replace('srv2143.hstgr.io', '195.35.61.22');
}

if (!rawDbUrl.includes('connection_limit')) {
  rawDbUrl += (rawDbUrl.includes('?') ? '&' : '?') + 'connection_limit=5&pool_timeout=15';
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

