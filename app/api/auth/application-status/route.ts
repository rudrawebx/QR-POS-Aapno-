import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { normalizeEmail } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ref = searchParams.get('ref')?.trim();
    const email = searchParams.get('email')?.trim();

    if (!ref && !email) {
      return NextResponse.json({ error: 'Please provide Application Reference ID or Email' }, { status: 400 });
    }

    const app = await prisma.restaurantApplication.findFirst({
      where: ref ? { applicationRef: ref.toUpperCase() } : { email: normalizeEmail(email!) },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        applicationRef: true,
        ownerName: true,
        restaurantName: true,
        email: true,
        mobile: true,
        address: true,
        city: true,
        state: true,
        pincode: true,
        gstin: true,
        fssaiNumber: true,
        upiId: true,
        status: true,
        rejectionReason: true,
        assignedQsrNumber: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!app) {
      return NextResponse.json({ error: 'No matching restaurant application found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: app });
  } catch (error) {
    console.error('Application status check error:', error);
    return NextResponse.json({ error: 'Failed to check application status' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { applicationRef, ownerName, restaurantName, address, city, state, pincode, gstin, fssaiNumber, upiId } = body;

    if (!applicationRef) {
      return NextResponse.json({ error: 'Application Reference ID is required' }, { status: 400 });
    }

    const existing = await prisma.restaurantApplication.findUnique({
      where: { applicationRef: applicationRef.trim().toUpperCase() },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (existing.status !== 'REJECTED') {
      return NextResponse.json(
        { error: 'Only rejected applications can be corrected and resubmitted.' },
        { status: 400 }
      );
    }

    const updated = await prisma.restaurantApplication.update({
      where: { id: existing.id },
      data: {
        ownerName: ownerName?.trim() || existing.ownerName,
        restaurantName: restaurantName?.trim() || existing.restaurantName,
        address: address?.trim() || existing.address,
        city: city?.trim() || existing.city,
        state: state?.trim() || existing.state,
        pincode: pincode?.trim() || existing.pincode,
        gstin: gstin !== undefined ? (gstin?.trim().toUpperCase() || null) : existing.gstin,
        fssaiNumber: fssaiNumber !== undefined ? (fssaiNumber?.trim() || null) : existing.fssaiNumber,
        upiId: upiId !== undefined ? (upiId?.trim() || null) : existing.upiId,
        status: 'PENDING_APPROVAL',
        rejectionReason: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: 'RESTAURANT_APPLICATION_RESUBMITTED',
        entity: 'RestaurantApplication',
        entityId: updated.id,
        notes: `Application ${updated.applicationRef} corrected and resubmitted by ${updated.email}`,
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      status: updated.status,
      message: 'Application resubmitted for Super Admin review.',
    });
  } catch (error) {
    console.error('Application resubmit error:', error);
    return NextResponse.json({ error: 'Failed to resubmit application' }, { status: 500 });
  }
}
