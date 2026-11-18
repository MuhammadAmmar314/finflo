'use client';

import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, ArrowLeftRight, Trash2, Receipt, Tag, Info } from 'lucide-react';
import { Transaction, Wallet, ExpenseCategory, IncomeCategory, TransactionType } from '@/lib/types';
import { defaultIncomeCategories } from '@/lib/defaultData';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  expenseCategories: ExpenseCategory[];
  incomeCategories?: IncomeCategory[];
  onSaveTransaction: (tx: Omit<Transaction, 'id'>, editId?: string) => void;
  onDeleteTransaction?: (id: string) => void;
  editingTransaction?: Transaction | null;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({
  isOpen,
  onClose,
  wallets,
  expenseCategories,
  incomeCategories = defaultIncomeCategories,
  onSaveTransaction,
  onDeleteTransaction,
  editingTransaction,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [toWalletId, setToWalletId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'none' | 'fee' | 'discount'>('none');
  const [adjustmentAmount, setAdjustmentAmount] = useState('');

  // Synchronize state when editingTransaction changes or modal opens
  useEffect(() => {
    if (editingTransaction) {
      setType(editingTransaction.type);
      setAmount(Number(editingTransaction.amount).toLocaleString('id-ID'));
      setWalletId(editingTransaction.walletId);
      setToWalletId(editingTransaction.toWalletId || '');
      setCategory(editingTransaction.category);
      setDate(editingTransaction.date);
      setDescription(editingTransaction.description || '');
      if (editingTransaction.fee && editingTransaction.fee > 0) {
        setAdjustmentType('fee');
        setAdjustmentAmount(Number(editingTransaction.fee).toLocaleString('id-ID'));
      } else if (editingTransaction.discount && editingTransaction.discount > 0) {
        setAdjustmentType('discount');
        setAdjustmentAmount(Number(editingTransaction.discount).toLocaleString('id-ID'));
      } else {
        setAdjustmentType('none');
        setAdjustmentAmount('');
      }
    } else {
      setType('expense');
      setAmount('');
      setWalletId(wallets[0]?.id || '');
      setToWalletId(wallets[1]?.id || '');
      setCategory(expenseCategories[0]?.name || 'Makanan & Minuman');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
      setAdjustmentType('none');
      setAdjustmentAmount('');
    }
  }, [editingTransaction, isOpen, wallets, expenseCategories]);

  // Update default category when type changes
  const handleTypeSelect = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(expenseCategories[0]?.name || 'Makanan & Minuman');
    } else if (newType === 'income') {
      setCategory(incomeCategories[0]?.name || 'Gaji Bulanan');
    } else {
      setCategory('Transfer');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const amountNum = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
    if (amountNum <= 0) return;
    if (!walletId) return;
    if (type === 'transfer' && (!toWalletId || toWalletId === walletId)) {
      alert('Pilih dompet tujuan transfer yang berbeda!');
      return;
    }

    const adjNum = parseFloat(adjustmentAmount.replace(/[^0-9]/g, '')) || 0;
    const fee = type === 'transfer' && adjustmentType === 'fee' && adjNum > 0 ? adjNum : undefined;
    const discount = type === 'transfer' && adjustmentType === 'discount' && adjNum > 0 ? adjNum : undefined;

    let finalDesc = description.trim();
    if (type === 'transfer' && !finalDesc) {
      const sourceName = wallets.find((w) => w.id === walletId)?.name || 'Dompet';
      const targetName = wallets.find((w) => w.id === toWalletId)?.name || 'Dompet';
      finalDesc = `Transfer dari ${sourceName} ke ${targetName}`;
      if (fee) {
        finalDesc += ` (+Admin Rp ${fee.toLocaleString('id-ID')})`;
      } else if (discount) {
        finalDesc += ` (Diskon Rp ${discount.toLocaleString('id-ID')})`;
      }
    }

    const txData: Omit<Transaction, 'id'> = {
      type,
      amount: amountNum,
      walletId,
      toWalletId: type === 'transfer' ? toWalletId : undefined,
      category: type === 'transfer' ? 'Transfer' : category,
      date: date || new Date().toISOString().split('T')[0],
      description: finalDesc,
      fee,
      discount,
    };

    onSaveTransaction(txData, editingTransaction ? editingTransaction.id : undefined);
    onClose();
  };

  const amountNum = parseFloat(amount.replace(/[^0-9]/g, '')) || 0;
  const adjNum = parseFloat(adjustmentAmount.replace(/[^0-9]/g, '')) || 0;
  const totalDeductedFromSource = type === 'transfer'
    ? (adjustmentType === 'fee' ? amountNum + adjNum : adjustmentType === 'discount' ? Math.max(0, amountNum - adjNum) : amountNum)
    : amountNum;
  const sourceWalletName = wallets.find((w) => w.id === walletId)?.name || 'Dompet Asal';
  const targetWalletName = wallets.find((w) => w.id === toWalletId)?.name || 'Dompet Tujuan';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      {/* Modal Card with max-height and flex column layout */}
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn overflow-hidden">
        {/* Modal Sticky Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200/80 px-6 py-4 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                type === 'expense'
                  ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                  : type === 'income'
                  ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  : 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
              }`}
            >
              {type === 'expense' ? (
                <ArrowDownRight className="h-5 w-5" />
              ) : type === 'income' ? (
                <ArrowUpRight className="h-5 w-5" />
              ) : (
                <ArrowLeftRight className="h-5 w-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {editingTransaction ? 'Edit Transaksi' : 'Catat Transaksi'}
              </h3>
              <p className="text-xs text-slate-500">
                {editingTransaction ? 'Perbarui rincian transaksi' : 'Pilih jenis transaksi & isi detailnya'}
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

        {/* Scrollable Form Body */}
        <form id="transaction-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Type Segmented Control */}
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-100 p-1 dark:bg-slate-800/70">
            <button
              type="button"
              onClick={() => handleTypeSelect('expense')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Pengeluaran</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('income')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Pemasukan</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeSelect('transfer')}
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold transition ${
                type === 'transfer'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              <span>Transfer</span>
            </button>
          </div>

          {/* Nominal Angka */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Nominal Transaksi (Rp)
            </label>
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
                placeholder="0"
                className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-12 pr-4 font-mono text-lg font-bold text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Dompet Pilihan */}
          {type === 'transfer' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Dari Dompet
                  </label>
                  <select
                    value={walletId}
                    onChange={(e) => setWalletId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} (Rp {w.balance.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Ke Dompet Tujuan
                  </label>
                  <select
                    value={toWalletId}
                    onChange={(e) => setToWalletId(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {wallets.map((w) => (
                      <option key={w.id} value={w.id} disabled={w.id === walletId}>
                        {w.name} (Rp {w.balance.toLocaleString('id-ID')})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Penyesuaian Transfer / Top Up (Biaya Admin & Diskon) */}
              <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 p-3.5 dark:border-slate-800 dark:bg-slate-800/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Receipt className="h-4 w-4 text-brand-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Biaya Admin / Diskon Top Up
                    </span>
                  </div>
                  <span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    Opsional
                  </span>
                </div>

                {/* Segmented Control */}
                <div className="grid grid-cols-3 gap-1 rounded-xl bg-slate-200/60 p-1 dark:bg-slate-700/60">
                  <button
                    type="button"
                    onClick={() => {
                      setAdjustmentType('none');
                      setAdjustmentAmount('');
                    }}
                    className={`rounded-lg py-1.5 text-[11px] font-bold transition ${
                      adjustmentType === 'none'
                        ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    Tanpa Biaya
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('fee')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                      adjustmentType === 'fee'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span>Biaya Admin (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustmentType('discount')}
                    className={`flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-bold transition ${
                      adjustmentType === 'discount'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                    }`}
                  >
                    <span>Diskon / Promo (-)</span>
                  </button>
                </div>

                {/* Nominal Penyesuaian Input */}
                {adjustmentType !== 'none' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      {adjustmentType === 'fee' ? 'Nominal Biaya Admin (Rp)' : 'Nominal Diskon / Cashback (Rp)'}
                    </label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-xs font-bold text-slate-400">
                        {adjustmentType === 'fee' ? '+ Rp' : '- Rp'}
                      </span>
                      <input
                        type="text"
                        value={adjustmentAmount}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          setAdjustmentAmount(val ? Number(val).toLocaleString('id-ID') : '');
                        }}
                        placeholder={adjustmentType === 'fee' ? '1.500' : '5.000'}
                        className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-12 pr-3 font-mono text-xs font-bold text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
                      {adjustmentType === 'fee'
                        ? 'Biaya admin akan otomatis dicatat sebagai pengeluaran dan memotong rekening sumber.'
                        : 'Diskon akan memotong jumlah kas yang keluar dari rekening sumber.'}
                    </p>
                  </div>
                )}

                {/* Rincian Ringkas Kalkulasi */}
                {amountNum > 0 && (
                  <div className="rounded-xl bg-white p-3 text-xs dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700 space-y-1.5">
                    <div className="flex justify-between text-slate-500 dark:text-slate-400 text-[11px]">
                      <span>Saldo Masuk ke {targetWalletName}:</span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        Rp {amountNum.toLocaleString('id-ID')}
                      </span>
                    </div>

                    {adjustmentType === 'fee' && adjNum > 0 && (
                      <div className="flex justify-between text-rose-600 dark:text-rose-400 text-[11px]">
                        <span>Biaya Admin (Pengeluaran Riil):</span>
                        <span className="font-mono font-bold">+ Rp {adjNum.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    {adjustmentType === 'discount' && adjNum > 0 && (
                      <div className="flex justify-between text-emerald-600 dark:text-emerald-400 text-[11px]">
                        <span>Potongan Diskon:</span>
                        <span className="font-mono font-bold">- Rp {adjNum.toLocaleString('id-ID')}</span>
                      </div>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 pt-1.5 flex justify-between font-bold text-slate-900 dark:text-white text-xs">
                      <span>Total Keluar dari {sourceWalletName}:</span>
                      <span className="font-mono text-brand-600 dark:text-brand-400 font-extrabold">
                        Rp {totalDeductedFromSource.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                {type === 'expense' ? 'Sumber Dompet' : 'Masuk ke Dompet'}
              </label>
              <select
                value={walletId}
                onChange={(e) => setWalletId(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {wallets.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name} (Rp {w.balance.toLocaleString('id-ID')})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Kategori (Kecuali Transfer) */}
          {type !== 'transfer' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {type === 'expense'
                  ? expenseCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name} ({cat.budgetPercentage}%)
                      </option>
                    ))
                  : incomeCategories.map((cat) => (
                      <option key={cat.id} value={cat.name}>
                        {cat.name}
                      </option>
                    ))}
              </select>
            </div>
          )}

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Catatan / Deskripsi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              Deskripsi / Catatan (Opsional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Makan siang di kantor, bayar WiFi, dsb"
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </form>

        {/* Modal Sticky Footer - ALWAYS visible & reachable */}
        <div className="flex shrink-0 items-center justify-between border-t border-slate-200/80 bg-slate-50/90 px-6 py-3.5 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90">
          <div>
            {editingTransaction && onDeleteTransaction && (
              <button
                type="button"
                onClick={() => {
                  onDeleteTransaction(editingTransaction.id);
                  onClose();
                }}
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <Trash2 className="h-4 w-4" />
                <span>Hapus</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Batal
            </button>
            <button
              type="submit"
              form="transaction-form"
              className="rounded-xl bg-brand-500 px-5 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
            >
              {editingTransaction ? 'Perbarui Transaksi' : 'Simpan Transaksi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
