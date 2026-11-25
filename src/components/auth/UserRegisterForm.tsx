'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  CaretDown,
  EnvelopeSimple,
  Eye,
  EyeSlash,
  LockKey,
  MapPin,
  User,
} from '@phosphor-icons/react';
import { useUserAuth } from '@/lib/store/user-auth-store';
import { MOCK_REGIONS } from '@/lib/mock/regions.data';
import {
  checkGoogleOAuthApi,
  loginWithGoogleDemoApi,
  registerWithOtpApi,
  requestGmailOtpApi,
} from '@/lib/api/user-auth.api';
import type { OtpDispatchData } from '@/lib/types/user';
import { UserAuthCardShell } from './UserAuthCardShell';
import { GoogleDemoModal } from './GoogleDemoModal';
import { OtpVerifyPanel } from './OtpVerifyPanel';

export function UserRegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setSession } = useUserAuth();

  const rawNext = searchParams.get('next');
  const nextPath = rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') ? rawNext : '/akun';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [regionId, setRegionId] = useState('reg_bogor');
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
    if (name.trim().length < 2) {
      setErrorMessage('Nama lengkap minimal 2 karakter.');
      return;
    }
    if (!email.trim().includes('@')) {
      setErrorMessage('Masukkan alamat Gmail yang valid.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Kata sandi minimal 6 karakter.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await requestGmailOtpApi({
        name: name.trim(),
        email: email.trim(),
        password,
        purpose: 'REGISTER',
      });
      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Gagal mengirim OTP verifikasi Gmail.');
        return;
      }
      setOtpMeta(res.data);
      setCooldown(30);
    } catch {
      setErrorMessage('Gagal terhubung ke layanan OTP Gmail.');
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
      const res = await registerWithOtpApi({
        name: name.trim(),
        email: email.trim(),
        password,
        otpCode: otpCode.trim(),
        preferredRegionId: regionId,
      });
      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Verifikasi OTP gagal.');
        return;
      }
      setSession(res.data);
      setIsSuccess(true);
      setTimeout(() => router.push(nextPath), 350);
    } catch {
      setErrorMessage('Pendaftaran gagal diproses.');
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
      const res = await loginWithGoogleDemoApi({ ...account, preferredRegionId: regionId });
      if (!res.success || !res.data) {
        setErrorMessage(res.message || 'Daftar lewat Google gagal.');
        return;
      }
      setGoogleModalOpen(false);
      setSession(res.data);
      setIsSuccess(true);
      setTimeout(() => router.push(nextPath), 300);
    } catch {
      setErrorMessage('Gagal mendaftarkan akun Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <UserAuthCardShell
        badgeText="DAFTAR AKUN"
        title="Buat Akun PasarKu"
        subtitle="Daftar cepat dengan Google atau ketik email manual lalu verifikasi kode OTP lewat Gmail."
        errorMessage={errorMessage}
        successMessage={isSuccess ? 'Akun aktif & terverifikasi! Mengalihkan ke Dashboard...' : null}
        showGoogleSection={!otpMeta}
        googleButtonLabel="Daftar Cepat dengan Google"
        googleDividerLabel="atau daftar manual + OTP Gmail"
        onGoogleClick={() => void handleGoogleClick()}
        googleDisabled={isLoading || isSuccess}
        switchPromptText="Sudah punya akun?"
        switchLinkLabel="Masuk di sini"
        switchLinkHref={nextPath !== '/akun' ? `/masuk?next=${encodeURIComponent(nextPath)}` : '/masuk'}
      >
        <form onSubmit={handleSubmit} className="space-y-3.5">
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
              submitLabel="Verifikasi OTP & Selesaikan Daftar"
            />
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Nama Lengkap</label>
                <div className="relative">
                  <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Siti Rahmawati"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] focus:bg-[var(--bg-card)] text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Alamat Gmail</label>
                <div className="relative">
                  <EnvelopeSimple size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] focus:bg-[var(--bg-card)] text-sm text-[var(--text-primary)]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Kata Sandi</label>
                <div className="relative">
                  <LockKey size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
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

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Daerah Pantauan Utama</label>
                <div className="relative">
                  <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
                  <select
                    value={regionId}
                    onChange={(e) => setRegionId(e.target.value)}
                    className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-sm font-medium text-[var(--text-primary)]"
                  >
                    {MOCK_REGIONS.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.phaseLabel || r.islandName})
                      </option>
                    ))}
                  </select>
                  <CaretDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
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
