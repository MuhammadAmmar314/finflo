/**
 * FinFlo - Default Mock Data
 * Presets matching the user's mockup interface
 */

const DEFAULT_USER = {
  id: 'usr-budi-01',
  name: 'Budi Pratama',
  email: 'budi.pratama@gmail.com',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  tier: 'free', // 'free' | 'pro'
  memberSince: 'Januari 2026',
  quota: {
    maxWallets: 3,
    maxExpenseCategories: 5
  }
};

const DEFAULT_WALLETS = [
  {
    id: 'wallet-1',
    name: 'Cash / Tunai',
    type: 'cash',
    balance: 1250000,
    color: 'emerald',
    icon: 'banknote',
    accountNumber: '-'
  },
  {
    id: 'wallet-2',
    name: 'BCA Utama',
    type: 'bank',
    balance: 12500000,
    color: 'blue',
    icon: 'building-2',
    accountNumber: '•••• 8829'
  },
  {
    id: 'wallet-3',
    name: 'GoPay',
    type: 'ewallet',
    balance: 1500000,
    color: 'sky',
    icon: 'smartphone',
    accountNumber: '0812 •••• 992'
  }
];

// Free Tier: strictly 5 expense categories with budgeting percentages
const DEFAULT_EXPENSE_CATEGORIES = [
  { id: 'cat-makanan', name: 'Makanan & Minuman', icon: 'utensils', color: '#f97316', budget: 1500000, percentage: 25 },
  { id: 'cat-transport', name: 'Transportasi', icon: 'car', color: '#0284c7', budget: 1000000, percentage: 15 },
  { id: 'cat-tagihan', name: 'Tagihan & Utilitas', icon: 'zap', color: '#eab308', budget: 1200000, percentage: 15 },
  { id: 'cat-belanja', name: 'Belanja', icon: 'shopping-bag', color: '#ec4899', budget: 2500000, percentage: 25 },
  { id: 'cat-hiburan', name: 'Hiburan', icon: 'film', color: '#8b5cf6', budget: 500000, percentage: 10 }
];

const DEFAULT_INCOME_CATEGORIES = [
  { id: 'cat-gaji', name: 'Gaji Pokok', icon: 'briefcase', color: '#10b981' },
  { id: 'cat-bonus', name: 'Bonus & THR', icon: 'gift', color: '#06b6d4' },
  { id: 'cat-freelance', name: 'Side Project', icon: 'laptop', color: '#6366f1' },
  { id: 'cat-investasi', name: 'Investasi & Bunga', icon: 'trending-up', color: '#14b8a6' }
];

