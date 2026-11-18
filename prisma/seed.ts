import { PrismaClient } from '@prisma/client';
import {
  defaultUser,
  defaultWallets,
  defaultExpenseCategories,
  defaultIncomeCategories,
  defaultTransactions,
  defaultDebts,
  defaultSavingsGoals,
} from '../lib/defaultData';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: defaultUser.email },
    update: {
      name: defaultUser.name,
      avatar: defaultUser.avatar,
      plan: defaultUser.plan,
    },
    create: {
      name: defaultUser.name,
      email: defaultUser.email,
      avatar: defaultUser.avatar,
      plan: defaultUser.plan,
      memberSince: defaultUser.memberSince,
    },
  });

  for (const wallet of defaultWallets) {
    await prisma.wallet.upsert({
      where: { id: wallet.id },
      update: {
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance,
        color: wallet.color,
        icon: wallet.icon,
      },
      create: {
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        balance: wallet.balance,
        color: wallet.color,
        icon: wallet.icon,
        userId: user.id,
      },
    });
  }

  for (const cat of defaultExpenseCategories) {
    await prisma.expenseCategory.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        color: cat.color,
        budgetPercentage: cat.budgetPercentage,
        icon: cat.icon,
      },
      create: {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        budgetPercentage: cat.budgetPercentage,
        icon: cat.icon,
        userId: user.id,
      },
    });
  }

  for (const cat of defaultIncomeCategories) {
    await prisma.incomeCategory.upsert({
      where: { id: cat.id },
      update: {
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
      },
      create: {
        id: cat.id,
        name: cat.name,
        color: cat.color,
        icon: cat.icon,
        userId: user.id,
      },
    });
  }

  for (const tx of defaultTransactions) {
    await prisma.transaction.upsert({
      where: { id: tx.id },
      update: {
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        category: tx.category,
        description: tx.description,
        walletId: tx.walletId,
        toWalletId: tx.toWalletId,
      },
      create: {
        id: tx.id,
        amount: tx.amount,
        type: tx.type,
        date: tx.date,
        category: tx.category,
        description: tx.description,
        walletId: tx.walletId,
        toWalletId: tx.toWalletId,
        userId: user.id,
      },
    });
  }

  for (const debt of defaultDebts) {
    await prisma.debt.upsert({
      where: { id: debt.id },
      update: {
        title: debt.title,
        type: debt.type,
        platform: debt.platform,
        totalAmount: debt.totalAmount,
        remainingAmount: debt.remainingAmount,
        minimumPayment: debt.minimumPayment,
        dueDate: debt.dueDate,
        status: debt.status,
        notes: debt.notes,
      },
      create: {
        id: debt.id,
        title: debt.title,
        type: debt.type,
        platform: debt.platform,
        totalAmount: debt.totalAmount,
        remainingAmount: debt.remainingAmount,
        minimumPayment: debt.minimumPayment,
        dueDate: debt.dueDate,
        status: debt.status,
        notes: debt.notes,
        userId: user.id,
      },
    });
  }

  for (const goal of defaultSavingsGoals) {
    await prisma.savingsGoal.upsert({
      where: { id: goal.id },
      update: {
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate || null,
        category: goal.category,
        color: goal.color,
      },
      create: {
        id: goal.id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate || null,
        category: goal.category,
        color: goal.color,
        userId: user.id,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
