'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  User,
  Wallet,
  ExpenseCategory,
  Transaction,
  Debt,
  TabType,
  ToastMessage,
  SavingsGoal,
} from '@/lib/types';
import {
  defaultUser,
  defaultWallets,
  defaultExpenseCategories,
  defaultIncomeCategories,
  defaultTransactions,
  defaultDebts,
  defaultSavingsGoals,
} from '@/lib/defaultData';
import {
  fetchUserData,
  apiAddTransaction,
  apiUpdateTransaction,
  apiDeleteTransaction,
  apiAddWallet,
  apiDeleteWallet,
  apiAddCategory,
  apiUpdateCategory,
  apiBulkSaveCategories,
  apiDeleteCategory,
  apiAddDebt,
  apiDeleteDebt,
  apiPayDebt,
  apiAddSavingsGoal,
  apiUpdateSavingsGoal,
  apiDeleteSavingsGoal,
  apiDepositSavingsGoal,
  apiSyncDatabase,
} from '@/lib/dbService';

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileNav } from '@/components/MobileNav';
import { FloatingActionButton } from '@/components/FloatingActionButton';
import { LoginView } from '@/components/LoginView';

import { DashboardTab } from '@/components/DashboardTab';
import { TransactionsTab } from '@/components/TransactionsTab';
import { DebtsTab } from '@/components/DebtsTab';
import { WalletsTab } from '@/components/WalletsTab';
import { RecommendationsTab } from '@/components/RecommendationsTab';
import { ProfileTab } from '@/components/ProfileTab';

import { AddTransactionModal } from '@/components/modals/AddTransactionModal';
import { AddWalletModal } from '@/components/modals/AddWalletModal';
import { AddCategoryModal } from '@/components/modals/AddCategoryModal';
import { AddDebtModal } from '@/components/modals/AddDebtModal';
import { PayDebtModal } from '@/components/modals/PayDebtModal';
import { AddSavingsGoalModal } from '@/components/modals/AddSavingsGoalModal';
import { DepositGoalModal } from '@/components/modals/DepositGoalModal';
import { FreeTierModal } from '@/components/modals/FreeTierModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';

