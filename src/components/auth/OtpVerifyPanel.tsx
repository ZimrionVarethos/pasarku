'use client';

import { ArrowLeft, CheckCircle, EnvelopeSimple, Key, ArrowsClockwise } from '@phosphor-icons/react';
import type { OtpDispatchData } from '@/lib/types/user';

interface Props {
  otpMeta: OtpDispatchData;
  otpCode: string;
  onOtpCodeChange: (val: string) => void;
  cooldownSeconds: number;
  isSubmitting: boolean;
  onResend: () => void;
  onBack: () => void;
  submitLabel: string;
}

export function OtpVerifyPanel({
  otpMeta,
  otpCode,
  onOtpCodeChange,
  cooldownSeconds,
  isSubmitting,
  onResend,
  onBack,
  submitLabel,
}: Props) {
  const isDemo = otpMeta.deliveryMode === 'demo_simulation' && Boolean(otpMeta.demoOtpCode);

  return (
    <div className="space-y-4">
      <div className="p-3.5 rounded-[12px] bg-[var(--forest-surface)] border-2 border-[var(--border-ink)] space-y-1.5">
        <div className="flex items-center gap-2 text-xs font-bold text-[var(--forest-ink)]">
          <EnvelopeSimple size={16} weight="bold" />
          <span>Verifikasi OTP Gmail</span>
        </div>
        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
          Kode 6 digit dikirim ke <strong className="text-[var(--text-primary)]">{otpMeta.email}</strong>.
          Masukkan kode tersebut untuk memastikan akun valid dan bebas fraud.
        </p>
      </div>

      {isDemo && otpMeta.demoOtpCode && (
        <div className="p-3.5 rounded-[12px] bg-[var(--ochre-surface)] border-2 border-[var(--border-ink)] flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--warning-ink)] block">
              Data Simulasi Demo OTP Gmail
            </span>
            <span className="font-mono-num text-lg font-extrabold tracking-[0.22em] text-[var(--text-primary)]">
              {otpMeta.demoOtpCode}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onOtpCodeChange(otpMeta.demoOtpCode || '')}
            className="market-btn-secondary px-3 py-1.5 text-[11px] font-bold shrink-0 cursor-pointer"
          >
            Isi Otomatis
          </button>
        </div>
      )}

      <div className="space-y-1.5">
        <label className="text-xs font-bold text-[var(--text-primary)]">Kode OTP 6 Digit</label>
        <div className="relative">
          <Key size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otpCode}
            onChange={(e) => onOtpCodeChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] focus:bg-[var(--bg-card)] font-mono-num text-base font-bold tracking-[0.28em] text-[var(--text-primary)] placeholder-[var(--text-muted)]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || otpCode.length !== 6}
        className="market-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-55 cursor-pointer"
      >
        <CheckCircle size={16} weight="bold" />
        <span>{isSubmitting ? 'Memverifikasi OTP...' : submitLabel}</span>
      </button>

      <div className="flex items-center justify-between gap-2 pt-1 text-xs">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 font-bold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
        >
          <ArrowLeft size={13} weight="bold" />
          <span>Ubah Email</span>
        </button>

        <button
          type="button"
          disabled={cooldownSeconds > 0 || isSubmitting}
          onClick={onResend}
          className="inline-flex items-center gap-1 font-bold text-[var(--accent-chili)] disabled:text-[var(--text-muted)] cursor-pointer disabled:cursor-not-allowed"
        >
          <ArrowsClockwise size={13} weight="bold" />
          <span>{cooldownSeconds > 0 ? `Kirim ulang (${cooldownSeconds}d)` : 'Kirim Ulang OTP'}</span>
        </button>
      </div>
    </div>
  );
}
