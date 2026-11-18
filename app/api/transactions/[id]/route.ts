import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { amount, type, date, category, description, walletId, toWalletId } = body;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    const newAmount = Number(amount) || existingTx.amount;
    const newType = type || existingTx.type;
    const newWalletId = walletId || existingTx.walletId;
    const newToWalletId = newType === 'transfer' ? toWalletId : null;

    const updated = await prisma.$transaction(async (tx) => {
      // 1. Roll back old transaction balance impact
      if (existingTx.type === 'expense') {
        await tx.wallet.update({
          where: { id: existingTx.walletId },
          data: { balance: { increment: existingTx.amount } },
        });
      } else if (existingTx.type === 'income') {
        await tx.wallet.update({
          where: { id: existingTx.walletId },
          data: { balance: { decrement: existingTx.amount } },
        });
      } else if (existingTx.type === 'transfer' && existingTx.toWalletId) {
        await tx.wallet.update({
          where: { id: existingTx.walletId },
          data: { balance: { increment: existingTx.amount } },
        });
        await tx.wallet.update({
          where: { id: existingTx.toWalletId },
          data: { balance: { decrement: existingTx.amount } },
        });
      }

      // 2. Apply new transaction balance impact
      if (newType === 'expense') {
        await tx.wallet.update({
          where: { id: newWalletId },
          data: { balance: { decrement: newAmount } },
        });
      } else if (newType === 'income') {
        await tx.wallet.update({
          where: { id: newWalletId },
          data: { balance: { increment: newAmount } },
        });
      } else if (newType === 'transfer' && newToWalletId) {
        await tx.wallet.update({
          where: { id: newWalletId },
          data: { balance: { decrement: newAmount } },
        });
        await tx.wallet.update({
          where: { id: newToWalletId },
          data: { balance: { increment: newAmount } },
        });
      }

      // 3. Update transaction record
      return await tx.transaction.update({
        where: { id },
        data: {
          amount: newAmount,
          type: newType,
          date: date || existingTx.date,
          category: newType === 'transfer' ? 'Transfer' : category || existingTx.category,
          description: description !== undefined ? description : existingTx.description,
          walletId: newWalletId,
          toWalletId: newToWalletId,
        },
      });
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to update transaction' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // Roll back wallet balance impact
      if (existingTx.type === 'expense') {
        await tx.wallet.update({
          where: { id: existingTx.walletId },
          data: { balance: { increment: existingTx.amount } },
        });
      } else if (existingTx.type === 'income') {
        await tx.wallet.update({
          where: { id: existingTx.walletId },
          data: { balance: { decrement: existingTx.amount } },
        });
      } else if (existingTx.type === 'transfer' && existingTx.toWalletId) {
        await tx.wallet.update({
          where: { id: existingTx.walletId },
          data: { balance: { increment: existingTx.amount } },
        });
        await tx.wallet.update({
          where: { id: existingTx.toWalletId },
          data: { balance: { decrement: existingTx.amount } },
        });
      }

      await tx.transaction.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to delete transaction' },
      { status: 500 }
    );
  }
}
