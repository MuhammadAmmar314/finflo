/**
 * FinFlo - Financial Planner Application Logic
 * Modern, Interactive Single Page Application (SPA)
 */

// Global State Object
const FinFloApp = {
  // State
  state: {
    auth: null,
    wallets: [],
    expenseCategories: [],
    incomeCategories: [],
    transactions: [],
    debts: [],
    currentTab: 'dashboard',
    darkMode: false,
    filters: {
      search: '',
      type: 'all',
      wallet: 'all',
      category: 'all',
      month: new Date().toISOString().slice(0, 7)
    },
    debtFilters: {
      search: '',
      type: 'all',
      status: 'all'
    },
    activePayDebtId: null,
    editingTransactionId: null
  },

  // Chart instances
  charts: {
    cashflow: null,
    category: null
  },

  // Limits for Free Tier
  LIMITS: {
    MAX_WALLETS: 3,
    MAX_EXPENSE_CATEGORIES: 5
  },

  // Initialize Application
  init() {
    this.loadState();
    this.initTheme();
    this.bindGlobalEvents();
    this.render();
  },

  // Load state from localStorage or mockData
  loadState() {
    try {
      const storedAuth = localStorage.getItem('finflo_auth');
      const storedWallets = localStorage.getItem('finflo_wallets');
      const storedExpCats = localStorage.getItem('finflo_expense_categories');
      const storedIncCats = localStorage.getItem('finflo_income_categories');
      const storedTrx = localStorage.getItem('finflo_transactions');
      const storedDebts = localStorage.getItem('finflo_debts');
      const storedTheme = localStorage.getItem('finflo_theme');

      this.state.auth = storedAuth ? JSON.parse(storedAuth) : null;
      this.state.wallets = storedWallets ? JSON.parse(storedWallets) : [...DEFAULT_WALLETS];
      this.state.expenseCategories = storedExpCats ? JSON.parse(storedExpCats) : [...DEFAULT_EXPENSE_CATEGORIES];
      this.state.incomeCategories = storedIncCats ? JSON.parse(storedIncCats) : [...DEFAULT_INCOME_CATEGORIES];
      this.state.transactions = storedTrx ? JSON.parse(storedTrx) : [...DEFAULT_TRANSACTIONS];
      this.state.debts = storedDebts ? JSON.parse(storedDebts) : (typeof DEFAULT_DEBTS !== 'undefined' ? [...DEFAULT_DEBTS] : []);
      this.state.darkMode = storedTheme === 'dark';
    } catch (e) {
      console.error('Error loading state from localStorage:', e);
      this.resetToDefaults(false);
    }
  },

  // Save current state to localStorage
  saveState() {
    try {
      if (this.state.auth) {
        localStorage.setItem('finflo_auth', JSON.stringify(this.state.auth));
      } else {
        localStorage.removeItem('finflo_auth');
      }
      localStorage.setItem('finflo_wallets', JSON.stringify(this.state.wallets));
      localStorage.setItem('finflo_expense_categories', JSON.stringify(this.state.expenseCategories));
      localStorage.setItem('finflo_income_categories', JSON.stringify(this.state.incomeCategories));
      localStorage.setItem('finflo_transactions', JSON.stringify(this.state.transactions));
      localStorage.setItem('finflo_debts', JSON.stringify(this.state.debts));
      localStorage.setItem('finflo_theme', this.state.darkMode ? 'dark' : 'light');
    } catch (e) {
      console.error('Error saving state:', e);
    }
  },

  // Reset all state to defaults
  resetToDefaults(notify = true) {
    this.state.wallets = JSON.parse(JSON.stringify(DEFAULT_WALLETS));
    this.state.expenseCategories = JSON.parse(JSON.stringify(DEFAULT_EXPENSE_CATEGORIES));
    this.state.incomeCategories = JSON.parse(JSON.stringify(DEFAULT_INCOME_CATEGORIES));
    this.state.transactions = JSON.parse(JSON.stringify(DEFAULT_TRANSACTIONS));
    this.state.debts = typeof DEFAULT_DEBTS !== 'undefined' ? JSON.parse(JSON.stringify(DEFAULT_DEBTS)) : [];
    this.saveState();
    if (notify) {
      this.showToast('Data berhasil direset ke data awal demo', 'info');
      this.render();
    }
  },

  // Theme Handling
  initTheme() {
    if (this.state.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },

  toggleTheme() {
    this.state.darkMode = !this.state.darkMode;
    this.initTheme();
    this.saveState();
    this.showToast(`Mode ${this.state.darkMode ? 'Gelap (Dark)' : 'Terang (Light)'} diaktifkan`, 'info');
    
    // Refresh charts to adjust colors
    if (this.state.currentTab === 'dashboard') {
      setTimeout(() => this.renderDashboardCharts(), 100);
    }
  },

  // Currency Formatter
  formatIDR(amount) {
    const num = Number(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(num);
  },

  // Format short number (e.g. 15.2M or 1.5jt)
  formatCompactIDR(amount) {
    const num = Number(amount) || 0;
    if (Math.abs(num) >= 1_000_000_000) {
      return (num / 1_000_000_000).toFixed(1) + ' M';
    }
    if (Math.abs(num) >= 1_000_000) {
      return (num / 1_000_000).toFixed(1) + ' jt';
    }
    if (Math.abs(num) >= 1_000) {
      return (num / 1_000).toFixed(0) + ' rb';
    }
    return String(num);
  },

  // Format date helper
  formatDate(dateString) {
    if (!dateString) return '-';
    try {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
      }
      return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return dateString;
    }
  },

  // Statistics Calculation
  calculateStats() {
    const totalSaldo = this.state.wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0);

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    let incomeBulanIni = 0;
    let expenseBulanIni = 0;

    this.state.transactions.forEach(t => {
      const tDate = new Date(t.date);
      // Check if within current month & year or simply compute based on loaded list
      if (t.type === 'income') {
        incomeBulanIni += Number(t.amount) || 0;
      } else if (t.type === 'expense') {
        expenseBulanIni += Number(t.amount) || 0;
      }
    });

    return {
      totalSaldo,
      incomeBulanIni,
      expenseBulanIni,
      netSavings: incomeBulanIni - expenseBulanIni
    };
  },

  // Main Render Routing
  render() {
    const loginView = document.getElementById('view-login');
    const appView = document.getElementById('view-app');

    if (!this.state.auth) {
      // User is not logged in: Show Login Screen
      if (loginView) {
        loginView.classList.remove('hidden');
        loginView.classList.add('flex');
        loginView.style.display = 'flex';
      }
      if (appView) {
        appView.classList.add('hidden');
        appView.classList.remove('flex');
        appView.style.display = 'none';
      }
      this.renderLoginPage();
    } else {
      // User is logged in: Show Dashboard SPA
      if (loginView) {
        loginView.classList.add('hidden');
        loginView.classList.remove('flex');
        loginView.style.display = 'none';
      }
      if (appView) {
        appView.classList.remove('hidden');
        appView.classList.add('flex');
        appView.style.display = 'flex';
      }
      this.renderAppHeader();
      this.renderNavigation();
      this.renderCurrentTab();
    }

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  // ==========================================
  // AUTHENTICATION & LOGIN FLOW
  // ==========================================
  renderLoginPage() {
    // Ensure form handler is bound
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.onsubmit = (e) => this.handleEmailLogin(e);
    }
  },

  handleEmailLogin(e) {
    if (e) e.preventDefault();
    const emailInput = document.getElementById('login-email');
    const passInput = document.getElementById('login-password');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passInput ? passInput.value : '';

    if (!email) {
      this.showToast('Silakan masukkan email Anda', 'error');
      return;
    }

    if (!password) {
      this.showToast('Silakan masukkan kata sandi', 'error');
      return;
    }

    // Default Budi Pratama
    if (email.toLowerCase() === 'budi.pratama@gmail.com') {
      this.login(DEFAULT_USER);
    } else {
      const namePart = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      this.login({
        id: 'usr-' + Date.now(),
        name: namePart || 'Pengguna FinFlo',
        email: email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(namePart || 'User')}&background=0284c7&color=fff&bold=true`,
        tier: 'free',
        memberSince: 'Maret 2026'
      });
    }
  },

  quickDemoLogin() {
    this.login(DEFAULT_USER);
  },

  openGoogleModal() {
    const modal = document.getElementById('modal-google-auth');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
      if (window.lucide) lucide.createIcons();
    }
  },

  closeGoogleModal() {
    const modal = document.getElementById('modal-google-auth');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  selectGoogleAccount(accountType) {
    this.closeGoogleModal();
    if (accountType === 'budi') {
      this.login(DEFAULT_USER);
    } else if (accountType === 'siti') {
      this.login({
        id: 'usr-siti-02',
        name: 'Siti Rahmawati',
        email: 'siti.rahmawati@gmail.com',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        tier: 'free',
        memberSince: 'Februari 2026'
      });
    }
  },

  toggleGoogleCustomInput() {
    const wrapper = document.getElementById('google-custom-form-wrapper');
    if (wrapper) {
      wrapper.classList.toggle('hidden');
      if (!wrapper.classList.contains('hidden')) {
        const nameInput = document.getElementById('google-custom-name');
        if (nameInput) nameInput.focus();
      }
    }
  },

  submitGoogleCustomAccount() {
    const nameInput = document.getElementById('google-custom-name');
    const emailInput = document.getElementById('google-custom-email');
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';

    if (!name) {
      this.showToast('Masukkan nama akun Google Anda', 'error');
      return;
    }
    const cleanEmail = email || (name.toLowerCase().replace(/\s+/g, '.') + '@gmail.com');

    this.closeGoogleModal();
    this.login({
      id: 'usr-google-' + Date.now(),
      name: name,
      email: cleanEmail,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=ea4335&color=fff&bold=true`,
      tier: 'free',
      memberSince: 'Hari ini'
    });
  },

  login(userObj) {
    if (!userObj) return;
    this.state.auth = {
      id: userObj.id || ('usr-' + Date.now()),
      name: userObj.name || 'Pengguna FinFlo',
      email: userObj.email || 'user@finflo.app',
      avatar: userObj.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userObj.name || 'User')}&background=0284c7&color=fff&bold=true`,
      tier: userObj.tier || 'free',
      memberSince: userObj.memberSince || 'Januari 2026'
    };
    this.saveState();
    
    // Confetti celebration
    if (window.confetti) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }

    this.showToast(`Selamat datang, ${this.state.auth.name}!`, 'success');
    this.render();
  },

  logout() {
    this.openConfirmModal({
      title: 'Konfirmasi Keluar',
      message: 'Apakah Anda yakin ingin keluar dari sesi FinFlo saat ini?',
      confirmText: 'Ya, Keluar',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: () => {
        this.state.auth = null;
        localStorage.removeItem('finflo_auth');
        this.saveState();
        this.showToast('Anda telah berhasil keluar dari sesi FinFlo.', 'info');
        this.render();
      }
    });
  },

  // ==========================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================
  switchTab(tabId) {
    this.state.currentTab = tabId;
    this.renderNavigation();
    this.renderCurrentTab();
    
    // Auto scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (window.lucide) {
      lucide.createIcons();
    }
  },

  renderAppHeader() {
    const user = this.state.auth || DEFAULT_USER;
    
    // Update user name in header and greetings
    const headerGreeting = document.getElementById('header-greeting');
    if (headerGreeting) {
      headerGreeting.textContent = `Welcome, ${user.name.split(' ')[0]}!`;
    }

    const headerUserAvatar = document.getElementById('header-user-avatar');
    if (headerUserAvatar) {
      headerUserAvatar.src = user.avatar;
      headerUserAvatar.alt = user.name;
    }

    const headerUserName = document.getElementById('header-user-name');
    if (headerUserName) {
      headerUserName.textContent = user.name;
    }

    const headerUserEmail = document.getElementById('header-user-email');
    if (headerUserEmail) {
      headerUserEmail.textContent = user.email;
    }

    // Free tier pill status
    const tierPill = document.getElementById('header-tier-pill');
    if (tierPill) {
      if (user.tier === 'pro') {
        tierPill.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm';
        tierPill.innerHTML = '<i data-lucide="crown" class="w-3 h-3 mr-1"></i> Pro Plan';
      } else {
        tierPill.className = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 cursor-pointer hover:bg-emerald-100 transition-colors';
        tierPill.innerHTML = '<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span> Free Tier';
        tierPill.onclick = () => this.openFreeTierModal('quota');
      }
    }
  },

  renderNavigation() {
    const tabs = ['dashboard', 'transactions', 'debts', 'recommendations', 'wallets', 'profile'];
    tabs.forEach(tab => {
      // Sidebar desktop buttons
      const navBtn = document.getElementById(`nav-btn-${tab}`);
      if (navBtn) {
        const isProTab = tab === 'debts' || tab === 'recommendations';
        const baseClass = isProTab ? 'flex items-center justify-between w-full px-4 py-3 text-sm rounded-xl transition-all' : 'flex items-center w-full px-4 py-3 text-sm rounded-xl transition-all';
        if (this.state.currentTab === tab) {
          navBtn.className = `${baseClass} font-semibold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/40 shadow-xs border border-sky-100 dark:border-sky-900/50`;
        } else {
          navBtn.className = `${baseClass} font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50`;
        }
      }

      // Mobile bottom nav buttons
      const mobBtn = document.getElementById(`mob-nav-${tab}`);
      if (mobBtn) {
        if (this.state.currentTab === tab) {
          mobBtn.className = 'flex flex-col items-center justify-center py-2 text-sky-600 dark:text-sky-400 font-semibold';
        } else {
          mobBtn.className = 'flex flex-col items-center justify-center py-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200';
        }
      }

      // Tab page contents
      const pageEl = document.getElementById(`tab-content-${tab}`);
      if (pageEl) {
        if (this.state.currentTab === tab) {
          pageEl.classList.remove('hidden');
          pageEl.classList.add('fade-in');
        } else {
          pageEl.classList.add('hidden');
          pageEl.classList.remove('fade-in');
        }
      }
    });
  },

  renderCurrentTab() {
    switch (this.state.currentTab) {
      case 'dashboard':
        this.renderDashboardTab();
        break;
      case 'transactions':
        this.renderTransactionsTab();
        break;
      case 'debts':
        this.renderDebtsTab();
        break;
      case 'recommendations':
        this.renderRecommendationsTab();
        break;
      case 'wallets':
        this.renderWalletsTab();
        break;
      case 'profile':
        this.renderProfileTab();
        break;
    }
  },

  // ==========================================
  // TAB 1: DASHBOARD (Matching User Mockup)
  // ==========================================
  renderDashboardTab() {
    const stats = this.calculateStats();

    // 1. Stats Cards
    const elTotalSaldo = document.getElementById('stat-total-saldo');
    const elPemasukan = document.getElementById('stat-pemasukan');
    const elPengeluaran = document.getElementById('stat-pengeluaran');

    if (elTotalSaldo) elTotalSaldo.textContent = this.formatIDR(stats.totalSaldo);
    if (elPemasukan) elPemasukan.textContent = this.formatIDR(stats.incomeBulanIni);
    if (elPengeluaran) elPengeluaran.textContent = this.formatIDR(stats.expenseBulanIni);

    // AI Advisor Spotlight Banner
    this.renderDashboardAdvisorBanner();

    // 2. Ringkasan Dompet Widget (Right Column)
    this.renderDashboardWalletsWidget();

    // 3. Kategori Terbatas Widget (Right Column)
    this.renderDashboardCategoriesWidget();

    // 4. Recent Transactions List
    this.renderDashboardRecentTransactions();

    // 5. Debt & Paylater Due Alert
    this.renderDashboardDebtAlert();

    // 6. Interactive Charts
    setTimeout(() => {
      this.renderDashboardCharts();
    }, 50);
  },

  renderDashboardAdvisorBanner() {
    const banner = document.getElementById('dash-advisor-banner');
    if (!banner) return;

    const isPro = this.state.auth && this.state.auth.tier === 'pro';

    if (!isPro) {
      banner.innerHTML = `
        <div class="flex items-center space-x-3.5 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center space-x-2">
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">FinFlo AI Financial Advisor (Fitur Pro Plan)</h4>
              <span class="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-gradient-to-r from-amber-500 to-orange-500 text-white shrink-0">PRO</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate sm:whitespace-normal">Audit formula 50/30/20, financial health score, dan deteksi kebocoran anggaran otomatis.</p>
          </div>
        </div>
        <button onclick="FinFloApp.switchTab('recommendations')" class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5">
          <span>Buka Rekomendasi Pro</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
        </button>
      `;
    } else {
      const health = this.calculateFinancialHealth();
      const statusColor = health.score >= 80 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300';
      const statusLabel = health.score >= 80 ? 'Prima & Sehat' : 'Perlu Dioptimalkan';

      banner.innerHTML = `
        <div class="flex items-center space-x-3.5 min-w-0">
          <div class="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
            <i data-lucide="sparkles" class="w-5 h-5"></i>
          </div>
          <div class="min-w-0">
            <div class="flex items-center space-x-2">
              <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">FinFlo AI Advisor: Skor Kesehatan Finansial ${health.score}/100</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor} shrink-0">
                ${statusLabel}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate sm:whitespace-normal">
              Surplus kas bulanan: <b>${this.formatIDR(health.surplus)}</b> (${health.savingsRate.toFixed(1)}%). <b>${health.recommendations.length} rekomendasi tindakan</b> siap Anda terapkan!
            </p>
          </div>
        </div>
        <button onclick="FinFloApp.switchTab('recommendations')" class="shrink-0 px-4 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition-all flex items-center space-x-1.5 shadow-xs">
          <span>Lihat Rekomendasi Lengkap</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 text-amber-500"></i>
        </button>
      `;
    }
    if (window.lucide) lucide.createIcons();
  },

  renderDashboardWalletsWidget() {
    const container = document.getElementById('dash-wallets-list');
    if (!container) return;

    const count = this.state.wallets.length;
    const max = this.LIMITS.MAX_WALLETS;

    let html = '';
    this.state.wallets.forEach(wallet => {
      const iconMap = {
        cash: 'banknote',
        bank: 'building-2',
        ewallet: 'smartphone'
      };
      const iconName = iconMap[wallet.type] || 'wallet';

      const colorMap = {
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400',
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400',
        sky: 'bg-sky-100 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400'
      };
      const badgeClass = colorMap[wallet.color] || colorMap.blue;

      html += `
        <div class="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors group">
          <div class="flex items-center space-x-3">
            <div class="w-9 h-9 rounded-lg flex items-center justify-center ${badgeClass}">
              <i data-lucide="${iconName}" class="w-4 h-4"></i>
            </div>
            <div>
              <p class="text-sm font-semibold text-slate-800 dark:text-slate-200">${wallet.name}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 capitalize">${wallet.type}</p>
            </div>
          </div>
          <div class="text-right">
            <p class="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono-num">${this.formatIDR(wallet.balance)}</p>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    // Update quota indicator
    const quotaLabel = document.getElementById('dash-wallet-quota-badge');
    if (quotaLabel) {
      quotaLabel.textContent = `max ${max}`;
    }
  },

  renderDashboardCategoriesWidget() {
    const container = document.getElementById('dash-categories-list');
    if (!container) return;

    const count = this.state.expenseCategories.length;
    const max = this.LIMITS.MAX_EXPENSE_CATEGORIES;

    // Calculate total spent per category
    const spendingMap = {};
    this.state.transactions.filter(t => t.type === 'expense').forEach(t => {
      spendingMap[t.categoryId] = (spendingMap[t.categoryId] || 0) + Number(t.amount);
    });

    let html = '';
    this.state.expenseCategories.forEach(cat => {
      const spent = spendingMap[cat.id] || 0;
      const budget = cat.budget || 1000000;
      const pct = Math.min(100, Math.round((spent / budget) * 100));

      html += `
        <div class="space-y-1.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center space-x-2">
              <span class="w-2.5 h-2.5 rounded-full" style="background-color: ${cat.color};"></span>
              <span class="font-medium text-slate-700 dark:text-slate-300">${cat.name}</span>
            </div>
            <span class="text-slate-500 dark:text-slate-400 font-mono-num">${this.formatIDR(spent)}</span>
          </div>
          <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div class="h-1.5 rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${cat.color};"></div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;

    const quotaLabel = document.getElementById('dash-category-quota-badge');
    if (quotaLabel) {
      quotaLabel.textContent = `${count}`;
    }
  },

  renderDashboardRecentTransactions() {
    const container = document.getElementById('dash-recent-transactions');
    if (!container) return;

    const recent = this.state.transactions.slice(0, 6);

    if (recent.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-slate-400 dark:text-slate-500">
          <i data-lucide="receipt" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
          <p class="text-sm">Belum ada riwayat transaksi</p>
        </div>
      `;
      return;
    }

    let html = '';
    recent.forEach(trx => {
      let isIncome = trx.type === 'income';
      let isExpense = trx.type === 'expense';
      let isTransfer = trx.type === 'transfer';

      let iconBg = isIncome 
        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400' 
        : isExpense 
          ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
          : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400';

      let iconName = isIncome ? 'arrow-down-left' : isExpense ? 'shopping-cart' : 'arrow-right-left';
      
      let amountColor = isIncome 
        ? 'text-emerald-600 dark:text-emerald-400' 
        : isExpense 
          ? 'text-slate-900 dark:text-slate-100'
          : 'text-indigo-600 dark:text-indigo-400';

      let amountPrefix = isIncome ? '+ ' : isExpense ? '- ' : '';

      html += `
        <div class="flex items-center justify-between py-3.5 px-3 rounded-xl hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60 last:border-b-0">
          <div class="flex items-center space-x-3.5 min-w-0">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}">
              <i data-lucide="${iconName}" class="w-5 h-5"></i>
            </div>
            <div class="truncate">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">${trx.title}</h4>
              <div class="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                <span>${this.formatDate(trx.date)}</span>
                <span>•</span>
                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  ${trx.categoryName || 'Umum'}
                </span>
                <span>•</span>
                <span class="text-[11px] text-slate-400">${trx.walletName || ''}</span>
              </div>
            </div>
          </div>
          <div class="text-right shrink-0 ml-3">
            <p class="text-sm font-bold font-mono-num ${amountColor}">${amountPrefix}${this.formatIDR(trx.amount)}</p>
            <div class="flex items-center justify-end space-x-1 mt-0.5 text-slate-400">
              <svg class="w-12 h-4 text-emerald-400/60 dark:text-emerald-500/40" viewBox="0 0 60 20" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M 0 15 Q 15 5, 30 12 T 60 6" />
              </svg>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderDashboardCharts() {
    const isDark = this.state.darkMode;
    const textColor = isDark ? '#94a3b8' : '#64748b';
    const gridColor = isDark ? 'rgba(51, 65, 85, 0.3)' : 'rgba(226, 232, 240, 0.7)';

    // 1. Cashflow Comparison Bar Chart
    const cashflowCanvas = document.getElementById('chart-cashflow');
    if (cashflowCanvas && window.Chart) {
      if (this.charts.cashflow) {
        this.charts.cashflow.destroy();
      }

      // Group last 6 months or sample timeline
      const labels = ['Nov', 'Des', 'Jan', 'Feb', 'Mar', 'Bulan Ini'];
      const incomeData = [7200000, 8500000, 9100000, 8800000, 9200000, this.calculateStats().incomeBulanIni];
      const expenseData = [4100000, 5200000, 4300000, 3900000, 4800000, this.calculateStats().expenseBulanIni];

      this.charts.cashflow = new Chart(cashflowCanvas, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [
            {
              label: 'Pemasukan',
              data: incomeData,
              backgroundColor: '#10b981',
              borderRadius: 6,
              barThickness: 16
            },
            {
              label: 'Pengeluaran',
              data: expenseData,
              backgroundColor: '#f43f5e',
              borderRadius: 6,
              barThickness: 16
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
              align: 'end',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                usePointStyle: true,
                color: textColor,
                font: { family: 'Plus Jakarta Sans', size: 12 }
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.dataset.label}: ${FinFloApp.formatIDR(ctx.parsed.y)}`
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { color: textColor, font: { family: 'Plus Jakarta Sans', size: 11 } }
            },
            y: {
              grid: { color: gridColor },
              ticks: {
                color: textColor,
                font: { family: 'Plus Jakarta Sans', size: 10 },
                callback: (val) => FinFloApp.formatCompactIDR(val)
              }
            }
          }
        }
      });
    }

    // 2. Category Doughnut Chart
    const catCanvas = document.getElementById('chart-category-doughnut');
    if (catCanvas && window.Chart) {
      if (this.charts.category) {
        this.charts.category.destroy();
      }

      const spendingMap = {};
      this.state.transactions.filter(t => t.type === 'expense').forEach(t => {
        spendingMap[t.categoryName || 'Lainnya'] = (spendingMap[t.categoryName || 'Lainnya'] || 0) + Number(t.amount);
      });

      const catLabels = Object.keys(spendingMap);
      const catData = Object.values(spendingMap);
      const catColors = ['#f97316', '#0284c7', '#eab308', '#ec4899', '#8b5cf6', '#64748b'];

      this.charts.category = new Chart(catCanvas, {
        type: 'doughnut',
        data: {
          labels: catLabels.length ? catLabels : ['Belum ada pengeluaran'],
          datasets: [{
            data: catData.length ? catData : [1],
            backgroundColor: catLabels.length ? catColors.slice(0, catLabels.length) : ['#cbd5e1'],
            borderWidth: 2,
            borderColor: isDark ? '#1e293b' : '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                boxWidth: 10,
                boxHeight: 10,
                usePointStyle: true,
                color: textColor,
                font: { family: 'Plus Jakarta Sans', size: 11 }
              }
            },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${FinFloApp.formatIDR(ctx.parsed)}`
              }
            }
          }
        }
      });
    }
  },

  // ==========================================
  // TAB 2: TRANSAKSI (Filter & History)
  // ==========================================
  renderTransactionsTab() {
    this.populateTransactionFilterDropdowns();
    this.applyTransactionFilters();
  },

  populateTransactionFilterDropdowns() {
    // Populate Wallet Dropdown Filter
    const walletSelect = document.getElementById('filter-trx-wallet');
    if (walletSelect) {
      let options = '<option value="all">Semua Dompet</option>';
      this.state.wallets.forEach(w => {
        options += `<option value="${w.id}">${w.name}</option>`;
      });
      walletSelect.innerHTML = options;
      walletSelect.value = this.state.filters.wallet;
    }

    // Populate Category Dropdown Filter
    const catSelect = document.getElementById('filter-trx-category');
    if (catSelect) {
      let options = '<option value="all">Semua Kategori</option>';
      this.state.expenseCategories.forEach(c => {
        options += `<option value="${c.id}">${c.name} (Pengeluaran)</option>`;
      });
      this.state.incomeCategories.forEach(c => {
        options += `<option value="${c.id}">${c.name} (Pemasukan)</option>`;
      });
      catSelect.innerHTML = options;
      catSelect.value = this.state.filters.category;
    }

    // Populate Month Filter (Default current month)
    const monthInput = document.getElementById('filter-trx-month');
    if (monthInput && !monthInput.value) {
      monthInput.value = this.state.filters.month;
    }
  },

  handleFilterChange() {
    const searchInput = document.getElementById('filter-trx-search');
    const typeSelect = document.getElementById('filter-trx-type');
    const walletSelect = document.getElementById('filter-trx-wallet');
    const categorySelect = document.getElementById('filter-trx-category');
    const monthInput = document.getElementById('filter-trx-month');

    if (searchInput) this.state.filters.search = searchInput.value.toLowerCase().trim();
    if (typeSelect) this.state.filters.type = typeSelect.value;
    if (walletSelect) this.state.filters.wallet = walletSelect.value;
    if (categorySelect) this.state.filters.category = categorySelect.value;
    if (monthInput) this.state.filters.month = monthInput.value;

    this.applyTransactionFilters();
  },

  resetTransactionFilters() {
    this.state.filters = {
      search: '',
      type: 'all',
      wallet: 'all',
      category: 'all',
      month: new Date().toISOString().slice(0, 7)
    };

    const searchInput = document.getElementById('filter-trx-search');
    const typeSelect = document.getElementById('filter-trx-type');
    const walletSelect = document.getElementById('filter-trx-wallet');
    const categorySelect = document.getElementById('filter-trx-category');
    const monthInput = document.getElementById('filter-trx-month');

    if (searchInput) searchInput.value = '';
    if (typeSelect) typeSelect.value = 'all';
    if (walletSelect) walletSelect.value = 'all';
    if (categorySelect) categorySelect.value = 'all';
    if (monthInput) monthInput.value = this.state.filters.month;

    this.applyTransactionFilters();
  },

  applyTransactionFilters() {
    const { search, type, wallet, category, month } = this.state.filters;

    const filtered = this.state.transactions.filter(t => {
      // Month Filter (Default current month)
      if (month && month !== 'all' && month !== '') {
        if (!t.date || !t.date.startsWith(month)) return false;
      }

      // Search
      if (search) {
        const titleMatch = t.title.toLowerCase().includes(search);
        const notesMatch = (t.notes || '').toLowerCase().includes(search);
        const catMatch = (t.categoryName || '').toLowerCase().includes(search);
        if (!titleMatch && !notesMatch && !catMatch) return false;
      }

      // Type
      if (type !== 'all' && t.type !== type) return false;

      // Wallet
      if (wallet !== 'all') {
        if (t.walletId !== wallet && t.toWalletId !== wallet) return false;
      }

      // Category
      if (category !== 'all' && t.categoryId !== category) return false;

      return true;
    });

    // Render Filter Stats Summary
    let totalIn = 0;
    let totalOut = 0;
    filtered.forEach(t => {
      if (t.type === 'income') totalIn += Number(t.amount);
      if (t.type === 'expense') totalOut += Number(t.amount);
    });

    const statCountEl = document.getElementById('trx-filter-count');
    const statInEl = document.getElementById('trx-filter-total-in');
    const statOutEl = document.getElementById('trx-filter-total-out');

    if (statCountEl) statCountEl.textContent = `${filtered.length} Transaksi`;
    if (statInEl) statInEl.textContent = this.formatIDR(totalIn);
    if (statOutEl) statOutEl.textContent = this.formatIDR(totalOut);

    // Render Table Rows
    const tableBody = document.getElementById('trx-table-body');
    if (!tableBody) return;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-12 text-slate-400 dark:text-slate-500">
            <i data-lucide="search-x" class="w-10 h-10 mx-auto mb-2 opacity-50"></i>
            <p class="font-medium">Tidak ada transaksi yang cocok pada filter / bulan ini</p>
            <button onclick="FinFloApp.resetTransactionFilters()" class="mt-3 text-xs text-sky-600 dark:text-sky-400 hover:underline">Reset Filter ke Bulan Berjalan</button>
          </td>
        </tr>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    let html = '';
    filtered.forEach(trx => {
      const isIncome = trx.type === 'income';
      const isExpense = trx.type === 'expense';
      const isTransfer = trx.type === 'transfer';

      const typeBadge = isIncome 
        ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">Pemasukan</span>'
        : isExpense
          ? '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">Pengeluaran</span>'
          : '<span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-400">Transfer</span>';

      const amountColor = isIncome 
        ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
        : isExpense 
          ? 'text-rose-600 dark:text-rose-400 font-bold'
          : 'text-indigo-600 dark:text-indigo-400 font-bold';

      const sign = isIncome ? '+' : isExpense ? '-' : '⇄';

      html += `
        <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors border-b border-slate-100 dark:border-slate-800/60">
          <td class="py-3 px-4 text-xs font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
            ${this.formatDate(trx.date)}
          </td>
          <td class="py-3 px-4">
            <div class="font-semibold text-slate-800 dark:text-slate-200 text-sm">${trx.title}</div>
            ${trx.notes ? `<div class="text-xs text-slate-400 dark:text-slate-500 truncate max-w-xs">${trx.notes}</div>` : ''}
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            ${typeBadge}
          </td>
          <td class="py-3 px-4 whitespace-nowrap">
            <span class="text-xs font-medium text-slate-700 dark:text-slate-300">
              ${trx.categoryName || '-'}
            </span>
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-xs text-slate-600 dark:text-slate-400">
            ${isTransfer ? `${trx.walletName} → ${trx.toWalletName}` : trx.walletName}
          </td>
          <td class="py-3 px-4 whitespace-nowrap text-right font-mono-num ${amountColor}">
            ${sign} ${this.formatIDR(trx.amount)}
          </td>
          <td class="py-3 px-3 text-right whitespace-nowrap">
            <div class="flex items-center justify-end space-x-1">
              <button onclick="FinFloApp.openEditTransactionModal('${trx.id}')" title="Edit Transaksi" class="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="FinFloApp.deleteTransaction('${trx.id}')" title="Hapus Transaksi" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  exportToCSV() {
    if (this.state.transactions.length === 0) {
      this.showToast('Tidak ada transaksi untuk diekspor', 'error');
      return;
    }

    const headers = ['ID', 'Tanggal', 'Judul', 'Tipe', 'Kategori', 'Dompet', 'Nominal', 'Catatan'];
    const rows = this.state.transactions.map(t => [
      t.id,
      t.date,
      `"${(t.title || '').replace(/"/g, '""')}"`,
      t.type,
      `"${(t.categoryName || '').replace(/"/g, '""')}"`,
      `"${(t.walletName || '').replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `FinFlo_Transaksi_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.showToast('Riwayat transaksi berhasil diekspor ke CSV', 'success');
  },

  // ==========================================
  // TAB 3: DOMPET & KATEGORI (Free Tier Status)
  // ==========================================
  renderWalletsTab() {
    this.renderWalletsGrid();
    this.renderCategoriesGrid();
    this.renderFreeTierLimitsSummary();
  },

  renderFreeTierLimitsSummary() {
    const walletCount = this.state.wallets.length;
    const catCount = this.state.expenseCategories.length;

    const walletPct = Math.round((walletCount / this.LIMITS.MAX_WALLETS) * 100);
    const catPct = Math.round((catCount / this.LIMITS.MAX_EXPENSE_CATEGORIES) * 100);

    const wMeter = document.getElementById('meter-wallet-count');
    const wBar = document.getElementById('meter-wallet-bar');
    if (wMeter) wMeter.textContent = `${walletCount} / ${this.LIMITS.MAX_WALLETS}`;
    if (wBar) wBar.style.width = `${walletPct}%`;

    const cMeter = document.getElementById('meter-cat-count');
    const cBar = document.getElementById('meter-cat-bar');
    if (cMeter) cMeter.textContent = `${catCount} / ${this.LIMITS.MAX_EXPENSE_CATEGORIES}`;
    if (cBar) cBar.style.width = `${catPct}%`;
  },

  renderWalletsGrid() {
    const container = document.getElementById('wallets-grid-container');
    if (!container) return;

    let html = '';
    this.state.wallets.forEach(wallet => {
      const iconMap = {
        cash: 'banknote',
        bank: 'building-2',
        ewallet: 'smartphone'
      };
      const iconName = iconMap[wallet.type] || 'wallet';

      const colorGradients = {
        emerald: 'from-emerald-500 to-teal-600',
        blue: 'from-blue-600 to-sky-600',
        sky: 'from-sky-500 to-cyan-600',
        purple: 'from-indigo-600 to-purple-600'
      };
      const grad = colorGradients[wallet.color] || colorGradients.blue;

      html += `
        <div class="relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${grad} text-white shadow-lg card-hover">
          <!-- Background decorative shapes -->
          <div class="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
          
          <div class="flex items-start justify-between relative z-10">
            <div class="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
              <i data-lucide="${iconName}" class="w-5 h-5 text-white"></i>
            </div>
            <div class="flex items-center space-x-1.5">
              <button onclick="FinFloApp.openEditWalletModal('${wallet.id}')" title="Edit Dompet" class="p-1.5 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 transition-all">
                <i data-lucide="edit-3" class="w-4 h-4"></i>
              </button>
              <button onclick="FinFloApp.confirmDeleteWallet('${wallet.id}')" title="Hapus Dompet" class="p-1.5 rounded-lg bg-white/15 hover:bg-rose-500/80 active:scale-95 transition-all">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div class="mt-5 relative z-10">
            <p class="text-xs font-semibold text-white/80 uppercase tracking-wider">${wallet.name}</p>
            <h3 class="text-2xl font-extrabold mt-1 font-mono-num tracking-tight">${this.formatIDR(wallet.balance)}</h3>
          </div>

          <div class="mt-5 pt-3 border-t border-white/15 flex items-center justify-end text-xs relative z-10">
            <button onclick="FinFloApp.openTransferModal('${wallet.id}')" class="inline-flex items-center space-x-1.5 font-bold text-white/95 hover:text-white bg-white/15 hover:bg-white/25 px-3 py-1.5 rounded-xl active:scale-95 transition-all">
              <i data-lucide="arrow-left-right" class="w-3.5 h-3.5"></i>
              <span>Transfer Saldo</span>
            </button>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  renderCategoriesGrid() {
    const container = document.getElementById('categories-grid-container');
    if (!container) return;

    // Calculate monthly spent
    const spendingMap = {};
    this.state.transactions.filter(t => t.type === 'expense').forEach(t => {
      spendingMap[t.categoryId] = (spendingMap[t.categoryId] || 0) + Number(t.amount);
    });

    let html = '';
    this.state.expenseCategories.forEach(cat => {
      const spent = spendingMap[cat.id] || 0;
      const budget = cat.budget || 1000000;
      const pct = Math.min(100, Math.round((spent / budget) * 100));

      html += `
        <div class="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs card-hover">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3 min-w-0">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style="background-color: ${cat.color}20; color: ${cat.color};">
                <i data-lucide="${cat.icon || 'tag'}" class="w-5 h-5"></i>
              </div>
              <div class="min-w-0">
                <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">${cat.name}</h4>
                <p class="text-xs text-slate-400">Budget: ${this.formatIDR(budget)}</p>
              </div>
            </div>
            <div class="flex items-center space-x-2 shrink-0">
              <span class="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap" style="background-color: ${cat.color}15; color: ${cat.color};">
                ${cat.percentage || 0}%
              </span>
              <button onclick="FinFloApp.confirmDeleteCategory('${cat.id}')" title="Hapus Kategori" class="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 active:scale-95 transition-colors">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>

          <div class="mt-3">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>Terpakai: <b class="text-slate-800 dark:text-slate-200">${this.formatIDR(spent)}</b></span>
              <span>Sisa: ${this.formatIDR(Math.max(0, budget - spent))}</span>
            </div>
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
              <div class="h-2 rounded-full transition-all duration-500" style="width: ${pct}%; background-color: ${cat.color};"></div>
            </div>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  // Add Wallet Trigger (Enforces 3 Limit on Free Tier)
  handleAddNewWallet() {
    const isPro = this.state.auth && this.state.auth.tier === 'pro';
    if (this.state.wallets.length >= this.LIMITS.MAX_WALLETS && !isPro) {
      this.openFreeTierModal('wallet');
      return;
    }
    this.openAddWalletModal();
  },

  openAddWalletModal() {
    const modal = document.getElementById('modal-add-wallet');
    if (!modal) return;

    const nameInput = document.getElementById('add-wallet-name');
    const typeSelect = document.getElementById('add-wallet-type');
    const balanceInput = document.getElementById('add-wallet-balance');
    const numberInput = document.getElementById('add-wallet-number');
    const colorSelect = document.getElementById('add-wallet-color');

    if (nameInput) nameInput.value = '';
    if (typeSelect) typeSelect.value = 'bank';
    if (balanceInput) balanceInput.value = '';
    if (numberInput) numberInput.value = '';
    if (colorSelect) colorSelect.value = 'blue';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  },

  closeAddWalletModal() {
    const modal = document.getElementById('modal-add-wallet');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  handleSaveWallet(e) {
    e.preventDefault();
    const name = document.getElementById('add-wallet-name').value.trim();
    const type = document.getElementById('add-wallet-type').value;
    const rawBal = document.getElementById('add-wallet-balance').value.replace(/[^0-9]/g, '');
    const balance = Number(rawBal) || 0;
    const numberEl = document.getElementById('add-wallet-number');
    const number = numberEl ? numberEl.value.trim() : '-';
    const color = document.getElementById('add-wallet-color').value;

    if (!name) {
      this.showToast('Masukkan nama dompet', 'error');
      return;
    }

    const iconMap = {
      cash: 'banknote',
      bank: 'building-2',
      ewallet: 'smartphone'
    };

    const newWallet = {
      id: 'wallet-' + Date.now(),
      name: name,
      type: type,
      balance: balance,
      color: color || 'blue',
      icon: iconMap[type] || 'wallet',
      accountNumber: number || '-'
    };

    this.state.wallets.push(newWallet);
    this.saveState();
    this.closeAddWalletModal();
    this.showToast(`Dompet "${newWallet.name}" berhasil ditambahkan!`, 'success');
    this.render();
  },

  // Delete Wallet
  confirmDeleteWallet(walletId) {
    if (this.state.wallets.length <= 1) {
      this.showToast('Minimal harus memiliki 1 dompet aktif!', 'error');
      return;
    }

    const wallet = this.state.wallets.find(w => w.id === walletId);
    if (!wallet) return;

    this.openConfirmModal({
      title: 'Hapus Dompet',
      message: `Hapus dompet "${wallet.name}" (${this.formatIDR(wallet.balance)})? Catatan riwayat transaksi masa lalu akan tetap tersimpan.`,
      confirmText: 'Hapus Dompet',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: () => {
        this.deleteWallet(walletId);
      }
    });
  },

  deleteWallet(walletId) {
    const wallet = this.state.wallets.find(w => w.id === walletId);
    const name = wallet ? wallet.name : 'Dompet';
    this.state.wallets = this.state.wallets.filter(w => w.id !== walletId);
    this.saveState();
    this.showToast(`Dompet "${name}" berhasil dihapus`, 'info');
    this.render();
  },

  // Delete Category
  confirmDeleteCategory(catId) {
    if (this.state.expenseCategories.length <= 1) {
      this.showToast('Minimal harus memiliki 1 kategori pengeluaran!', 'error');
      return;
    }

    const cat = this.state.expenseCategories.find(c => c.id === catId);
    if (!cat) return;

    this.openConfirmModal({
      title: 'Hapus Kategori',
      message: `Hapus kategori "${cat.name}"? Kuota alokasi budgeting sebesar ${cat.percentage || 0}% akan otomatis dibebaskan kembali.`,
      confirmText: 'Hapus Kategori',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: () => {
        this.deleteCategory(catId);
      }
    });
  },

  deleteCategory(catId) {
    const cat = this.state.expenseCategories.find(c => c.id === catId);
    const name = cat ? cat.name : 'Kategori';
    this.state.expenseCategories = this.state.expenseCategories.filter(c => c.id !== catId);
    this.saveState();
    this.showToast(`Kategori "${name}" berhasil dihapus`, 'info');
    this.render();
  },

  // Add Category Trigger (Enforces 5 Limit on Free Tier & Max 100% Budget)
  handleAddNewCategory() {
    const isPro = this.state.auth && this.state.auth.tier === 'pro';
    if (this.state.expenseCategories.length >= this.LIMITS.MAX_EXPENSE_CATEGORIES && !isPro) {
      this.openFreeTierModal('category');
      return;
    }
    this.openAddCategoryModal();
  },

  openAddCategoryModal() {
    const modal = document.getElementById('modal-add-category');
    if (!modal) return;

    const currentTotalPct = this.state.expenseCategories.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0);
    const maxAllowed = Math.max(0, 100 - currentTotalPct);

    document.getElementById('add-cat-name').value = '';
    document.getElementById('add-cat-icon').value = 'tag';
    document.getElementById('add-cat-color').value = '#0284c7';
    
    const pctInput = document.getElementById('add-cat-percentage');
    if (pctInput) {
      pctInput.value = maxAllowed > 0 ? Math.min(10, maxAllowed) : 0;
      pctInput.max = maxAllowed;
    }

    const currentTotalEl = document.getElementById('cat-budget-current-total');
    const remainingQuotaEl = document.getElementById('cat-budget-remaining-quota');
    const warningEl = document.getElementById('cat-budget-warning');

    if (currentTotalEl) currentTotalEl.textContent = `${currentTotalPct}%`;
    if (remainingQuotaEl) remainingQuotaEl.textContent = `${maxAllowed}%`;
    if (warningEl) warningEl.classList.add('hidden');

    this.handleCategoryPercentageInput();

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  },

  closeAddCategoryModal() {
    const modal = document.getElementById('modal-add-category');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  handleCategoryPercentageInput() {
    const currentTotalPct = this.state.expenseCategories.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0);
    const maxAllowed = Math.max(0, 100 - currentTotalPct);

    const input = document.getElementById('add-cat-percentage');
    const warningEl = document.getElementById('cat-budget-warning');
    const submitBtn = document.getElementById('btn-submit-add-cat');
    const previewEl = document.getElementById('cat-budget-preview-nominal');

    if (!input) return;
    const entered = Number(input.value) || 0;
    const stats = this.calculateStats();
    const estBudget = Math.round((entered / 100) * (stats.incomeBulanIni || 5000000));

    if (previewEl) {
      previewEl.textContent = `Estimasi Nominal Anggaran: ${this.formatIDR(estBudget)}`;
    }

    if (entered > maxAllowed || (currentTotalPct + entered) > 100) {
      if (warningEl) {
        warningEl.classList.remove('hidden');
        warningEl.textContent = `Total alokasi tidak boleh melebihi 100%! Kuota tersisa hanya ${maxAllowed}%.`;
      }
      if (submitBtn) submitBtn.disabled = true;
    } else if (entered <= 0) {
      if (warningEl) {
        warningEl.classList.remove('hidden');
        warningEl.textContent = 'Persentase budgeting minimal 1%';
      }
      if (submitBtn) submitBtn.disabled = true;
    } else {
      if (warningEl) warningEl.classList.add('hidden');
      if (submitBtn) submitBtn.disabled = false;
    }
  },

  handleSaveCategory(e) {
    e.preventDefault();
    const name = document.getElementById('add-cat-name').value.trim();
    const icon = document.getElementById('add-cat-icon').value || 'tag';
    const color = document.getElementById('add-cat-color').value || '#0284c7';
    const percentage = Number(document.getElementById('add-cat-percentage').value) || 0;

    const currentTotalPct = this.state.expenseCategories.reduce((acc, c) => acc + (Number(c.percentage) || 0), 0);
    const maxAllowed = Math.max(0, 100 - currentTotalPct);

    if (!name) {
      this.showToast('Masukkan nama kategori', 'error');
      return;
    }

    if (percentage <= 0 || percentage > maxAllowed) {
      this.showToast(`Alokasi budgeting melebihi 100%! Maksimal: ${maxAllowed}%`, 'error');
      return;
    }

    const stats = this.calculateStats();
    const estBudget = Math.round((percentage / 100) * (stats.incomeBulanIni || 5000000));

    const newCat = {
      id: 'cat-' + Date.now(),
      name: name,
      icon: icon,
      color: color,
      percentage: percentage,
      budget: estBudget
    };

    this.state.expenseCategories.push(newCat);
    this.saveState();
    this.closeAddCategoryModal();
    this.showToast(`Kategori "${newCat.name}" (${percentage}%) berhasil ditambahkan!`, 'success');
    this.render();
  },

  // Edit Wallet Balance / Name
  openEditWalletModal(walletId) {
    const wallet = this.state.wallets.find(w => w.id === walletId);
    if (!wallet) return;

    const modal = document.getElementById('modal-edit-wallet');
    if (!modal) return;

    document.getElementById('edit-wallet-id').value = wallet.id;
    document.getElementById('edit-wallet-name').value = wallet.name;
    document.getElementById('edit-wallet-balance').value = wallet.balance;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeEditWalletModal() {
    const modal = document.getElementById('modal-edit-wallet');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  saveEditedWallet(e) {
    e.preventDefault();
    const id = document.getElementById('edit-wallet-id').value;
    const name = document.getElementById('edit-wallet-name').value.trim();
    const balance = Number(document.getElementById('edit-wallet-balance').value) || 0;

    const idx = this.state.wallets.findIndex(w => w.id === id);
    if (idx !== -1) {
      this.state.wallets[idx].name = name;
      this.state.wallets[idx].balance = balance;
      this.saveState();
      this.closeEditWalletModal();
      this.showToast(`Dompet "${name}" berhasil diperbarui`, 'success');
      this.render();
    }
  },

  // ==========================================
  // TAB 4: PROFIL & AKUN
  // ==========================================
  renderProfileTab() {
    const user = this.state.auth || DEFAULT_USER;
    
    const pName = document.getElementById('profile-name');
    const pEmail = document.getElementById('profile-email');
    const pAvatar = document.getElementById('profile-avatar');
    const pMemberSince = document.getElementById('profile-since');

    if (pName) pName.textContent = user.name;
    if (pEmail) pEmail.textContent = user.email;
    if (pAvatar) pAvatar.src = user.avatar;
    if (pMemberSince) pMemberSince.textContent = user.memberSince || 'Januari 2026';

    const pThemeText = document.getElementById('profile-theme-label');
    if (pThemeText) {
      pThemeText.textContent = this.state.darkMode ? 'Mode Gelap Aktif' : 'Mode Terang Aktif';
    }
  },

  exportAllDataJSON() {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      user: this.state.auth,
      wallets: this.state.wallets,
      expenseCategories: this.state.expenseCategories,
      incomeCategories: this.state.incomeCategories,
      transactions: this.state.transactions,
      exportedAt: new Date().toISOString()
    }, null, 2));

    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `FinFlo_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    this.showToast('Backup data FinFlo berhasil diunduh', 'success');
  },

  // ==========================================
  // TAB: HUTANG, PIUTANG & PAYLATER
  // ==========================================
  calculateDebtStats() {
    let totalKewajiban = 0;
    let totalPiutang = 0;
    let countActiveDebts = 0;
    let countActivePiutang = 0;

    const upcomingDebts = [];

    this.state.debts.forEach(d => {
      const remaining = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
      if (d.type === 'piutang') {
        if (d.status !== 'paid' && remaining > 0) {
          totalPiutang += remaining;
          countActivePiutang++;
        }
      } else {
        if (d.status !== 'paid' && remaining > 0) {
          totalKewajiban += remaining;
          countActiveDebts++;
          upcomingDebts.push({
            ...d,
            remaining
          });
        }
      }
    });

    upcomingDebts.sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''));

    return {
      totalKewajiban,
      totalPiutang,
      countActiveDebts,
      countActivePiutang,
      nearestDebt: upcomingDebts[0] || null
    };
  },

  renderDashboardDebtAlert() {
    const alertBox = document.getElementById('dash-debt-alert-banner');
    if (!alertBox) return;

    const stats = this.calculateDebtStats();
    if (!stats.nearestDebt) {
      alertBox.classList.add('hidden');
      return;
    }

    const d = stats.nearestDebt;
    const daysDiff = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
    let timeText = daysDiff < 0 ? `Terlambat ${Math.abs(daysDiff)} hari` : daysDiff === 0 ? 'Jatuh tempo Hari Ini!' : `Jatuh tempo dalam ${daysDiff} hari`;

    alertBox.classList.remove('hidden');
    alertBox.innerHTML = `
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 text-amber-900 dark:text-amber-200 gap-3">
        <div class="flex items-center space-x-3">
          <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <i data-lucide="bell-ring" class="w-5 h-5 animate-pulse"></i>
          </div>
          <div>
            <p class="text-xs font-bold leading-tight flex items-center gap-1.5">
              <span>Pengingat Jatuh Tempo Terdekat:</span>
              <span class="px-1.5 py-0.5 rounded text-[10px] bg-amber-200/60 dark:bg-amber-900 text-amber-900 dark:text-amber-200 font-bold uppercase">${d.type}</span>
            </p>
            <p class="text-xs text-amber-800 dark:text-amber-300 mt-0.5">
              <b>${d.title}</b> (${d.counterparty}) • Sisa Tagihan: <b class="font-mono-num">${this.formatIDR(d.remaining)}</b> (${timeText})
            </p>
          </div>
        </div>
        <div class="flex items-center space-x-2 shrink-0">
          <button onclick="FinFloApp.openPayDebtModal('${d.id}')" class="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs transition-all">
            Bayar Sekarang
          </button>
          <button onclick="FinFloApp.switchTab('debts')" class="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/50 hover:bg-amber-200 text-amber-800 dark:text-amber-200 text-xs font-bold transition-all">
            Lihat Semua
          </button>
        </div>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
  },

  renderDebtsTab() {
    const isPro = this.state.auth && this.state.auth.tier === 'pro';
    const gatekeeperEl = document.getElementById('debts-pro-gatekeeper');
    const contentEl = document.getElementById('debts-pro-content');

    if (!isPro) {
      if (gatekeeperEl) gatekeeperEl.classList.remove('hidden');
      if (contentEl) contentEl.classList.add('hidden');
      return;
    } else {
      if (gatekeeperEl) gatekeeperEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
    }

    const stats = this.calculateDebtStats();

    const elKewajiban = document.getElementById('debt-stat-kewajiban');
    const elPiutang = document.getElementById('debt-stat-piutang');
    const elActiveCount = document.getElementById('debt-stat-count');

    if (elKewajiban) elKewajiban.textContent = this.formatIDR(stats.totalKewajiban);
    if (elPiutang) elPiutang.textContent = this.formatIDR(stats.totalPiutang);
    if (elActiveCount) elActiveCount.textContent = `${stats.countActiveDebts} Tagihan Aktif`;

    this.applyDebtFilters();
  },

  handleDebtFilterChange() {
    const searchInput = document.getElementById('filter-debt-search');
    const typeSelect = document.getElementById('filter-debt-type');
    const statusSelect = document.getElementById('filter-debt-status');

    if (searchInput) this.state.debtFilters.search = searchInput.value.toLowerCase().trim();
    if (typeSelect) this.state.debtFilters.type = typeSelect.value;
    if (statusSelect) this.state.debtFilters.status = statusSelect.value;

    this.applyDebtFilters();
  },

  applyDebtFilters() {
    const { search, type, status } = this.state.debtFilters;

    const filtered = this.state.debts.filter(d => {
      if (search) {
        const titleMatch = d.title.toLowerCase().includes(search);
        const partyMatch = (d.counterparty || '').toLowerCase().includes(search);
        const notesMatch = (d.notes || '').toLowerCase().includes(search);
        if (!titleMatch && !partyMatch && !notesMatch) return false;
      }

      if (type !== 'all' && d.type !== type) return false;

      if (status === 'unpaid' && d.status === 'paid') return false;
      if (status === 'paid' && d.status !== 'paid') return false;

      return true;
    });

    // Urutkan berdasarkan tanggal terdekat (Unpaid first, then closest dueDate ascending)
    filtered.sort((a, b) => {
      const aPaid = a.status === 'paid' || (Number(a.paidAmount) >= Number(a.totalAmount));
      const bPaid = b.status === 'paid' || (Number(b.paidAmount) >= Number(b.totalAmount));
      if (aPaid && !bPaid) return 1;
      if (!aPaid && bPaid) return -1;
      return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31');
    });

    const container = document.getElementById('debts-grid-container');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400 dark:text-slate-500">
          <i data-lucide="badge-percent" class="w-12 h-12 mx-auto mb-2 opacity-50"></i>
          <p class="font-medium text-sm">Tidak ada catatan hutang / piutang yang cocok</p>
          <button onclick="FinFloApp.openAddDebtModal('paylater')" class="mt-3 px-3 py-1.5 rounded-xl bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 text-xs font-bold hover:underline">
            + Tambah Catatan Baru
          </button>
        </div>
      `;
      if (window.lucide) lucide.createIcons();
      return;
    }

    let html = '';
    filtered.forEach(d => {
      const isPaid = d.status === 'paid' || (Number(d.paidAmount) >= Number(d.totalAmount));
      const remaining = Math.max(0, (Number(d.totalAmount) || 0) - (Number(d.paidAmount) || 0));
      const pct = Math.min(100, Math.round(((Number(d.paidAmount) || 0) / (Number(d.totalAmount) || 1)) * 100));

      let dueText = '';
      let dueClass = '';
      if (d.dueDate) {
        const daysDiff = Math.ceil((new Date(d.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        if (isPaid) {
          dueText = 'Lunas';
          dueClass = 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400';
        } else if (daysDiff < 0) {
          dueText = `Lewat ${Math.abs(daysDiff)} hari`;
          dueClass = 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 font-bold animate-pulse';
        } else if (daysDiff === 0) {
          dueText = 'Jatuh tempo Hari Ini';
          dueClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 font-bold';
        } else {
          dueText = `${daysDiff} hari lagi (${this.formatDate(d.dueDate)})`;
          dueClass = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
        }
      }

      const typeBadgeConfig = {
        paylater: {
          label: 'Paylater / Cicilan',
          class: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: 'credit-card'
        },
        hutang: {
          label: 'Hutang Saya',
          class: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: 'arrow-up-right'
        },
        piutang: {
          label: 'Piutang (Uang di Orang)',
          class: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: 'arrow-down-left'
        }
      };

      const cfg = typeBadgeConfig[d.type] || typeBadgeConfig.paylater;

      html += `
        <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs card-hover flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${cfg.class}">
                <i data-lucide="${cfg.icon}" class="w-3 h-3 mr-1"></i> ${cfg.label}
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ${dueClass}">
                <i data-lucide="calendar" class="w-3 h-3 mr-1"></i> ${dueText}
              </span>
            </div>

            <h4 class="text-base font-bold text-slate-900 dark:text-white leading-snug">${d.title}</h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center">
              <i data-lucide="user" class="w-3.5 h-3.5 mr-1 text-slate-400"></i> ${d.counterparty || '-'}
            </p>

            ${d.notes ? `<p class="text-xs text-slate-400 dark:text-slate-500 mt-2 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl italic">"${d.notes}"</p>` : ''}

            <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div class="flex justify-between items-baseline">
                <span class="text-xs text-slate-500">Sisa ${d.type === 'piutang' ? 'Hak' : 'Kewajiban'}:</span>
                <span class="text-base font-extrabold font-mono-num ${isPaid ? 'text-emerald-600' : 'text-rose-600 dark:text-rose-400'}">
                  ${isPaid ? 'Rp 0 (LUNAS)' : this.formatIDR(remaining)}
                </span>
              </div>

              <div>
                <div class="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Terbayar: ${this.formatIDR(d.paidAmount || 0)}</span>
                  <span>Total: ${this.formatIDR(d.totalAmount)} (${pct}%)</span>
                </div>
                <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div class="h-2 rounded-full transition-all duration-500 ${isPaid ? 'bg-emerald-500' : 'bg-brand-500'}" style="width: ${pct}%;"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
            <button onclick="FinFloApp.deleteDebt('${d.id}')" title="Hapus Catatan" class="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors">
              <i data-lucide="trash-2" class="w-4 h-4"></i>
            </button>

            ${!isPaid ? `
              <button onclick="FinFloApp.openPayDebtModal('${d.id}')" class="flex-1 py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1">
                <i data-lucide="check-circle-2" class="w-4 h-4"></i>
                <span>${d.type === 'piutang' ? 'Terima Pelunasan' : 'Bayar / Cicil'}</span>
              </button>
            ` : `
              <span class="flex-1 text-center py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl">
                ✓ Lunas Sepenuhnya
              </span>
            `}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
    if (window.lucide) lucide.createIcons();
  },

  openAddDebtModal(defaultType = 'paylater') {
    const modal = document.getElementById('modal-add-debt');
    if (!modal) return;

    const typeSelect = document.getElementById('debt-input-type');
    if (typeSelect) typeSelect.value = defaultType;

    const titleInput = document.getElementById('debt-input-title');
    const partyInput = document.getElementById('debt-input-party');
    const amountInput = document.getElementById('debt-input-amount');
    const paidInput = document.getElementById('debt-input-paid');
    const dateInput = document.getElementById('debt-input-date');
    const notesInput = document.getElementById('debt-input-notes');

    if (titleInput) titleInput.value = '';
    if (partyInput) partyInput.value = '';
    if (amountInput) amountInput.value = '';
    if (paidInput) paidInput.value = '';
    if (notesInput) notesInput.value = '';
    if (dateInput) {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      dateInput.value = nextWeek.toISOString().split('T')[0];
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  },

  closeAddDebtModal() {
    const modal = document.getElementById('modal-add-debt');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  handleSaveDebt(e) {
    e.preventDefault();
    const type = document.getElementById('debt-input-type').value;
    const title = document.getElementById('debt-input-title').value.trim();
    const party = document.getElementById('debt-input-party').value.trim();
    const rawAmount = document.getElementById('debt-input-amount').value.replace(/[^0-9]/g, '');
    const rawPaid = (document.getElementById('debt-input-paid').value || '0').replace(/[^0-9]/g, '');
    const dueDate = document.getElementById('debt-input-date').value;
    const notes = document.getElementById('debt-input-notes').value.trim();

    const totalAmount = Number(rawAmount) || 0;
    const paidAmount = Number(rawPaid) || 0;

    if (!title) {
      this.showToast('Masukkan judul atau keperluan tagihan', 'error');
      return;
    }
    if (totalAmount <= 0) {
      this.showToast('Nominal total harus lebih dari 0', 'error');
      return;
    }

    const isPaid = paidAmount >= totalAmount;

    const newDebt = {
      id: 'debt-' + Date.now(),
      type: type,
      title: title,
      counterparty: party || '-',
      totalAmount: totalAmount,
      paidAmount: Math.min(paidAmount, totalAmount),
      dueDate: dueDate,
      status: isPaid ? 'paid' : (paidAmount > 0 ? 'partial' : 'unpaid'),
      notes: notes
    };

    this.state.debts.unshift(newDebt);
    this.saveState();
    this.closeAddDebtModal();
    this.showToast(`Catatan ${type === 'paylater' ? 'Paylater' : type === 'piutang' ? 'Piutang' : 'Hutang'} berhasil disimpan`, 'success');
    this.render();
  },

  openPayDebtModal(debtId) {
    const debt = this.state.debts.find(d => d.id === debtId);
    if (!debt) return;

    this.state.activePayDebtId = debtId;
    const modal = document.getElementById('modal-pay-debt');
    if (!modal) return;

    const remaining = Math.max(0, (Number(debt.totalAmount) || 0) - (Number(debt.paidAmount) || 0));

    document.getElementById('pay-debt-title').textContent = debt.title;
    document.getElementById('pay-debt-party').textContent = `${debt.counterparty} • Total: ${this.formatIDR(debt.totalAmount)}`;
    document.getElementById('pay-debt-remaining').textContent = this.formatIDR(remaining);

    const amountInput = document.getElementById('pay-debt-amount');
    if (amountInput) {
      amountInput.value = new Intl.NumberFormat('id-ID').format(remaining);
    }

    const walletSelect = document.getElementById('pay-debt-wallet');
    if (walletSelect) {
      walletSelect.innerHTML = this.state.wallets.map(w => 
        `<option value="${w.id}">${w.name} (Saldo: ${this.formatIDR(w.balance)})</option>`
      ).join('');
    }

    const labelType = document.getElementById('pay-debt-type-label');
    if (labelType) {
      labelType.textContent = debt.type === 'piutang' ? 'Terima Pembayaran dari' : 'Bayar Tagihan ke';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  },

  closePayDebtModal() {
    const modal = document.getElementById('modal-pay-debt');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.state.activePayDebtId = null;
  },

  fillPayFullAmount() {
    const debt = this.state.debts.find(d => d.id === this.state.activePayDebtId);
    if (!debt) return;
    const remaining = Math.max(0, (Number(debt.totalAmount) || 0) - (Number(debt.paidAmount) || 0));
    const amountInput = document.getElementById('pay-debt-amount');
    if (amountInput) {
      amountInput.value = new Intl.NumberFormat('id-ID').format(remaining);
    }
  },

  handleSaveDebtPayment(e) {
    e.preventDefault();
    const debt = this.state.debts.find(d => d.id === this.state.activePayDebtId);
    if (!debt) return;

    const rawPay = document.getElementById('pay-debt-amount').value.replace(/[^0-9]/g, '');
    const payAmount = Number(rawPay) || 0;
    const walletId = document.getElementById('pay-debt-wallet').value;
    const syncTrx = document.getElementById('pay-debt-sync-trx').checked;

    if (payAmount <= 0) {
      this.showToast('Nominal pembayaran harus lebih dari 0', 'error');
      return;
    }

    const currentRemaining = Math.max(0, (Number(debt.totalAmount) || 0) - (Number(debt.paidAmount) || 0));
    if (payAmount > currentRemaining) {
      this.showToast(`Nominal melebihi sisa tagihan (${this.formatIDR(currentRemaining)})`, 'error');
      return;
    }

    const wallet = this.state.wallets.find(w => w.id === walletId);

    if (syncTrx && wallet) {
      if (debt.type !== 'piutang') {
        if (wallet.balance < payAmount) {
          this.showToast(`Saldo ${wallet.name} tidak cukup (${this.formatIDR(wallet.balance)})`, 'error');
          return;
        }
        wallet.balance -= payAmount;

        const newTrx = {
          id: 'trx-' + Date.now(),
          title: `Bayar ${debt.title}`,
          type: 'expense',
          amount: payAmount,
          walletId: wallet.id,
          walletName: wallet.name,
          categoryId: 'cat-tagihan',
          categoryName: 'Tagihan & Utilitas',
          date: new Date().toISOString().split('T')[0],
          notes: `Pembayaran ${debt.type} ke ${debt.counterparty}`
        };
        this.state.transactions.unshift(newTrx);
      } else {
        wallet.balance += payAmount;
        const newTrx = {
          id: 'trx-' + Date.now(),
          title: `Terima Piutang: ${debt.title}`,
          type: 'income',
          amount: payAmount,
          walletId: wallet.id,
          walletName: wallet.name,
          categoryId: 'cat-bonus',
          categoryName: 'Penerimaan Piutang',
          date: new Date().toISOString().split('T')[0],
          notes: `Pelunasan piutang dari ${debt.counterparty}`
        };
        this.state.transactions.unshift(newTrx);
      }
    }

    debt.paidAmount = (Number(debt.paidAmount) || 0) + payAmount;
    if (debt.paidAmount >= debt.totalAmount) {
      debt.status = 'paid';
      if (window.confetti) {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
      this.showToast(`Hore! Tagihan "${debt.title}" telah LUNAS!`, 'success');
    } else {
      debt.status = 'partial';
      this.showToast(`Pembayaran ${this.formatIDR(payAmount)} berhasil dicatat`, 'success');
    }

    this.saveState();
    this.closePayDebtModal();
    this.render();
  },

  deleteDebt(debtId) {
    const debt = this.state.debts.find(d => d.id === debtId);
    if (!debt) return;

    this.openConfirmModal({
      title: 'Hapus Catatan Tagihan',
      message: `Hapus "${debt.title}" (${this.formatIDR(debt.totalAmount)})? Data ini akan dihapus dari daftar hutang/piutang.`,
      confirmText: 'Hapus',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: () => {
        this.state.debts = this.state.debts.filter(d => d.id !== debtId);
        this.saveState();
        this.showToast('Catatan berhasil dihapus', 'info');
        this.render();
      }
    });
  },

  // ==========================================
  // TAB: REKOMENDASI KEUANGAN PRO (AI ADVISOR)
  // ==========================================
  calculateFinancialHealth() {
    const stats = this.calculateStats();
    const debtStats = this.calculateDebtStats();

    const income = stats.incomeBulanIni || 0;
    const expense = stats.expenseBulanIni || 0;
    const surplus = stats.netSavings || (income - expense);
    const liquidCash = stats.totalSaldo || 0;

    // 1. Savings Rate (%)
    const savingsRate = income > 0 ? Math.max(0, (surplus / income) * 100) : 0;

    // 2. Debt Service Ratio (DSR) (%)
    const monthlyDebtInstallment = debtStats.upcomingDebts ? debtStats.upcomingDebts.reduce((acc, d) => acc + (d.remaining || 0), 0) : debtStats.totalKewajiban;
    const dsr = income > 0 ? (monthlyDebtInstallment / income) * 100 : 0;

    // 3. Emergency Fund Months
    const emergencyMonths = expense > 0 ? (liquidCash / expense) : (liquidCash > 0 ? 12 : 0);

    // 4. 50/30/20 Breakdown
    const needsCategories = ['makanan', 'food', 'transport', 'tagihan', 'utilitas', 'listrik', 'air', 'sewa', 'kesehatan', 'pendidikan'];
    const wantsCategories = ['belanja', 'shopping', 'hiburan', 'recreation', 'cafe', 'lifestyle'];

    let needsSpent = 0;
    let wantsSpent = 0;

    this.state.transactions.filter(t => t.type === 'expense').forEach(t => {
      const cat = this.state.expenseCategories.find(c => c.id === t.categoryId);
      const catName = (cat ? cat.name : (t.categoryName || '')).toLowerCase();
      const amt = Number(t.amount) || 0;

      if (needsCategories.some(n => catName.includes(n))) {
        needsSpent += amt;
      } else if (wantsCategories.some(w => catName.includes(w))) {
        wantsSpent += amt;
      } else {
        needsSpent += amt * 0.5;
        wantsSpent += amt * 0.5;
      }
    });

    const needsPct = income > 0 ? (needsSpent / income) * 100 : 0;
    const wantsPct = income > 0 ? (wantsSpent / income) * 100 : 0;
    const savingsPct = income > 0 ? (surplus / income) * 100 : 0;

    // 5. Overall Health Score (0 - 100)
    let score = 50;

    // Savings score (up to 25 pts)
    if (savingsRate >= 20) score += 25;
    else if (savingsRate >= 10) score += 15;
    else if (savingsRate > 0) score += 8;
    else score -= 15;

    // DSR score (up to 25 pts)
    if (dsr === 0) score += 25;
    else if (dsr <= 20) score += 22;
    else if (dsr <= 30) score += 15;
    else if (dsr <= 40) score += 5;
    else score -= 20;

    // Emergency fund score (up to 25 pts)
    if (emergencyMonths >= 6) score += 25;
    else if (emergencyMonths >= 3) score += 18;
    else if (emergencyMonths >= 1) score += 10;
    else score -= 10;

    // Cashflow positive score (up to 25 pts)
    if (surplus > 0 && expense <= (income * 0.6)) score += 25;
    else if (surplus > 0) score += 15;
    else score -= 15;

    score = Math.min(100, Math.max(10, Math.round(score)));

    // 6. Actionable Priority Recommendations
    const recommendations = [];

    // Rec 1: Spending Leak / Needs vs Wants
    if (wantsPct > 30) {
      recommendations.push({
        type: 'warning',
        icon: 'alert-triangle',
        color: 'rose',
        title: 'Pengeluaran Gaya Hidup Melebihi Batas 30%',
        badge: 'Prioritas Tinggi',
        diagnosis: `Alokasi untuk pos keinginan (Belanja & Hiburan) mencapai ${wantsPct.toFixed(1)}% dari pemasukan (Ambang aman: 30%).`,
        action: 'Terapkan metode "Wait 48 Hours" sebelum membeli barang non-pokok untuk mengeliminasi impulse buying.'
      });
    } else {
      recommendations.push({
        type: 'success',
        icon: 'shopping-bag',
        color: 'emerald',
        title: 'Disiplin Pengeluaran Gaya Hidup Terjaga',
        badge: 'Terkontrol',
        diagnosis: `Pos keinginan (Belanja & Hiburan) berada di ${wantsPct.toFixed(1)}%, terjaga rapi di bawah batas maksimal 30%.`,
        action: 'Pertahankan batas belanja bulanan dan pertimbangkan mengalihkan sisa kuota diskresioner ke tabungan impian.'
      });
    }

    // Rec 2: Debts & Paylater
    if (debtStats.totalKewajiban > 0) {
      if (dsr > 30) {
        recommendations.push({
          type: 'danger',
          icon: 'credit-card',
          color: 'rose',
          title: 'Beban Cicilan Melebihi Batas Sehat (DSR > 30%)',
          badge: 'Perhatian Khusus',
          diagnosis: `Total cicilan paylater & pinjaman Anda (${this.formatIDR(debtStats.totalKewajiban)}) memakan ${dsr.toFixed(1)}% penghasilan bulanan.`,
          action: 'Gunakan metode Avalanche (lunasi tagihan dengan bunga tertinggi lebih dahulu) dan bekukan penggunaan limit paylater sementara waktu.'
        });
      } else {
        recommendations.push({
          type: 'info',
          icon: 'check-circle-2',
          color: 'sky',
          title: 'Strategi Akselerasi Pelunasan Hutang & Paylater',
          badge: 'Sehat & Terkendali',
          diagnosis: `Beban cicilan Anda saat ini adalah ${this.formatIDR(debtStats.totalKewajiban)} (${dsr.toFixed(1)}% pemasukan), dalam kondisi aman.`,
          action: 'Alokasikan sebagian surplus kas bulanan untuk pelunasan dipercepat agar terbebas dari akumulasi bunga.'
        });
      }
    } else {
      recommendations.push({
        type: 'success',
        icon: 'smile',
        color: 'emerald',
        title: 'Bebas dari Beban Hutang & Cicilan',
        badge: 'Bebas Finansial',
        diagnosis: 'Anda tidak memiliki catatan hutang atau cicilan paylater aktif saat ini.',
        action: 'Kondisi kas Anda sangat leluasa. Ini saat yang sempurna untuk memperbesar porsi investasi produktif.'
      });
    }

    // Rec 3: Emergency Fund
    if (emergencyMonths < 3) {
      const gap = Math.max(0, (expense * 3) - liquidCash);
      recommendations.push({
        type: 'warning',
        icon: 'shield-alert',
        color: 'amber',
        title: 'Dana Darurat Masih di Bawah 3 Bulan Biaya Hidup',
        badge: 'Fondasi Utama',
        diagnosis: `Saldo likuid Anda (${this.formatIDR(liquidCash)}) hanya mampu bertahan ${emergencyMonths.toFixed(1)} bulan jika terjadi kehilangan pemasukan.`,
        action: `Prioritaskan menyisihkan ${this.formatIDR(gap / 6)} per bulan ke rekening bank terpisah untuk menutup defisit dalam 6 bulan ke depan.`
      });
    } else if (emergencyMonths < 6) {
      const gap = Math.max(0, (expense * 6) - liquidCash);
      recommendations.push({
        type: 'info',
        icon: 'shield-check',
        color: 'amber',
        title: 'Perkuat Dana Darurat Menuju Target Aman 6 Bulan',
        badge: 'Cukup Baik',
        diagnosis: `Dana darurat Anda saat ini mencukupi ${emergencyMonths.toFixed(1)} bulan biaya hidup (${this.formatIDR(liquidCash)}).`,
        action: `Tambahkan ${this.formatIDR(gap)} secara bertahap agar mencapai batas ideal 6 bulan pengeluaran untuk ketenangan finansial optimal.`
      });
    } else {
      recommendations.push({
        type: 'success',
        icon: 'shield',
        color: 'emerald',
        title: 'Fondasi Dana Darurat Sangat Kuat (>= 6 Bulan)',
        badge: 'Target Tercapai',
        diagnosis: `Dana darurat Anda mencukupi ${emergencyMonths.toFixed(1)} bulan biaya hidup (${this.formatIDR(liquidCash)}).`,
        action: 'Fondasi darurat telah aman! Surplus kas berikutnya dapat sepenuhnya dialihkan ke instrumen investasi jangka panjang.'
      });
    }

    // Rec 4: Surplus Allocation & Investment
    if (surplus > 0) {
      recommendations.push({
        type: 'info',
        icon: 'trending-up',
        color: 'purple',
        title: 'Optimalkan Kas Menganggur ke Instrumen Investasi',
        badge: 'Pertumbuhan Nilai',
        diagnosis: `Anda memiliki surplus kas aktif sebesar ${this.formatIDR(surplus)} per bulan yang siap diputar.`,
        action: 'Diversifikasikan 50% surplus ke Reksadana Pasar Uang atau Obligasi Negara (SBN) untuk melindungi nilai uang dari inflasi.'
      });
    }

    return {
      score,
      savingsRate,
      dsr,
      emergencyMonths,
      liquidCash,
      income,
      expense,
      needsSpent,
      wantsSpent,
      surplus,
      needsPct,
      wantsPct,
      savingsPct,
      monthlyDebtInstallment,
      recommendations
    };
  },

  renderRecommendationsTab() {
    const isPro = this.state.auth && this.state.auth.tier === 'pro';
    const gatekeeperEl = document.getElementById('recomms-pro-gatekeeper');
    const contentEl = document.getElementById('recomms-pro-content');

    if (!isPro) {
      if (gatekeeperEl) gatekeeperEl.classList.remove('hidden');
      if (contentEl) contentEl.classList.add('hidden');
      if (window.lucide) lucide.createIcons();
      return;
    } else {
      if (gatekeeperEl) gatekeeperEl.classList.add('hidden');
      if (contentEl) contentEl.classList.remove('hidden');
    }

    const health = this.calculateFinancialHealth();

    // 1. Health Score Ring & Label
    const scoreVal = document.getElementById('recomm-score-val');
    const scoreCircle = document.getElementById('recomm-score-circle');
    const scoreStatus = document.getElementById('recomm-score-status');

    if (scoreVal) scoreVal.textContent = health.score;
    if (scoreCircle) {
      const offset = 264 - (264 * health.score / 100);
      scoreCircle.style.strokeDashoffset = offset;
      if (health.score >= 80) {
        scoreCircle.className = 'text-emerald-500 transition-all duration-1000 ease-out';
      } else if (health.score >= 60) {
        scoreCircle.className = 'text-amber-500 transition-all duration-1000 ease-out';
      } else {
        scoreCircle.className = 'text-rose-500 transition-all duration-1000 ease-out';
      }
    }

    if (scoreStatus) {
      if (health.score >= 80) {
        scoreStatus.className = 'mt-3 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300';
        scoreStatus.textContent = 'Kondisi Prima & Sangat Sehat';
      } else if (health.score >= 60) {
        scoreStatus.className = 'mt-3 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300';
        scoreStatus.textContent = 'Cukup Baik & Perlu Optimasi';
      } else {
        scoreStatus.className = 'mt-3 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300';
        scoreStatus.textContent = 'Kritis (Perlu Pemulihan Kas)';
      }
    }

    // 2. Metrics Right
    const elSavingsRate = document.getElementById('recomm-stat-savings-rate');
    const elSavingsNominal = document.getElementById('recomm-stat-savings-nominal');
    const elDsr = document.getElementById('recomm-stat-dsr');
    const elDsrNominal = document.getElementById('recomm-stat-dsr-nominal');
    const elEmergencyMonths = document.getElementById('recomm-stat-emergency-months');
    const elEmergencyNominal = document.getElementById('recomm-stat-emergency-nominal');
    const elDisciplineScore = document.getElementById('recomm-stat-discipline-score');

    if (elSavingsRate) elSavingsRate.textContent = `${health.savingsRate.toFixed(1)}%`;
    if (elSavingsNominal) elSavingsNominal.textContent = `${this.formatIDR(health.surplus)} / bln`;
    if (elDsr) elDsr.textContent = `${health.dsr.toFixed(1)}%`;
    if (elDsrNominal) elDsrNominal.textContent = this.formatIDR(health.monthlyDebtInstallment || 0);
    if (elEmergencyMonths) elEmergencyMonths.textContent = `${health.emergencyMonths.toFixed(1)} Bulan`;
    if (elEmergencyNominal) elEmergencyNominal.textContent = this.formatIDR(health.liquidCash || 0);
    if (elDisciplineScore) elDisciplineScore.textContent = `${((health.expense / (health.income || 1)) * 100).toFixed(1)}%`;

    // 3. 50/30/20 Elements
    const elNeedsPct = document.getElementById('recomm-needs-pct');
    const elNeedsNominal = document.getElementById('recomm-needs-nominal');
    const elNeedsBar = document.getElementById('recomm-needs-bar');
    const elNeedsDiag = document.getElementById('recomm-needs-diagnosis');

    const elWantsPct = document.getElementById('recomm-wants-pct');
    const elWantsNominal = document.getElementById('recomm-wants-nominal');
    const elWantsBar = document.getElementById('recomm-wants-bar');
    const elWantsDiag = document.getElementById('recomm-wants-diagnosis');

    const elSavingsPct = document.getElementById('recomm-savings-pct');
    const elSavingsNom = document.getElementById('recomm-savings-nominal');
    const elSavingsBar = document.getElementById('recomm-savings-bar');
    const elSavingsDiag = document.getElementById('recomm-savings-diagnosis');

    if (elNeedsPct) elNeedsPct.textContent = `${health.needsPct.toFixed(1)}%`;
    if (elNeedsNominal) elNeedsNominal.textContent = this.formatIDR(health.needsSpent);
    if (elNeedsBar) elNeedsBar.style.width = `${Math.min(100, health.needsPct)}%`;
    if (elNeedsDiag) {
      if (health.needsPct <= 50) {
        elNeedsDiag.innerHTML = '✅ <b>Sangat Sehat</b>: Pengeluaran pokok Anda terkendali dengan baik di bawah pagu maksimal 50% pemasukan.';
      } else {
        elNeedsDiag.innerHTML = '⚠️ <b>Overbudget Kebutuhan</b>: Pengeluaran primer melampaui 50%. Evaluasi tagihan rutin atau biaya operasional bulanan.';
      }
    }

    if (elWantsPct) elWantsPct.textContent = `${health.wantsPct.toFixed(1)}%`;
    if (elWantsNominal) elWantsNominal.textContent = this.formatIDR(health.wantsSpent);
    if (elWantsBar) elWantsBar.style.width = `${Math.min(100, health.wantsPct)}%`;
    if (elWantsDiag) {
      if (health.wantsPct <= 30) {
        elWantsDiag.innerHTML = '✅ <b>Terkendali</b>: Pengeluaran lifestyle Anda tidak melampaui batas 30%. Disiplin anggaran terjaga!';
      } else {
        elWantsDiag.innerHTML = '🚨 <b>Gaya Hidup Boros</b>: Pos belanja & rekreasi memakan lebih dari 30% pemasukan. Terapkan rem belanja.';
      }
    }

    if (elSavingsPct) elSavingsPct.textContent = `${health.savingsPct.toFixed(1)}%`;
    if (elSavingsNom) elSavingsNom.textContent = this.formatIDR(health.surplus);
    if (elSavingsBar) elSavingsBar.style.width = `${Math.min(100, Math.max(0, health.savingsPct))}%`;
    if (elSavingsDiag) {
      if (health.savingsPct >= 20) {
        elSavingsDiag.innerHTML = '🌟 <b>Luar Biasa</b>: Anda menyisihkan lebih dari 20% pemasukan! Arus kas ini siap diputar ke investasi jangka panjang.';
      } else if (health.savingsPct > 0) {
        elSavingsDiag.innerHTML = '⚠️ <b>Perlu Ditingkatkan</b>: Tingkat tabungan Anda masih di bawah benchmark 20%. Cobalah tekan pos belanja keinginan.';
      } else {
        elSavingsDiag.innerHTML = '🚨 <b>Defisit Arus Kas</b>: Pengeluaran melebihi pemasukan bulan ini! Anda mengalami arus kas negatif.';
      }
    }

    // 4. Render Dynamic Actionable Recommendations
    const cardsGrid = document.getElementById('recomms-cards-grid');
    if (cardsGrid) {
      let cardsHtml = '';
      health.recommendations.forEach(rec => {
        const badgeColors = {
          emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
          amber: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300',
          rose: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
          sky: 'bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300',
          purple: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
        };
        const iconBg = {
          emerald: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400',
          amber: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400',
          rose: 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400',
          sky: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400',
          purple: 'bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400'
        };

        const bClass = badgeColors[rec.color] || badgeColors.sky;
        const iBg = iconBg[rec.color] || iconBg.sky;

        cardsHtml += `
          <div class="glass-card rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between card-hover">
            <div>
              <div class="flex items-start justify-between gap-3 mb-3">
                <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iBg}">
                  <i data-lucide="${rec.icon}" class="w-5 h-5"></i>
                </div>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${bClass}">
                  ${rec.badge}
                </span>
              </div>
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">${rec.title}</h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">${rec.diagnosis}</p>
            </div>
            <div class="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
              <p class="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">Rencana Aksi Cerdas:</p>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">👉 ${rec.action}</p>
            </div>
          </div>
        `;
      });
      cardsGrid.innerHTML = cardsHtml;
    }

    // 5. Initialize Goal Simulator
    const simSurplusEl = document.getElementById('sim-current-surplus');
    if (simSurplusEl) {
      simSurplusEl.textContent = `${this.formatIDR(Math.max(0, health.surplus))} / bln`;
    }
    this.handleGoalSimulation();

    if (window.lucide) lucide.createIcons();
  },

  handleGoalSimulation() {
    const nameInput = document.getElementById('sim-goal-name');
    const targetInput = document.getElementById('sim-goal-target');
    const monthlyInput = document.getElementById('sim-goal-monthly');

    if (!targetInput || !monthlyInput) return;

    const goalName = nameInput ? (nameInput.value.trim() || 'Target Impian') : 'Target Impian';
    const targetAmount = Number(targetInput.value) || 25000000;
    const monthlyAlloc = Number(monthlyInput.value) || 2500000;

    const targetText = document.getElementById('sim-goal-target-text');
    const monthlyText = document.getElementById('sim-goal-monthly-text');
    const resGoalTitle = document.getElementById('sim-res-goal-title');
    const resMonths = document.getElementById('sim-res-months');
    const resDate = document.getElementById('sim-res-date');

    if (targetText) targetText.textContent = this.formatIDR(targetAmount);
    if (monthlyText) monthlyText.textContent = `${this.formatIDR(monthlyAlloc)} / bln`;
    if (resGoalTitle) resGoalTitle.textContent = goalName;

    const monthsNeeded = Math.ceil(targetAmount / Math.max(1, monthlyAlloc));
    if (resMonths) resMonths.textContent = monthsNeeded;

    const projectedDate = new Date();
    projectedDate.setMonth(projectedDate.getMonth() + monthsNeeded);
    const dateFormatted = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(projectedDate);

    if (resDate) {
      resDate.innerHTML = `Estimasi tercapai pada: <b>${dateFormatted}</b>`;
    }
  },

  refreshRecommendations() {
    this.showToast('Menganalisis ulang kondisi finansial terkini...', 'info');
    this.renderRecommendationsTab();
    this.showToast('Rekomendasi keuangan berhasil diperbarui!', 'success');
  },

  // ==========================================
  // TRANSACTION CRUD & BALANCES
  // ==========================================
  openTransactionModal(defaultType = 'expense') {
    this.state.editingTransactionId = null;
    const modal = document.getElementById('modal-add-transaction');
    if (!modal) return;

    const titleEl = document.getElementById('trx-modal-title');
    const submitBtn = document.getElementById('trx-modal-submit-btn');
    if (titleEl) titleEl.textContent = 'Tambah Transaksi Baru';
    if (submitBtn) submitBtn.textContent = 'Simpan Transaksi';

    this.setTransactionModalTab(defaultType);
    this.populateModalDropdowns();

    // Set today date
    const dateInput = document.getElementById('trx-date');
    if (dateInput) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    // Reset fields
    const titleInput = document.getElementById('trx-title');
    const amountInput = document.getElementById('trx-amount');
    const notesInput = document.getElementById('trx-notes');
    if (titleInput) titleInput.value = '';
    if (amountInput) amountInput.value = '';
    if (notesInput) notesInput.value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');

    if (window.lucide) lucide.createIcons();
  },

  openEditTransactionModal(trxId) {
    const trx = this.state.transactions.find(t => t.id === trxId);
    if (!trx) return;

    this.state.editingTransactionId = trxId;
    const modal = document.getElementById('modal-add-transaction');
    if (!modal) return;

    const titleEl = document.getElementById('trx-modal-title');
    const submitBtn = document.getElementById('trx-modal-submit-btn');
    if (titleEl) titleEl.textContent = 'Edit Transaksi';
    if (submitBtn) submitBtn.textContent = 'Perbarui Transaksi';

    this.setTransactionModalTab(trx.type || 'expense');
    this.populateModalDropdowns();

    const titleInput = document.getElementById('trx-title');
    const amountInput = document.getElementById('trx-amount');
    const dateInput = document.getElementById('trx-date');
    const notesInput = document.getElementById('trx-notes');

    if (titleInput) titleInput.value = trx.title || '';
    if (amountInput) amountInput.value = new Intl.NumberFormat('id-ID').format(trx.amount || 0);
    if (dateInput) dateInput.value = trx.date || '';
    if (notesInput) notesInput.value = trx.notes || '';

    if (trx.type === 'transfer') {
      const fromSelect = document.getElementById('trx-from-wallet');
      const toSelect = document.getElementById('trx-to-wallet');
      if (fromSelect && trx.walletId) fromSelect.value = trx.walletId;
      if (toSelect && trx.toWalletId) toSelect.value = trx.toWalletId;
    } else {
      const walletSelect = document.getElementById('trx-wallet');
      const catSelect = document.getElementById('trx-category');
      if (walletSelect && trx.walletId) walletSelect.value = trx.walletId;
      if (catSelect && trx.categoryId) catSelect.value = trx.categoryId;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
    if (window.lucide) lucide.createIcons();
  },

  closeTransactionModal() {
    const modal = document.getElementById('modal-add-transaction');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.state.editingTransactionId = null;
  },

  currentModalType: 'expense',

  setTransactionModalTab(type) {
    this.currentModalType = type;

    const tabs = ['expense', 'income', 'transfer'];
    tabs.forEach(t => {
      const btn = document.getElementById(`modal-tab-${t}`);
      if (btn) {
        if (t === type) {
          btn.className = 'flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg bg-white dark:bg-slate-700 shadow-xs text-slate-800 dark:text-slate-100 transition-all';
        } else {
          btn.className = 'flex-1 py-2 text-xs sm:text-sm font-medium rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-all';
        }
      }
    });

    // Toggle fields based on type
    const categoryGroup = document.getElementById('group-trx-category');
    const transferGroup = document.getElementById('group-trx-transfer-wallets');
    const singleWalletGroup = document.getElementById('group-trx-single-wallet');

    if (type === 'transfer') {
      if (categoryGroup) categoryGroup.classList.add('hidden');
      if (transferGroup) transferGroup.classList.remove('hidden');
      if (singleWalletGroup) singleWalletGroup.classList.add('hidden');
    } else {
      if (categoryGroup) categoryGroup.classList.remove('hidden');
      if (transferGroup) transferGroup.classList.add('hidden');
      if (singleWalletGroup) singleWalletGroup.classList.remove('hidden');
    }

    this.populateModalDropdowns();
  },

  populateModalDropdowns() {
    // Single Wallet
    const walletSelect = document.getElementById('trx-wallet');
    if (walletSelect) {
      walletSelect.innerHTML = this.state.wallets.map(w => 
        `<option value="${w.id}">${w.name} (Saldo: ${this.formatIDR(w.balance)})</option>`
      ).join('');
    }

    // From Wallet & To Wallet for Transfer
    const fromSelect = document.getElementById('trx-from-wallet');
    const toSelect = document.getElementById('trx-to-wallet');
    if (fromSelect && toSelect) {
      const fromOpts = this.state.wallets.map(w => 
        `<option value="${w.id}">${w.name} (${this.formatIDR(w.balance)})</option>`
      ).join('');
      fromSelect.innerHTML = fromOpts;

      const toOpts = this.state.wallets.map((w, idx) => 
        `<option value="${w.id}" ${idx === 1 ? 'selected' : ''}>${w.name}</option>`
      ).join('');
      toSelect.innerHTML = toOpts;
    }

    // Category selector based on expense vs income
    const catSelect = document.getElementById('trx-category');
    if (catSelect) {
      if (this.currentModalType === 'income') {
        catSelect.innerHTML = this.state.incomeCategories.map(c => 
          `<option value="${c.id}">${c.name}</option>`
        ).join('');
      } else {
        catSelect.innerHTML = this.state.expenseCategories.map(c => 
          `<option value="${c.id}">${c.name}</option>`
        ).join('');
      }
    }
  },

  handleSaveTransaction(e) {
    e.preventDefault();

    const titleInput = document.getElementById('trx-title');
    const amountInput = document.getElementById('trx-amount');
    const dateInput = document.getElementById('trx-date');
    const notesInput = document.getElementById('trx-notes');

    const title = titleInput.value.trim();
    const rawAmount = amountInput.value.replace(/[^0-9]/g, '');
    const amount = Number(rawAmount);
    const date = dateInput.value || new Date().toISOString().split('T')[0];
    const notes = notesInput.value.trim();

    if (!title) {
      this.showToast('Silakan masukkan judul transaksi', 'error');
      titleInput.focus();
      return;
    }

    if (!amount || amount <= 0) {
      this.showToast('Nominal harus lebih dari 0', 'error');
      amountInput.focus();
      return;
    }

    const type = this.currentModalType;
    const editId = this.state.editingTransactionId;

    // Rollback previous transaction effect if editing
    if (editId) {
      const oldTrx = this.state.transactions.find(t => t.id === editId);
      if (oldTrx) {
        if (oldTrx.type === 'income') {
          const w = this.state.wallets.find(w => w.id === oldTrx.walletId);
          if (w) w.balance -= Number(oldTrx.amount);
        } else if (oldTrx.type === 'expense') {
          const w = this.state.wallets.find(w => w.id === oldTrx.walletId);
          if (w) w.balance += Number(oldTrx.amount);
        } else if (oldTrx.type === 'transfer') {
          const fromW = this.state.wallets.find(w => w.id === oldTrx.walletId);
          const toW = this.state.wallets.find(w => w.id === oldTrx.toWalletId);
          if (fromW) fromW.balance += Number(oldTrx.amount);
          if (toW) toW.balance -= Number(oldTrx.amount);
        }
      }
    }

    if (type === 'transfer') {
      const fromId = document.getElementById('trx-from-wallet').value;
      const toId = document.getElementById('trx-to-wallet').value;

      if (fromId === toId) {
        this.showToast('Dompet asal dan tujuan tidak boleh sama', 'error');
        return;
      }

      const fromWallet = this.state.wallets.find(w => w.id === fromId);
      const toWallet = this.state.wallets.find(w => w.id === toId);

      if (!fromWallet || !toWallet) {
        this.showToast('Dompet tidak valid', 'error');
        return;
      }

      if (fromWallet.balance < amount) {
        this.showToast(`Saldo di ${fromWallet.name} tidak mencukupi untuk transfer`, 'error');
        return;
      }

      // Deduct from source and add to destination
      fromWallet.balance -= amount;
      toWallet.balance += amount;

      const trxData = {
        id: editId || ('trx-' + Date.now()),
        title: title,
        type: 'transfer',
        amount: amount,
        walletId: fromWallet.id,
        walletName: fromWallet.name,
        toWalletId: toWallet.id,
        toWalletName: toWallet.name,
        categoryId: 'transfer',
        categoryName: 'Transfer Antar Dompet',
        date: date,
        notes: notes
      };

      if (editId) {
        const idx = this.state.transactions.findIndex(t => t.id === editId);
        if (idx !== -1) this.state.transactions[idx] = trxData;
      } else {
        this.state.transactions.unshift(trxData);
      }
    } else {
      // Income or Expense
      const walletId = document.getElementById('trx-wallet').value;
      const catId = document.getElementById('trx-category').value;
      const wallet = this.state.wallets.find(w => w.id === walletId);

      if (!wallet) {
        this.showToast('Pilih dompet terlebih dahulu', 'error');
        return;
      }

      let catName = 'Lainnya';
      if (type === 'income') {
        const cat = this.state.incomeCategories.find(c => c.id === catId);
        if (cat) catName = cat.name;
        wallet.balance += amount;
      } else {
        const cat = this.state.expenseCategories.find(c => c.id === catId);
        if (cat) catName = cat.name;
        wallet.balance -= amount;
      }

      const trxData = {
        id: editId || ('trx-' + Date.now()),
        title: title,
        type: type,
        amount: amount,
        walletId: wallet.id,
        walletName: wallet.name,
        categoryId: catId,
        categoryName: catName,
        date: date,
        notes: notes
      };

      if (editId) {
        const idx = this.state.transactions.findIndex(t => t.id === editId);
        if (idx !== -1) this.state.transactions[idx] = trxData;
      } else {
        this.state.transactions.unshift(trxData);
      }
    }

    this.state.editingTransactionId = null;
    this.saveState();
    this.closeTransactionModal();
    this.showToast(editId ? 'Transaksi berhasil diperbarui!' : 'Transaksi berhasil ditambahkan!', 'success');
    this.render();
  },

  deleteTransaction(id) {
    const trx = this.state.transactions.find(t => t.id === id);
    if (!trx) return;

    this.openConfirmModal({
      title: 'Hapus Transaksi',
      message: `Hapus "${trx.title}" (${this.formatIDR(trx.amount)})? Saldo dompet akan disesuaikan kembali secara otomatis.`,
      confirmText: 'Hapus',
      confirmColor: 'bg-rose-600 hover:bg-rose-700',
      onConfirm: () => {
        // Rollback wallet balance
        if (trx.type === 'income') {
          const w = this.state.wallets.find(w => w.id === trx.walletId);
          if (w) w.balance -= Number(trx.amount);
        } else if (trx.type === 'expense') {
          const w = this.state.wallets.find(w => w.id === trx.walletId);
          if (w) w.balance += Number(trx.amount);
        } else if (trx.type === 'transfer') {
          const fromW = this.state.wallets.find(w => w.id === trx.walletId);
          const toW = this.state.wallets.find(w => w.id === trx.toWalletId);
          if (fromW) fromW.balance += Number(trx.amount);
          if (toW) toW.balance -= Number(trx.amount);
        }

        this.state.transactions = this.state.transactions.filter(t => t.id !== id);
        this.saveState();
        this.showToast('Transaksi berhasil dihapus & saldo dikembalikan', 'info');
        this.render();
      }
    });
  },

  openTransferModal(fromWalletId) {
    this.openTransactionModal('transfer');
    const fromSelect = document.getElementById('trx-from-wallet');
    if (fromSelect && fromWalletId) {
      fromSelect.value = fromWalletId;
    }
  },

  // ==========================================
  // FREE TIER LIMIT MODAL
  // ==========================================
  openFreeTierModal(reason = 'quota') {
    const modal = document.getElementById('modal-free-tier');
    if (!modal) return;

    const titleEl = document.getElementById('free-tier-modal-title');
    const descEl = document.getElementById('free-tier-modal-desc');

    if (reason === 'wallet') {
      if (titleEl) titleEl.textContent = 'Batas Dompet Free Tier Tercapai';
      if (descEl) descEl.textContent = 'Paket Free Tier dibatasi maksimal 3 dompet aktif. Anda dapat mengedit dompet yang ada atau beralih ke FinFlo Pro untuk jumlah dompet tanpa batas.';
    } else if (reason === 'category') {
      if (titleEl) titleEl.textContent = 'Batas Kategori Free Tier Tercapai';
      if (descEl) descEl.textContent = 'Paket Free Tier dibatasi maksimal 5 kategori pengeluaran dasar. Upgrade ke FinFlo Pro untuk membuat custom kategori tanpa batas.';
    } else {
      if (titleEl) titleEl.textContent = 'Fitur & Batasan Free Tier';
      if (descEl) descEl.textContent = 'Anda sedang menikmati akun Free Tier FinFlo. Nikmati pencatatan transaksi mudah dengan 3 dompet dan 5 kategori pengeluaran utama.';
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeFreeTierModal() {
    const modal = document.getElementById('modal-free-tier');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  },

  simulateUpgradePro() {
    if (this.state.auth) {
      this.state.auth.tier = 'pro';
      this.LIMITS.MAX_WALLETS = 999;
      this.LIMITS.MAX_EXPENSE_CATEGORIES = 999;
      this.saveState();
      this.closeFreeTierModal();

      if (window.confetti) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 }
        });
      }

      this.showToast('Selamat! Fitur Pro berhasil diaktifkan secara simulasi.', 'success');
      this.render();
    }
  },

  // ==========================================
  // GENERIC CONFIRM MODAL
  // ==========================================
  confirmCallback: null,

  openConfirmModal({ title, message, confirmText = 'Konfirmasi', confirmColor = 'bg-sky-600', onConfirm }) {
    const modal = document.getElementById('modal-confirm');
    if (!modal) return;

    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    
    const confirmBtn = document.getElementById('confirm-action-btn');
    confirmBtn.textContent = confirmText;
    confirmBtn.className = `px-4 py-2 rounded-xl text-sm font-semibold text-white transition-colors ${confirmColor}`;

    this.confirmCallback = onConfirm;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  },

  closeConfirmModal() {
    const modal = document.getElementById('modal-confirm');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
    this.confirmCallback = null;
  },

  executeConfirmAction() {
    if (typeof this.confirmCallback === 'function') {
      this.confirmCallback();
    }
    this.closeConfirmModal();
  },

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'flex items-center space-x-3 px-4 py-3 rounded-2xl shadow-xl border glass-card text-sm font-semibold toast-enter pointer-events-auto';

    let iconHtml = '';
    if (type === 'success') {
      toast.classList.add('border-emerald-200', 'dark:border-emerald-800', 'text-emerald-900', 'dark:text-emerald-200');
      iconHtml = '<div class="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0"><i data-lucide="check" class="w-4 h-4"></i></div>';
    } else if (type === 'error') {
      toast.classList.add('border-rose-200', 'dark:border-rose-800', 'text-rose-900', 'dark:text-rose-200');
      iconHtml = '<div class="w-7 h-7 rounded-full bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0"><i data-lucide="alert-circle" class="w-4 h-4"></i></div>';
    } else {
      toast.classList.add('border-sky-200', 'dark:border-sky-800', 'text-sky-900', 'dark:text-sky-200');
      iconHtml = '<div class="w-7 h-7 rounded-full bg-sky-100 dark:bg-sky-900/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0"><i data-lucide="info" class="w-4 h-4"></i></div>';
    }

    toast.innerHTML = `
      ${iconHtml}
      <span class="flex-1">${message}</span>
      <button class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg" onclick="this.parentElement.remove()">
        <i data-lucide="x" class="w-3.5 h-3.5"></i>
      </button>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
      toast.classList.remove('toast-enter');
      toast.classList.add('toast-leave');
      setTimeout(() => toast.remove(), 250);
    }, 3500);
  },

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindGlobalEvents() {
    // Format currency input dynamically on amount fields
    const formatCurrencyInput = (elId) => {
      const el = document.getElementById(elId);
      if (el) {
        el.addEventListener('input', (e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val) {
            e.target.value = new Intl.NumberFormat('id-ID').format(val);
          } else {
            e.target.value = '';
          }
        });
      }
    };

    formatCurrencyInput('trx-amount');
    formatCurrencyInput('debt-input-amount');
    formatCurrencyInput('debt-input-paid');
    formatCurrencyInput('pay-debt-amount');
    formatCurrencyInput('add-wallet-balance');

    // Modal background click close
    window.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop-click')) {
        this.closeTransactionModal();
        this.closeFreeTierModal();
        this.closeGoogleModal();
        this.closeEditWalletModal();
        this.closeConfirmModal();
        this.closeAddDebtModal();
        this.closePayDebtModal();
        this.closeAddWalletModal();
        this.closeAddCategoryModal();
      }
    });

    // Keyboard ESC to close any modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeTransactionModal();
        this.closeFreeTierModal();
        this.closeGoogleModal();
        this.closeEditWalletModal();
        this.closeConfirmModal();
        this.closeAddDebtModal();
        this.closePayDebtModal();
        this.closeAddWalletModal();
        this.closeAddCategoryModal();
      }
    });
  }
};

// Auto start when DOM ready
document.addEventListener('DOMContentLoaded', () => {
  FinFloApp.init();
});