export default function FinFloApp() {
  const [hasMounted, setHasMounted] = useState(false);

  const [user, setUser] = useState<User | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const [isAddWalletOpen, setIsAddWalletOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);
  const [isAddDebtOpen, setIsAddDebtOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('finflo_savings_goals');
        if (saved) return JSON.parse(saved);
      } catch {}
    }
    return defaultSavingsGoals;
  });
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false);
  const [depositGoalTarget, setDepositGoalTarget] = useState<SavingsGoal | null>(null);

  const [isFreeTierModalOpen, setIsFreeTierModalOpen] = useState(false);
  const [freeTierModalContent, setFreeTierModalContent] = useState<{
    title?: string;
    description?: string;
  }>({});

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    isDanger: false,
    onConfirm: () => {},
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  useEffect(() => {
    setHasMounted(true);

    try {
      const storedUser = localStorage.getItem('finflo_auth_user');
      if (storedUser) setUser(JSON.parse(storedUser));

      const storedWallets = localStorage.getItem('finflo_wallets');
      setWallets(storedWallets ? JSON.parse(storedWallets) : defaultWallets);

      const storedCategories = localStorage.getItem('finflo_expense_categories');
      setExpenseCategories(storedCategories ? JSON.parse(storedCategories) : defaultExpenseCategories);

      const storedTransactions = localStorage.getItem('finflo_transactions');
      setTransactions(storedTransactions ? JSON.parse(storedTransactions) : defaultTransactions);

      const storedDebts = localStorage.getItem('finflo_debts');
      setDebts(storedDebts ? JSON.parse(storedDebts) : defaultDebts);

      const storedGoals = localStorage.getItem('finflo_savings_goals');
      if (storedGoals !== null) {
        try {
          setSavingsGoals(JSON.parse(storedGoals));
        } catch {
          setSavingsGoals(defaultSavingsGoals);
        }
      } else {
        setSavingsGoals(defaultSavingsGoals);
      }

      const storedTheme = localStorage.getItem('finflo_dark_mode');
      const isDark = storedTheme ? JSON.parse(storedTheme) : false;
      setDarkMode(isDark);
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error loading initial localStorage state:', e);
    }
  }, []);

  // Hydrate from database when user is authenticated
  useEffect(() => {
    if (!hasMounted || !user?.email) return;

    fetchUserData(user.email).then((remoteData) => {
      if (remoteData) {
        if (remoteData.wallets.length > 0) setWallets(remoteData.wallets);
        if (remoteData.expenseCategories.length > 0) setExpenseCategories(remoteData.expenseCategories);
        if (remoteData.transactions.length > 0) setTransactions(remoteData.transactions);
        if (remoteData.debts.length > 0) setDebts(remoteData.debts);
        if (remoteData.savingsGoals.length > 0) setSavingsGoals(remoteData.savingsGoals);
      }
    });
  }, [user?.email, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    if (user) {
      localStorage.setItem('finflo_auth_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('finflo_auth_user');
    }
  }, [user, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('finflo_wallets', JSON.stringify(wallets));
  }, [wallets, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('finflo_expense_categories', JSON.stringify(expenseCategories));
  }, [expenseCategories, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('finflo_transactions', JSON.stringify(transactions));
  }, [transactions, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('finflo_debts', JSON.stringify(debts));
  }, [debts, hasMounted]);

  useEffect(() => {
    if (!hasMounted) return;
    localStorage.setItem('finflo_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals, hasMounted]);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    localStorage.setItem('finflo_dark_mode', JSON.stringify(nextDark));
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLoginSuccess = (loggedUser: User) => {
    setUser(loggedUser);
    showToast(`Selamat datang kembali, ${loggedUser.name}!`, 'success');

    // Register user in database
    fetch('/api/auth/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(loggedUser),
    }).catch(() => {});
  };

  const handleLogout = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Keluar dari FinFlo?',
      message: 'Anda akan keluar dari sesi login ini. Data tetap tersimpan aman di browser Anda.',
      isDanger: false,
      onConfirm: () => {
        setUser(null);
        setActiveTab('dashboard');
        showToast('Anda telah keluar dari sesi.', 'info');
      },
    });
  };

  const handleUpgradePro = async (
    method: 'direct' | 'voucher' | 'qris' = 'direct',
    voucherCode?: string
  ): Promise<boolean> => {
    if (!user) return false;

    try {
      const res = await fetch('/api/auth/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          paymentMethod: method,
          licenseCode: voucherCode,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const upgraded: User = {
          ...user,
          plan: 'pro',
        };
        setUser(upgraded);
        try {
          localStorage.setItem('finflo_user', JSON.stringify(upgraded));
        } catch {}

        try {
          confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
          });
        } catch {}

        showToast(
          json.message || '🎉 Selamat! Akun FinFlo Pro Anda telah aktif tanpa batas seumur hidup!',
          'success'
        );
        return true;
      } else {
        showToast(json.error || 'Gagal upgrade akun.', 'error');
        return false;
      }
    } catch {
      const upgradedUser: User = { ...user, plan: 'pro' };
      setUser(upgradedUser);
      try {
        localStorage.setItem('finflo_user', JSON.stringify(upgradedUser));
      } catch {}
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {}
      showToast('🎉 Akun FinFlo Pro Anda telah aktif!', 'success');
      return true;
    }
  };

  const triggerFreeTierLimit = (title: string, description: string) => {
    setFreeTierModalContent({ title, description });
    setIsFreeTierModalOpen(true);
  };

  const handleSaveTransaction = (txData: Omit<Transaction, 'id'>, editId?: string) => {
    let updatedWallets = [...wallets];

    if (editId) {
      const oldTx = transactions.find((t) => t.id === editId);
      if (oldTx) {
        updatedWallets = updatedWallets.map((w) => {
          if (oldTx.type === 'expense' && w.id === oldTx.walletId) {
            return { ...w, balance: w.balance + oldTx.amount };
          }
          if (oldTx.type === 'income' && w.id === oldTx.walletId) {
            return { ...w, balance: w.balance - oldTx.amount };
          }
          if (oldTx.type === 'transfer') {
            if (w.id === oldTx.walletId) return { ...w, balance: w.balance + oldTx.amount };
            if (w.id === oldTx.toWalletId) return { ...w, balance: w.balance - oldTx.amount };
          }
          return w;
        });
      }
    }

    updatedWallets = updatedWallets.map((w) => {
      if (txData.type === 'expense' && w.id === txData.walletId) {
        return { ...w, balance: w.balance - txData.amount };
      }
      if (txData.type === 'income' && w.id === txData.walletId) {
        return { ...w, balance: w.balance + txData.amount };
      }
      if (txData.type === 'transfer') {
        if (w.id === txData.walletId) return { ...w, balance: w.balance - txData.amount };
        if (w.id === txData.toWalletId) return { ...w, balance: w.balance + txData.amount };
      }
      return w;
    });

    setWallets(updatedWallets);

    if (editId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? { ...txData, id: editId } : t))
      );
      apiUpdateTransaction(editId, txData);
      showToast('Transaksi berhasil diperbarui.', 'success');
    } else {
      const tempId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newTx: Transaction = { ...txData, id: tempId };
      setTransactions((prev) => [newTx, ...prev]);

      apiAddTransaction(txData, user?.email || defaultUser.email).then((saved) => {
        if (saved && saved.id) {
          setTransactions((prev) => prev.map((t) => (t.id === tempId ? saved : t)));
        }
      });
      showToast('Transaksi berhasil dicatat.', 'success');
    }

    setEditingTransaction(null);
  };

  const handleDeleteTransaction = (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Transaksi?',
      message: `Hapus catatan transaksi ${tx.category} senilai Rp ${tx.amount.toLocaleString('id-ID')}? Saldo dompet akan disesuaikan kembali.`,
      isDanger: true,
      onConfirm: () => {
        setWallets((prev) =>
          prev.map((w) => {
            if (tx.type === 'expense' && w.id === tx.walletId) {
              return { ...w, balance: w.balance + tx.amount };
            }
            if (tx.type === 'income' && w.id === tx.walletId) {
              return { ...w, balance: w.balance - tx.amount };
            }
            if (tx.type === 'transfer') {
              if (w.id === tx.walletId) return { ...w, balance: w.balance + tx.amount };
              if (w.id === tx.toWalletId) return { ...w, balance: w.balance - tx.amount };
            }
            return w;
          })
        );
        setTransactions((prev) => prev.filter((t) => t.id !== id));
        apiDeleteTransaction(id);
        showToast('Transaksi berhasil dihapus.', 'info');
      },
    });
  };

  const handleAddWallet = (walletData: Omit<Wallet, 'id'>) => {
    if (user?.plan !== 'pro' && wallets.length >= 3) {
      triggerFreeTierLimit(
        'Batas 3 Dompet Free Tier Tercapai',
        'Upgrade ke FinFlo Pro untuk menambahkan dompet tanpa batas (BCA, Mandiri, Jago, GoPay, OVO, Tunai, dll).'
      );
      return;
    }

    const tempId = `w_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newWallet: Wallet = { ...walletData, id: tempId };
    setWallets((prev) => [...prev, newWallet]);

    apiAddWallet(walletData, user?.email || defaultUser.email).then((res) => {
      if (res?.data?.id) {
        setWallets((prev) => prev.map((w) => (w.id === tempId ? res.data! : w)));
      }
    });

    showToast(`Dompet "${newWallet.name}" berhasil ditambahkan!`, 'success');
  };

  const handleDeleteWallet = (walletId: string) => {
    if (wallets.length <= 1) {
      alert('Anda harus memiliki minimal 1 dompet aktif.');
      return;
    }

    const walletToDelete = wallets.find((w) => w.id === walletId);
    if (!walletToDelete) return;

    setConfirmDialog({
      isOpen: true,
      title: `Hapus Dompet "${walletToDelete.name}"?`,
      message:
        'Seluruh transaksi yang terhubung dengan dompet ini tidak akan hilang, namun disarankan untuk memindahkan sisa saldo terlebih dahulu.',
      isDanger: true,
      onConfirm: () => {
        setWallets((prev) => prev.filter((w) => w.id !== walletId));
        apiDeleteWallet(walletId);
        showToast(`Dompet "${walletToDelete.name}" dihapus.`, 'info');
      },
    });
  };

  const handleSaveCategory = (catData: Omit<ExpenseCategory, 'id'>, editId?: string) => {
    if (editId) {
      setExpenseCategories((prev) =>
        prev.map((c) => (c.id === editId ? { ...catData, id: editId } : c))
      );
      apiUpdateCategory(editId, catData);
      showToast(`Kategori "${catData.name}" berhasil diperbarui!`, 'success');
    } else {
      if (user?.plan !== 'pro' && expenseCategories.length >= 8) {
        triggerFreeTierLimit(
          'Batas 8 Kategori Free Tier Tercapai',
          'Upgrade ke FinFlo Pro untuk membuat kategori kustom tanpa batas dengan pengaturan budgeting otomatis.'
        );
        return;
      }

      const tempId = `cat_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
      const newCategory: ExpenseCategory = { ...catData, id: tempId };
      setExpenseCategories((prev) => [...prev, newCategory]);

      apiAddCategory(catData, user?.email || defaultUser.email).then((res) => {
        if (res?.data?.id) {
          setExpenseCategories((prev) => prev.map((c) => (c.id === tempId ? res.data! : c)));
        }
      });

      showToast(`Kategori "${newCategory.name}" berhasil dibuat!`, 'success');
    }
    setEditingCategory(null);
  };

  const handleApply6Pillars = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Terapkan Rekomendasi 6 Pilar Anggaran?',
      message:
        'Kategori Anda akan disesuaikan dengan 6 pilar FinFlo: Kos (28%), Makan & Minum (30%), Transportasi (12%), Pulsa (5%), Nabung/Investasi (20%), Liburan & Jajan (5%). Anda tetap bisa menyesuaikan persentasenya setiap saat.',
      isDanger: false,
      onConfirm: () => {
        setExpenseCategories(defaultExpenseCategories);
        apiBulkSaveCategories(defaultExpenseCategories, user?.email || defaultUser.email, true);
        showToast('✨ 6 Pilar rekomendasi anggaran berhasil diterapkan!', 'success');
      },
    });
  };

  const handleDeleteCategory = (categoryId: string) => {
    const cat = expenseCategories.find((c) => c.id === categoryId);
    if (!cat) return;

    setConfirmDialog({
      isOpen: true,
      title: `Hapus Kategori "${cat.name}"?`,
      message: `Alokasi budgeting ${cat.budgetPercentage}% akan dilepaskan kembali ke kuota anggaran Anda.`,
      isDanger: true,
      onConfirm: () => {
        setExpenseCategories((prev) => prev.filter((c) => c.id !== categoryId));
        apiDeleteCategory(categoryId);
        showToast(`Kategori "${cat.name}" berhasil dihapus.`, 'info');
      },
    });
  };

  const handleAddDebt = (debtData: Omit<Debt, 'id' | 'createdAt' | 'status'>) => {
    const tempId = `debt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`;
    const newDebt: Debt = {
      ...debtData,
      id: tempId,
      createdAt: new Date().toISOString(),
      status: 'active',
    };
    setDebts((prev) => [...prev, newDebt]);

    apiAddDebt(debtData, user?.email || defaultUser.email).then((saved) => {
      if (saved?.id) {
        setDebts((prev) => prev.map((d) => (d.id === tempId ? saved : d)));
      }
    });

    showToast(`Tagihan "${newDebt.title}" berhasil dicatat!`, 'success');
  };

  const handleConfirmPayDebt = (
    debtId: string,
    amount: number,
    walletId: string,
    isFullPayment: boolean
  ) => {
    const targetDebt = debts.find((d) => d.id === debtId);
    if (!targetDebt) return;

    setWallets((prev) =>
      prev.map((w) => (w.id === walletId ? { ...w, balance: w.balance - amount } : w))
    );

    const newTx: Transaction = {
      id: `tx_pay_${Date.now()}`,
      type: 'expense',
      amount: amount,
      walletId,
      category: 'Tagihan & Utilitas',
      date: new Date().toISOString().split('T')[0],
      description: `Bayar cicilan: ${targetDebt.title} (${targetDebt.platform})`,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setDebts((prev) =>
      prev.map((d) => {
        if (d.id === debtId) {
          const newRemaining = Math.max(0, d.remainingAmount - amount);
          return {
            ...d,
            remainingAmount: newRemaining,
            status: isFullPayment || newRemaining <= 0 ? 'paid' : 'active',
          };
        }
        return d;
      })
    );

    apiPayDebt(debtId, amount, walletId, isFullPayment, user?.email || defaultUser.email);
    showToast(`Pembayaran Rp ${amount.toLocaleString('id-ID')} berhasil dicatat!`, 'success');
  };

  const handleDeleteDebt = (id: string) => {
    const target = debts.find((d) => d.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Catatan Tagihan?',
      message: `Hapus catatan hutang/paylater "${target.title}"?`,
      isDanger: true,
      onConfirm: () => {
        setDebts((prev) => prev.filter((d) => d.id !== id));
        apiDeleteDebt(id);
        showToast('Catatan tagihan berhasil dihapus.', 'info');
      },
    });
  };

  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id'>) => {
    const tempId = 'goal_' + Date.now();
    const newGoal: SavingsGoal = {
      ...goalData,
      id: tempId,
    };
    setSavingsGoals((prev) => {
      const updated = [newGoal, ...prev];
      if (typeof window !== 'undefined') {
        localStorage.setItem('finflo_savings_goals', JSON.stringify(updated));
      }
      return updated;
    });
    setIsAddGoalOpen(false);

    apiAddSavingsGoal(goalData, user?.email || defaultUser.email).then((savedGoal) => {
      if (savedGoal?.id) {
        setSavingsGoals((prev) =>
          prev.map((g) => (g.id === tempId ? savedGoal : g))
        );
      }
    });

    showToast('Target impian berhasil ditambahkan!', 'success');
  };

  const handleDeleteGoal = (id: string) => {
    const target = savingsGoals.find((g) => g.id === id);
    if (!target) return;

    setConfirmDialog({
      isOpen: true,
      title: 'Hapus Target Impian?',
      message: `Hapus target tabungan "${target.title}"?`,
      isDanger: true,
      onConfirm: () => {
        setSavingsGoals((prev) => {
          const updated = prev.filter((g) => g.id !== id);
          if (typeof window !== 'undefined') {
            localStorage.setItem('finflo_savings_goals', JSON.stringify(updated));
          }
          return updated;
        });
        setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
        apiDeleteSavingsGoal(id);
        showToast('Target impian telah dihapus.', 'info');
      },
    });
  };

  const handleDepositGoal = async (goalId: string, amount: number, sourceWalletId: string) => {
    const sourceWallet = wallets.find((w) => w.id === sourceWalletId);
    if (!sourceWallet) return;
    if (sourceWallet.balance < amount) {
      showToast('Saldo dompet tidak mencukupi untuk setor tabungan.', 'error');
      return;
    }

    const targetGoal = savingsGoals.find((g) => g.id === goalId);
    const tempTxId = 'tx_goal_' + Date.now();

    // 1. Pembaruan instan pada antarmuka (optimistic update)
    setWallets((prev) =>
      prev.map((w) => (w.id === sourceWalletId ? { ...w, balance: w.balance - amount } : w))
    );

    setSavingsGoals((prev) => {
      const updated = prev.map((g) => (g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g));
      if (typeof window !== 'undefined') {
        localStorage.setItem('finflo_savings_goals', JSON.stringify(updated));
      }
      return updated;
    });

    const newTx: Transaction = {
      id: tempTxId,
      amount,
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
      category: 'Tabungan & Investasi',
      description: `Setor tabungan: ${targetGoal?.title || 'Target Impian'}`,
      walletId: sourceWalletId,
    };
    setTransactions((prev) => [newTx, ...prev]);

    setDepositGoalTarget(null);
    showToast('Setoran tabungan berhasil dialokasikan!', 'success');

    // 2. Sinkronisasi transaksi, saldo dompet, dan target tabungan ke database
    try {
      const result = await apiDepositSavingsGoal(
        goalId,
        amount,
        sourceWalletId,
        user?.email || defaultUser.email
      );

      if (result) {
        if (result.transaction) {
          setTransactions((prev) =>
            prev.map((t) => (t.id === tempTxId ? result.transaction : t))
          );
        }
        if (result.wallet) {
          setWallets((prev) =>
            prev.map((w) => (w.id === sourceWalletId ? result.wallet : w))
          );
        }
        if (result.goal) {
          setSavingsGoals((prev) =>
            prev.map((g) => (g.id === goalId ? result.goal : g))
          );
        }
      }
    } catch (e) {
      console.error('Gagal mencatat transaksi setoran ke database:', e);
    }
  };

  const handleResetData = () => {
    setConfirmDialog({
      isOpen: true,
      title: 'Kembalikan ke Data Demo Awal?',
      message: 'Seluruh transaksi dan dompet akan direset ke konfigurasi awal Budi Pratama.',
      isDanger: true,
      onConfirm: () => {
        setUser(defaultUser);
        setWallets(defaultWallets);
        setExpenseCategories(defaultExpenseCategories);
        setTransactions(defaultTransactions);
        setDebts(defaultDebts);
        setSavingsGoals(defaultSavingsGoals);
        if (typeof window !== 'undefined') {
          localStorage.setItem('finflo_savings_goals', JSON.stringify(defaultSavingsGoals));
        }
        showToast('Data demo berhasil direset.', 'info');
      },
    });
  };

  const handleRestoreData = (backup: any) => {
    if (backup.user) setUser(backup.user);
    if (backup.wallets) setWallets(backup.wallets);
    if (backup.expenseCategories) setExpenseCategories(backup.expenseCategories);
    if (backup.transactions) setTransactions(backup.transactions);
    if (backup.debts) setDebts(backup.debts);
    if (backup.savingsGoals) {
      setSavingsGoals(backup.savingsGoals);
      if (typeof window !== 'undefined') {
        localStorage.setItem('finflo_savings_goals', JSON.stringify(backup.savingsGoals));
      }
    }
    showToast('Data berhasil dipulihkan dari cadangan JSON.', 'success');
  };

  const handleSyncDatabase = async () => {
    return await apiSyncDatabase({
      user,
      wallets,
      expenseCategories,
      incomeCategories: defaultIncomeCategories,
      transactions,
      debts,
      savingsGoals,
    });
  };

  if (!hasMounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 text-white">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
          <span className="text-sm font-semibold tracking-wide">Memuat FinFlo...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  const currentTotalBudgetPercentage = expenseCategories.reduce(
    (acc, c) => acc + (c.budgetPercentage || 0),
    0
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors">
      <Sidebar
        user={user}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if ((tab === 'debts' || tab === 'recommendations') && user.plan !== 'pro') {
            triggerFreeTierLimit(
              `Fitur ${tab === 'debts' ? 'Hutang & Paylater' : 'Rekomendasi Finansial'} Khusus Pro`,
              `Tingkatkan ke FinFlo Pro untuk membuka akses ${tab === 'debts' ? 'pelacakan hutang terpadu' : 'audit kesehatan finansial dan anggaran kategori'}.`
            );
          }
          setActiveTab(tab);
        }}
        onOpenUpgrade={() =>
          triggerFreeTierLimit(
            'Upgrade ke FinFlo Pro',
            'Buka akses tak terbatas untuk dompet, kategori kustom, pelacakan hutang, dan audit kesehatan finansial 50/30/20.'
          )
        }
      />

      <div className="flex flex-col md:pl-64 min-h-screen pb-24 md:pb-10">
        <Header
          user={user}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
          onLogout={handleLogout}
          onOpenUpgrade={() =>
            triggerFreeTierLimit(
              'Upgrade ke FinFlo Pro',
              'Buka seluruh batasan Free Tier dengan satu kali pembayaran tanpa langganan.'
            )
          }
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeTab === 'dashboard' && (
            <DashboardTab
              user={user}
              wallets={wallets}
              expenseCategories={expenseCategories}
              transactions={transactions}
              onOpenAddTransaction={() => {
                setEditingTransaction(null);
                setIsAddTransactionOpen(true);
              }}
              onOpenAddWallet={() => setIsAddWalletOpen(true)}
              onOpenAddCategory={() => setIsAddCategoryOpen(true)}
              onOpenUpgrade={() =>
                triggerFreeTierLimit(
                  'Upgrade ke FinFlo Pro',
                  'Dapatkan akses penuh ke fitur eksklusif FinFlo Pro.'
                )
              }
              onTabChange={setActiveTab}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsTab
              transactions={transactions}
              wallets={wallets}
              expenseCategories={expenseCategories}
              onOpenAddTransaction={() => {
                setEditingTransaction(null);
                setIsAddTransactionOpen(true);
              }}
              onEditTransaction={(tx) => {
                setEditingTransaction(tx);
                setIsAddTransactionOpen(true);
              }}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'debts' && (
            <DebtsTab
              user={user}
              debts={debts}
              wallets={wallets}
              onOpenAddDebt={() => setIsAddDebtOpen(true)}
              onOpenPayDebt={(debt) => setPayingDebt(debt)}
              onDeleteDebt={handleDeleteDebt}
              onOpenUpgrade={() =>
                triggerFreeTierLimit(
                  'Buka Fitur Lacak Hutang & Paylater',
                  'Fitur ini khusus pengguna FinFlo Pro untuk mengelola cicilan dan pengingat jatuh tempo.'
                )
              }
            />
          )}

          {activeTab === 'wallets' && (
            <WalletsTab
              user={user}
              wallets={wallets}
              expenseCategories={expenseCategories}
              savingsGoals={savingsGoals}
              onOpenAddWallet={() => setIsAddWalletOpen(true)}
              onOpenAddCategory={() => {
                setEditingCategory(null);
                setIsAddCategoryOpen(true);
              }}
              onOpenAddGoal={() => setIsAddGoalOpen(true)}
              onOpenDepositGoal={(goal) => setDepositGoalTarget(goal)}
              onDeleteGoal={handleDeleteGoal}
              onEditCategory={(cat) => {
                setEditingCategory(cat);
                setIsAddCategoryOpen(true);
              }}
              onApply6Pillars={handleApply6Pillars}
              onDeleteWallet={handleDeleteWallet}
              onDeleteCategory={handleDeleteCategory}
              onOpenUpgrade={() =>
                triggerFreeTierLimit(
                  'Upgrade Kuota Dompet & Kategori',
                  'Nikmati kebebasan mengelola puluhan rekening bank, e-wallet, dan pos budgeting tanpa batas.'
                )
              }
            />
          )}

          {activeTab === 'recommendations' && (
            <RecommendationsTab
              user={user}
              transactions={transactions}
              wallets={wallets}
              debts={debts}
              expenseCategories={expenseCategories}
              onTabChange={setActiveTab}
              onOpenUpgrade={() =>
                triggerFreeTierLimit(
                  'Buka Rekomendasi Finansial & Audit Anggaran',
                  'Dapatkan analisa mendalam kesehatan finansial, simulasi target impian, dan cetak PDF.'
                )
              }
            />
          )}

          {activeTab === 'profile' && (
            <ProfileTab
              user={user}
              wallets={wallets}
              expenseCategories={expenseCategories}
              transactions={transactions}
              debts={debts}
              savingsGoals={savingsGoals}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              onOpenUpgrade={() =>
                triggerFreeTierLimit(
                  'Upgrade Akun ke FinFlo Pro',
                  'Bebaskan seluruh fitur finansial canggih dengan harga promo spesial.'
                )
              }
              onLogout={handleLogout}
              onResetData={handleResetData}
              onRestoreData={handleRestoreData}
              onSyncDatabase={handleSyncDatabase}
            />
          )}
        </main>

        <FloatingActionButton
          onClick={() => {
            setEditingTransaction(null);
            setIsAddTransactionOpen(true);
          }}
        />

        <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      <AddTransactionModal
        isOpen={isAddTransactionOpen}
        onClose={() => {
          setIsAddTransactionOpen(false);
          setEditingTransaction(null);
        }}
        wallets={wallets}
        expenseCategories={expenseCategories}
        incomeCategories={defaultIncomeCategories}
        onSaveTransaction={handleSaveTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        editingTransaction={editingTransaction}
      />

      <AddWalletModal
        isOpen={isAddWalletOpen}
        onClose={() => setIsAddWalletOpen(false)}
        onAddWallet={handleAddWallet}
        existingWalletsCount={wallets.length}
        isPro={user.plan === 'pro'}
        onReachLimit={() =>
          triggerFreeTierLimit(
            'Batas 3 Dompet Tercapai',
            'Pengguna Free Tier dibatasi maksimal 3 dompet aktif. Upgrade ke Pro untuk dompet tanpa batas.'
          )
        }
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => {
          setIsAddCategoryOpen(false);
          setEditingCategory(null);
        }}
        onSaveCategory={handleSaveCategory}
        editingCategory={editingCategory}
        existingCategoriesCount={expenseCategories.length}
        currentTotalBudgetPercentage={currentTotalBudgetPercentage}
        isPro={user.plan === 'pro'}
        onReachLimit={() =>
          triggerFreeTierLimit(
            'Batas 8 Kategori Tercapai',
            'Pengguna Free Tier dapat menggunakan hingga 8 kategori (termasuk 6 pilar rekomendasi). Upgrade ke Pro untuk kategori tanpa batas.'
          )
        }
      />

      <AddDebtModal
        isOpen={isAddDebtOpen}
        onClose={() => setIsAddDebtOpen(false)}
        onAddDebt={handleAddDebt}
      />

      <PayDebtModal
        isOpen={!!payingDebt}
        onClose={() => setPayingDebt(null)}
        debt={payingDebt}
        wallets={wallets}
        onConfirmPayment={handleConfirmPayDebt}
      />

      <AddSavingsGoalModal
        isOpen={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAddGoal={handleAddGoal}
      />

      <DepositGoalModal
        isOpen={!!depositGoalTarget}
        onClose={() => setDepositGoalTarget(null)}
        goal={depositGoalTarget}
        wallets={wallets}
        onDeposit={handleDepositGoal}
      />

      <FreeTierModal
        isOpen={isFreeTierModalOpen}
        onClose={() => setIsFreeTierModalOpen(false)}
        onUpgradePro={handleUpgradePro}
        userEmail={user?.email}
        featureTitle={freeTierModalContent.title}
        featureDescription={freeTierModalContent.description}
      />

      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        isDanger={confirmDialog.isDanger}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog((prev) => ({ ...prev, isOpen: false }))}
      />

      <div className="fixed bottom-24 left-4 z-50 flex flex-col gap-2 pointer-events-none md:bottom-6 md:left-6">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-bold text-white shadow-xl backdrop-blur-md animate-toastSlideIn ${
              toast.type === 'error'
                ? 'bg-rose-600/95 shadow-rose-600/30'
                : toast.type === 'info'
                ? 'bg-slate-800/95 shadow-slate-900/30'
                : 'bg-emerald-600/95 shadow-emerald-600/30'
            }`}
          >
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
