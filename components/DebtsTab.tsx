'use client';

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Plus,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  Sparkles,
  Crown,
  ChevronRight,
  Trash2,
  DollarSign,
} from 'lucide-react';
import { Debt, DebtType, User, Wallet } from '@/lib/types';
import { formatIDR, calculateDebtStats } from '@/lib/utils';

interface DebtsTabProps {
  user: User;
  debts: Debt[];
  wallets: Wallet[];
  onOpenAddDebt: () => void;
  onOpenPayDebt: (debt: Debt) => void;
  onDeleteDebt: (id: string) => void;
  onOpenUpgrade: () => void;
}

export const DebtsTab: React.FC<DebtsTabProps> = ({
  user,
  debts,
  wallets,
  onOpenAddDebt,
  onOpenPayDebt,
  onDeleteDebt,
  onOpenUpgrade,
}) => {
  const isPro = user.plan === 'pro';
  const [filterType, setFilterType] = useState<string>('all');

  const debtStats = calculateDebtStats(debts);

  // Sort debts by nearest due date ascending (user request: urutan terdekat)
  const sortedAndFilteredDebts = useMemo(() => {
    return debts
      .filter((d) => {
        if (filterType === 'all') return true;
        if (filterType === 'paid') return d.status === 'paid';
        if (filterType === 'active') return d.status === 'active';
        return d.type === filterType;
      })
      .sort((a, b) => {
        // Active debts first, then sorted by due date ascending
        if (a.status !== b.status) {
          return a.status === 'active' ? -1 : 1;
        }
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
  }, [debts, filterType]);

  // If user is Free Tier, display the Pro Gatekeeper View
  if (!isPro) {
    return (
      <div className="space-y-6">
        {/* Pro Plan Gatekeeper Hero Card */}
        <div className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/40 p-6 sm:p-10 text-white shadow-xl">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />

          <div className="relative max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-400 border border-amber-500/30">
              <Crown className="h-3.5 w-3.5" />
              Fitur Eksklusif FinFlo Pro
            </span>

            <h2 className="mt-4 text-2xl sm:text-3xl font-black tracking-tight">
              Lacak Hutang, Piutang &amp; Tagihan Paylater
            </h2>

            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Kendalikan tagihan Shopee PayLater, GoPay SpayLater, Kredivo, kartu kredit, dan pinjaman pribadi dalam satu dasbor terpadu. Lengkap dengan pengingat jatuh tempo otomatis dan pemotongan saldo saat membayar.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Urutan otomatis jatuh tempo terdekat</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Simulasi cicilan &amp; pembayaran langsung</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Terintegrasi dengan saldo dompet FinFlo</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-3 border border-white/10">
                <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                <span>Riwayat pelunasan rapi &amp; bebas denda</span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onOpenUpgrade}
                className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/30 hover:brightness-110 active:scale-95"
              >
                <Sparkles className="h-4 w-4 fill-white" />
                <span>Buka Akses FinFlo Pro (Rp 49rb)</span>
              </button>

              <span className="text-center sm:text-left text-xs text-slate-400">
                Sekali bayar • Akses seumur hidup
              </span>
            </div>
          </div>
        </div>

        {/* Blurred / Simulated Preview Cards */}
        <div className="opacity-40 pointer-events-none filter blur-[1px] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Total Tagihan Aktif</div>
              <div className="mt-2 text-xl font-bold">Rp 3.750.000</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Jatuh Tempo Terdekat</div>
              <div className="mt-2 text-xl font-bold">5 Maret 2026 (SPayLater)</div>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="text-xs text-slate-500">Total Telah Dibayar</div>
              <div className="mt-2 text-xl font-bold">Rp 1.250.000</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Helper to calculate days until due
  const getDaysRemaining = (dueDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr);
    due.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">
              Lacak Hutang &amp; Paylater
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
              PRO AKTIF
            </span>
          </div>
          <p className="text-xs text-slate-500">
            Daftar otomatis diurutkan berdasarkan <strong>jatuh tempo terdekat</strong>
          </p>
        </div>

        <button
          onClick={onOpenAddDebt}
          className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Tambah Tagihan</span>
        </button>
      </div>

      {/* Summary 3 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-3xl border border-rose-500/20 bg-rose-50/30 p-5 shadow-sm dark:border-rose-500/20 dark:bg-rose-950/20">
          <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
            Total Sisa Hutang/Paylater
          </span>
          <div className="mt-2 font-mono text-2xl font-black text-rose-600 dark:text-rose-400">
            {formatIDR(debtStats.totalRemainingDebt)}
          </div>
          <span className="mt-1 block text-[11px] text-slate-500">Kewajiban belum lunas</span>
        </div>

        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-50/30 p-5 shadow-sm dark:border-emerald-500/20 dark:bg-emerald-950/20">
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">
            Total Piutang (Hak Anda)
          </span>
          <div className="mt-2 font-mono text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatIDR(debtStats.totalReceivable)}
          </div>
          <span className="mt-1 block text-[11px] text-slate-500">Uang yang dipinjamkan</span>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-semibold text-slate-500">Jatuh Tempo Terdekat</span>
          <div className="mt-2 text-base font-bold text-slate-900 dark:text-white truncate">
            {debtStats.nearestDueDate ? debtStats.nearestDueDate : 'Tidak ada tagihan'}
          </div>
          <span className="mt-1 block text-[11px] text-slate-500">Prioritas bayar agar tak kena denda</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'paylater', label: 'Paylater' },
          { id: 'hutang', label: 'Hutang' },
          { id: 'piutang', label: 'Piutang' },
          { id: 'paid', label: 'Telah Lunas' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
              filterType === tab.id
                ? 'bg-brand-500 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Debt Cards List */}
      {sortedAndFilteredDebts.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white py-16 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <CreditCard className="mx-auto h-12 w-12 text-slate-400" />
          <p className="mt-3 text-sm font-semibold text-slate-600 dark:text-slate-400">
            Belum ada catatan hutang/paylater di kategori ini.
          </p>
          <button
            onClick={onOpenAddDebt}
            className="mt-3 text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            + Tambah Tagihan Baru
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortedAndFilteredDebts.map((item) => {
            const isPaid = item.status === 'paid' || item.remainingAmount <= 0;
            const daysRemaining = getDaysRemaining(item.dueDate);
            const isUrgent = !isPaid && daysRemaining <= 3 && daysRemaining >= 0;
            const isOverdue = !isPaid && daysRemaining < 0;

            const percentPaid = Math.min(
              100,
              Math.round(((item.totalAmount - item.remainingAmount) / item.totalAmount) * 100)
            );

            return (
              <div
                key={item.id}
                className={`relative flex flex-col justify-between rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${
                  isPaid
                    ? 'border-emerald-500/30 bg-emerald-50/20 dark:border-emerald-500/20 dark:bg-emerald-950/10'
                    : isOverdue
                    ? 'border-rose-500/40 bg-rose-50/30 dark:border-rose-500/30 dark:bg-rose-950/20'
                    : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            item.type === 'paylater'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                              : item.type === 'hutang'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {item.platform}
                        </span>
                      </div>
                      <h3 className="mt-1 text-base font-bold text-slate-900 dark:text-white">
                        {item.title}
                      </h3>
                    </div>

                    <button
                      onClick={() => onDeleteDebt(item.id)}
                      className="rounded-xl p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      title="Hapus Catatan"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Due Date Indicator */}
                  <div className="mt-3 flex items-center gap-1.5 text-xs">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-slate-600 dark:text-slate-300">
                      Jatuh Tempo: <strong>{item.dueDate}</strong>
                    </span>
                    {isPaid ? (
                      <span className="ml-auto inline-flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Lunas
                      </span>
                    ) : isOverdue ? (
                      <span className="ml-auto font-bold text-rose-600 dark:text-rose-400">
                        Terlewat {Math.abs(daysRemaining)} hari!
                      </span>
                    ) : isUrgent ? (
                      <span className="ml-auto font-bold text-amber-600 dark:text-amber-400">
                        {daysRemaining === 0 ? 'Hari Ini!' : `${daysRemaining} hari lagi!`}
                      </span>
                    ) : (
                      <span className="ml-auto text-slate-400">
                        {daysRemaining} hari lagi
                      </span>
                    )}
                  </div>

                  {/* Progress & Amounts */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Sisa Tagihan</span>
                      <span className="font-mono font-extrabold text-slate-900 dark:text-white">
                        {formatIDR(item.remainingAmount)}
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isPaid ? 'bg-emerald-500' : 'bg-brand-500'
                        }`}
                        style={{ width: `${percentPaid}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span>Total: {formatIDR(item.totalAmount)}</span>
                      <span>Terbayar {percentPaid}%</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Pay Action */}
                {!isPaid && (
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="text-[11px] text-slate-500">
                      {item.minimumPayment ? (
                        <>Cicilan: <strong>{formatIDR(item.minimumPayment)}</strong></>
                      ) : (
                        'Pelunasan Penuh'
                      )}
                    </div>
                    <button
                      onClick={() => onOpenPayDebt(item)}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95"
                    >
                      <DollarSign className="h-3.5 w-3.5" />
                      <span>Bayar Cicilan</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
