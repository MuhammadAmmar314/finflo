import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || defaultUser.email;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        debts: {
          orderBy: { dueDate: 'asc' },
        },
      },
    });

    return NextResponse.json({ success: true, data: user?.debts ?? [] });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch debts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      title,
      platform,
      totalAmount,
      remainingAmount,
      minimumPayment,
      dueDate,
      notes,
      email = defaultUser.email,
    } = body;

    const totalNum = Number(totalAmount);
    if (!type || !title || !totalNum || !dueDate) {
      return NextResponse.json(
        { success: false, error: 'Title, type, total amount, and due date are required' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const debt = await prisma.debt.create({
      data: {
        type,
        title,
        platform: platform || (type === 'paylater' ? 'PayLater' : 'Pribadi'),
        totalAmount: totalNum,
        remainingAmount: typeof remainingAmount === 'number' ? remainingAmount : totalNum,
        minimumPayment: minimumPayment ? Number(minimumPayment) : null,
        dueDate,
        status: 'active',
        notes: notes || null,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true, data: debt }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create debt record' },
      { status: 500 }
    );
  }
}
