'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, EnvelopeSimple, Eye, EyeSlash, LockKey } from '@phosphor-icons/react';
import { useUserAuth } from '@/lib/store/user-auth-store';
import {
  checkGoogleOAuthApi,
  loginWithGoogleDemoApi,
  loginWithOtpApi,
  requestGmailOtpApi,
} from '@/lib/api/user-auth.api';
import type { OtpDispatchData } from '@/lib/types/user';
import { UserAuthCardShell } from './UserAuthCardShell';
import { GoogleDemoModal } from './GoogleDemoModal';
import { OtpVerifyPanel } from './OtpVerifyPanel';

export function UserLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setSession } = useUserAuth();

  const rawNext = searchParams.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/akun';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpMeta, setOtpMeta] = useState<OtpDispatchData | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [googleModalOpen, setGoogleModalOpen] = useState(false);

  useEffect(() => {
    if (user) router.replace(nextPath);
  }, [user, router, nextPath]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setTimeout(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [cooldown]);

  const handleRequestOtp = async () => {
    setErrorMessage('');
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Email Gmail dan kata sandi wajib diisi.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await requestGmailOtpApi({ email: email.trim(), password, purpose: 'LOGIN' });
      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Gagal mengirim kode OTP Gmail.');
        return;
      }
      setOtpMeta(res.data);
      setCooldown(30);
    } catch {
      setErrorMessage('Koneksi gagal saat mengirim OTP Gmail.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpMeta) {
      await handleRequestOtp();
      return;
    }
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await loginWithOtpApi({ email: email.trim(), password, otpCode: otpCode.trim() });
      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Verifikasi OTP gagal.');
        return;
      }
      setSession(res.data);
      setIsSuccess(true);
      setTimeout(() => router.push(nextPath), 350);
    } catch {
      setErrorMessage('Gagal menyelesaikan login.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await checkGoogleOAuthApi(nextPath);
      if (res.success && res.data?.configured && res.data.authUrl) {
        window.location.href = res.data.authUrl;
        return;
      }
      setGoogleModalOpen(true);
    } catch {
      setGoogleModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleDemoSelect = async (account: { name: string; email: string }) => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginWithGoogleDemoApi(account);
      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Login Google gagal.');
        return;
      }
      setGoogleModalOpen(false);
      setSession(res.data);
      setIsSuccess(true);
      setTimeout(() => router.push(nextPath), 300);
    } catch {
      setErrorMessage('Gagal memproses akun Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <UserAuthCardShell
        badgeText="AKUN WARGA"
        title="Masuk ke PasarKu"
        subtitle="Gunakan Google atau email manual dengan verifikasi OTP Gmail untuk melapor & membuka dashboard Anda."
        errorMessage={errorMessage}
        successMessage={isSuccess ? 'Berhasil masuk! Membuka halaman tujuan...' : null}
        showGoogleSection={!otpMeta}
        googleButtonLabel="Masuk Langsung dengan Google"
        googleDividerLabel="atau email + OTP Gmail"
        onGoogleClick={() => void handleGoogleClick()}
        googleDisabled={isLoading || isSuccess}
        switchPromptText="Belum punya akun?"
        switchLinkLabel="Daftar Akun Baru"
        switchLinkHref={nextPath !== '/akun' ? `/daftar?next=${encodeURIComponent(nextPath)}` : '/daftar'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {otpMeta ? (
            <OtpVerifyPanel
              otpMeta={otpMeta}
              otpCode={otpCode}
              onOtpCodeChange={setOtpCode}
              cooldownSeconds={cooldown}
              isSubmitting={isLoading || isSuccess}
              onResend={() => void handleRequestOtp()}
              onBack={() => {
                setOtpMeta(null);
                setOtpCode('');
                setErrorMessage('');
              }}
              submitLabel="Verifikasi OTP & Masuk"
            />
          ) : (
            <>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[var(--text-primary)]">Alamat Gmail</label>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('warga.demo@gmail.com');
                      setPassword('pasarku123');
                    }}
                    className="text-[11px] font-bold text-[var(--forest-ink)] hover:underline cursor-pointer"
                  >
                    Isi Akun Demo
                  </button>
                </div>
                <div className="relative">
                  <EnvelopeSimple size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] focus:bg-[var(--bg-card)] text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[var(--text-primary)]">Kata Sandi</label>
                <div className="relative">
                  <LockKey size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full pl-10 pr-10 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] focus:bg-[var(--bg-card)] text-sm text-[var(--text-primary)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="market-btn-primary w-full py-3 text-xs flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                <span>{isLoading ? 'Mengirim OTP ke Gmail...' : 'Kirim Kode OTP ke Gmail'}</span>
                <ArrowRight size={16} weight="bold" />
              </button>
            </>
          )}
        </form>
      </UserAuthCardShell>

      <GoogleDemoModal
        isOpen={googleModalOpen}
        onClose={() => setGoogleModalOpen(false)}
        onSelectAccount={handleGoogleDemoSelect}
        isSubmitting={isLoading}
      />
    </>
  );
}
