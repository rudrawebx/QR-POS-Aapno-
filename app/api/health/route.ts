import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const raw = process.env.DATABASE_URL || '';
  const hostMatch = raw.match(/@([^/:]+):?(\d+)?/);
  const envHost = hostMatch ? `${hostMatch[1]}:${hostMatch[2] || '3306'}` : 'fallback_195.35.61.22:3306';

  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const count = await prisma.restaurant.count();
    return NextResponse.json({
      ok: true,
      envHost,
      latencyMs: Date.now() - start,
      restaurants: count,
    });
  } catch (err: any) {
    const msg = String(err?.message || 'Unknown DB error')
      .replace(/mysql:\/\/[^@]+@/gi, 'mysql://***@')
      .slice(0, 300);
    return NextResponse.json(
      {
        ok: false,
        envHost,
        errorCode: err?.code || err?.errorCode || 'DB_CONN_ERR',
        message: msg,
      },
      { status: 500 }
    );
  }
}
