'use client';

import React, { useState } from 'react';
import { X, PiggyBank, ArrowRight, CheckCircle2 } from 'lucide-react';
import { SavingsGoal, Wallet } from '@/lib/types';
import { formatIDR } from '@/lib/utils';

interface DepositGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  wallets: Wallet[];
  onDeposit: (goalId: string, amount: number, walletId: string) => void;
}

export const DepositGoalModal: React.FC<DepositGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  wallets,
  onDeposit,
}) => {
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');

  if (!isOpen || !goal) return null;

  const remainingNeeded = Math.max(0, goal.targetAmount - goal.currentAmount);
  const amountNum = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];
  const newProjectedAmount = goal.currentAmount + amountNum;
  const newProgressPct = Math.min(100, Math.round((newProjectedAmount / goal.targetAmount) * 100));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum <= 0) {
      alert('Masukkan nominal setoran yang valid.');
      return;
    }

    if (selectedWallet && selectedWallet.balance < amountNum) {
      if (!confirm(`Saldo ${selectedWallet.name} (${formatIDR(selectedWallet.balance)}) lebih kecil dari nominal setor. Tetap lanjutkan?`)) {
        return;
      }
    }

    onDeposit(goal.id, amountNum, walletId);
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <PiggyBank className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Setor Tabungan / Investasi
              </h3>
              <p className="text-xs text-slate-500">
                Untuk target: <strong className="text-slate-700 dark:text-slate-300">{goal.title}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Target Info Mini Card */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Terkumpul Saat Ini:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatIDR(goal.currentAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Target Akhir:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatIDR(goal.targetAmount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-teal-600 dark:text-teal-400 font-semibold border-t border-slate-200/60 dark:border-slate-700/60 pt-2">
              <span>Kurang: {formatIDR(remainingNeeded)}</span>
              <span>Progress: {Math.round((goal.currentAmount / goal.targetAmount) * 100)}%</span>
            </div>
          </div>

          {/* Sumber Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ambil Dana dari Dompet
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Saldo: {formatIDR(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Nominal Setoran */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nominal Setoran (Rp)
              </label>
              {remainingNeeded > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(remainingNeeded.toLocaleString('id-ID'))}
                  className="text-[11px] font-bold text-brand-600 dark:text-brand-400 hover:underline"
                >
                  Setor Penuh ({formatIDR(remainingNeeded)})
                </button>
              )}
            </div>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-base font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                required
                autoFocus
                value={amount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setAmount(val ? Number(val).toLocaleString('id-ID') : '');
                }}
                placeholder="1.000.000"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 font-mono text-lg font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Amount Pills */}
          <div className="flex flex-wrap gap-1.5">
            {[250000, 500000, 1000000, 2000000].map((quickVal) => (
              <button
                key={quickVal}
                type="button"
                onClick={() => setAmount(quickVal.toLocaleString('id-ID'))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                +{formatIDR(quickVal)}
              </button>
            ))}
          </div>

          {/* Projected Progress Preview */}
          {amountNum > 0 && (
            <div className="rounded-2xl border border-teal-500/30 bg-teal-50/50 p-3.5 dark:border-teal-500/20 dark:bg-teal-950/20 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold text-teal-800 dark:text-teal-300">
                <span>Progress Baru Setelah Setor:</span>
                <span className="font-bold">{newProgressPct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full bg-teal-500 transition-all duration-300"
                  style={{ width: `${newProgressPct}%` }}
                />
              </div>
              <p className="text-[11px] text-teal-700 dark:text-teal-400">
                Total terkumpul menjadi {formatIDR(newProjectedAmount)}
              </p>
            </div>
          )}

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-teal-600/30 transition hover:bg-teal-700 active:scale-95 flex items-center gap-1.5"
            >
              <span>Setor Sekarang</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
