'use client';

import React, { useState } from 'react';
import { X, CheckCircle, Wallet as WalletIcon, Calendar } from 'lucide-react';
import { Debt, Wallet } from '@/lib/types';
import { formatIDR } from '@/lib/utils';

interface PayDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  wallets: Wallet[];
  onConfirmPayment: (
    debtId: string,
    amount: number,
    walletId: string,
    isFullPayment: boolean
  ) => void;
}

export const PayDebtModal: React.FC<PayDebtModalProps> = ({
  isOpen,
  onClose,
  debt,
  wallets,
  onConfirmPayment,
}) => {
  const [payAmount, setPayAmount] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState(wallets[0]?.id || '');
  const [isFullPayment, setIsFullPayment] = useState(false);

  if (!isOpen || !debt) return null;

  const remaining = debt.remainingAmount;
  const suggestedAmount = debt.minimumPayment && debt.minimumPayment < remaining
    ? debt.minimumPayment
    : remaining;

  const handleFullToggle = (checked: boolean) => {
    setIsFullPayment(checked);
    if (checked) {
      setPayAmount(remaining.toLocaleString('id-ID'));
    } else {
      setPayAmount(suggestedAmount.toLocaleString('id-ID'));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(payAmount.replace(/[^0-9]/g, '')) || 0;
    if (amountNum <= 0) {
      alert('Masukkan nominal pembayaran yang valid.');
      return;
    }
    if (!selectedWalletId) {
      alert('Pilih dompet untuk pembayaran.');
      return;
    }

    const full = isFullPayment || amountNum >= remaining;
    onConfirmPayment(debt.id, amountNum, selectedWalletId, full);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Bayar Cicilan / Tagihan
            </h3>
            <p className="text-xs text-slate-500">{debt.title} • {debt.platform}</p>
          </div>
        </div>

        {/* Debt Status Card */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">Sisa Tagihan Belum Lunas:</span>
            <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
              {formatIDR(debt.remainingAmount)}
            </span>
          </div>
          {debt.minimumPayment ? (
            <div className="mt-1.5 flex items-center justify-between text-xs">
              <span className="text-slate-500">Cicilan Disarankan:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
                {formatIDR(debt.minimumPayment)}
              </span>
            </div>
          ) : null}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Nominal Pembayaran */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nominal yang Dibayarkan (Rp)
            </label>
            <input
              type="text"
              required
              value={payAmount || (suggestedAmount ? suggestedAmount.toLocaleString('id-ID') : '')}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setPayAmount(val ? Number(val).toLocaleString('id-ID') : '');
              }}
              className="mt-1 w-full font-mono text-base font-bold rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Sumber Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Dipotong Dari Dompet
            </label>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} (Saldo: {formatIDR(w.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Checkbox Tandai Lunas */}
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isFullPayment}
              onChange={(e) => handleFullToggle(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Tandai tagihan ini langsung lunas sepenuhnya
            </span>
          </label>

          {/* Action buttons */}
          <div className="mt-6 flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
            >
              Konfirmasi Bayar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
