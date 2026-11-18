import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email') || defaultUser.email;
    const month = searchParams.get('month'); // YYYY-MM
    const type = searchParams.get('type');
    const walletId = searchParams.get('walletId');

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ success: true, data: [] });
    }

    const where: any = { userId: user.id };

    if (month) {
      where.date = { startsWith: month };
    }
    if (type && type !== 'all') {
      where.type = type;
    }
    if (walletId && walletId !== 'all') {
      where.OR = [{ walletId }, { toWalletId: walletId }];
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        wallet: true,
        toWallet: true,
      },
    });

    return NextResponse.json({ success: true, data: transactions });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      type,
      date,
      category,
      description,
      walletId,
      toWalletId,
      email = defaultUser.email,
    } = body;

    const amountNum = Number(amount);
    if (!amountNum || amountNum <= 0 || !type || !walletId) {
      return NextResponse.json(
        { success: false, error: 'Missing required transaction fields' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const createdTx = await tx.transaction.create({
        data: {
          amount: amountNum,
          type,
          date: date || new Date().toISOString().split('T')[0],
          category: type === 'transfer' ? 'Transfer' : category,
          description: description || null,
          walletId,
          toWalletId: type === 'transfer' ? toWalletId : null,
          userId: user.id,
        },
      });

      if (type === 'expense') {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: amountNum } },
        });
      } else if (type === 'income') {
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { increment: amountNum } },
        });
      } else if (type === 'transfer' && toWalletId) {
        const discountNum = Number(body.discount) || 0;
        const sourceDebit = Math.max(0, amountNum - discountNum);
        await tx.wallet.update({
          where: { id: walletId },
          data: { balance: { decrement: sourceDebit } },
        });
        await tx.wallet.update({
          where: { id: toWalletId },
          data: { balance: { increment: amountNum } },
        });
      }

      return createdTx;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to record transaction' },
      { status: 500 }
    );
  }
}
