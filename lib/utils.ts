import { Transaction, Wallet, ExpenseCategory } from './types';

export interface StatsSummary {
  totalBalance: number;
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  savingsRate: number;
}

export function formatIDR(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('id-ID').format(amount);
}

export function calculateStats(transactions: Transaction[], wallets: Wallet[]): StatsSummary {
  const totalBalance = wallets.reduce((sum, wallet) => sum + wallet.balance, 0);

  let totalIncome = 0;
  let totalExpense = 0;

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      totalIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
    }
  });

  const netCashflow = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netCashflow / totalIncome) * 100) : 0;

  return {
    totalBalance,
    totalIncome,
    totalExpense,
    netCashflow,
    savingsRate,
  };
}

export function getCategoryTotals(transactions: Transaction[], type: 'income' | 'expense') {
  const totals: { [category: string]: number } = {};

  transactions
    .filter((tx) => tx.type === type)
    .forEach((tx) => {
      const cat = tx.category || 'Lainnya';
      totals[cat] = (totals[cat] || 0) + tx.amount;
    });

  return totals;
}

export function getMonthlyTotals(transactions: Transaction[]) {
  const months: { [month: string]: { income: number; expense: number } } = {};

  transactions.forEach((tx) => {
    const month = tx.date.substring(0, 7); // 'YYYY-MM'
    if (!months[month]) {
      months[month] = { income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      months[month].income += tx.amount;
    } else if (tx.type === 'expense') {
      months[month].expense += tx.amount;
    }
  });

  return months;
}

export function calculateDebtStats(debts: any[]) {
  let totalRemainingDebt = 0;
  let totalReceivable = 0;
  let nearestDueDate: string | null = null;

  const activeItems = (debts || []).filter((d) => d.status === 'active');

  activeItems.forEach((d) => {
    if (d.type === 'piutang') {
      totalReceivable += d.remainingAmount;
    } else {
      totalRemainingDebt += d.remainingAmount;
    }
  });

  const payableDebts = activeItems.filter((d) => d.type !== 'piutang' && d.dueDate);
  if (payableDebts.length > 0) {
    const sorted = [...payableDebts].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    nearestDueDate = sorted[0].dueDate;
  }

  return {
    totalRemainingDebt,
    totalReceivable,
    nearestDueDate,
  };
}

export interface CategoryBudgetAudit {
  id: string;
  name: string;
  color: string;
  spent: number;
  realRate: number;
  targetRate: number;
  budgetNominal: number;
  isOver: boolean;
  statusNote: string;
}

export function calculateFinancialHealth(
  transactions: Transaction[],
  wallets: Wallet[],
  expenseCategories: ExpenseCategory[] = []
) {
  const stats = calculateStats(transactions, wallets);
  const hasData = transactions.length > 0 && (stats.totalIncome > 0 || stats.totalExpense > 0);

  const currentMonth = new Date().toISOString().slice(0, 7);

  const income = stats.totalIncome || 1;
  const expense = stats.totalExpense;
  const netSavings = Math.max(0, stats.totalIncome - stats.totalExpense);
  const savingsRate = stats.totalIncome > 0 ? Math.round((netSavings / stats.totalIncome) * 100) : 0;

  // Compute category audits from user's actual categories
  const categoryAudits: CategoryBudgetAudit[] = expenseCategories
    .filter((c) => (c.budgetPercentage || 0) > 0)
    .map((c) => {
      const spent = transactions
        .filter((tx) => tx.type === 'expense' && tx.category === c.name)
        .reduce((sum, tx) => sum + tx.amount, 0);

      const realRate = stats.totalIncome > 0
        ? Math.round((spent / stats.totalIncome) * 100)
        : (stats.totalExpense > 0 ? Math.round((spent / stats.totalExpense) * 100) : 0);

      const targetRate = c.budgetPercentage;
      const budgetNominal = stats.totalIncome > 0 ? (targetRate / 100) * stats.totalIncome : 0;
      const isOver = targetRate > 0 && realRate > targetRate;

      let statusNote = 'Sesuai dengan target anggaran.';
      if (isOver) {
        statusNote = `Melebihi target anggaran sebesar ${realRate - targetRate}%.`;
      } else if (realRate === 0) {
        statusNote = 'Belum ada pengeluaran di kategori ini.';
      } else {
        statusNote = `Tersisa ruang anggaran ${targetRate - realRate}%.`;
      }

      return {
        id: c.id,
        name: c.name,
        color: c.color || '#0ea5e9',
        spent,
        realRate,
        targetRate,
        budgetNominal,
        isOver,
        statusNote,
      };
    });

  if (!hasData) {
    return {
      healthScore: 0,
      status: 'Belum Ada Transaksi',
      hasData: false,
      savingsRate: 0,
      targetSavingsRate: 20,
      netSavings: 0,
      categoryAudits,
      recommendations: [
        {
          category: 'Langkah Awal',
          priority: 'Tinggi',
          action: 'Catat dompet dan tambahkan transaksi pemasukan atau pengeluaran pertama Anda untuk mengaktifkan audit anggaran otomatis.',
        },
      ],
    };
  }

  // Compute health score based on user's actual savings rate and adherence to defined budgets
  let score = 70;
  if (savingsRate >= 20) score += 15;
  else if (savingsRate >= 10) score += 5;
  else score -= 15;

  const overBudgetCategories = categoryAudits.filter((ca) => ca.isOver);
  if (categoryAudits.length > 0) {
    if (overBudgetCategories.length === 0) {
      score += 15; // all categories within user's target budget
    } else {
      score -= overBudgetCategories.length * 10;
    }
  }

  const healthScore = Math.min(100, Math.max(20, score));

  let status = 'Cukup Baik';
  if (healthScore >= 80) status = 'Sangat Sehat';
  else if (healthScore < 50) status = 'Perlu Perhatian';

  const recommendations = [];

  // 1. Savings recommendation
  recommendations.push({
    category: 'Alokasi Tabungan & Kas',
    priority: savingsRate < 20 ? 'Tinggi' : 'Sedang',
    action:
      savingsRate >= 20
        ? `Tingkat tabungan Anda ${savingsRate}% dari pemasukan. Pertahankan disiplin ini dan alokasikan ke instrumen reksa dana pasar uang atau deposito.`
        : `Tingkat tabungan Anda saat ini ${savingsRate}%. Upayakan menyisihkan minimal 20% di awal saat pemasukan masuk.`,
  });

  // 2. Specific over-budget categories
  if (overBudgetCategories.length > 0) {
    overBudgetCategories.forEach((ca) => {
      recommendations.push({
        category: `Anggaran: ${ca.name}`,
        priority: 'Tinggi',
        action: `Pengeluaran ${ca.name} telah mencapai ${ca.realRate}% (target anggaran Anda: ${ca.targetRate}%). Disarankan menekan belanja tambahan di kategori ini.`,
      });
    });
  } else if (categoryAudits.length > 0) {
    recommendations.push({
      category: 'Disiplin Anggaran Kategori',
      priority: 'Rendah',
      action: 'Seluruh pos pengeluaran Anda masih berada dalam batas target persentase yang Anda tetapkan. Pertahankan kontrol ini hingga akhir bulan.',
    });
  } else {
    recommendations.push({
      category: 'Pengaturan Anggaran',
      priority: 'Sedang',
      action: 'Anda belum menentukan target persentase anggaran pada kategori. Masuk ke menu Dompet & Kategori untuk mengatur alokasi anggaran.',
    });
  }

  // 3. Emergency fund
  recommendations.push({
    category: 'Dana Darurat & Ketahanan',
    priority: stats.totalBalance < 3 * expense ? 'Tinggi' : 'Rendah',
    action:
      stats.totalBalance < 3 * expense
        ? 'Total saldo kas saat ini belum mencapai 3x rata-rata pengeluaran. Jadikan pembentukan dana darurat sebagai prioritas utama.'
        : 'Total saldo likuid Anda sudah aman di atas 3x pengeluaran bulanan. Posisi finansial Anda memiliki bantalan yang kuat.',
  });

  return {
    healthScore,
    status,
    hasData: true,
    savingsRate,
    targetSavingsRate: 20,
    netSavings,
    categoryAudits,
    recommendations: recommendations.slice(0, 4),
  };
}
