'use client';

import React, { useState } from 'react';
import { X, Wallet as WalletIcon, Check, TrendingUp, PiggyBank } from 'lucide-react';
import { Wallet, WalletType } from '@/lib/types';

interface AddWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWallet: (wallet: Omit<Wallet, 'id'>) => void;
  existingWalletsCount: number;
  isPro: boolean;
  onReachLimit: () => void;
}

export const AddWalletModal: React.FC<AddWalletModalProps> = ({
  isOpen,
  onClose,
  onAddWallet,
  existingWalletsCount,
  isPro,
  onReachLimit,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WalletType>('bank');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('sky');
  const [icon, setIcon] = useState('Landmark');

  if (!isOpen) return null;

  const colorOptions = [
    { id: 'sky', label: 'Biru Cerah', class: 'bg-sky-500' },
    { id: 'emerald', label: 'Hijau Zamrud', class: 'bg-emerald-500' },
    { id: 'violet', label: 'Ungu Elegan', class: 'bg-violet-500' },
    { id: 'indigo', label: 'Indigo', class: 'bg-indigo-500' },
    { id: 'teal', label: 'Teal', class: 'bg-teal-500' },
    { id: 'amber', label: 'Kuning Emas', class: 'bg-amber-500' },
    { id: 'rose', label: 'Merah Muda', class: 'bg-rose-500' },
  ];

  const handleTypeChange = (newType: WalletType) => {
    setType(newType);
    if (newType === 'cash') {
      setIcon('Coins');
      setColor('emerald');
    } else if (newType === 'bank') {
      setIcon('Landmark');
      setColor('sky');
    } else if (newType === 'investment') {
      setIcon('TrendingUp');
      setColor('indigo');
    } else if (newType === 'savings') {
      setIcon('PiggyBank');
      setColor('teal');
    } else {
      setIcon('Smartphone');
      setColor('violet');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPro && existingWalletsCount >= 3) {
      onClose();
      onReachLimit();
      return;
    }

    if (!name.trim()) return;

    const balanceNum = parseFloat(initialBalance.replace(/[^0-9]/g, '')) || 0;

    onAddWallet({
      name: name.trim(),
      type,
      balance: balanceNum,
      color,
      icon,
    });

    setName('');
    setInitialBalance('');
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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            <WalletIcon className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Tambah Dompet Baru
            </h3>
            <p className="text-xs text-slate-500">
              {isPro
                ? 'Paket Pro: Dompet tak terbatas'
                : `Kuota Free: ${existingWalletsCount}/3 dompet`}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Tipe Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tipe Dompet
            </label>
            <div className="mt-1.5 grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleTypeChange('bank')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'bank'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Rekening Bank
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('ewallet')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'ewallet'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                E-Wallet
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('cash')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'cash'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Uang Tunai
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('investment')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'investment'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Investasi (Saham/Emas)
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('savings')}
                className={`col-span-2 sm:col-span-1 rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'savings'
                    ? 'border-teal-500 bg-teal-50 text-teal-700 dark:bg-teal-950/60 dark:text-teal-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Tabungan Berjangka
              </button>
            </div>
          </div>

          {/* Nama Dompet */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Dompet / Akun
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Mandiri Utama, GoPay, Dompet Saku"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Saldo Awal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Saldo Awal (Rp)
            </label>
            <input
              type="text"
              value={initialBalance}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setInitialBalance(val ? Number(val).toLocaleString('id-ID') : '');
              }}
              placeholder="0"
              className="mt-1 w-full font-mono text-sm rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Pilihan Warna */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Warna Kartu
            </label>
            <div className="flex items-center gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  aria-label={c.label}
                  className={`h-8 w-8 rounded-full ${c.class} flex items-center justify-center text-white transition-transform ${
                    color === c.id ? 'ring-4 ring-offset-2 ring-brand-500 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {color === c.id && <Check className="h-4 w-4 stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Tombol Aksi */}
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
              className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
            >
              Simpan Dompet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
