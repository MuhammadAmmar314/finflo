'use client';

import React, { useEffect, useRef } from 'react';
import {
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  Crown,
  CreditCard,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Transaction, Wallet, ExpenseCategory, User, TabType } from '@/lib/types';
import { formatIDR, calculateStats, calculateFinancialHealth } from '@/lib/utils';

// Register Chart.js components safely
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardTabProps {
  user: User;
  wallets: Wallet[];
  expenseCategories: ExpenseCategory[];
  transactions: Transaction[];
  onOpenAddTransaction: () => void;
  onOpenAddWallet: () => void;
  onOpenAddCategory: () => void;
  onOpenUpgrade: () => void;
  onTabChange: (tab: TabType) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  user,
  wallets,
  expenseCategories,
  transactions,
  onOpenAddTransaction,
  onOpenAddWallet,
  onOpenAddCategory,
  onOpenUpgrade,
  onTabChange,
}) => {
  const isPro = user.plan === 'pro';
  const stats = calculateStats(transactions, wallets);
  const health = calculateFinancialHealth(transactions, wallets);

  const barCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstance = useRef<ChartJS | null>(null);
  const doughnutChartInstance = useRef<ChartJS | null>(null);

  // Recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Current month string 'YYYY-MM'
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Monthly income for current month
  const currentMonthIncome = transactions
    .filter((tx) => tx.type === 'income' && tx.date.startsWith(currentMonth))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Budgeted categories (only those with budgetPercentage > 0)
  const budgetedCategories = expenseCategories.filter(
    (c) => (c.budgetPercentage || 0) > 0
  );

  // Initialize and update charts
  useEffect(() => {
    // 1. Bar Chart (Cashflow)
    if (barCanvasRef.current) {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
      }

      barChartInstance.current = new ChartJS(barCanvasRef.current, {
        type: 'bar',
        data: {
          labels: ['Pemasukan', 'Pengeluaran'],
          datasets: [
            {
              label: 'Total (Rp)',
              data: [stats.totalIncome, stats.totalExpense],
              backgroundColor: ['#10b981', '#ef4444'],
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(148, 163, 184, 0.1)' },
              ticks: {
                callback: (val) => `Rp ${Number(val) / 1000}k`,
                font: { size: 10 },
              },
            },
            x: {
              grid: { display: false },
            },
          },
        },
      });
    }

    // 2. Doughnut Chart (Categories)
    if (doughnutCanvasRef.current) {
      if (doughnutChartInstance.current) {
        doughnutChartInstance.current.destroy();
      }

      const categoryExpenses: Record<string, number> = {};
      transactions
        .filter((tx) => tx.type === 'expense')
        .forEach((tx) => {
          categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
        });

      const categoryLabels = Object.keys(categoryExpenses);
      const categoryValues = Object.values(categoryExpenses);
      const defaultColors = ['#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#64748b'];

      doughnutChartInstance.current = new ChartJS(doughnutCanvasRef.current, {
        type: 'doughnut',
        data: {
          labels: categoryLabels.length > 0 ? categoryLabels : ['Belum ada transaksi'],
          datasets: [
            {
              data: categoryValues.length > 0 ? categoryValues : [1],
              backgroundColor:
                categoryLabels.length > 0
                  ? defaultColors.slice(0, categoryLabels.length)
                  : ['#cbd5e1'],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                font: { size: 11 },
                color: '#64748b',
              },
            },
          },
          cutout: '70%',
        },
      });
    }

    return () => {
      if (barChartInstance.current) barChartInstance.current.destroy();
      if (doughnutChartInstance.current) doughnutChartInstance.current.destroy();
    };
  }, [stats.totalIncome, stats.totalExpense, transactions]);

  return (
    <div className="space-y-6">
      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Saldo */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Total Saldo Keseluruhan
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
              <WalletIcon className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {formatIDR(stats.totalBalance)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>Dari {wallets.length} dompet aktif</span>
          </div>
        </div>

        {/* Pemasukan Bulan Ini */}
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/30 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-950/20 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
              Pemasukan Bulan Ini
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
            {formatIDR(stats.totalIncome)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span>Arus kas masuk tercatat</span>
          </div>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="rounded-3xl border border-rose-500/20 bg-rose-50/30 p-5 shadow-sm dark:border-rose-500/20 dark:bg-rose-950/20 transition hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Pengeluaran Bulan Ini
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 font-mono text-2xl font-black tracking-tight text-rose-600 dark:text-rose-400">
            {formatIDR(stats.totalExpense)}
          </div>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400">
            <span>Sisa Kas: {formatIDR(stats.netCashflow)}</span>
          </div>
        </div>
      </div>

      {/* Financial Health Spotlight Banner */}
      <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-r from-brand-600 via-sky-600 to-indigo-600 p-5 sm:p-6 text-white shadow-lg shadow-brand-500/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
              <Sparkles className="h-7 w-7 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Evaluasi Kesehatan Finansial
                </span>
                <span className="text-xs text-sky-100">
                  {health.hasData ? (
                    <>Skor Kesehatan: <strong>{health.healthScore}/100</strong> ({health.status})</>
                  ) : (
                    <>Status: <strong>Akun Baru • Belum Ada Transaksi</strong></>
                  )}
                </span>
              </div>
              <h3 className="mt-1 text-base sm:text-lg font-bold">
                {!health.hasData
                  ? 'Selamat Datang di FinFlo! Mulai Kelola Keuangan Anda'
                  : isPro
                  ? `Analisis Finansial: Tabungan Anda ${health.savingsRate}% dari pemasukan`
                  : 'Buka Audit Anggaran & Simulasi Target Finansial'}
              </h3>
              <p className="text-xs text-sky-100 line-clamp-1">
                {health.recommendations[0]?.action || 'Dapatkan rekomendasi alokasi dana otomatis agar keuangan sehat.'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!health.hasData) {
                if (wallets.length === 0) {
                  onOpenAddWallet();
                } else {
                  onOpenAddTransaction();
                }
              } else {
                onTabChange('recommendations');
              }
            }}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-900 shadow-md transition hover:bg-slate-100 active:scale-95"
          >
            <span>
              {!health.hasData
                ? wallets.length === 0
                  ? '+ Buat Dompet Pertama'
                  : '+ Catat Transaksi Pertama'
                : 'Lihat Rekomendasi Lengkap'}
            </span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Charts & Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Bar Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Arus Kas (Cash Flow)
              </h3>
              <p className="text-xs text-slate-500">Perbandingan pemasukan vs pengeluaran</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              Bulan Berjalan
            </span>
          </div>

          <div className="relative h-64 w-full">
            <canvas ref={barCanvasRef} />
          </div>
        </div>

        {/* Category Breakdown Doughnut Chart */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Distribusi Kategori
              </h3>
              <p className="text-xs text-slate-500">Komposisi pengeluaran bulan ini</p>
            </div>
          </div>

          <div className="relative h-64 w-full flex items-center justify-center">
            <canvas ref={doughnutCanvasRef} />
          </div>
        </div>
      </div>

      {/* Recent Transactions & Side Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Transaksi Terkini
              </h3>
              <p className="text-xs text-slate-500">Aktivitas keuangan terbaru Anda</p>
            </div>
            <button
              onClick={() => onTabChange('transactions')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 flex items-center gap-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-sm text-slate-400">
              Belum ada transaksi tercatat.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions.map((tx) => {
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';

                return (
                  <div key={tx.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-2xl ${
                          isExpense
                            ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                            : isIncome
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                            : 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                        }`}
                      >
                        {isExpense ? (
                          <ArrowDownRight className="h-5 w-5" />
                        ) : isIncome ? (
                          <ArrowUpRight className="h-5 w-5" />
                        ) : (
                          <ArrowLeftRight className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.description || tx.category}
                        </div>
                        <div className="text-xs text-slate-400">
                          {tx.category} • {tx.date}
                        </div>
                      </div>
                    </div>

                    <div
                      className={`font-mono text-sm font-bold ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-sky-600 dark:text-sky-400'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatIDR(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Wallets & Categories Quick Glance */}
        <div className="space-y-6">
          {/* Wallets widget */}
          <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Ringkasan Dompet
                </h3>
                <p className="text-xs text-slate-500">
                  {isPro ? 'Pro: Tanpa batas' : `Free: ${wallets.length}/3 Dompet`}
                </p>
              </div>
              <button
                onClick={onOpenAddWallet}
                className="flex items-center gap-1 rounded-xl bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-100 dark:bg-brand-950/50 dark:text-brand-400"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-3 dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-500 text-white text-xs font-bold">
                      {w.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {w.name}
                      </div>
                      <div className="text-[10px] text-slate-400 capitalize">{w.type}</div>
                    </div>
                  </div>
                  <div className="font-mono text-xs font-bold text-slate-900 dark:text-white">
                    {formatIDR(w.balance)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Progress Budgeting Widget (Hanya tampil jika ada kategori yang diset budgeting-nya) */}
          {budgetedCategories.length > 0 && (
            <div className="rounded-3xl border border-slate-200/80 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Progress Budgeting Bulan Ini
                  </h3>
                  <p className="text-xs text-slate-500">
                    Realisasi pengeluaran terhadap alokasi anggaran
                  </p>
                </div>
                <button
                  onClick={() => onTabChange('wallets')}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 cursor-pointer"
                >
                  Atur
                </button>
              </div>

              <div className="space-y-3">
                {budgetedCategories.map((c) => {
                  const spent = transactions
                    .filter(
                      (tx) =>
                        tx.type === 'expense' &&
                        tx.category === c.name &&
                        tx.date.startsWith(currentMonth)
                    )
                    .reduce((sum, tx) => sum + tx.amount, 0);

                  const budgetNominal =
                    currentMonthIncome > 0
                      ? (c.budgetPercentage / 100) * currentMonthIncome
                      : 0;

                  const pct =
                    budgetNominal > 0
                      ? Math.round((spent / budgetNominal) * 100)
                      : 0;

                  const isOver = budgetNominal > 0 && spent > budgetNominal;

                  return (
                    <div key={c.id} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{ backgroundColor: c.color }}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[120px]">
                            {c.name}
                          </span>
                          <span className="text-[10px] text-slate-400 shrink-0">
                            ({c.budgetPercentage}%)
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span
                            className={`font-mono text-xs font-bold ${
                              isOver ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            {formatIDR(spent)}
                          </span>
                          {budgetNominal > 0 ? (
                            <span className="text-[10px] text-slate-400">
                              {' '}
                              / {formatIDR(budgetNominal)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400">
                              {' '}
                              (Belum ada pemasukan)
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver
                              ? 'bg-rose-500'
                              : pct > 80
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                          style={{
                            width: `${Math.min(100, pct)}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
