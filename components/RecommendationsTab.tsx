'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Crown,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Printer,
  Target,
  Calculator,
  PieChart,
  Zap,
  Sliders,
} from 'lucide-react';
import { User, Transaction, Wallet, Debt, ExpenseCategory, TabType } from '@/lib/types';
import { formatIDR, calculateFinancialHealth } from '@/lib/utils';

interface RecommendationsTabProps {
  user: User;
  transactions: Transaction[];
  wallets: Wallet[];
  debts: Debt[];
  expenseCategories?: ExpenseCategory[];
  onOpenUpgrade: () => void;
  onTabChange?: (tab: TabType) => void;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({
  user,
  transactions,
  wallets,
  debts,
  expenseCategories = [],
  onOpenUpgrade,
  onTabChange,
}) => {
  const isPro = user.plan === 'pro';
  const health = calculateFinancialHealth(transactions, wallets, expenseCategories);

  // Goal simulator state
  const [goalName, setGoalName] = useState('Dana Darurat 6 Bulan');
  const [goalTargetAmount, setGoalTargetAmount] = useState(25000000);
  const [goalMonths, setGoalMonths] = useState(12);

  // Calculate monthly savings needed for goal
  const requiredMonthlySavings = Math.round(goalTargetAmount / Math.max(1, goalMonths));
  const currentNetCashflow = health.netSavings;
  const isGoalFeasible = currentNetCashflow >= requiredMonthlySavings;

  // Print report
  const handlePrintReport = () => {
    window.print();
  };

  if (!isPro) {
    return (
      <div className="space-y-6">
        {/* Pro Gatekeeper Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-brand-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-brand-950/40 p-6 sm:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />

          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-500/20 px-3 py-1 text-xs font-bold text-brand-300 border border-brand-500/30">
              <Crown className="h-3.5 w-3.5 text-amber-400" />
              FINFLO FINANCIAL ADVISOR
            </span>

            <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
              Rekomendasi Finansial &amp; Audit Anggaran Kategori
            </h2>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Dapatkan analisis mendalam kesehatan keuangan Anda berdasarkan target anggaran yang Anda tentukan. Dilengkapi dengan audit realisasi pengeluaran, peringatan over-budgeting, dan simulasi target tabungan.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Skor Kesehatan Finansial (0-100)</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Audit Anggaran Kategori Otomatis</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>4 Rekomendasi Alokasi Prioritas</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>Simulasi Target Tabungan &amp; Cetak PDF</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenUpgrade}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95 cursor-pointer"
              >
                <Sparkles className="h-4 w-4 fill-white" />
                <span>Buka Rekomendasi Pro (Rp 49rb)</span>
              </button>

              <span className="text-center sm:text-left text-xs text-slate-400">
                Bebas langganan bulanan • Sekali bayar
              </span>
            </div>
          </div>
        </div>

        {/* Blurred Preview */}
        <div className="opacity-40 pointer-events-none filter blur-[1px] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Financial Health Score</div>
              <div className="mt-2 text-2xl font-bold">85 / 100 (Sangat Sehat)</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Savings Rate</div>
              <div className="mt-2 text-2xl font-bold">28% dari Total Pemasukan</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Debt-to-Income (DTI)</div>
              <div className="mt-2 text-2xl font-bold">12% (Batas Aman)</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Print Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Rekomendasi Finansial &amp; Audit Anggaran
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              PRO AKTIF
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Analisis kesehatan arus kas, audit alokasi pengeluaran, dan peta jalan finansial
          </p>
        </div>

        <button
          onClick={handlePrintReport}
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
        >
          <Printer className="h-4 w-4" />
          <span>Cetak Laporan PDF</span>
        </button>
      </div>

      {/* Main Score Spotlight Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl bg-brand-500/10 border-2 border-brand-500/30 text-brand-600 dark:bg-brand-500/20 dark:border-brand-500/40 dark:text-brand-400">
              <div className="text-center">
                <span className="font-mono text-3xl font-black leading-none">
                  {health.hasData ? health.healthScore : '-'}
                </span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5">
                  / 100
                </span>
              </div>
            </div>

            <div>
              <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                !health.hasData
                  ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  : health.healthScore >= 80
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
              }`}>
                <ShieldCheck className="h-3.5 w-3.5" />
                Status: {health.status}
              </span>
              <h3 className="mt-2 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {health.hasData ? 'Kondisi Finansial Terkendali' : 'Belum Ada Transaksi Tercatat'}
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md">
                {health.hasData ? (
                  <>
                    Pola pengeluaran Anda cukup disiplin dengan tingkat tabungan{' '}
                    <strong>{health.savingsRate}%</strong> dari total pemasukan bulan berjalan.
                  </>
                ) : (
                  'Mulai catat transaksi pemasukan atau pengeluaran pertama Anda untuk menghasilkan laporan kesehatan finansial otomatis.'
                )}
              </p>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400">Savings Rate</span>
              <div className="mt-1 font-mono text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {health.hasData ? `${health.savingsRate}%` : '-'}
              </div>
              <span className="text-[10px] text-slate-500">Target ideal: &ge; 20%</span>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[11px] text-slate-400">Sisa Kas Bulanan</span>
              <div className="mt-1 font-mono text-lg font-bold text-slate-900 dark:text-white">
                {formatIDR(health.netSavings)}
              </div>
              <span className="text-[10px] text-slate-500">Surplus kas masuk</span>
            </div>
          </div>
        </div>
      </div>

      {/* Audit Rasio Anggaran Berdasarkan Budgeting Pengguna */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-brand-500" />
              Audit Rasio Anggaran Kategori
            </h3>
            <p className="text-xs text-slate-500">
              Evaluasi realisasi pengeluaran riil terhadap target persentase anggaran yang Anda tetapkan
            </p>
          </div>
          {onTabChange && (
            <button
              onClick={() => onTabChange('wallets')}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:underline dark:text-brand-400 cursor-pointer self-start sm:self-auto"
            >
              <span>Ubah Target Anggaran</span>
            </button>
          )}
        </div>

        {health.categoryAudits && health.categoryAudits.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {health.categoryAudits.map((ca) => (
              <div
                key={ca.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span
                      className="h-2.5 w-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: ca.color }}
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                      {ca.name}
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300 shrink-0">
                    Target: {ca.targetRate}%
                  </span>
                </div>

                <div className="flex items-baseline justify-between">
                  <span className={`font-mono text-base sm:text-lg font-extrabold ${
                    ca.isOver ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {formatIDR(ca.spent)}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    {ca.realRate}% dari kas
                  </span>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      ca.isOver
                        ? 'bg-rose-500'
                        : ca.realRate > ca.targetRate * 0.8
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{
                      width: `${Math.min(100, ca.targetRate > 0 ? (ca.realRate / ca.targetRate) * 100 : 0)}%`,
                    }}
                  />
                </div>

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  {ca.statusNote}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <Sliders className="mx-auto h-8 w-8 text-slate-400" />
            <h4 className="mt-2 text-sm font-bold text-slate-800 dark:text-slate-200">
              Belum Ada Target Persentase Anggaran
            </h4>
            <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
              Anda belum menentukan target persentase anggaran pada kategori pengeluaran Anda. Atur persentase budgeting atau terapkan 6 Pilar di menu Dompet &amp; Kategori agar FinFlo dapat mengaudit pengeluaran Anda secara otomatis.
            </p>
            {onTabChange && (
              <button
                type="button"
                onClick={() => onTabChange('wallets')}
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-brand-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-brand-700 cursor-pointer"
              >
                <span>Atur Target Anggaran Sekarang</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4 Prioritized Action Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Zap className="h-5 w-5 text-amber-500" />
          Rencana Aksi Finansial yang Disarankan
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {health.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex items-start gap-3.5"
            >
              <div
                className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${
                  rec.priority === 'Tinggi'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                    : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                }`}
              >
                {idx + 1}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {rec.category}
                  </h4>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                      rec.priority === 'Tinggi'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    Prioritas {rec.priority}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {rec.action}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Target Impian Calculator Simulator */}
      <div className="rounded-3xl border border-brand-500/20 bg-gradient-to-br from-brand-50/50 via-white to-sky-50/40 p-6 shadow-sm dark:border-brand-500/20 dark:from-slate-900 dark:via-slate-900 dark:to-brand-950/20 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            Simulasi Target Tabungan Impian
          </h3>
          <p className="text-xs text-slate-500">
            Kalkulasikan kemampuan arus kas Anda untuk mencapai target tabungan dalam durasi waktu tertentu
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Target
            </label>
            <input
              type="text"
              value={goalName}
              onChange={(e) => setGoalName(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nominal Target (Rp)
            </label>
            <input
              type="number"
              step="500000"
              value={goalTargetAmount}
              onChange={(e) => setGoalTargetAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-900 outline-none focus:border-brand-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Durasi: {goalMonths} Bulan
            </label>
            <input
              type="range"
              min="3"
              max="60"
              step="1"
              value={goalMonths}
              onChange={(e) => setGoalMonths(Number(e.target.value))}
              className="mt-3 w-full accent-brand-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Calculation Result Banner */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl p-4 border ${
            isGoalFeasible
              ? 'border-emerald-500/30 bg-emerald-50/70 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-amber-500/30 bg-amber-50/70 text-amber-950 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-200'
          }`}
        >
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {isGoalFeasible ? '✅ Rencana Realistis' : '⚠️ Perlu Penyesuaian Anggaran'}
            </span>
            <div className="mt-1 text-xs">
              Untuk mencapai <strong>{formatIDR(goalTargetAmount)}</strong> dalam {goalMonths} bulan, Anda perlu menyisihkan:{' '}
              <strong className="font-mono text-sm underline">{formatIDR(requiredMonthlySavings)} / bulan</strong>.
            </div>
          </div>

          <div className="text-right text-xs">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Kapasitas surplus kas Anda:</span>
            <div className="font-mono font-bold text-sm">
              {formatIDR(currentNetCashflow)} / bulan
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