// Today reference date in ISO
function getSampleDate(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const DEFAULT_TRANSACTIONS = [
  {
    id: 'trx-1',
    title: 'Gaji Bulanan',
    type: 'income',
    amount: 9800000,
    walletId: 'wallet-2',
    walletName: 'BCA Utama',
    categoryId: 'cat-gaji',
    categoryName: 'Gaji Pokok',
    date: getSampleDate(1),
    notes: 'Transfer payroll bulanan perusahaan'
  },
  {
    id: 'trx-2',
    title: 'Belanja Bulanan Supermarket',
    type: 'expense',
    amount: 1550000,
    walletId: 'wallet-2',
    walletName: 'BCA Utama',
    categoryId: 'cat-belanja',
    categoryName: 'Belanja',
    date: getSampleDate(3),
    notes: 'Bahan makanan dan perlengkapan rumah'
  },
  {
    id: 'trx-3',
    title: 'Top Up GoPay',
    type: 'transfer',
    amount: 500000,
    walletId: 'wallet-2',
    walletName: 'BCA Utama',
    toWalletId: 'wallet-3',
    toWalletName: 'GoPay',
    categoryId: 'transfer',
    categoryName: 'Transfer Antar Dompet',
    date: getSampleDate(5),
    notes: 'Top up saldo transportasi & makanan mingguan'
  },
  {
    id: 'trx-4',
    title: 'Tagihan Listrik & Internet WiFi',
    type: 'expense',
    amount: 850000,
    walletId: 'wallet-2',
    walletName: 'BCA Utama',
    categoryId: 'cat-tagihan',
    categoryName: 'Tagihan & Utilitas',
    date: getSampleDate(7),
    notes: 'PLN Pascabayar & Indihome'
  },
  {
    id: 'trx-5',
    title: 'Makan Malam Bersama Keluarga',
    type: 'expense',
    amount: 450000,
    walletId: 'wallet-1',
    walletName: 'Cash / Tunai',
    categoryId: 'cat-makanan',
    categoryName: 'Makanan & Minuman',
    date: getSampleDate(9),
    notes: 'Restoran Sunda akhir pekan'
  },
  {
    id: 'trx-6',
    title: 'Bensin Mobil & Biaya Tol',
    type: 'expense',
    amount: 350000,
    walletId: 'wallet-3',
    walletName: 'GoPay',
    categoryId: 'cat-transport',
    categoryName: 'Transportasi',
    date: getSampleDate(11),
    notes: 'Pertamax & e-Toll GoPay'
  },
  {
    id: 'trx-7',
    title: 'Langganan Netflix & Spotify',
    type: 'expense',
    amount: 185000,
    walletId: 'wallet-2',
    walletName: 'BCA Utama',
    categoryId: 'cat-hiburan',
    categoryName: 'Hiburan',
    date: getSampleDate(12),
    notes: 'Subscription hiburan bulanan'
  },
  {
    id: 'trx-8',
    title: 'Pakaian & Sepatu Kerja',
    type: 'expense',
    amount: 665000,
    walletId: 'wallet-2',
    walletName: 'BCA Utama',
    categoryId: 'cat-belanja',
    categoryName: 'Belanja',
    date: getSampleDate(14),
    notes: 'Promo diskon e-commerce'
  },
  {
    id: 'trx-9',
    title: 'Ngopi & Snack Kantor',
    type: 'expense',
    amount: 150000,
    walletId: 'wallet-3',
    walletName: 'GoPay',
    categoryId: 'cat-makanan',
    categoryName: 'Makanan & Minuman',
    date: getSampleDate(16),
    notes: 'Kopi Kenangan 3 hari'
  },
  {
    id: 'trx-10',
    title: 'Ojol & Transportasi Kantor',
    type: 'expense',
    amount: 350000,
    walletId: 'wallet-3',
    walletName: 'GoPay',
    categoryId: 'cat-transport',
    categoryName: 'Transportasi',
    date: getSampleDate(18),
    notes: 'Transportasi komuter'
  }
];

function getFutureSampleDate(daysAhead = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysAhead);
  return d.toISOString().split('T')[0];
}

const DEFAULT_DEBTS = [
  {
    id: 'debt-1',
    type: 'paylater',
    title: 'Shopee PayLater - Headset Bluetooth',
    counterparty: 'SPayLater',
    totalAmount: 650000,
    paidAmount: 250000,
    dueDate: getFutureSampleDate(5),
    status: 'partial',
    notes: 'Cicilan bulan ini'
  },
  {
    id: 'debt-2',
    type: 'paylater',
    title: 'GoPay Later - Belanja Bulanan',
    counterparty: 'GoPay Later',
    totalAmount: 320000,
    paidAmount: 0,
    dueDate: getFutureSampleDate(12),
    status: 'unpaid',
    notes: 'Tagihan akhir bulan'
  },
  {
    id: 'debt-3',
    type: 'piutang',
    title: 'Talangan Tiket Konser Dimas',
    counterparty: 'Dimas Setiawan',
    totalAmount: 500000,
    paidAmount: 200000,
    dueDate: getFutureSampleDate(7),
    status: 'partial',
    notes: 'Dimas janji bayar pas tanggal gajian'
  },
  {
    id: 'debt-4',
    type: 'hutang',
    title: 'Pinjaman Renovasi Rumah',
    counterparty: 'Keluarga / Kerabat',
    totalAmount: 4000000,
    paidAmount: 2500000,
    dueDate: getFutureSampleDate(25),
    status: 'partial',
    notes: 'Pelunasan bertahap tanpa bunga'
  },
  {
    id: 'debt-5',
    type: 'piutang',
    title: 'Pinjaman Rian (Makan Siang)',
    counterparty: 'Rian Pratama',
    totalAmount: 75000,
    paidAmount: 75000,
    dueDate: getSampleDate(3),
    status: 'paid',
    notes: 'Sudah lunas ditransfer via QRIS'
  }
];

