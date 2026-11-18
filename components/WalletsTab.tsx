'use client';

import React from 'react';
import {
  Wallet as WalletIcon,
  Plus,
  Trash2,
  PieChart,
  Tag,
  AlertTriangle,
  Crown,
  Sparkles,
  Coins,
  Landmark,
  Smartphone,
  TrendingUp,
  PiggyBank,
  Target,
  Sliders,
  RotateCcw,
} from 'lucide-react';
import { Wallet, ExpenseCategory, User, SavingsGoal } from '@/lib/types';
import { formatIDR } from '@/lib/utils';

interface WalletsTabProps {
  user: User;
  wallets: Wallet[];
  expenseCategories: ExpenseCategory[];
  savingsGoals?: SavingsGoal[];
  onOpenAddWallet: () => void;
  onOpenAddCategory: () => void;
  onOpenAddGoal?: () => void;
  onOpenDepositGoal?: (goal: SavingsGoal) => void;
  onDeleteGoal?: (id: string) => void;
  onEditCategory: (category: ExpenseCategory) => void;
  onApply6Pillars: () => void;
  onDeleteWallet: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onOpenUpgrade: () => void;
}

export const WalletsTab: React.FC<WalletsTabProps> = ({
  user,
  wallets,
  expenseCategories,
  savingsGoals = [],
  onOpenAddWallet,
  onOpenAddCategory,
  onOpenAddGoal,
  onOpenDepositGoal,
  onDeleteGoal,
  onEditCategory,
  onApply6Pillars,
  onDeleteWallet,
  onDeleteCategory,
  onOpenUpgrade,
}) => {
  const isPro = user.plan === 'pro';

  // Calculate total budget percentage allocated
  const totalBudgetPercentage = expenseCategories.reduce(
    (sum, c) => sum + (c.budgetPercentage || 0),
    0
  );

  const getWalletIcon = (type: string) => {
    switch (type) {
      case 'cash':
        return <Coins className="h-5 w-5" />;
      case 'ewallet':
        return <Smartphone className="h-5 w-5" />;
      case 'investment':
        return <TrendingUp className="h-5 w-5" />;
      case 'savings':
        return <PiggyBank className="h-5 w-5" />;
      default:
        return <Landmark className="h-5 w-5" />;
    }
  };

  const getWalletGradient = (color: string) => {
    switch (color) {
      case 'emerald':
        return 'from-emerald-500 to-teal-600';
      case 'violet':
        return 'from-violet-500 to-purple-600';
      case 'amber':
        return 'from-amber-500 to-orange-600';
      case 'rose':
        return 'from-rose-500 to-pink-600';
      default:
        return 'from-sky-500 to-blue-600';
    }
  };

  return (
    <div className="space-y-8">
      {/* Free Tier Quota Reminder Banner (if not Pro) */}
      {!isPro && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-brand-500/20 bg-brand-50/50 p-5 dark:border-brand-500/20 dark:bg-brand-950/20">
          <div className="flex items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white shadow-md shadow-brand-500/20">
              <WalletIcon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Batas Penggunaan Paket Free Tier
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Maksimal 3 dompet aktif &amp; 8 kategori pengeluaran dasar.
              </p>
            </div>
          </div>

          <button
            onClick={onOpenUpgrade}
            className="flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-amber-500/20 hover:brightness-110 active:scale-95"
          >
            <Crown className="h-3.5 w-3.5" />
            <span>Upgrade Tanpa Batas</span>
          </button>
        </div>
      )}

      {/* SECTION 1: MANAJEMEN DOMPET */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Daftar Dompet &amp; Rekening
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {isPro ? `${wallets.length} Dompet` : `${wallets.length}/3 Dompet`}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Kelola kas tunai, saldo bank, dan dompet digital
            </p>
          </div>

          <button
            onClick={onOpenAddWallet}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Dompet</span>
          </button>
        </div>

        {/* Clean Wallet Cards Grid (No account number, No active status) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 sm:p-12 text-center bg-white/50 dark:bg-slate-900/50">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400 mb-3">
                <WalletIcon className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Belum Ada Dompet Aktif
              </h3>
              <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Tambahkan dompet pertama Anda (seperti Kas Tunai, Rekening BCA/Mandiri, atau E-Wallet) untuk mulai mencatat transaksi.
              </p>
              <button
                onClick={onOpenAddWallet}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 transition active:scale-95"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Dompet Pertama</span>
              </button>
            </div>
          ) : (
            wallets.map((wallet) => {
              const gradient = getWalletGradient(wallet.color);

              return (
                <div
                  key={wallet.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-3xl p-5 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
                  style={{
                    background: `linear-gradient(135deg, var(--tw-gradient-stops))`,
                  }}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${gradient} -z-10`}
                  />
                  {/* Decorative background element */}
                  <div className="absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md">
                          {getWalletIcon(wallet.type)}
                        </div>
                        <div>
                          <h3 className="text-base font-black tracking-tight drop-shadow-sm">
                            {wallet.name}
                          </h3>
                          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
                            {wallet.type === 'bank'
                              ? 'Rekening Bank'
                              : wallet.type === 'cash'
                              ? 'Uang Tunai'
                              : wallet.type === 'investment'
                              ? 'Investasi & Portofolio'
                              : wallet.type === 'savings'
                              ? 'Tabungan Khusus'
                              : 'E-Wallet'}
                          </span>
                        </div>
                      </div>

                      {/* Delete Wallet Button */}
                      <button
                        onClick={() => onDeleteWallet(wallet.id)}
                        title="Hapus Dompet"
                        className="rounded-xl bg-white/10 p-2 text-white/80 backdrop-blur-md transition hover:bg-rose-600 hover:text-white"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Balance */}
                  <div className="mt-8">
                    <span className="text-[11px] font-medium text-white/70">
                      Saldo Tersedia
                    </span>
                    <div className="font-mono text-xl sm:text-2xl font-black tracking-tight drop-shadow-sm">
                      {formatIDR(wallet.balance)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* SECTION 2: KANTONG TARGET TABUNGAN & INVESTASI (SAVINGS GOALS) */}
      <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Kantong Target Tabungan &amp; Investasi
              </h2>
              <span className="rounded-full bg-teal-100 px-2.5 py-0.5 text-xs font-bold text-teal-800 dark:bg-teal-950 dark:text-teal-300">
                {savingsGoals.length} Target Aktif
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Kumpulkan dana impian untuk masa depan, dana darurat, dan portofolio
            </p>
          </div>

          {onOpenAddGoal && (
            <button
              onClick={onOpenAddGoal}
              className="flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/30 transition hover:bg-teal-700 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Target Impian</span>
            </button>
          )}
        </div>

        {savingsGoals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {savingsGoals.map((goal) => {
              const progressPct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              const isAchieved = goal.currentAmount >= goal.targetAmount;
              const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

              return (
                <div
                  key={goal.id}
                  className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between space-y-4 hover:shadow-md transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-white shadow-sm"
                          style={{ backgroundColor: goal.color || '#10b981' }}
                        >
                          <Target className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">
                            {goal.title}
                          </h3>
                          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                            {goal.category || 'Target Tabungan'}
                          </span>
                        </div>
                      </div>

                      {onDeleteGoal && (
                        <button
                          onClick={() => onDeleteGoal(goal.id)}
                          title="Hapus Target"
                          className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="pt-2">
                      <div className="flex items-baseline justify-between">
                        <span className="font-mono text-base font-extrabold text-slate-900 dark:text-white">
                          {formatIDR(goal.currentAmount)}
                        </span>
                        <span className="text-xs text-slate-400">
                          dari {formatIDR(goal.targetAmount)}
                        </span>
                      </div>

                      <div className="mt-2 space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold">
                          <span className={isAchieved ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-500'}>
                            {isAchieved ? '🎉 Target Tercapai!' : `Kurang ${formatIDR(remaining)}`}
                          </span>
                          <span className="font-bold text-slate-700 dark:text-slate-300">
                            {progressPct}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              isAchieved ? 'bg-emerald-500' : 'bg-teal-500'
                            }`}
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-slate-400">
                      {goal.targetDate ? `Target: ${goal.targetDate}` : 'Fleksibel'}
                    </span>
                    {onOpenDepositGoal && (
                      <button
                        onClick={() => onOpenDepositGoal(goal)}
                        className="flex items-center gap-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 hover:text-teal-700 px-3 py-1.5 text-xs font-bold text-slate-700 transition dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-teal-950 dark:hover:text-teal-300 active:scale-95"
                      >
                        <PiggyBank className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                        <span>Setor Tabungan</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <PiggyBank className="mx-auto h-10 w-10 text-teal-500" />
            <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
              Belum Ada Kantong Target Tabungan
            </h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
              Mulai buat target impian Anda seperti Dana Darurat atau Investasi Masa Depan dan pantau pencapaiannya.
            </p>
            {onOpenAddGoal && (
              <button
                type="button"
                onClick={onOpenAddGoal}
                className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/25 transition hover:bg-teal-700 active:scale-95 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Tambah Target Impian Pertama</span>
              </button>
            )}
          </div>
        )}
      </section>

      {/* SECTION 3: KATEGORI PENGELUARAN & BUDGETING */}
      <section className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                Kategori Pengeluaran &amp; Budgeting
              </h2>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                {isPro ? `${expenseCategories.length} Kategori` : `${expenseCategories.length}/8 Kategori`}
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Atur persentase alokasi budgeting (Total maksimal 100%)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onApply6Pillars}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-100 dark:border-indigo-900/50 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60"
              title="Terapkan pembagian 6 pilar rekomendasi awal FinFlo"
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
              <span>Terapkan 6 Pilar</span>
            </button>
            <button
              onClick={onOpenAddCategory}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Tambah Kategori</span>
            </button>
          </div>
        </div>

        {/* 6 Pillars Recommendation Info Card */}
        <div className="rounded-2xl border border-indigo-500/20 bg-indigo-50/40 p-4 dark:border-indigo-500/20 dark:bg-indigo-950/20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Rekomendasi Awal: 6 Pilar Alokasi Anggaran (100%)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Kos (28%) • Makan &amp; Minum (30%) • Transport (12%) • Pulsa &amp; Data (5%) • Nabung/Investasi (20%) • Liburan &amp; Jajan (5%)
                </p>
              </div>
            </div>
            <button
              onClick={onApply6Pillars}
              className="shrink-0 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Pasang Otomatis ➔
            </button>
          </div>
        </div>

        {/* Total Budgeting Allocation Bar */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <PieChart className="h-4 w-4 text-brand-500" />
              Total Alokasi Budget Terpakai:
            </span>
            <span
              className={`font-mono font-bold ${
                totalBudgetPercentage > 100
                  ? 'text-rose-600 dark:text-rose-400'
                  : 'text-brand-600 dark:text-brand-400'
              }`}
            >
              {totalBudgetPercentage}% / 100%
            </span>
          </div>

          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                totalBudgetPercentage > 100 ? 'bg-rose-500' : 'bg-brand-500'
              }`}
              style={{ width: `${Math.min(100, totalBudgetPercentage)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>
              Sisa Kuota: <strong>{Math.max(0, 100 - totalBudgetPercentage)}%</strong>
            </span>
            {totalBudgetPercentage === 100 ? (
              <span className="text-emerald-500 font-semibold">Alokasi Budget Sempurna 100%</span>
            ) : totalBudgetPercentage < 100 ? (
              <span>Tersedia untuk kategori baru</span>
            ) : (
              <span className="text-rose-500 font-semibold">Melebihi kuota 100%!</span>
            )}
          </div>
        </div>

        {/* Categories List Cards with Delete Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {expenseCategories.length === 0 ? (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/50 space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Belum Ada Kategori Pengeluaran
                </h3>
                <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
                  Gunakan rekomendasi awal 6 pilar anggaran FinFlo (100%) atau tambahkan pos kategori Anda sendiri secara manual.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                <button
                  onClick={onApply6Pillars}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-indigo-700 transition active:scale-95"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Terapkan Rekomendasi 6 Pilar</span>
                </button>
                <button
                  onClick={onOpenAddCategory}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Tambah Manual</span>
                </button>
              </div>
            </div>
          ) : (
            expenseCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-2xl text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: category.color }}
                      >
                        {category.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                          {category.name}
                        </h3>
                        <span className="text-[11px] text-slate-400">
                          Alokasi Budget
                        </span>
                      </div>
                    </div>

                    {/* Edit & Delete Action Buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditCategory(category)}
                        title="Sesuaikan Alokasi & Nama Kategori"
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400 transition"
                      >
                        <Sliders className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteCategory(category.id)}
                        title="Hapus Kategori"
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Persentase</span>
                      <span className="font-mono font-bold text-slate-900 dark:text-white">
                        {category.budgetPercentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${category.budgetPercentage}%`,
                          backgroundColor: category.color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
