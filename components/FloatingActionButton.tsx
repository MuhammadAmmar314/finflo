'use client';

import React from 'react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
  onClick: () => void;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      aria-label="Catat Transaksi Baru"
      className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-emerald-500 px-4 py-3 text-white shadow-xl shadow-brand-500/30 transition-all hover:scale-105 hover:shadow-brand-500/50 active:scale-95 md:bottom-8 md:right-8"
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20">
        <Plus className="h-4 w-4 stroke-[3]" />
      </div>
      <span className="text-sm font-bold tracking-wide">Catat</span>
    </button>
  );
};
