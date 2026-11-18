'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Zap,
  Eye,
  EyeOff,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
  AlertTriangle,
  KeyRound,
} from 'lucide-react';
import { User } from '@/lib/types';
import { defaultUser } from '@/lib/defaultData';

interface LoginViewProps {
  onLoginSuccess: (user: User) => void;
}

type AuthMode = 'login' | 'signup' | 'verify' | 'forgot' | 'reset';

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Email verification state
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [devCode, setDevCode] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  // Reset password state
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Handle countdown timer for resending verification code
  useEffect(() => {
    if (countdown <= 0) return;
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [countdown]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }
    if (!password) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      // Handle unverified user redirecting to OTP verification screen
      if (data.requiresVerification) {
        setVerificationEmail(email.trim().toLowerCase());
        setDevCode(data.devCode || null);
        setCountdown(60);
        setAuthMode('verify');
        setErrorMessage('');
        setSuccessMessage('Email Anda belum terverifikasi. Masukkan kode 6 digit yang telah dikirim.');
        setIsLoading(false);
        return;
      }

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Gagal masuk. Periksa email dan kata sandi Anda.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(data.data);
    } catch {
      setErrorMessage(
        'Tidak dapat terhubung ke server aplikasi / database. Pastikan PostgreSQL di DraGon/komputer Anda sudah aktif.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage('Nama lengkap wajib diisi.');
      return;
    }
    if (!email || !email.includes('@')) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        if (res.status === 500) {
          const fallbackUser: User = {
            name: name.trim(),
            email,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name.trim())}&background=0ea5e9&color=fff`,
            plan: 'free',
            memberSince: 'Februari 2026',
          };
          onLoginSuccess(fallbackUser);
          return;
        }

        setErrorMessage(data.error || 'Gagal mendaftar akun.');
        setIsLoading(false);
        return;
      }

      if (data.requiresVerification) {
        setVerificationEmail(email.trim().toLowerCase());
        setDevCode(data.devCode || null);
        setCountdown(60);
        setAuthMode('verify');
        setVerifyCode('');
        setSuccessMessage('Kode verifikasi 6 digit telah dikirim ke email Anda.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(data.data);
    } catch {
      setErrorMessage(
        'Tidak dapat terhubung ke server aplikasi / database. Pastikan PostgreSQL di DraGon/komputer Anda sudah aktif.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanCode = verifyCode.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Masukkan 6 digit kode verifikasi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, code: cleanCode }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Kode verifikasi salah atau telah kedaluwarsa.');
        setIsLoading(false);
        return;
      }

      onLoginSuccess(data.data);
    } catch {
      setErrorMessage('Terjadi kesalahan saat memverifikasi kode. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !email.includes('@')) {
      setErrorMessage('Masukkan alamat email yang valid.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Pengguna dengan email ini tidak ditemukan.');
        setIsLoading(false);
        return;
      }

      setVerificationEmail(email.trim().toLowerCase());
      setDevCode(data.devCode || null);
      setCountdown(60);
      setAuthMode('reset');
      setResetCode('');
      setNewPassword('');
      setConfirmNewPassword('');
      setSuccessMessage('Kode verifikasi reset kata sandi telah dikirim ke email Anda.');
    } catch {
      setErrorMessage('Gagal menghubungi server. Silakan coba beberapa saat lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const cleanCode = resetCode.replace(/\D/g, '').trim();
    if (cleanCode.length !== 6) {
      setErrorMessage('Masukkan 6 digit kode verifikasi.');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMessage('Kata sandi baru minimal 6 karakter.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: verificationEmail,
          code: cleanCode,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Gagal mereset kata sandi. Periksa kode verifikasi.');
        setIsLoading(false);
        return;
      }

      setAuthMode('login');
      setPassword('');
      setConfirmPassword('');
      setSuccessMessage('Kata sandi Anda berhasil diperbarui. Silakan masuk.');
    } catch {
      setErrorMessage('Terjadi kesalahan saat memperbarui kata sandi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0 || isLoading) return;

    setErrorMessage('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      const endpoint = authMode === 'reset' ? '/api/auth/forgot-password' : '/api/auth/resend-code';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Gagal mengirim ulang kode.');
        setIsLoading(false);
        return;
      }

      if (data.devCode) {
        setDevCode(data.devCode);
      }
      setCountdown(60);
      setSuccessMessage('Kode verifikasi baru telah dikirim ke email Anda.');
    } catch {
      setErrorMessage('Gagal menghubungi server untuk kirim ulang kode.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(defaultUser);
    }, 250);
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900">
      <div className="absolute top-1/4 -left-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-500/20 to-emerald-500/20 border border-brand-500/30 p-2 shadow-inner">
              <Image
                src="/assets/logo-icon.svg"
                alt="FinFlo Icon"
                width={48}
                height={48}
                className="h-10 w-10 drop-shadow-md"
                priority
              />
            </div>
            <h1 className="mt-4 text-2xl font-black tracking-tight text-white sm:text-3xl">
              Fin<span className="text-brand-400">Flo</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm font-medium text-slate-400">
              Your Smart Financial Flow &amp; Planner
            </p>
          </div>

          {/* Tab selector for Login / Signup */}
          {(authMode === 'login' || authMode === 'signup') && (
            <div className="mt-6 flex rounded-2xl bg-slate-800/80 p-1">
              <button
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Masuk
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage('');
                  setSuccessMessage('');
                }}
                className={`flex-1 rounded-xl py-2 text-xs font-bold transition cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Daftar Akun Baru
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-500/40 bg-rose-500/15 p-3.5 text-xs text-rose-300">
              <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
              <span className="leading-relaxed">{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* MODE 1: VERIFY SIGNUP CODE */}
          {authMode === 'verify' && (
            <div className="mt-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-400 mb-2">
                  <Mail className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-white">Verifikasi Email Anda</h2>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Masukkan 6 digit kode OTP yang kami kirimkan ke alamat:
                </p>
                <p className="mt-0.5 font-medium text-xs text-brand-300 break-all">
                  {verificationEmail}
                </p>
              </div>

              {devCode && (
                <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-center text-xs text-sky-200">
                  <span className="font-semibold text-sky-400">Mode Simulasi Dev:</span>{' '}
                  Kode verifikasi Anda adalah{' '}
                  <button
                    type="button"
                    onClick={() => setVerifyCode(devCode)}
                    className="font-mono font-bold tracking-wider text-sky-300 underline hover:text-white cursor-pointer"
                    title="Klik untuk mengisi otomatis"
                  >
                    {devCode}
                  </button>
                </div>
              )}

              <form onSubmit={handleVerifySubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-center text-xs font-semibold text-slate-300 mb-2">
                    Kode Verifikasi (6 Digit)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={verifyCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setVerifyCode(val);
                    }}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-2xl rounded-xl border border-slate-700 bg-slate-800/80 py-3 text-white placeholder-slate-600 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || verifyCode.trim().length !== 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Memverifikasi...' : 'Konfirmasi & Masuk'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-300 disabled:opacity-50 transition cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {countdown > 0
                      ? `Kirim ulang kode dalam ${countdown}s`
                      : 'Kirim ulang kode'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                    setVerifyCode('');
                    setDevCode(null);
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 2: FORGOT PASSWORD (REQUEST OTP) */}
          {authMode === 'forgot' && (
            <div className="mt-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-2">
                  <KeyRound className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-white">Lupa Kata Sandi</h2>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Masukkan alamat email akun Anda. Kami akan mengirimkan 6 digit kode verifikasi untuk mereset kata sandi.
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Alamat Email Terdaftar
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      required
                      autoFocus
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-2.5 text-sm font-bold text-white shadow-md shadow-amber-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Mengirim Kode...' : 'Kirim Kode Verifikasi'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 text-center pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Kembali ke Halaman Masuk</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 3: RESET PASSWORD (VERIFY OTP + ENTER NEW PASSWORD) */}
          {authMode === 'reset' && (
            <div className="mt-6">
              <div className="rounded-2xl border border-slate-800 bg-slate-800/40 p-4 text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/20 text-amber-400 mb-2">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <h2 className="text-base font-bold text-white">Buat Kata Sandi Baru</h2>
                <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                  Kode verifikasi telah dikirim ke <span className="text-brand-300 font-semibold">{verificationEmail}</span>
                </p>
              </div>

              {devCode && (
                <div className="mt-3 rounded-xl border border-sky-500/30 bg-sky-500/10 p-3 text-center text-xs text-sky-200">
                  <span className="font-semibold text-sky-400">Mode Simulasi Dev:</span>{' '}
                  Kode verifikasi Anda adalah{' '}
                  <button
                    type="button"
                    onClick={() => setResetCode(devCode)}
                    className="font-mono font-bold tracking-wider text-sky-300 underline hover:text-white cursor-pointer"
                  >
                    {devCode}
                  </button>
                </div>
              )}

              <form onSubmit={handleResetPasswordSubmit} className="mt-4 space-y-3.5">
                <div>
                  <label className="block text-center text-xs font-semibold text-slate-300 mb-1">
                    Kode Verifikasi (6 Digit)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoFocus
                    required
                    value={resetCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setResetCode(val);
                    }}
                    placeholder="••••••"
                    className="w-full text-center tracking-[0.5em] font-mono font-bold text-xl rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 text-white placeholder-slate-600 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Kata Sandi Baru (Min. 6 Karakter)
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || resetCode.length !== 6 || newPassword.length < 6}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                >
                  <span>{isLoading ? 'Menyimpan...' : 'Simpan Kata Sandi Baru'}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-4 flex flex-col gap-2 pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={countdown > 0 || isLoading}
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand-300 disabled:opacity-50 transition cursor-pointer"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>
                    {countdown > 0
                      ? `Kirim ulang kode dalam ${countdown}s`
                      : 'Kirim ulang kode'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setErrorMessage('');
                    setSuccessMessage('');
                  }}
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition cursor-pointer"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Batal &amp; Kembali ke Halaman Masuk</span>
                </button>
              </div>
            </div>
          )}

          {/* MODE 4: LOGIN FORM */}
          {authMode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="mt-5 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kata Sandi
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setErrorMessage('');
                      setSuccessMessage('');
                    }}
                    className="text-xs font-medium text-brand-400 hover:text-brand-300 transition cursor-pointer"
                  >
                    Lupa kata sandi?
                  </button>
                </div>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Memproses...' : 'Masuk ke Akun'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* MODE 5: SIGNUP FORM */}
          {authMode === 'signup' && (
            <form onSubmit={handleSignupSubmit} className="mt-5 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Nama Lengkap
                </label>
                <div className="relative mt-1">
                  <UserIcon className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Budi Pratama"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Alamat Email
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Kata Sandi (Minimal 6 Karakter)
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-10 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-10 pr-3 text-sm text-white placeholder-slate-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 py-2.5 text-sm font-bold text-white shadow-md shadow-brand-500/25 transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                <span>{isLoading ? 'Mendaftarkan...' : 'Daftar Sekarang'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}

          {/* Quick Demo Button for Local Testing */}
          <div className="mt-6 flex flex-col items-center gap-3 border-t border-slate-800/80 pt-4 text-center">
            <button
              type="button"
              onClick={handleQuickDemo}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-brand-400 transition cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              <span>Coba Demo 1-Klik (Pengembangan Cepat)</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Data tersimpan aman di database PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
