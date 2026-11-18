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
      walletId,
      affectWallet = false,
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

    const result = await prisma.$transaction(async (tx) => {
      const debt = await tx.debt.create({
        data: {
          type,
          title: title.trim(),
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

      let updatedWallet;
      let transaction;

      if (affectWallet && walletId) {
        const today = new Date().toISOString().split('T')[0];

        if (type === 'piutang') {
          // Uang dipinjamkan ke pihak lain: saldo dompet berkurang
          updatedWallet = await tx.wallet.update({
            where: { id: walletId },
            data: { balance: { decrement: totalNum } },
          });

          transaction = await tx.transaction.create({
            data: {
              amount: totalNum,
              type: 'expense',
              date: today,
              category: 'Pinjaman & Piutang',
              description: `Pinjamkan uang ke: ${title.trim()}`,
              walletId,
              debtId: debt.id,
              userId: user.id,
            },
          });
        } else if (type === 'hutang') {
          // Pinjaman diterima: saldo dompet bertambah
          updatedWallet = await tx.wallet.update({
            where: { id: walletId },
            data: { balance: { increment: totalNum } },
          });

          transaction = await tx.transaction.create({
            data: {
              amount: totalNum,
              type: 'income',
              date: today,
              category: 'Pencairan Pinjaman',
              description: `Pencairan pinjaman: ${title.trim()}`,
              walletId,
              debtId: debt.id,
              userId: user.id,
            },
          });
        }
      }

      return { debt, wallet: updatedWallet, transaction };
    });

    return NextResponse.json({ success: true, data: result.debt, meta: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to create debt record' },
      { status: 500 }
    );
  }
}
