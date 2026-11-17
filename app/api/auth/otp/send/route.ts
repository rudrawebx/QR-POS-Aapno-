import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  generateOtpCode,
  hashToken,
  normalizeEmail,
  normalizeMobile,
  checkLoginRateLimit,
  recordFailedLogin,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const { identifier, purpose = 'REGISTRATION' } = await request.json();
    if (!identifier || typeof identifier !== 'string') {
      return NextResponse.json({ error: 'Valid email or mobile number is required' }, { status: 400 });
    }

    const isEmail = identifier.includes('@');
    const normalized = isEmail ? normalizeEmail(identifier) : normalizeMobile(identifier);

    if (!isEmail && normalized.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number or email' }, { status: 400 });
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';
    const rateCheck = checkLoginRateLimit(`otp_${clientIp}_${normalized}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: `Too many OTP requests. Please try again in ${rateCheck.remainingMinutes || 15} minutes.` },
        { status: 429 }
      );
    }

    recordFailedLogin(`otp_${clientIp}_${normalized}`);

    const otp = generateOtpCode();
    const otpHash = hashToken(`${normalized}:${purpose}:${otp}`);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Clean previous unverified OTPs for same identifier & purpose
    await prisma.otpVerification.deleteMany({
      where: { identifier: normalized, purpose, verified: false },
    });

    await prisma.otpVerification.create({
      data: {
        identifier: normalized,
        purpose,
        otpHash,
        expiresAt,
      },
    });

    // Note: Production SMS/Email gateway hooks can be invoked here.
    // For immediate verification testing when no SMTP/SMS key is configured, include demoOtp only in non-strict mode or log it.
    console.log(`[OTP SERVICE] Purpose: ${purpose} | Identifier: ${normalized} | OTP: ${otp}`);

    return NextResponse.json({
      success: true,
      message: `6-digit verification OTP sent to ${identifier}`,
      expiresInSeconds: 600,
      // Provide testOtp only if no external SMS/Email provider is configured in env
      testOtp: !process.env.SMTP_HOST && !process.env.MSG91_AUTH_KEY ? otp : undefined,
    });
  } catch (error) {
    console.error('OTP send error:', error);
    return NextResponse.json({ error: 'Failed to send verification OTP' }, { status: 500 });
  }
}
