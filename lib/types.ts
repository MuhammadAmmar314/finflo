export type UserTier = 'free' | 'pro';
export type TabType = 'dashboard' | 'transactions' | 'debts' | 'wallets' | 'recommendations' | 'profile';

export interface User {
  id?: string;
  name: string;
  email: string;
  avatar?: string;
  plan: UserTier;
  tier?: UserTier;
  memberSince?: string;
  emailVerified?: string | Date | null;
}

export type WalletType = 'cash' | 'bank' | 'ewallet' | 'investment' | 'savings';

export interface Wallet {
  id: string;
  name: string;
  type: WalletType;
  balance: number;
  color: string;
  icon?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  category?: string;
  color?: string;
  icon?: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  icon?: string;
  color: string;
  budgetPercentage: number;
  percentage?: number;
  budget?: number;
}

export interface IncomeCategory {
  id: string;
  name: string;
  icon?: string;
  color: string;
}

export type TransactionType = 'expense' | 'income' | 'transfer';

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  date: string;
  walletId: string;
  toWalletId?: string;
  targetWalletId?: string;
  savingsGoalId?: string;
  category: string;
  categoryName?: string;
  categoryId?: string;
  description?: string;
  notes?: string;
  fee?: number;
  discount?: number;
}

export type DebtType = 'paylater' | 'hutang' | 'piutang';
export type DebtStatus = 'active' | 'unpaid' | 'partial' | 'paid';

export interface Debt {
  id: string;
  type: DebtType;
  title: string;
  platform: string;
  counterparty?: string;
  totalAmount: number;
  remainingAmount: number;
  paidAmount?: number;
  minimumPayment?: number;
  dueDate: string;
  status: DebtStatus;
  notes?: string;
  createdAt?: string;
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}
