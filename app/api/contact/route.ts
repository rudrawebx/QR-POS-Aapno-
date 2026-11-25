import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const restaurantName = String(body?.restaurantName || '').trim();
    const phone = String(body?.phone || '').trim();
    const email = String(body?.email || '').trim();
    const city = String(body?.city || '').trim();
    const message = String(body?.message || '').trim();

    if (!name || (!phone && !email)) {
      return NextResponse.json(
        { error: 'Please provide your name and a valid phone number or email.' },
        { status: 400 }
      );
    }

    try {
      await prisma.auditLog.create({
        data: {
          userName: name,
          action: 'DEMO_CONTACT_INQUIRY',
          entity: 'ContactInquiry',
          entityId: restaurantName || 'PROSPECT',
          notes: JSON.stringify({
            name,
            restaurantName,
            phone,
            email,
            city,
            message: message.slice(0, 500),
          }),
        },
      });
    } catch {
      // Non-blocking audit persistence
    }

    return NextResponse.json({
      success: true,
      message:
        'Thank you! Our onboarding team has received your request and will reach out shortly.',
    });
  } catch {
    return NextResponse.json(
      { error: 'Unable to submit request. Please try again.' },
      { status: 500 }
    );
  }
}
