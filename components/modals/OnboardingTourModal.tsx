'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Wallet,
  PieChart,
  PlusCircle,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';
import { User } from '@/lib/types';

interface OnboardingTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartFirstWallet: () => void;
  user: User;
}

export const OnboardingTourModal: React.FC<OnboardingTourModalProps> = ({
  isOpen,
  onClose,
  onStartFirstWallet,
  user,
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const firstName = user.name ? user.name.split(' ')[0] : 'Sobat FinFlo';

  const steps = [
    {
      id: 'welcome',
      badge: 'Selamat Datang',
      icon: <Sparkles className="h-7 w-7 text-amber-400" />,
      iconBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
      title: `Halo ${firstName}, Selamat Datang di FinFlo!`,
      subtitle: 'Your Smart Financial Flow & Planner',
      description:
        'FinFlo membantu Anda mengontrol aliran uang, memantau saldo di berbagai rekening, serta menjaga kesehatan finansial dengan alokasi anggaran yang terencana.',
      highlights: [
        {
          title: 'Dompet Terpadu',
          desc: 'Pantau kas tunai, rekening bank, dan e-wallet dalam satu layar.',
        },
        {
          title: 'Budgeting Presisi',
          desc: 'Atur batas alokasi pengeluaran bulanan agar tidak bocor halus.',
        },
        {
          title: 'Analisis Cerdas',
          desc: 'Skor kesehatan finansial dan rekomendasi otomatis.',
        },
      ],
    },
    {
      id: 'wallet',
      badge: 'Langkah 1 dari 3',
      icon: <Wallet className="h-7 w-7 text-brand-400" />,
      iconBg: 'bg-brand-500/20 text-brand-400 border border-brand-500/30',
      title: '1. Buat Dompet / Sumber Dana Pertama',
      subtitle: 'Wadah dasar untuk menampung saldo dan mencatat transaksi',
      description:
        'Sebelum mencatat pengeluaran atau pemasukan, Anda memerlukan minimal satu dompet aktif. Dompet ini bisa berupa rekening bank utama, uang tunai, atau dompet digital.',
      tips: 'Setiap transaksi nantinya akan otomatis memotong atau menambah saldo dompet yang bersangkutan, sehingga pencatatan selalu akurat.',
    },
    {
      id: 'categories',
      badge: 'Langkah 2 dari 3',
      icon: <PieChart className="h-7 w-7 text-violet-400" />,
      iconBg: 'bg-violet-500/20 text-violet-400 border border-violet-500/30',
      title: '2. Rekomendasi 6 Pilar Anggaran (100%)',
      subtitle: 'Kendalikan pos pengeluaran bulanan secara proporsional',
      description:
        'FinFlo merekomendasikan batas anggaran berbasis 6 pilar agar keuangan tetap seimbang, dan masing-masing dapat Anda sesuaikan bebas:',
      pillars: [
        { name: 'Kos / Tempat Tinggal', pct: '28%', desc: 'Sewa, listrik, & air dasar' },
        { name: 'Makan & Minum', pct: '30%', desc: 'Pangan pokok & harian' },
        { name: 'Transportasi', pct: '12%', desc: 'Bensin & mobilitas kerja' },
        { name: 'Pulsa & Paket Data', pct: '5%', desc: 'Komunikasi & internet' },
        { name: 'Nabung & Investasi', pct: '20%', desc: 'Tabungan masa depan' },
        { name: 'Liburan & Jajan', pct: '5%', desc: 'Nongkrong & self reward' },
      ],
      tips: '6 pilar ini adalah acuan rekomendasi awal yang seimbang. Anda bebas mengubah persentasenya, menghapus, atau menambahkan pos kategori kustom baru di luar 6 pilar (seperti Zakat, Kesehatan, Cicilan, atau Hobi) melalui menu Dompet & Kategori.',
    },
    {
      id: 'transactions',
      badge: 'Langkah 3 dari 3',
      icon: <PlusCircle className="h-7 w-7 text-emerald-400" />,
      iconBg: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
      title: '3. Catat Transaksi & Pantau Dashboard',
      subtitle: 'Semua siap! Mulai perjalanan finansial cerdas Anda hari ini',
      description:
        'Gunakan tombol (+) di dashboard atau pojok kanan bawah setiap ada uang masuk, uang keluar, atau transfer antar rekening. Dashboard akan langsung merangkum cashflow dan skor kesehatan Anda.',
      tips: 'Konsistensi mencatat 1 menit setiap hari adalah kunci kebebasan finansial jangka panjang.',
    },
  ];

  const step = steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleStartNow = () => {
    onClose();
    onStartFirstWallet();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn"
    >
      <div className="relative w-full max-w-lg rounded-3xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-2xl dark:border-slate-800 dark:bg-slate-900 transition-all">
        {/* Skip / Close Button */}
        <button
          onClick={onClose}
          aria-label="Tutup panduan"
          className="absolute right-4 top-4 rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Badge & Progress Indicators */}
        <div className="flex items-center justify-between pr-8 mb-5">
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-600 dark:bg-brand-950/60 dark:text-brand-400">
            {step.badge}
          </span>
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentStep
                    ? 'w-6 bg-brand-500'
                    : 'w-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                }`}
                title={`Menuju langkah ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Step Icon & Header */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${step.iconBg}`}>
            {step.icon}
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {step.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {step.subtitle}
            </p>
          </div>
        </div>

        {/* Step Content */}
        <div className="mt-4 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {step.description}
          </p>

          {/* Highlights for Step 0 */}
          {step.highlights && (
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {step.highlights.map((item, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-500 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {item.title}:{' '}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 6 Pillars Grid for Step 2 */}
          {(step as any).pillars && (
            <div className="grid grid-cols-2 gap-2 pt-1">
              {(step as any).pillars.map((pillar: any, i: number) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/40"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-[11px] truncate">
                      {pillar.name}
                    </span>
                    <span className="font-mono font-extrabold text-indigo-600 dark:text-indigo-400 text-xs ml-1">
                      {pillar.pct}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">{pillar.desc}</p>
                </div>
              ))}
            </div>
          )}

          {/* Practical Tips Box for Step 1, 2, 3 */}
          {step.tips && (
            <div className="rounded-2xl border border-brand-500/20 bg-brand-50/50 p-3.5 text-xs text-brand-900 dark:border-brand-500/20 dark:bg-brand-950/30 dark:text-brand-200">
              <span className="font-bold">Tips FinFlo:</span> {step.tips}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            {!isFirstStep && (
              <button
                type="button"
                onClick={handlePrev}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isLastStep ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
                >
                  Lewati Tur
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/25 hover:bg-brand-600 active:scale-95 transition"
                >
                  <span>Lanjutkan</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleStartNow}
                className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-500 via-emerald-500 to-teal-500 px-6 py-2.5 text-xs font-black text-white shadow-lg shadow-brand-500/25 hover:brightness-110 active:scale-95 transition"
              >
                <span>Mulai Buat Dompet Pertama 🚀</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
