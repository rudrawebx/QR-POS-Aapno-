import { PrismaClient } from './generated/prisma';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const rawDbUrl =
  process.env.DATABASE_URL ||
  'mysql://u931854669_aapno_khano:RudraWebX%4012@127.0.0.1:3306/u931854669_aapno_khano';

function createPrismaClient(): PrismaClient {
  const parsed = new URL(rawDbUrl);
  const adapter = new PrismaMariaDb({
    host: parsed.hostname || '127.0.0.1',
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    connectionLimit: 5,
    connectTimeout: 5000,
    idleTimeout: 30000,
    allowPublicKeyRetrieval: true,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

export default prisma;

