import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { amount, walletId, isFullPayment, email = defaultUser.email } = body;

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0 || !walletId) {
      return NextResponse.json(
        { success: false, error: 'Nominal dan dompet wajib diisi' },
        { status: 400 }
      );
    }

    const debt = await prisma.debt.findUnique({ where: { id } });
    if (!debt) {
      return NextResponse.json({ success: false, error: 'Catatan hutang/piutang tidak ditemukan' }, { status: 404 });
    }

    const user = await prisma.user.findUnique({ where: { email: email.trim().toLowerCase() } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    const today = new Date().toISOString().split('T')[0];

    const result = await prisma.$transaction(async (tx) => {
      let updatedWallet;
      let transaction;

      if (debt.type === 'piutang') {
        // Terima pembayaran piutang: saldo dompet BERTAMBAH (income)
        updatedWallet = await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: amountNum } },
        });

        transaction = await tx.transaction.create({
          data: {
            amount: amountNum,
            type: 'income',
            date: today,
            category: 'Pelunasan Piutang',
            description: `Terima pembayaran piutang: ${debt.title}`,
            walletId,
            debtId: debt.id,
            userId: user.id,
          },
        });
      } else {
        // Bayar cicilan hutang / paylater: saldo dompet BERKURANG (expense)
        updatedWallet = await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amountNum } },
        });

        transaction = await tx.transaction.create({
          data: {
            amount: amountNum,
            type: 'expense',
            date: today,
            category: 'Cicilan & Hutang',
            description: `Bayar cicilan: ${debt.title} (${debt.platform})`,
            walletId,
            debtId: debt.id,
            userId: user.id,
          },
        });
      }

      // 3. Update debt remaining amount and status
      const newRemaining = Math.max(0, debt.remainingAmount - amountNum);
      const updatedDebt = await tx.debt.update({
        where: { id },
        data: {
          remainingAmount: newRemaining,
          status: isFullPayment || newRemaining <= 0 ? 'paid' : 'active',
        },
      });

      return { debt: updatedDebt, wallet: updatedWallet, transaction };
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || 'Gagal memproses pembayaran tagihan' },
      { status: 500 }
    );
  }
}
