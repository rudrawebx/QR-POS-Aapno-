import { NextResponse } from 'next/server';
import net from 'net';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

function testTcp(host: string, port = 3306, timeoutMs = 2000): Promise<string> {
  return new Promise((resolve) => {
    const start = Date.now();
    const sock = net.createConnection({ host, port });
    sock.setTimeout(timeoutMs);
    sock.on('connect', () => {
      sock.destroy();
      resolve(`OK (${Date.now() - start}ms)`);
    });
    sock.on('timeout', () => {
      sock.destroy();
      resolve(`TIMEOUT (${timeoutMs}ms)`);
    });
    sock.on('error', (e: any) => {
      sock.destroy();
      resolve(`ERR: ${e?.code || e?.message}`);
    });
  });
}

export async function GET() {
  const raw = process.env.DATABASE_URL || '';
  const hostMatch = raw.match(/@([^/:]+):?(\d+)?/);
  const envHost = hostMatch ? `${hostMatch[1]}:${hostMatch[2] || '3306'}` : 'fallback_127.0.0.1:3306';

  const tcpChecks = await Promise.all([
    testTcp('127.0.0.1', 3306).then((r) => ['127.0.0.1:3306', r]),
    testTcp('localhost', 3306).then((r) => ['localhost:3306', r]),
    testTcp('srv2143.hstgr.io', 3306).then((r) => ['srv2143.hstgr.io:3306', r]),
    testTcp('195.35.61.22', 3306).then((r) => ['195.35.61.22:3306', r]),
  ]);

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.restaurant.count();
    return NextResponse.json({
      ok: true,
      envHost,
      latencyMs: Date.now() - start,
      restaurants: count,
      tcpChecks: Object.fromEntries(tcpChecks),
    });
  } catch (err: any) {
    const msg = String(err?.message || 'Unknown DB error')
      .replace(/mysql:\/\/[^@]+@/gi, 'mysql://***@')
      .slice(0, 300);
    return NextResponse.json(
      {
        ok: false,
        envHost,
        tcpChecks: Object.fromEntries(tcpChecks),
        errorCode: err?.code || err?.errorCode || 'DB_CONN_ERR',
        message: msg,
      },
      { status: 500 }
    );
  }
}
