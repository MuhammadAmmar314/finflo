'use client';

import React from 'react';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Wallet,
  User as UserIcon,
} from 'lucide-react';
import { TabType } from '@/lib/types';

interface MobileNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs: {
    id: TabType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transaksi', icon: ArrowLeftRight },
    { id: 'debts', label: 'Hutang', icon: CreditCard },
    { id: 'wallets', label: 'Dompet', icon: Wallet },
    { id: 'profile', label: 'Profil', icon: UserIcon },
  ];

  return (
    <nav
      aria-label="Navigasi Utama Ponsel"
      className="fixed bottom-0 inset-x-0 z-30 block md:hidden border-t border-slate-200/80 bg-white/95 px-2 py-1.5 backdrop-blur-lg dark:border-slate-800/80 dark:bg-slate-900/95"
    >
      <div className="grid grid-cols-5 items-center">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                isActive
                  ? 'text-brand-500 font-bold'
                  : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'
              }`}
            >
              <div
                className={`relative flex items-center justify-center rounded-xl p-1 transition-all ${
                  isActive ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-400' : ''
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="mt-0.5 text-[11px] leading-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
