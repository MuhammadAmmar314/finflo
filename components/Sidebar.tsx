'use client';

import React from 'react';
import Image from 'next/image';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  Sparkles,
  User as UserIcon,
  Crown,
  ChevronRight,
} from 'lucide-react';
import { TabType, User } from '@/lib/types';

interface SidebarProps {
  user: User;
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  onOpenUpgrade: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  activeTab,
  onTabChange,
  onOpenUpgrade,
}) => {
  const isPro = user.plan === 'pro';

  const navItems: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    proOnly?: boolean;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { id: 'debts', label: 'Hutang & Paylater', icon: CreditCard, proOnly: true, badge: 'PRO' },
    { id: 'wallets', label: 'Dompet & Kategori', icon: Wallet },
    { id: 'recommendations', label: 'Rekomendasi Finansial', icon: Sparkles, proOnly: true, badge: 'PRO' },
    { id: 'profile', label: 'Profil Saya', icon: UserIcon },
  ];

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-40 border-r border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/90 transition-colors">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-200/60 dark:border-slate-800/60">
        <Image
          src="/assets/logo-icon.svg"
          alt="FinFlo Icon"
          width={34}
          height={34}
          className="h-8 w-8"
          priority
        />
        <div>
          <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
            Fin<span className="text-brand-500">Flo</span>
          </span>
          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            Financial Planner
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 space-y-1.5 px-3 py-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/30'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 text-left min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="text-left truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ml-1.5 ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : isPro
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                      : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Pro Plan Upsell Card / Status in Sidebar footer */}
      <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/60">
        {isPro ? (
          <div className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent p-4 dark:border-amber-500/20">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Crown className="h-5 w-5" />
              <span className="text-xs font-bold uppercase tracking-wider">FinFlo Pro Aktif</span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Semua fitur premium terbuka tanpa batas.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-brand-500/20 bg-gradient-to-br from-brand-50 via-white to-emerald-50/50 p-4 dark:border-brand-500/20 dark:from-slate-800/80 dark:to-brand-950/20">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 dark:text-brand-400">
                <Sparkles className="h-3.5 w-3.5" />
                Upgrade ke Pro
              </span>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-700 dark:bg-brand-900/60 dark:text-brand-300">
                Rp 49rb
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">
              Buka kuota dompet tanpa batas, lacak hutang, dan rekomendasi finansial.
            </p>
            <button
              onClick={onOpenUpgrade}
              className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-brand-500 to-emerald-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-brand-500/25 transition hover:brightness-110 active:scale-95 cursor-pointer"
            >
              <span>Upgrade Sekarang</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
