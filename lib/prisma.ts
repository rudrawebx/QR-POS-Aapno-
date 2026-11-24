import { PrismaClient } from '@prisma/client';

// Limit Tokio/libuv threads on shared hosting (e.g. Hostinger) to prevent
// "PANIC: timer has gone away" caused by thread/nproc limits.
if (!process.env.TOKIO_WORKER_THREADS) {
  process.env.TOKIO_WORKER_THREADS = '1';
}
if (!process.env.UV_THREADPOOL_SIZE) {
  process.env.UV_THREADPOOL_SIZE = '1';
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let rawDbUrl =
  process.env.DATABASE_URL ||
  'mysql://u931854669_aapno_khano:RudraWebX%4012@127.0.0.1:3306/u931854669_aapno_khano';

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

