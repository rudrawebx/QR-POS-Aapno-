import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  hashPassword,
  normalizeEmail,
  normalizeMobile,
  validatePasswordStrength,
} from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      ownerName,
      restaurantName,
      email,
      mobile,
      password,
      confirmPassword,
      address,
      city,
      state,
      pincode,
      logoUrl,
      coverUrl,
      gstin,
      fssaiNumber,
      upiId,
      otpVerifiedIdentifier,
    } = body;

    // 1. Validate Required Fields
    if (!ownerName || !restaurantName || !email || !mobile || !password || !address || !city || !state || !pincode) {
      return NextResponse.json(
        { error: 'All required fields (Owner Name, Restaurant Name, Email, Mobile, Password, Address, City, State, Pincode) must be filled.' },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: 'Password and Confirm Password do not match.' }, { status: 400 });
    }

    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 });
    }

    const normEmail = normalizeEmail(email);
    const normMobile = normalizeMobile(mobile);

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normEmail)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }
    if (normMobile.length < 10) {
      return NextResponse.json({ error: 'Please enter a valid 10-digit mobile number.' }, { status: 400 });
    }

    // 2. Verify OTP was completed for either email or mobile
    const verifiedOtp = await prisma.otpVerification.findFirst({
      where: {
        identifier: { in: [normEmail, normMobile, ...(otpVerifiedIdentifier ? [otpVerifiedIdentifier] : [])] },
        purpose: 'REGISTRATION',
        verified: true,
        expiresAt: { gt: new Date(Date.now() - 30 * 60 * 1000) }, // valid within 30 mins of verification
      },
    });

    if (!verifiedOtp) {
      return NextResponse.json(
        { error: 'Please verify your email or mobile number via OTP before submitting.' },
        { status: 400 }
      );
    }

    // 3. Duplicate Prevention across active Users and active Applications
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normEmail }, { phone: normMobile }, { phone: `+91${normMobile}` }],
      },
    });
    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email or mobile number already exists. Please sign in instead.' },
        { status: 409 }
      );
    }

    const existingApp = await prisma.restaurantApplication.findFirst({
      where: {
        OR: [{ email: normEmail }, { mobile: normMobile }],
        status: { in: ['PENDING_APPROVAL', 'UNDER_REVIEW', 'APPROVED', 'ACTIVE'] },
      },
    });
    if (existingApp) {
      return NextResponse.json(
        {
          error: `An application (${existingApp.applicationRef}) with this email or mobile already exists and is currently ${existingApp.status.replace('_', ' ')}.`,
        },
        { status: 409 }
      );
    }

    // 4. Optional GSTIN & FSSAI format check if provided
    if (gstin && gstin.trim()) {
      const cleanGstin = gstin.trim().toUpperCase();
      if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(cleanGstin)) {
        return NextResponse.json({ error: 'Invalid GSTIN format. Leave blank if not registered.' }, { status: 400 });
      }
    }
    if (fssaiNumber && fssaiNumber.trim()) {
      const cleanFssai = fssaiNumber.trim();
      if (!/^[0-9]{14}$/.test(cleanFssai)) {
        return NextResponse.json({ error: 'FSSAI License Number must be 14 digits. Leave blank if not registered.' }, { status: 400 });
      }
    }

    // 5. Generate unique Application Reference Number
    const count = await prisma.restaurantApplication.count();
    const applicationRef = `APP-${new Date().getFullYear()}-${String(count + 101).padStart(4, '0')}`;
    const passwordHash = hashPassword(password);
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown_ip';

    const application = await prisma.restaurantApplication.create({
      data: {
        applicationRef,
        ownerName: ownerName.trim(),
        restaurantName: restaurantName.trim(),
        email: normEmail,
        mobile: normMobile,
        passwordHash,
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        logoUrl: logoUrl?.trim() || null,
        coverUrl: coverUrl?.trim() || null,
        gstin: gstin?.trim().toUpperCase() || null,
        fssaiNumber: fssaiNumber?.trim() || null,
        upiId: upiId?.trim() || null,
        status: 'PENDING_APPROVAL',
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'RESTAURANT_REGISTRATION_SUBMITTED',
        entity: 'RestaurantApplication',
        entityId: application.id,
        notes: `New application ${applicationRef} submitted for ${restaurantName} (${city}) by ${normEmail}`,
        ipAddress: clientIp,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      applicationRef: application.applicationRef,
      status: application.status,
      message: 'Registration submitted successfully! Your application is pending Super Admin approval.',
    });
  } catch (error) {
    console.error('Restaurant registration error:', error);
    return NextResponse.json({ error: 'Failed to submit registration' }, { status: 500 });
  }
}
