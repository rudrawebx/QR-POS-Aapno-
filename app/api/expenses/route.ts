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

    const expenses = await prisma.expense.findMany({
      where: { restaurantId },
      orderBy: { expenseDate: 'desc' },
      include: { createdByStaff: true },
    });

    const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);

    return NextResponse.json({ expenses, totalExpense });
  } catch (error) {
    console.error('Expenses fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getCurrentSession();
    if (!session || !session.restaurantId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { category, title, amount, paymentMethod, notes, expenseDate } = await request.json();

    const expense = await prisma.expense.create({
      data: {
        restaurantId: session.restaurantId,
        category: category || 'OTHER',
        title,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || 'CASH',
        notes: notes || null,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        createdByStaffId: session.userId,
      },
    });

    return NextResponse.json({ success: true, expense });
  } catch (error) {
    console.error('Create expense error:', error);
    return NextResponse.json({ error: 'Failed to record expense' }, { status: 500 });
  }
}
