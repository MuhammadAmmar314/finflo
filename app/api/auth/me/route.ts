import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || defaultUser.email;

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: {
        wallets: true,
        expenseCategories: true,
        incomeCategories: true,
        transactions: {
          orderBy: { date: 'desc' },
        },
        debts: {
          orderBy: { dueDate: 'asc' },
        },
        savingsGoals: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const { password: _, ...safeUser } = user;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Database connection failed' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, plan, name, avatar } = body;

    if (!email) {
      return NextResponse.json({ success: false, error: 'Email required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { email: email.trim().toLowerCase() },
      data: {
        ...(plan ? { plan } : {}),
        ...(name ? { name } : {}),
        ...(avatar !== undefined ? { avatar } : {}),
      },
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json({ success: true, data: safeUser });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}
