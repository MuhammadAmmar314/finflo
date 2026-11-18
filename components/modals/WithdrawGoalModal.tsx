'use client';

import React, { useState } from 'react';
import { X, ArrowDownLeft, ArrowRight, Wallet as WalletIcon } from 'lucide-react';
import { SavingsGoal, Wallet } from '@/lib/types';
import { formatIDR } from '@/lib/utils';

interface WithdrawGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: SavingsGoal | null;
  wallets: Wallet[];
  onWithdraw: (goalId: string, amount: number, destinationWalletId: string) => void;
}

export const WithdrawGoalModal: React.FC<WithdrawGoalModalProps> = ({
  isOpen,
  onClose,
  goal,
  wallets,
  onWithdraw,
}) => {
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState(wallets[0]?.id || '');

  if (!isOpen || !goal) return null;

  const currentAvailable = goal.currentAmount || 0;
  const amountNum = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
  const selectedWallet = wallets.find((w) => w.id === walletId) || wallets[0];
  const remainingInGoal = Math.max(0, currentAvailable - amountNum);
  const newWalletBalance = (selectedWallet?.balance || 0) + amountNum;

  const handleQuickPercent = (pct: number) => {
    const calculated = Math.round(currentAvailable * pct);
    setAmount(calculated > 0 ? calculated.toLocaleString('id-ID') : '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (amountNum <= 0) {
      alert('Masukkan nominal penarikan yang valid.');
      return;
    }

    if (amountNum > currentAvailable) {
      alert(`Nominal penarikan tidak boleh melebihi saldo tabungan (${formatIDR(currentAvailable)}).`);
      return;
    }

    if (!selectedWallet) {
      alert('Pilih dompet tujuan penarikan.');
      return;
    }

    onWithdraw(goal.id, amountNum, selectedWallet.id);
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <ArrowDownLeft className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tarik Dana Tabungan
              </h3>
              <p className="text-xs text-slate-500">
                Dari target: <strong className="text-slate-700 dark:text-slate-300">{goal.title}</strong>
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
              <span className="text-slate-500">Saldo Tabungan Saat Ini:</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {formatIDR(currentAvailable)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Target Nominal:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatIDR(goal.targetAmount)}
              </span>
            </div>
          </div>

          {/* Dompet Tujuan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Masukkan Dana ke Dompet Tujuan
            </label>
            <select
              value={walletId}
              onChange={(e) => setWalletId(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Saldo saat ini: {formatIDR(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Nominal Penarikan */}
          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nominal Penarikan (Rp)
              </label>
              {currentAvailable > 0 && (
                <button
                  type="button"
                  onClick={() => setAmount(currentAvailable.toLocaleString('id-ID'))}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Tarik Semua ({formatIDR(currentAvailable)})
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
                placeholder="500.000"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 font-mono text-lg font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Quick Percentage Pills */}
          {currentAvailable > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {[
                { label: '25%', val: 0.25 },
                { label: '50%', val: 0.5 },
                { label: '75%', val: 0.75 },
                { label: '100%', val: 1.0 },
              ].map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={() => handleQuickPercent(pill.val)}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {pill.label} ({formatIDR(Math.round(currentAvailable * pill.val))})
                </button>
              ))}
            </div>
          )}

          {/* Impact Preview */}
          {amountNum > 0 && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-50/50 p-3.5 dark:border-amber-500/20 dark:bg-amber-950/20 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Sisa Tabungan di Target:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {formatIDR(remainingInGoal)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-300">
                <span>Saldo Baru Dompet {selectedWallet?.name}:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatIDR(newWalletBalance)}
                </span>
              </div>
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
              disabled={amountNum <= 0 || amountNum > currentAvailable}
              className="rounded-xl bg-amber-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-amber-600/30 transition hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 flex items-center gap-1.5"
            >
              <span>Tarik Dana</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
