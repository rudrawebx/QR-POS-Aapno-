import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Valid email address is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      // Return success to avoid email enumeration
      return NextResponse.json({
        success: true,
        message: 'If the email exists, a password reset link has been dispatched.',
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Password reset instructions generated successfully.',
      resetToken, // Provided in response for easy testing
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process password reset request' }, { status: 500 });
  }
}
