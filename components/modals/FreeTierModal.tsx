'use client';

import React, { useState } from 'react';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  Key,
  ArrowLeft,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';

interface FreeTierModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradePro: (method: 'direct' | 'voucher', code?: string) => Promise<boolean> | boolean | void;
  userEmail?: string;
  featureTitle?: string;
  featureDescription?: string;
}

type ModalStep = 'overview' | 'voucher';

const LYNK_URL =
  process.env.NEXT_PUBLIC_LYNK_PRO_URL || 'https://lynk.id/finflo/finflo-pro';

export const FreeTierModal: React.FC<FreeTierModalProps> = ({
  isOpen,
  onClose,
  onUpgradePro,
  userEmail,
  featureTitle = 'Buka Seluruh Potensi Finansial Anda',
  featureDescription = 'Tingkatkan ke FinFlo Pro untuk akses fitur eksklusif tanpa batasan kuota.',
}) => {
  const [step, setStep] = useState<ModalStep>('overview');
  const [voucherCode, setVoucherCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    setStep('overview');
    setVoucherCode('');
    setIsProcessing(false);
    setStatusMessage(null);
    onClose();
  };

  const proFeatures = [
    'Dompet tanpa batas (BCA, Mandiri, BRI, Jago, GoPay, OVO, TapCash, dll)',
    'Kategori kustom tanpa batas dan evaluasi anggaran adaptif',
    'Fitur lacak hutang, piutang, dan paylater terpadu',
    'Evaluasi kesehatan finansial dan audit alokasi anggaran',
    'Simulasi target tabungan dan cetak laporan PDF resmi',
    'Akses seumur hidup (lifetime) : sekali bayar, bebas biaya bulanan',
  ];

  const handleOpenLynk = () => {
    window.open(LYNK_URL, '_blank', 'noopener,noreferrer');
  };

  const handleCheckStatus = async () => {
    if (!userEmail) return;
    setIsCheckingStatus(true);
    setStatusMessage(null);

    try {
      const res = await fetch(`/api/auth/me?email=${encodeURIComponent(userEmail)}`);
      const json = await res.json();

      if (json?.data?.plan === 'pro') {
        setStatusMessage('Status Pro terdeteksi. Mengaktifkan akun Anda...');
        await onUpgradePro('direct');
        handleClose();
      } else {
        setStatusMessage(
          'Pembayaran belum terdeteksi. Silakan selesaikan pembayaran di Lynk.id, lalu coba periksa kembali.'
        );
        setTimeout(() => setStatusMessage(null), 5000);
      }
    } catch {
      setStatusMessage('Gagal menghubungi server. Silakan coba beberapa saat lagi.');
      setTimeout(() => setStatusMessage(null), 4000);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleApplyVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    setIsProcessing(true);
    try {
      const success = await onUpgradePro('voucher', voucherCode.trim());
      if (success !== false) {
        handleClose();
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const copyEmail = () => {
    if (!userEmail) return;
    navigator.clipboard?.writeText(userEmail);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-white p-6 shadow-2xl dark:border-amber-500/30 dark:bg-slate-900 animate-scaleIn overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Decorative corner glow */}
        <div className="absolute -top-16 -right-16 h-36 w-36 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 opacity-20 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          aria-label="Tutup jendela upgrade"
          className="absolute right-4 top-4 rounded-xl p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200 z-10 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Back Button if in voucher step */}
        {step !== 'overview' && (
          <button
            onClick={() => setStep('overview')}
            className="mb-3 flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Kembali ke Informasi Paket</span>
          </button>
        )}

        {/* STEP 1: OVERVIEW */}
        {step === 'overview' && (
          <div>
            {/* Header Icon */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30">
                <Crown className="h-6 w-6" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
                  <Sparkles className="h-3 w-3" />
                  FINFLO PRO LIFETIME
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white sm:text-xl">
                  {featureTitle}
                </h3>
              </div>
            </div>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
              {featureDescription}
            </p>

            {/* Feature list */}
            <div className="mt-4 rounded-2xl border border-amber-500/20 bg-amber-50/50 p-4 dark:border-amber-500/20 dark:bg-amber-950/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300">
                Keuntungan FinFlo Pro Seumur Hidup:
              </h4>
              <ul className="mt-2.5 space-y-2">
                {proFeatures.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200">
                    <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                      <Check className="h-2.5 w-2.5 stroke-[3]" />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Pricing Banner */}
            <div className="mt-5 rounded-2xl bg-slate-900 p-4 text-white dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Harga Promo Sekali Bayar</div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl font-black text-amber-400">Rp 49.000</span>
                    <span className="text-xs text-slate-400 line-through">Rp 149.000</span>
                    <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                      Hemat 67%
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-300">
                    Akses Selamanya
                  </span>
                </div>
              </div>

              {/* Email sync hint */}
              {userEmail && (
                <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-800/80 px-3 py-2 text-xs border border-slate-700/60">
                  <div className="text-[11px] text-slate-300 truncate">
                    Email akun Anda: <strong className="text-amber-300">{userEmail}</strong>
                  </div>
                  <button
                    onClick={copyEmail}
                    className="flex items-center gap-1 text-[10px] font-semibold text-slate-300 hover:text-white shrink-0 ml-2 cursor-pointer"
                    title="Salin email untuk pembayaran di Lynk.id"
                  >
                    <Copy className="h-3 w-3" />
                    <span>{copiedEmail ? 'Tersalin' : 'Salin'}</span>
                  </button>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3.5 space-y-2">
                <button
                  onClick={handleOpenLynk}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-95 cursor-pointer"
                >
                  <span>Beli Akses Pro di Lynk.id</span>
                  <ExternalLink className="h-4 w-4" />
                </button>

                <button
                  onClick={handleCheckStatus}
                  disabled={isCheckingStatus}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/90 px-4 py-2.5 text-xs font-semibold text-slate-200 transition hover:bg-slate-700 hover:text-white active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>
                    {isCheckingStatus ? 'Memeriksa status pembayaran...' : 'Sudah Bayar? Cek Status Akun'}
                  </span>
                </button>
              </div>

              {statusMessage && (
                <div className="mt-2.5 rounded-lg bg-slate-800 p-2 text-center text-[11px] text-amber-300 border border-slate-700">
                  {statusMessage}
                </div>
              )}
            </div>

            {/* Voucher Option */}
            <div className="mt-4 flex items-center justify-center text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep('voucher')}
                className="flex items-center gap-1.5 font-semibold text-slate-600 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400 cursor-pointer"
              >
                <Key className="h-3.5 w-3.5" />
                <span>Punya Kode Lisensi dari Email atau Kupon?</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: VOUCHER / LICENSE CODE ACTIVATION */}
        {step === 'voucher' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400 mb-2">
                <Key className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Aktivasi Kode Lisensi
              </h3>
              <p className="text-xs text-slate-500">
                Masukkan kode lisensi resmi yang Anda peroleh melalui email setelah pembelian.
              </p>
            </div>

            <form onSubmit={handleApplyVoucher} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Kode Lisensi / Kupon Pro
                </label>
                <div className="mt-1 relative">
                  <input
                    type="text"
                    required
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                    placeholder="Contoh: FINFLO-7K8P-9M2Q-W4XR"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm uppercase tracking-wider text-slate-900 outline-none focus:border-amber-500 focus:bg-white dark:border-slate-800 dark:bg-slate-800 dark:text-white"
                  />
                  <div className="absolute right-3 top-3 text-[10px] font-bold text-amber-500">
                    VIP
                  </div>
                </div>
              </div>

              {userEmail && (
                <div className="rounded-xl bg-slate-50 p-2.5 text-[11px] text-slate-500 dark:bg-slate-800/40">
                  Lisensi akan ditautkan ke email: <strong>{userEmail}</strong>
                </div>
              )}

              <button
                type="submit"
                disabled={isProcessing || !voucherCode.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-xs font-bold text-white shadow-lg shadow-amber-500/30 transition hover:brightness-110 active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Memverifikasi Lisensi...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 fill-white" />
                    <span>Verifikasi dan Klaim Akses Pro</span>
                  </>
                )}
              </button>
            </form>

            <button
              onClick={() => setStep('overview')}
              className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white py-1 cursor-pointer"
            >
              Kembali ke Informasi Paket
            </button>
          </div>
        )}

        {/* Security badge footer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-slate-400 pt-3 border-t border-slate-100 dark:border-slate-800">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
          <span>Akses instan seumur hidup : Garansi pembaruan fitur FinFlo</span>
        </div>
      </div>
    </div>
  );
};
