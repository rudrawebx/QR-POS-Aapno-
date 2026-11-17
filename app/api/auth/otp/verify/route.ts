import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashToken, normalizeEmail, normalizeMobile } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, otp, purpose = 'REGISTRATION' } = await request.json();
    if (!identifier || !otp) {
      return NextResponse.json({ error: 'Identifier and 6-digit OTP are required' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const normalized = isEmail ? normalizeEmail(identifier) : normalizeMobile(identifier);

    const record = await prisma.otpVerification.findFirst({
      where: { identifier: normalized, purpose },
      orderBy: { createdAt: 'desc' },
    });

    if (!record) {
      return NextResponse.json({ error: 'No OTP request found. Please request a new OTP.' }, { status: 404 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: 'OTP has expired. Please request a new one.' }, { status: 400 });
    }

    if (record.attempts >= 5) {
      return NextResponse.json({ error: 'Maximum OTP attempts exceeded. Please request a new OTP.' }, { status: 429 });
    }

    const expectedHash = hashToken(`${normalized}:${purpose}:${String(otp).trim()}`);
    if (record.otpHash !== expectedHash) {
      await prisma.otpVerification.update({
        where: { id: record.id },
        data: { attempts: { increment: 1 } },
      });
      return NextResponse.json({ error: 'Invalid OTP. Please check and try again.' }, { status: 400 });
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data: { verified: true },
    });

    return NextResponse.json({
      success: true,
      verified: true,
      identifier: normalized,
      message: 'Verification successful',
    });
  } catch (error) {
    console.error('OTP verify error:', error);
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}
