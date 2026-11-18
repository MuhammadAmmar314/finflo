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
    const { id } = await Promise.resolve(params);

    const existingTx = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!existingTx) {
      return NextResponse.json({ success: false, error: 'Transaction not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      // 1. Roll back wallet balance impact
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

      // 2. Roll back linked Savings Goal if this was a savings deposit or withdrawal
      let goalIdToUpdate = existingTx.savingsGoalId;
      if (!goalIdToUpdate && existingTx.description) {
        let extractedTitle = '';
        if (existingTx.description.startsWith('Setor tabungan: ')) {
          extractedTitle = existingTx.description.replace('Setor tabungan: ', '').trim();
        } else if (existingTx.description.startsWith('Tarik tabungan: ')) {
          extractedTitle = existingTx.description.replace('Tarik tabungan: ', '').trim();
        }
        if (extractedTitle) {
          const matchedGoal = await tx.savingsGoal.findFirst({
            where: {
              userId: existingTx.userId,
              title: { equals: extractedTitle, mode: 'insensitive' },
            },
          });
          if (matchedGoal) {
            goalIdToUpdate = matchedGoal.id;
          }
        }
      }

      if (goalIdToUpdate) {
        const goal = await tx.savingsGoal.findUnique({
          where: { id: goalIdToUpdate },
        });
        if (goal) {
          if (existingTx.type === 'expense') {
            // It was a deposit: rolling back means decrementing savings goal
            const newAmount = Math.max(0, goal.currentAmount - existingTx.amount);
            await tx.savingsGoal.update({
              where: { id: goalIdToUpdate },
              data: { currentAmount: newAmount },
            });
          } else if (existingTx.type === 'income') {
            // It was a withdrawal: rolling back means returning money to savings goal
            await tx.savingsGoal.update({
              where: { id: goalIdToUpdate },
              data: { currentAmount: { increment: existingTx.amount } },
            });
          }
        }
      }

      // 3. Roll back linked Debt if this was a debt payment or piutang repayment
      let debtIdToUpdate = existingTx.debtId;
      if (!debtIdToUpdate && existingTx.description) {
        if (existingTx.description.startsWith('Bayar cicilan: ')) {
          const titlePart = existingTx.description.replace('Bayar cicilan: ', '').split('(')[0].trim();
          const matchedDebt = await tx.debt.findFirst({
            where: {
              userId: existingTx.userId,
              title: { equals: titlePart, mode: 'insensitive' },
            },
          });
          if (matchedDebt) debtIdToUpdate = matchedDebt.id;
        } else if (existingTx.description.startsWith('Terima pembayaran piutang: ')) {
          const titlePart = existingTx.description.replace('Terima pembayaran piutang: ', '').trim();
          const matchedDebt = await tx.debt.findFirst({
            where: {
              userId: existingTx.userId,
              title: { equals: titlePart, mode: 'insensitive' },
            },
          });
          if (matchedDebt) debtIdToUpdate = matchedDebt.id;
        }
      }

      if (debtIdToUpdate) {
        const debt = await tx.debt.findUnique({
          where: { id: debtIdToUpdate },
        });
        if (debt) {
          if (debt.type === 'piutang' && existingTx.type === 'income') {
            // Pelunasan piutang dibatalkan: sisa piutang bertambah kembali
            await tx.debt.update({
              where: { id: debtIdToUpdate },
              data: {
                remainingAmount: { increment: existingTx.amount },
                status: 'active',
              },
            });
          } else if ((debt.type === 'hutang' || debt.type === 'paylater') && existingTx.type === 'expense') {
            // Pembayaran cicilan dibatalkan: sisa hutang bertambah kembali
            await tx.debt.update({
              where: { id: debtIdToUpdate },
              data: {
                remainingAmount: { increment: existingTx.amount },
                status: 'active',
              },
            });
          }
        }
      }

      // 4. Delete the transaction
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
