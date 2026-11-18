import { User, Wallet, ExpenseCategory, IncomeCategory, Transaction, Debt, SavingsGoal } from './types';

export const defaultUser: User = {
  id: 'usr-budi-01',
  name: 'Budi Pratama',
  email: 'budi.pratama@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  plan: 'free',
  tier: 'free',
  memberSince: 'Januari 2026',
};

export const defaultWallets: Wallet[] = [
  {
    id: 'wallet-1',
    name: 'Cash / Tunai',
    type: 'cash',
    balance: 1250000,
    color: 'emerald',
    icon: 'banknote',
  },
  {
    id: 'wallet-2',
    name: 'BCA Utama',
    type: 'bank',
    balance: 12500000,
    color: 'sky',
    icon: 'building-2',
  },
  {
    id: 'wallet-3',
    name: 'GoPay',
    type: 'ewallet',
    balance: 1500000,
    color: 'violet',
    icon: 'smartphone',
  },
];

export const defaultExpenseCategories: ExpenseCategory[] = [
  {
    id: 'cat-kos',
    name: 'Kos / Tempat Tinggal',
    icon: 'home',
    color: '#6366f1',
    budgetPercentage: 28,
    percentage: 28,
  },
  {
    id: 'cat-makan',
    name: 'Makan & Minum',
    icon: 'utensils',
    color: '#f59e0b',
    budgetPercentage: 30,
    percentage: 30,
  },
  {
    id: 'cat-transport',
    name: 'Transportasi',
    icon: 'car',
    color: '#0ea5e9',
    budgetPercentage: 12,
    percentage: 12,
  },
  {
    id: 'cat-pulsa',
    name: 'Pulsa & Paket Data',
    icon: 'wifi',
    color: '#8b5cf6',
    budgetPercentage: 5,
    percentage: 5,
  },
  {
    id: 'cat-investasi',
    name: 'Nabung & Investasi',
    icon: 'trending-up',
    color: '#10b981',
    budgetPercentage: 20,
    percentage: 20,
  },
  {
    id: 'cat-hiburan',
    name: 'Liburan, Nongkrong & Jajan',
    icon: 'coffee',
    color: '#ec4899',
    budgetPercentage: 5,
    percentage: 5,
  },
];

export const defaultIncomeCategories: IncomeCategory[] = [
  { id: 'cat-gaji', name: 'Gaji Pokok', icon: 'briefcase', color: '#10b981' },
  { id: 'cat-bonus', name: 'Bonus & THR', icon: 'gift', color: '#06b6d4' },
  { id: 'cat-investasi', name: 'Investasi & Dividen', icon: 'trending-up', color: '#8b5cf6' },
  { id: 'cat-freelance', name: 'Freelance & Sampingan', icon: 'laptop', color: '#3b82f6' },
];

