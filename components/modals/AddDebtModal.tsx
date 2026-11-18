'use client';

import React, { useState } from 'react';
import { X, CreditCard, Calendar, DollarSign, Layers } from 'lucide-react';
import { Debt, DebtType } from '@/lib/types';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'status'>) => void;
}

export const AddDebtModal: React.FC<AddDebtModalProps> = ({
  isOpen,
  onClose,
  onAddDebt,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<DebtType>('paylater');
  const [platform, setPlatform] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const total = parseFloat(totalAmount.replace(/[^0-9]/g, '')) || 0;
    const minPay = parseFloat(minimumPayment.replace(/[^0-9]/g, '')) || 0;

    if (!title.trim() || total <= 0 || !dueDate) {
      alert('Mohon lengkapi judul, total nominal, dan tanggal jatuh tempo.');
      return;
    }

    onAddDebt({
      title: title.trim(),
      type,
      platform: platform.trim() || (type === 'paylater' ? 'PayLater' : 'Pribadi'),
      totalAmount: total,
      remainingAmount: total,
      minimumPayment: minPay || undefined,
      dueDate,
      notes: notes.trim() || undefined,
    });

    setTitle('');
    setTotalAmount('');
    setMinimumPayment('');
    setPlatform('');
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative flex max-h-[90vh] w-full max-w-md flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Tambah Hutang / Paylater
              </h3>
              <p className="text-xs text-slate-500">Catat tagihan &amp; cicilan berjalan</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form id="debt-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Tipe: Paylater, Hutang, Piutang */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tipe Kewajiban
            </label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('paylater')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'paylater'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Paylater
              </button>
              <button
                type="button"
                onClick={() => setType('hutang')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'hutang'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Hutang Saya
              </button>
              <button
                type="button"
                onClick={() => setType('piutang')}
                className={`rounded-xl border py-2 text-xs font-semibold transition ${
                  type === 'piutang'
                    ? 'border-brand-500 bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-300'
                }`}
              >
                Piutang (Hak)
              </button>
            </div>
          </div>

          {/* Judul Tagihan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nama Tagihan / Deskripsi
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Contoh: Cicilan Smartphone, SPaylater Belanja"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Platform / Lembaga */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Platform / Pemberi Pinjaman
            </label>
            <input
              type="text"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              placeholder="Contoh: Shopee PayLater, Kredivo, BCA Finance, Budi"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Total Nominal */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Total Nominal Tagihan (Rp)
            </label>
            <input
              type="text"
              required
              value={totalAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setTotalAmount(val ? Number(val).toLocaleString('id-ID') : '');
              }}
              placeholder="0"
              className="mt-1.5 w-full font-mono text-sm rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Cicilan Per Bulan / Min Payment */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Cicilan per Bulan / Min. Bayar (Rp) (Opsional)
            </label>
            <input
              type="text"
              value={minimumPayment}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setMinimumPayment(val ? Number(val).toLocaleString('id-ID') : '');
              }}
              placeholder="0"
              className="mt-1.5 w-full font-mono text-sm rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Jatuh Tempo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tanggal Jatuh Tempo Terdekat
            </label>
            <input
              type="date"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Catatan Tambahan (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Tenor 3 bulan sisa 2x bayar"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </form>

        {/* Sticky Footer */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200/80 bg-slate-50/90 px-6 py-3.5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Batal
          </button>
          <button
            type="submit"
            form="debt-form"
            className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
          >
            Simpan Tagihan
          </button>
        </div>
      </div>
    </div>
  );
};
