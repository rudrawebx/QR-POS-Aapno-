import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: 'Valid token and minimum 6 character password are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiry: { gte: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired password reset token' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: hashPassword(newPassword),
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        forcePasswordChange: false,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password has been updated successfully. Please login with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
