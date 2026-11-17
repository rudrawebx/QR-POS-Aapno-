import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';

    if (session && prisma) {
      if (session.sessionId) {
        await prisma.session.updateMany({
          where: { id: session.sessionId },
          data: { isRevoked: true },
        }).catch(() => {});
      }

      await prisma.auditLog.create({
        data: {
          restaurantId: session.restaurantId,
          userId: session.userId,
          userName: session.name,
          action: 'USER_LOGOUT',
          entity: 'Session',
          entityId: session.sessionId || session.userId,
          notes: `User ${session.email} logged out from IP ${clientIp}`,
          ipAddress: clientIp,
        },
      }).catch(() => {});
    }

    const response = NextResponse.json({ success: true, message: 'Signed out successfully' });
    response.cookies.set({
      name: 'auth_session',
      value: '',
      httpOnly: true,
      path: '/',
      maxAge: 0,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
