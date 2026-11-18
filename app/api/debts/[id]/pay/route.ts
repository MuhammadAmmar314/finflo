import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount, walletId, isFullPayment, email = defaultUser.email } = body;

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0 || !walletId) {
      return NextResponse.json(
        { success: false, error: 'Amount and walletId are required' },
        { status: 400 }
      );
    }

    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt) {
      return NextResponse.json({ success: false, error: 'Debt not found' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Deduct wallet balance
      await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { decrement: amountNum } },
      });

      // 2. Record expense transaction
      const transaction = await tx.transaction.create({
        data: {
          amount: amountNum,
          type: 'expense',
          date: new Date().toISOString().split('T')[0],
          category: 'Tagihan & Utilitas',
          description: `Bayar cicilan: ${debt.title} (${debt.platform})`,
          walletId,
          userId: user.id,
        },
      });

      // 3. Update debt remaining amount and status
      const newRemaining = Math.max(0, debt.remainingAmount - amountNum);
      const updatedDebt = await tx.debt.update({
        where: { id },
        data: {
          remainingAmount: newRemaining,
          status: isFullPayment || newRemaining <= 0 ? 'paid' : 'active',
        },
      });

      return { debt: updatedDebt, transaction };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to process debt payment' },
      { status: 500 }
    );
  }
}