export const defaultTransactions: Transaction[] = [
  {
    id: 'trx-1',
    amount: 9800000,
    type: 'income',
    date: '2026-11-01',
    walletId: 'wallet-2',
    category: 'Gaji Pokok',
    categoryName: 'Gaji Pokok',
    categoryId: 'cat-gaji',
    description: 'Gaji Bulanan PT Digital Flow',
    notes: 'Transfer Payroll BCA',
  },
  {
    id: 'trx-2',
    amount: 1550000,
    type: 'expense',
    date: '2026-11-03',
    walletId: 'wallet-2',
    category: 'Belanja',
    categoryName: 'Belanja',
    categoryId: 'cat-belanja',
    description: 'Belanja Bulanan Supermarket',
    notes: 'Kebutuhan dapur & rumah tangga',
  },
  {
    id: 'trx-3',
    amount: 1500000,
    type: 'transfer',
    date: '2026-11-04',
    walletId: 'wallet-2',
    toWalletId: 'wallet-3',
    targetWalletId: 'wallet-3',
    category: 'Transfer',
    description: 'GoPay Topup dari BCA',
    notes: 'Saldo operasional harian',
  },
  {
    id: 'trx-4',
    amount: 850000,
    type: 'expense',
    date: '2026-11-05',
    walletId: 'wallet-3',
    category: 'Tagihan & Utilitas',
    categoryName: 'Tagihan & Utilitas',
    categoryId: 'cat-tagihan',
    description: 'Tagihan Listrik & WiFi',
    notes: 'Token PLN & Indihome',
  },
  {
    id: 'trx-5',
    amount: 650000,
    type: 'expense',
    date: '2026-11-07',
    walletId: 'wallet-1',
    category: 'Makanan & Minuman',
    categoryName: 'Makanan & Minuman',
    categoryId: 'cat-makanan',
    description: 'Makan Siang & Kopi Mingguan',
    notes: 'Kuliner kantor & cafe',
  },
  {
    id: 'trx-6',
    amount: 450000,
    type: 'expense',
    date: '2026-11-09',
    walletId: 'wallet-3',
    category: 'Transportasi',
    categoryName: 'Transportasi',
    categoryId: 'cat-transport',
    description: 'Bensin & GoRide Mingguan',
    notes: 'Mobilitas kantor',
  },
];

export const defaultDebts: Debt[] = [
  {
    id: 'debt-1',
    type: 'paylater',
    title: 'SPayLater Belanja Gadget',
    platform: 'Shopee PayLater',
    counterparty: 'Shopee PayLater',
    totalAmount: 1850000,
    remainingAmount: 1250000,
    paidAmount: 600000,
    minimumPayment: 625000,
    dueDate: '2026-11-15',
    status: 'active',
    notes: 'Cicilan 3 bulan sisa 2x',
  },
  {
    id: 'debt-2',
    type: 'paylater',
    title: 'Kredivo Elektronik',
    platform: 'Kredivo',
    counterparty: 'Kredivo',
    totalAmount: 2400000,
    remainingAmount: 1600000,
    paidAmount: 800000,
    minimumPayment: 800000,
    dueDate: '2026-11-20',
    status: 'active',
    notes: 'Cicilan monitor kerja',
  },
  {
    id: 'debt-3',
    type: 'piutang',
    title: 'Pinjaman Talangan Teman',
    platform: 'Pribadi (Rian)',
    counterparty: 'Rian Rekan Kantor',
    totalAmount: 1000000,
    remainingAmount: 1000000,
    paidAmount: 0,
    dueDate: '2026-11-28',
    status: 'active',
    notes: 'Talangan servis laptop',
  },
];

export const defaultSavingsGoals: SavingsGoal[] = [
  {
    id: 'goal-1',
    title: 'Dana Darurat 6 Bulan',
    targetAmount: 25000000,
    currentAmount: 10000000,
    targetDate: '2027-06-30',
    category: 'Dana Darurat',
    color: '#10b981',
  },
  {
    id: 'goal-2',
    title: 'Investasi Saham & Reksadana',
    targetAmount: 15000000,
    currentAmount: 6500000,
    targetDate: '2027-12-31',
    category: 'Investasi',
    color: '#0ea5e9',
  },
  {
    id: 'goal-3',
    title: 'Liburan Akhir Tahun',
    targetAmount: 5000000,
    currentAmount: 2000000,
    targetDate: '2026-12-20',
    category: 'Liburan',
    color: '#f59e0b',
  },
];

// Uppercase aliases for compatibility
export const DEFAULT_USER = defaultUser;
export const DEFAULT_WALLETS = defaultWallets;
export const DEFAULT_EXPENSE_CATEGORIES = defaultExpenseCategories;
export const DEFAULT_INCOME_CATEGORIES = defaultIncomeCategories;
export const DEFAULT_TRANSACTIONS = defaultTransactions;
export const DEFAULT_DEBTS = defaultDebts;
export const DEFAULT_SAVINGS_GOALS = defaultSavingsGoals;
