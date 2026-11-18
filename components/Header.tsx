'use client';

import React from 'react';
import Image from 'next/image';
import { Moon, Sun, Crown, Sparkles, LogOut, HelpCircle } from 'lucide-react';
import { User, TabType } from '@/lib/types';

interface HeaderProps {
  user: User;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onOpenUpgrade: () => void;
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onTabChange,
  darkMode,
  onToggleDarkMode,
  onLogout,
  onOpenUpgrade,
  onOpenTour,
}) => {
  const firstName = user.name ? user.name.split(' ')[0] : 'User';
  const isPro = user.plan === 'pro';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/85 px-4 py-3 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/85 sm:px-6">
      {/* Brand & Greeting */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 md:hidden">
          <Image
            src="/assets/logo-icon.svg"
            alt="FinFlo Logo"
            width={32}
            height={32}
            className="h-8 w-8"
            priority
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-900 dark:text-white sm:text-lg">
              Welcome, {firstName}!
            </h1>
            {isPro ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-xs font-semibold text-white shadow-sm">
                <Crown className="h-3 w-3" />
                Pro Plan
              </span>
            ) : (
              <button
                onClick={onOpenUpgrade}
                className="group inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 transition hover:bg-brand-50 hover:text-brand-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-brand-400"
                title="Klik untuk upgrade ke FinFlo Pro"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                Free Tier
                <Sparkles className="h-2.5 w-2.5 text-amber-500 transition-transform group-hover:scale-125" />
              </button>
            )}
          </div>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {isPro
              ? 'Akses penuh ke semua fitur FinFlo Pro'
              : 'Maks. 3 dompet & 8 kategori pengeluaran'}
          </p>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Help / Onboarding Tour Button */}
        {onOpenTour && (
          <button
            onClick={onOpenTour}
            aria-label="Buka panduan awal"
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Buka Panduan Awal (Tour)"
          >
            <HelpCircle className="h-4 w-4 text-brand-500" />
            <span className="hidden lg:inline">Panduan</span>
          </button>
        )}

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          aria-label="Toggle dark mode"
          className="rounded-xl border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        >
          {darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
        </button>

        {/* User Profile Avatar */}
        <button
          onClick={() => onTabChange('profile')}
          className="flex items-center gap-2 rounded-xl p-1 transition hover:bg-slate-100 dark:hover:bg-slate-800"
          title="Buka Profil Pengguna"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
            alt={user.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-brand-500/20"
          />
        </button>

        {/* Quick Logout Button */}
        <button
          onClick={onLogout}
          aria-label="Logout"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-400 dark:hover:bg-rose-900/50"
          title="Keluar dari Akun"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Keluar</span>
        </button>
      </div>
    </header>
  );
};
