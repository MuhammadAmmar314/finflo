import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { defaultUser } from '@/lib/defaultData';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user, wallets, expenseCategories, incomeCategories, transactions, debts, savingsGoals } = body;

    const email = user?.email || defaultUser.email;

    const dbUser = await prisma.user.upsert({
      where: { email },
      update: {
        name: user?.name || defaultUser.name,
        avatar: user?.avatar || defaultUser.avatar,
        plan: user?.plan || 'free',
      },
      create: {
        name: user?.name || defaultUser.name,
        email,
        avatar: user?.avatar || defaultUser.avatar,
        plan: user?.plan || 'free',
        memberSince: user?.memberSince || 'Januari 2026',
      },
    });

    if (Array.isArray(wallets)) {
      for (const w of wallets) {
        await prisma.wallet.upsert({
          where: { id: w.id },
          update: {
            name: w.name,
            type: w.type,
            balance: Number(w.balance) || 0,
            color: w.color,
            icon: w.icon,
          },
          create: {
            id: w.id,
            name: w.name,
            type: w.type,
            balance: Number(w.balance) || 0,
            color: w.color,
            icon: w.icon,
            userId: dbUser.id,
          },
        });
      }
    }

    if (Array.isArray(expenseCategories)) {
      for (const c of expenseCategories) {
        await prisma.expenseCategory.upsert({
          where: { id: c.id },
          update: {
            name: c.name,
            color: c.color,
            budgetPercentage: Number(c.budgetPercentage) || 0,
            icon: c.icon,
          },
          create: {
            id: c.id,
            name: c.name,
            color: c.color,
            budgetPercentage: Number(c.budgetPercentage) || 0,
            icon: c.icon,
            userId: dbUser.id,
          },
        });
      }
    }

    if (Array.isArray(transactions)) {
      for (const t of transactions) {
        await prisma.transaction.upsert({
          where: { id: t.id },
          update: {
            amount: Number(t.amount) || 0,
            type: t.type,
            date: t.date,
            category: t.category,
            description: t.description,
            walletId: t.walletId,
            toWalletId: t.toWalletId,
          },
          create: {
            id: t.id,
            amount: Number(t.amount) || 0,
            type: t.type,
            date: t.date,
            category: t.category,
            description: t.description,
            walletId: t.walletId,
            toWalletId: t.toWalletId,
            userId: dbUser.id,
          },
        });
      }
    }

    if (Array.isArray(debts)) {
      for (const d of debts) {
        await prisma.debt.upsert({
          where: { id: d.id },
          update: {
            title: d.title,
            type: d.type,
            platform: d.platform,
            totalAmount: Number(d.totalAmount) || 0,
            remainingAmount: Number(d.remainingAmount) || 0,
            minimumPayment: d.minimumPayment ? Number(d.minimumPayment) : null,
            dueDate: d.dueDate,
            status: d.status || 'active',
            notes: d.notes,
          },
          create: {
            id: d.id,
            title: d.title,
            type: d.type,
            platform: d.platform,
            totalAmount: Number(d.totalAmount) || 0,
            remainingAmount: Number(d.remainingAmount) || 0,
            minimumPayment: d.minimumPayment ? Number(d.minimumPayment) : null,
            dueDate: d.dueDate,
            status: d.status || 'active',
            notes: d.notes,
            userId: dbUser.id,
          },
        });
      }
    }

    if (Array.isArray(savingsGoals)) {
      for (const g of savingsGoals) {
        await prisma.savingsGoal.upsert({
          where: { id: g.id },
          update: {
            title: g.title,
            targetAmount: Number(g.targetAmount) || 0,
            currentAmount: Number(g.currentAmount) || 0,
            targetDate: g.targetDate || null,
            category: g.category || 'Target Tabungan',
            color: g.color || '#10b981',
          },
          create: {
            id: g.id,
            title: g.title,
            targetAmount: Number(g.targetAmount) || 0,
            currentAmount: Number(g.currentAmount) || 0,
            targetDate: g.targetDate || null,
            category: g.category || 'Target Tabungan',
            color: g.color || '#10b981',
            userId: dbUser.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to sync data' },
      { status: 500 }
    );
  }
}
