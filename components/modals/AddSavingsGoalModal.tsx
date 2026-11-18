'use client';

import React, { useState } from 'react';
import { X, Target, Calendar, Sparkles } from 'lucide-react';
import { SavingsGoal } from '@/lib/types';

interface AddSavingsGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddGoal: (goal: Omit<SavingsGoal, 'id'>) => void;
}

export const AddSavingsGoalModal: React.FC<AddSavingsGoalModalProps> = ({
  isOpen,
  onClose,
  onAddGoal,
}) => {
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [category, setCategory] = useState('Dana Darurat');
  const [color, setColor] = useState('#10b981');

  if (!isOpen) return null;

  const categories = [
    { name: 'Dana Darurat', defaultColor: '#10b981' },
    { name: 'Investasi & Saham', defaultColor: '#0ea5e9' },
    { name: 'Liburan & Healing', defaultColor: '#f59e0b' },
    { name: 'Rumah & Properti', defaultColor: '#6366f1' },
    { name: 'Kendaraan & Gadget', defaultColor: '#8b5cf6' },
    { name: 'Lainnya', defaultColor: '#ec4899' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const targetNum = parseFloat(targetAmount.replace(/[^0-9]/g, '')) || 0;
    const currentNum = parseFloat(currentAmount.replace(/[^0-9]/g, '')) || 0;

    if (!title.trim() || targetNum <= 0) {
      alert('Mohon isi nama target dan nominal target dengan benar.');
      return;
    }

    onAddGoal({
      title: title.trim(),
      targetAmount: targetNum,
      currentAmount: currentNum,
      targetDate: targetDate || undefined,
      category,
      color,
    });

    setTitle('');
    setTargetAmount('');
    setCurrentAmount('');
    setTargetDate('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Buat Target Tabungan / Investasi
              </h3>
              <p className="text-xs text-slate-500">
                Alokasikan impian finansial Anda secara bertahap
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
          {/* Kategori Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Kategori Impian
            </label>
            <div className="mt-1.5 grid grid-cols-2 gap-2">
              {categories.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => {
                    setCategory(c.name);
                    setColor(c.defaultColor);
                  }}
                  className={`rounded-xl border px-3 py-2 text-xs font-semibold text-left transition truncate ${
                    category === c.name
                      ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nama Target */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Target / Kantong
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Dana Darurat 6 Bulan, Beli Laptop, DP Rumah"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Target Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Nominal (Rp)
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                required
                value={targetAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setTargetAmount(val ? Number(val).toLocaleString('id-ID') : '');
                }}
                placeholder="25.000.000"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-12 pr-4 font-mono text-base font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Saldo Terkumpul Saat Ini (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Saldo Terkumpul Saat Ini (Opsional)
            </label>
            <div className="relative mt-1.5">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                value={currentAmount}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '');
                  setCurrentAmount(val ? Number(val).toLocaleString('id-ID') : '');
                }}
                placeholder="0"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-12 pr-4 font-mono text-sm font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Target Tanggal Tercapai (Opsional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Target Tanggal Tercapai (Opsional)
            </label>
            <input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

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
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-600/30 transition hover:bg-emerald-700 active:scale-95"
            >
              Simpan Target Impian
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
