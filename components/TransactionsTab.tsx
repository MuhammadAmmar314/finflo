'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Calendar,
  Filter,
  Download,
  Plus,
  Edit2,
  Trash2,
  ArrowDownRight,
  ArrowUpRight,
  ArrowLeftRight,
  RotateCcw,
} from 'lucide-react';
import { Transaction, Wallet, ExpenseCategory, TransactionType } from '@/lib/types';
import { formatIDR } from '@/lib/utils';

interface TransactionsTabProps {
  transactions: Transaction[];
  wallets: Wallet[];
  expenseCategories: ExpenseCategory[];
  onOpenAddTransaction: () => void;
  onEditTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  wallets,
  expenseCategories,
  onOpenAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
}) => {
  // Current month default in YYYY-MM format
  const currentMonthStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  }, []);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Month filter (tx.date is YYYY-MM-DD)
      if (selectedMonth && !tx.date.startsWith(selectedMonth)) {
        return false;
      }

      // Type filter
      if (selectedType !== 'all' && tx.type !== selectedType) {
        return false;
      }

      // Wallet filter
      if (selectedWalletId !== 'all') {
        if (tx.walletId !== selectedWalletId && tx.toWalletId !== selectedWalletId) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'all' && tx.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const descMatch = (tx.description || '').toLowerCase().includes(query);
        const catMatch = tx.category.toLowerCase().includes(query);
        return descMatch || catMatch;
      }

      return true;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, selectedMonth, selectedType, selectedWalletId, selectedCategory, searchQuery]);

  // Calculate filtered stats
  const filteredStats = useMemo(() => {
    let income = 0;
    let expense = 0;
    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') income += tx.amount;
      if (tx.type === 'expense') expense += tx.amount;
    });
    return { income, expense, balance: income - expense };
  }, [filteredTransactions]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedMonth(currentMonthStr);
    setSelectedType('all');
    setSelectedWalletId('all');
    setSelectedCategory('all');
  };

  // CSV Export
  const handleExportCSV = () => {
    if (filteredTransactions.length === 0) {
      alert('Tidak ada transaksi untuk diekspor.');
      return;
    }

    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nominal', 'Dompet Sumber', 'Dompet Tujuan', 'Deskripsi'];
    const rows = filteredTransactions.map((tx) => {
      const fromWallet = wallets.find((w) => w.id === tx.walletId)?.name || tx.walletId;
      const toWallet = tx.toWalletId ? wallets.find((w) => w.id === tx.toWalletId)?.name || tx.toWalletId : '';
      return [
        tx.id,
        tx.date,
        tx.type,
        `"${tx.category.replace(/"/g, '""')}"`,
        tx.amount,
        `"${fromWallet.replace(/"/g, '""')}"`,
        `"${toWallet.replace(/"/g, '""')}"`,
        `"${(tx.description || '').replace(/"/g, '""')}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlo_Transaksi_${selectedMonth || 'semua'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header and Quick Summary */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Riwayat Transaksi
          </h2>
          <p className="text-xs text-slate-500">
            Pencatatan arus kas masuk, keluar, dan mutasi dompet
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={onOpenAddTransaction}
            className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/30 transition hover:bg-brand-600 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Tambah Transaksi</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-4 sm:p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi atau deskripsi..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white dark:focus:bg-slate-800"
            />
          </div>

          {/* Month Picker (Defaults to Current Month) */}
          <div className="relative">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              title="Pilih Bulan Transaksi"
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="all">Semua Tipe</option>
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          {/* Dompet Filter */}
          <div>
            <select
              value={selectedWalletId}
              onChange={(e) => setSelectedWalletId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 px-3 text-xs font-medium text-slate-900 focus:border-brand-500 focus:bg-white focus:outline-none dark:border-slate-800 dark:bg-slate-800/60 dark:text-white"
            >
              <option value="all">Semua Dompet</option>
              {wallets.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Footer with Reset & Active Counters */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
          <div className="flex items-center gap-4">
            <span className="text-slate-500">
              Ditemukan: <strong>{filteredTransactions.length}</strong> transaksi
            </span>
            <span className="text-emerald-600 dark:text-emerald-400">
              + Masuk: <strong>{formatIDR(filteredStats.income)}</strong>
            </span>
            <span className="text-rose-600 dark:text-rose-400">
              - Keluar: <strong>{formatIDR(filteredStats.expense)}</strong>
            </span>
          </div>

          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset Filter Bulan Ini</span>
          </button>
        </div>
      </div>

      {/* Transactions List Table / Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-3">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Calendar className="h-6 w-6" />
            </div>
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              Tidak ada transaksi yang sesuai filter
            </p>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Tampilkan Transaksi Bulan Ini
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredTransactions.map((tx) => {
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';
              const walletName = wallets.find((w) => w.id === tx.walletId)?.name || 'Dompet';
              const toWalletName = tx.toWalletId
                ? wallets.find((w) => w.id === tx.toWalletId)?.name
                : null;

              return (
                <div
                  key={tx.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                >
                  {/* Left: Icon, Category, Date, Description */}
                  <div className="flex items-start sm:items-center gap-3">
                    <div
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                        isExpense
                          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                          : isIncome
                          ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400'
                      }`}
                    >
                      {isExpense ? (
                        <ArrowDownRight className="h-5 w-5" />
                      ) : isIncome ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowLeftRight className="h-5 w-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                          {tx.description || tx.category}
                        </span>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                          {tx.category}
                        </span>
                      </div>

                      <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-400">
                        <span>{tx.date}</span>
                        <span>•</span>
                        <span>
                          {tx.type === 'transfer'
                            ? `${walletName} ➔ ${toWalletName || 'Tujuan'}`
                            : walletName}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Amount & Actions (Edit / Delete) */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 pl-14 sm:pl-0">
                    <div
                      className={`font-mono text-sm sm:text-base font-extrabold ${
                        isExpense
                          ? 'text-rose-600 dark:text-rose-400'
                          : isIncome
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-sky-600 dark:text-sky-400'
                      }`}
                    >
                      {isExpense ? '-' : isIncome ? '+' : ''}
                      {formatIDR(tx.amount)}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditTransaction(tx)}
                        title="Edit Transaksi"
                        className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-slate-800 dark:hover:text-brand-400"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        title="Hapus Transaksi"
                        className="rounded-xl p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
