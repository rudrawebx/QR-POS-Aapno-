import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessions = await prisma.session.findMany({
      where: {
        userId: session.userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { lastActivityAt: 'desc' },
      select: {
        id: true,
        deviceInfo: true,
        ipAddress: true,
        lastActivityAt: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      currentSessionId: session.sessionId || null,
      sessions,
    });
  } catch (error) {
    console.error('Sessions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const all = searchParams.get('all') === 'true';

    if (all) {
      await prisma.session.updateMany({
        where: { userId: session.userId },
        data: { isRevoked: true },
      });

      const res = NextResponse.json({ success: true, message: 'Logged out from all devices' });
      res.cookies.set('auth_session', '', { path: '/', maxAge: 0 });
      return res;
    }

    if (!sessionId) {
      return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
    }

    await prisma.session.updateMany({
      where: { id: sessionId, userId: session.userId },
      data: { isRevoked: true },
    });

    return NextResponse.json({ success: true, message: 'Session revoked' });
  } catch (error) {
    console.error('Session revoke error:', error);
    return NextResponse.json({ error: 'Failed to revoke session' }, { status: 500 });
  }
}
