'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  User as UserIcon,
  Crown,
  Check,
  ShieldCheck,
  Sparkles,
  Zap,
  Download,
  Upload,
  RotateCcw,
  Moon,
  Sun,
  Database,
  Compass,
  RefreshCw,
  LogOut,
  KeyRound,
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { User, Wallet, ExpenseCategory, Transaction, SavingsGoal } from '@/lib/types';

interface ProfileTabProps {
  user: User;
  wallets: Wallet[];
  expenseCategories: ExpenseCategory[];
  transactions: Transaction[];
  debts?: any[];
  savingsGoals?: SavingsGoal[];
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenUpgrade: () => void;
  onResetData: () => void;
  onRestoreData: (data: {
    wallets?: Wallet[];
    expenseCategories?: ExpenseCategory[];
    transactions?: Transaction[];
    debts?: any[];
    savingsGoals?: SavingsGoal[];
  }) => void;
  onSyncDatabase?: () => Promise<boolean>;
  onOpenTour?: () => void;
  onLogout?: () => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  user,
  wallets,
  expenseCategories,
  transactions,
  debts = [],
  savingsGoals = [],
  darkMode,
  onToggleDarkMode,
  onOpenUpgrade,
  onResetData,
  onRestoreData,
  onSyncDatabase,
  onOpenTour,
  onLogout,
}) => {
  const isPro = user.plan === 'pro';
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Change Password Modal State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'request' | 'verify'>('request');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [devCode, setDevCode] = useState<string | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleExportJSON = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user,
      wallets,
      expenseCategories,
      transactions,
      debts,
      savingsGoals,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflo-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.wallets && json.transactions) {
          onRestoreData(json);
          alert('Data berhasil dipulihkan!');
        } else {
          alert('Format file cadangan tidak valid.');
        }
      } catch {
        alert('Gagal membaca file JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSync = async () => {
    if (!onSyncDatabase) return;
    setIsSyncing(true);
    try {
      const ok = await onSyncDatabase();
      if (ok) {
        alert('Data berhasil disinkronkan ke database PostgreSQL!');
      } else {
        alert('Sinkronisasi database gagal. Pastikan DATABASE_URL telah dikonfigurasi.');
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRequestPasswordOtp = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    setPasswordLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Gagal mengirim kode verifikasi.');
        return;
      }

      setDevCode(data.devCode || null);
      setPasswordStep('verify');
      setCountdown(60);
      setPasswordSuccess(`Kode verifikasi 6 digit telah dikirim ke ${user.email}`);
    } catch {
      setPasswordError('Gagal menghubungi server.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    const cleanCode = otpCode.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      setPasswordError('Masukkan 6 digit kode verifikasi.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordError('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
          code: cleanCode,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Kode verifikasi salah atau telah kedaluwarsa.');
        return;
      }

      setPasswordSuccess('Kata sandi berhasil diperbarui!');
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordStep('request');
        setOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');
        setPasswordSuccess('');
      }, 1500);
    } catch {
      setPasswordError('Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Header Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900 text-center flex flex-col items-center">
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
            alt={user.name}
            className="h-24 w-24 rounded-full object-cover ring-4 ring-brand-500/20 shadow-md"
          />
          {isPro && (
            <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md">
              <Crown className="h-4 w-4" />
            </div>
          )}
        </div>

        <h2 className="mt-4 text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          {user.name}
        </h2>
        <p className="text-xs text-slate-500">{user.email}</p>

        <div className="mt-3 flex items-center gap-2">
          {isPro ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 text-xs font-bold text-white shadow-sm">
              <Crown className="h-3.5 w-3.5" />
              Paket FinFlo Pro
            </span>
          ) : (
            <button
              onClick={onOpenUpgrade}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:border-brand-500 hover:text-brand-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Paket Free Tier</span>
              <Sparkles className="h-3 w-3 text-amber-500" />
            </button>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <span>Anggota FinFlo sejak: <strong>{user.memberSince || 'Januari 2026'}</strong></span>
          <span>•</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Akun Terverifikasi
          </span>
        </div>
      </div>

      {/* Feature Comparison Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Detail Fitur: Free Tier vs FinFlo Pro
            </h3>
            <p className="text-xs text-slate-500">
              Perbandingan hak akses dan kemampuan fitur
            </p>
          </div>
          {!isPro && (
            <button
              onClick={onOpenUpgrade}
              className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <Zap className="h-3 w-3 fill-white" />
              <span>Upgrade Rp 49rb</span>
            </button>
          )}
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Batas Dompet (Wallets)</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              <strong className="text-slate-500">3 Dompet (Free)</strong> / <span className="text-brand-600 dark:text-brand-400">Unlimited di Pro</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Batas Kategori Pengeluaran</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              <strong className="text-slate-500">8 Kategori Dasar (Free)</strong> / <span className="text-brand-600 dark:text-brand-400">Custom Tak Terbatas di Pro</span>
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Pencatatan Pemasukan, Pengeluaran &amp; Transfer</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Tak Terbatas
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Lacak Hutang, Piutang &amp; Paylater</span>
            <span className="font-semibold">
              {isPro ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  Aktif Penuh
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Khusus Pro</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Audit Kesehatan Finansial &amp; 6 Pilar</span>
            <span className="font-semibold">
              {isPro ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                  Aktif Penuh
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-semibold">Khusus Pro</span>
              )}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <span className="text-slate-600 dark:text-slate-300 font-medium">Ekspor Data CSV &amp; Grafik Dinamis</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Check className="h-3.5 w-3.5 stroke-[3]" />
              Termasuk
            </span>
          </div>
        </div>
      </div>

      {/* Security & Password Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Keamanan Akun &amp; Kata Sandi
          </h3>
          <p className="text-xs text-slate-500">
            Kelola kata sandi akun dengan verifikasi email resmi
          </p>
        </div>

        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm">
              <KeyRound className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Ubah Kata Sandi</h4>
              <p className="text-[11px] text-slate-500">
                Memerlukan verifikasi kode OTP yang dikirimkan ke email {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setIsPasswordModalOpen(true);
              setPasswordStep('request');
              setPasswordError('');
              setPasswordSuccess('');
              setOtpCode('');
              setNewPassword('');
              setConfirmNewPassword('');
            }}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
          >
            <span>Ubah Kata Sandi</span>
          </button>
        </div>
      </div>

      {/* Settings & Data Management Card */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Pengaturan &amp; Manajemen Data
          </h3>
          <p className="text-xs text-slate-500">
            Sinkronkan ke database, ubah tema, atau cadangkan data
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {/* Database Sync */}
          {onSyncDatabase && (
            <div className="flex items-center justify-between rounded-2xl border border-brand-500/20 bg-brand-50/50 p-4 dark:border-brand-500/20 dark:bg-brand-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 text-white shadow-sm">
                  <Database className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Database PostgreSQL</h4>
                  <p className="text-[11px] text-slate-500">
                    Sinkronkan data lokal Anda langsung ke server database Prisma
                  </p>
                </div>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="flex items-center gap-1.5 rounded-xl bg-brand-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Menyinkronkan...' : 'Sinkronkan'}</span>
              </button>
            </div>
          )}

          {/* Tour Guide */}
          {onOpenTour && (
            <div className="flex items-center justify-between rounded-2xl border border-sky-500/20 bg-sky-50/50 p-4 dark:border-sky-500/20 dark:bg-sky-950/20">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500 text-white shadow-sm">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Panduan Tour Aplikasi</h4>
                  <p className="text-[11px] text-slate-500">
                    Buka kembali langkah awal pengoperasian FinFlo
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenTour}
                className="flex items-center gap-1.5 rounded-xl border border-sky-200 bg-white px-3 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:bg-slate-800 dark:text-sky-300 cursor-pointer"
              >
                <span>Buka Tur</span>
              </button>
            </div>
          )}

          {/* Dark Mode Switch */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tema Tampilan</h4>
              <p className="text-[11px] text-slate-500">
                {darkMode ? 'Mode Gelap Aktif (Dark UI)' : 'Mode Terang Aktif (Clean Light)'}
              </p>
            </div>
            <button
              onClick={onToggleDarkMode}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              <span>Ganti Tema</span>
            </button>
          </div>

          {/* Backup JSON */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Cadangkan Data (JSON)</h4>
              <p className="text-[11px] text-slate-500">
                Unduh seluruh catatan transaksi, dompet, dan tagihan ke berkas JSON
              </p>
            </div>
            <button
              onClick={handleExportJSON}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh JSON</span>
            </button>
          </div>

          {/* Restore JSON */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Pulihkan Data (JSON)</h4>
              <p className="text-[11px] text-slate-500">
                Impor data dari berkas cadangan JSON yang pernah Anda unduh
              </p>
            </div>
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Unggah JSON</span>
              </button>
            </div>
          </div>

          {/* Reset Demo Data */}
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Reset ke Data Awal Demo</h4>
              <p className="text-[11px] text-slate-500">
                Kembalikan data transaksi &amp; dompet ke simulasi awal Budi Pratama
              </p>
            </div>
            <button
              onClick={onResetData}
              className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-100 dark:border-amber-900/40 dark:bg-amber-950/40 dark:text-amber-400 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Data</span>
            </button>
          </div>

          {/* Logout Button */}
          <div className="flex items-center justify-between rounded-2xl border border-rose-100 bg-rose-50/40 p-4 dark:border-rose-900/30 dark:bg-rose-950/20">
            <div>
              <h4 className="text-xs font-bold text-rose-700 dark:text-rose-400">Keluar dari Akun</h4>
              <p className="text-[11px] text-slate-500">
                Akhiri sesi login Anda di perangkat ini
              </p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-rose-700 active:scale-95 cursor-pointer"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 animate-scaleIn">
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-2">
                <KeyRound className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Ubah Kata Sandi Akun
              </h3>
              <p className="text-xs text-slate-500">
                Demi keamanan, kami akan mengirimkan kode verifikasi 6 digit ke email Anda.
              </p>
            </div>

            {passwordError && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-50 p-2.5 text-xs text-rose-600 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="mt-3 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-50 p-2.5 text-xs text-emerald-600 dark:border-emerald-900/40 dark:bg-emerald-950/30 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordStep === 'request' ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-800/40">
                  <span className="text-slate-500">Alamat email terdaftar:</span>
                  <div className="font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                    {user.email}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRequestPasswordOtp}
                  disabled={passwordLoading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-xs font-bold text-white shadow-md shadow-amber-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${passwordLoading ? 'animate-spin' : ''}`} />
                  <span>{passwordLoading ? 'Mengirim Kode...' : 'Kirim Kode Verifikasi ke Email'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3">
                {devCode && (
                  <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-2 text-center text-xs text-sky-600 dark:text-sky-300">
                    <span className="font-bold">Mode Simulasi: </span>
                    <button
                      type="button"
                      onClick={() => setOtpCode(devCode)}
                      className="font-mono font-bold underline cursor-pointer"
                    >
                      {devCode}
                    </button>
                  </div>
                )}

                <div>
                  <label className="block text-center text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Kode Verifikasi (6 Digit)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl rounded-xl border border-slate-200 bg-slate-50 py-2 text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Kata Sandi Baru (Min. 6 Karakter)
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passwordLoading || otpCode.length !== 6 || newPassword.length < 6}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-xs font-bold text-white shadow-md shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{passwordLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={handleRequestPasswordOtp}
                    disabled={countdown > 0 || passwordLoading}
                    className="text-[11px] text-slate-500 hover:text-amber-600 dark:hover:text-amber-400 disabled:opacity-50 cursor-pointer"
                  >
                    {countdown > 0 ? `Kirim ulang kode dalam ${countdown}s` : 'Kirim ulang kode verifikasi'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
