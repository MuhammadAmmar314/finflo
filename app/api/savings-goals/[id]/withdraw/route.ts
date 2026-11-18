import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { amount, walletId, email = defaultUser.email } = body;

    const withdrawAmount = Number(amount);
    if (!withdrawAmount || withdrawAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Nominal penarikan tabungan harus lebih dari 0' },
        { status: 400 }
      );
    }

    if (!walletId) {
      return NextResponse.json(
        { success: false, error: 'Dompet tujuan penarikan wajib dipilih' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // Atomic transaction for withdrawal, wallet balance increment, and income transaction creation
    const result = await prisma.$transaction(async (tx) => {
      const goal = await tx.savingsGoal.findUnique({
        where: { id },
      });

      if (!goal) {
        throw new Error('Target tabungan tidak ditemukan');
      }

      if (goal.currentAmount < withdrawAmount) {
        throw new Error('Saldo target tabungan tidak mencukupi untuk ditarik');
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Dompet tujuan tidak ditemukan');
      }

      // 1. Decrement goal currentAmount
      const updatedGoal = await tx.savingsGoal.update({
        where: { id },
        data: { currentAmount: { decrement: withdrawAmount } },
      });

      // 2. Increment destination wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { increment: withdrawAmount } },
      });

      // 3. Create income transaction
      const today = new Date().toISOString().split('T')[0];
      const createdTx = await tx.transaction.create({
        data: {
          amount: withdrawAmount,
          type: 'income',
          date: today,
          category: 'Tarik Tabungan',
          description: `Tarik tabungan: ${goal.title}`,
          walletId,
          savingsGoalId: goal.id,
          userId: user.id,
        },
      });

      return {
        goal: updatedGoal,
        wallet: updatedWallet,
        transaction: createdTx,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Dana tabungan berhasil ditarik dan disetorkan ke dompet tujuan',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses penarikan tabungan' },
      { status: 400 }
    );
  }
}
