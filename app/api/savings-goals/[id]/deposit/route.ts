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

    const depositAmount = Number(amount);
    if (!depositAmount || depositAmount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Nominal setoran tabungan harus lebih dari 0' },
        { status: 400 }
      );
    }

    if (!walletId) {
      return NextResponse.json(
        { success: false, error: 'Dompet sumber dana wajib dipilih' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    // Atomic transaction for deposit, wallet balance deduction, and expense transaction creation
    const result = await prisma.$transaction(async (tx) => {
      const goal = await tx.savingsGoal.findUnique({
        where: { id },
      });

      if (!goal) {
        throw new Error('Target tabungan tidak ditemukan');
      }

      const wallet = await tx.wallet.findUnique({
        where: { id: walletId },
      });

      if (!wallet) {
        throw new Error('Dompet tidak ditemukan');
      }

      if (wallet.balance < depositAmount) {
        throw new Error('Saldo dompet tidak mencukupi untuk setor tabungan');
      }

      // 1. Decrement wallet balance
      const updatedWallet = await tx.wallet.update({
        where: { id: walletId },
        data: { balance: { decrement: depositAmount } },
      });

      // 2. Increment goal currentAmount
      const updatedGoal = await tx.savingsGoal.update({
        where: { id },
        data: { currentAmount: { increment: depositAmount } },
      });

      // 3. Create expense transaction
      const existingCat = await tx.expenseCategory.findFirst({
        where: {
          userId: user.id,
          OR: [
            { name: { contains: 'Nabung', mode: 'insensitive' } },
            { name: { contains: 'Tabung', mode: 'insensitive' } },
            { name: { contains: 'Investasi', mode: 'insensitive' } },
          ],
        },
      });
      const categoryName = existingCat ? existingCat.name : 'Nabung & Investasi';

      const today = new Date().toISOString().split('T')[0];
      const createdTx = await tx.transaction.create({
        data: {
          amount: depositAmount,
          type: 'expense',
          date: today,
          category: categoryName,
          description: `Setor tabungan: ${goal.title}`,
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
      message: 'Setoran tabungan berhasil dialokasikan dan dicatat ke transaksi',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Gagal memproses setoran tabungan' },
      { status: 400 }
    );
  }
}
