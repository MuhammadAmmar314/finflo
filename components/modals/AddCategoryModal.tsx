'use client';

import React, { useState, useEffect } from 'react';
import { X, Tag, PieChart, AlertCircle, Sliders } from 'lucide-react';
import { ExpenseCategory } from '@/lib/types';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCategory: (category: Omit<ExpenseCategory, 'id'>, editId?: string) => void;
  existingCategoriesCount: number;
  currentTotalBudgetPercentage: number;
  isPro: boolean;
  onReachLimit: () => void;
  editingCategory?: ExpenseCategory | null;
}

export const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onSaveCategory,
  existingCategoriesCount,
  currentTotalBudgetPercentage,
  isPro,
  onReachLimit,
  editingCategory,
}) => {
  const [name, setName] = useState('');
  const [budgetPercentage, setBudgetPercentage] = useState<number>(10);
  const [color, setColor] = useState('#0ea5e9');
  const [icon, setIcon] = useState('Tag');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
      setBudgetPercentage(editingCategory.budgetPercentage);
      setColor(editingCategory.color || '#0ea5e9');
      setIcon(editingCategory.icon || 'Tag');
    } else {
      setName('');
      setBudgetPercentage(10);
      setColor('#0ea5e9');
      setIcon('Tag');
    }
    setErrorMsg('');
  }, [editingCategory, isOpen]);

  if (!isOpen) return null;

  // If editing, exclude the current category's percentage from total
  const otherTotalBudget = editingCategory
    ? Math.max(0, currentTotalBudgetPercentage - (editingCategory.budgetPercentage || 0))
    : currentTotalBudgetPercentage;

  const remainingBudgetPercentage = Math.max(0, 100 - otherTotalBudget);

  const colors = [
    { code: '#6366f1', name: 'Indigo' },
    { code: '#f59e0b', name: 'Amber' },
    { code: '#0ea5e9', name: 'Sky' },
    { code: '#8b5cf6', name: 'Purple' },
    { code: '#10b981', name: 'Emerald' },
    { code: '#ec4899', name: 'Pink' },
    { code: '#ef4444', name: 'Rose' },
    { code: '#14b8a6', name: 'Teal' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!editingCategory && !isPro && existingCategoriesCount >= 8) {
      onClose();
      onReachLimit();
      return;
    }

    if (!name.trim()) {
      setErrorMsg('Nama kategori tidak boleh kosong.');
      return;
    }

    const pct = Number(budgetPercentage);
    if (pct <= 0) {
      setErrorMsg('Persentase alokasi minimal 1%.');
      return;
    }

    if (otherTotalBudget + pct > 100) {
      setErrorMsg(
        `Total alokasi budgeting tidak boleh melebihi 100%. Maksimal alokasi yang tersisa: ${remainingBudgetPercentage}%.`
      );
      return;
    }

    onSaveCategory(
      {
        name: name.trim(),
        budgetPercentage: pct,
        color,
        icon,
      },
      editingCategory?.id
    );

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
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingCategory ? 'Sesuaikan Kategori & Anggaran' : 'Tambah Kategori Pengeluaran'}
            </h3>
            <p className="text-xs text-slate-500">
              {isPro
                ? 'Paket Pro: Kategori kustom tanpa batas'
                : `Kuota Free: ${existingCategoriesCount}/8 kategori`}
            </p>
          </div>
        </div>

        {/* Budget Allocation Progress Indicator */}
        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <PieChart className="h-3.5 w-3.5 text-brand-500" />
              Total Alokasi Budgeting:
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              {otherTotalBudget + Number(budgetPercentage || 0)}% / 100%
            </span>
          </div>

          {/* Progress bar */}
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className={`h-full transition-all duration-300 ${
                otherTotalBudget + Number(budgetPercentage) > 100 ? 'bg-rose-500' : 'bg-brand-500'
              }`}
              style={{
                width: `${Math.min(100, otherTotalBudget + Number(budgetPercentage || 0))}%`,
              }}
            />
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Sisa kuota: {Math.max(0, remainingBudgetPercentage - Number(budgetPercentage || 0))}%</span>
            <span>Alokasi kategori ini: {budgetPercentage || 0}%</span>
          </div>
        </div>

        {/* Error banner */}
        {errorMsg && (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-500 dark:text-rose-400">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Kategori
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Makan & Minum, Kos, Transportasi"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Alokasi Persentase Anggaran (%)
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="1"
                  max={remainingBudgetPercentage}
                  value={budgetPercentage}
                  onChange={(e) => setBudgetPercentage(Math.max(1, Number(e.target.value)))}
                  className="w-16 text-right font-mono font-bold text-xs rounded-lg border border-slate-300 px-2 py-1 dark:border-slate-700 dark:bg-slate-800 text-brand-600 dark:text-brand-400"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max={Math.max(1, remainingBudgetPercentage)}
              value={budgetPercentage}
              onChange={(e) => setBudgetPercentage(Number(e.target.value))}
              className="mt-2 w-full accent-brand-500 cursor-pointer"
            />

            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>Minimal 1%</span>
              <span>Maksimal tersedia {remainingBudgetPercentage}%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Warna Penanda
            </label>
            <div className="flex items-center gap-2.5">
              {colors.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setColor(c.code)}
                  style={{ backgroundColor: c.code }}
                  className={`h-7 w-7 rounded-full transition-transform ${
                    color === c.code ? 'scale-125 ring-2 ring-slate-900 dark:ring-white' : 'opacity-80 hover:opacity-100'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

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
              disabled={remainingBudgetPercentage <= 0 && !editingCategory}
              className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95 disabled:opacity-50"
            >
              {editingCategory ? 'Simpan Perubahan' : 'Simpan Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
