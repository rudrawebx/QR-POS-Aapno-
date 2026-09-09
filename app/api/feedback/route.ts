import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const session = await getCurrentSession();
    const restaurantId = searchParams.get('restaurantId') || session?.restaurantId;

    if (!restaurantId) {
      return NextResponse.json({ error: 'Restaurant ID required' }, { status: 400 });
    }

    const feedbacks = await prisma.feedback.findMany({
      where: { restaurantId },
      orderBy: { createdAt: 'desc' },
      include: { order: true },
    });

    const avgRating =
      feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + f.overallRating, 0) / feedbacks.length).toFixed(1)
        : '5.0';

    return NextResponse.json({ feedbacks, avgRating, totalReviews: feedbacks.length });
  } catch (error) {
    console.error('Feedback fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { restaurantId, orderId, customerName, customerPhone, overallRating, foodRating, serviceRating, ambienceRating, comment } =
      await request.json();

    const feedback = await prisma.feedback.create({
      data: {
        restaurantId,
        orderId: orderId || null,
        customerName: customerName || 'Guest',
        customerPhone: customerPhone || null,
        overallRating: parseInt(overallRating || '5'),
        foodRating: parseInt(foodRating || '5'),
        serviceRating: parseInt(serviceRating || '5'),
        ambienceRating: parseInt(ambienceRating || '5'),
        comment: comment || null,
      },
    });

    return NextResponse.json({ success: true, feedback });
  } catch (error) {
    console.error('Create feedback error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
