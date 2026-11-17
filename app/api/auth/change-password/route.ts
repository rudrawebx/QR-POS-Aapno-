import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession, hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: 'All password fields are required' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirm password do not match' }, { status: 400 });
    }

    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!user || !verifyPassword(currentPassword, user.passwordHash)) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const newHash = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash, forcePasswordChange: false },
    });

    // Revoke all other active sessions for security
    await prisma.session.updateMany({
      where: {
        userId: user.id,
        ...(session.sessionId ? { id: { not: session.sessionId } } : {}),
      },
      data: { isRevoked: true },
    });

    await prisma.auditLog.create({
      data: {
        restaurantId: session.restaurantId,
        userId: user.id,
        userName: user.name,
        action: 'PASSWORD_CHANGED',
        entity: 'User',
        entityId: user.id,
        notes: 'Password updated by user; other sessions revoked',
      },
    }).catch(() => {});

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
  }
}
