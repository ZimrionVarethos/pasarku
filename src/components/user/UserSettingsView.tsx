'use client';

import { useState } from 'react';
import {
  CaretDown,
  CheckCircle,
  FloppyDisk,
  LockKey,
  MapPin,
  Moon,
  Sun,
  User,
  WarningCircle,
} from '@phosphor-icons/react';
import type { UserProfile } from '@/lib/types/user';
import { MOCK_REGIONS } from '@/lib/mock/regions.data';
import { useTheme } from '@/lib/store/theme-store';
import { useRegion } from '@/lib/store/region-store';
import { useUserAuth } from '@/lib/store/user-auth-store';
import { updateUserProfileApi } from '@/lib/api/user-auth.api';

interface Props {
  user: UserProfile;
  onProfileSaved: () => Promise<void>;
}

export function UserSettingsView({ user, onProfileSaved }: Props) {
  const { theme, toggleTheme } = useTheme();
  const { setSelectedRegion } = useRegion();
  const { token, updateUserState } = useUserAuth();

  const [name, setName] = useState(user.name);
  const [regionId, setRegionId] = useState(user.preferredRegionId || 'reg_bogor');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setIsSaving(true);
    try {
      const res = await updateUserProfileApi(
        {
          name: name.trim(),
          preferredRegionId: regionId,
          ...(newPassword
            ? { currentPassword, newPassword }
            : {}),
        },
        token
      );
      if (!res.success || !res.data?.user) {
        setStatusMessage({
          type: 'error',
          text: res.message || 'Gagal menyimpan pengaturan akun.',
        });
        return;
      }

      updateUserState(res.data.user);
      const matchedRegion = MOCK_REGIONS.find((r) => r.id === res.data.user.preferredRegionId);
      if (matchedRegion) {
        setSelectedRegion(matchedRegion);
      }
      setCurrentPassword('');
      setNewPassword('');
      setStatusMessage({
        type: 'success',
        text: 'Pengaturan profil & daerah pantauan berhasil disimpan.',
      });
      await onProfileSaved();
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Terjadi gangguan koneksi saat menyimpan pengaturan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="market-card p-5 sm:p-6">
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Pengaturan Akun &amp; Daerah
        </h1>
        <p className="text-sm text-[var(--text-secondary)] mt-0.5">
          Sesuaikan nama tampilan, wilayah acuan harga utama pada Beranda, tema layar, dan keamanan sandi.
        </p>
      </div>

      {statusMessage && (
        <div
          className={`p-3.5 rounded-[12px] border-2 text-xs font-bold flex items-center gap-2 ${
            statusMessage.type === 'success'
              ? 'bg-[var(--forest-surface)] border-[var(--forest-ink)] text-[var(--forest-ink)]'
              : 'bg-[var(--accent-chili-soft)] border-[var(--accent-chili)] text-[var(--accent-chili)]'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle size={16} weight="fill" className="shrink-0" />
          ) : (
            <WarningCircle size={16} weight="fill" className="shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <form onSubmit={handleSaveProfile} className="lg:col-span-7 market-card p-5 sm:p-6 space-y-5">
          <div className="pb-3 border-b-2 border-[var(--border-ink)]">
            <h2 className="text-base font-bold text-[var(--text-primary)]">
              Identitas &amp; Wilayah Pantauan
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Perubahan wilayah otomatis memperbarui ringkasan harga di tab Home.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Nama Lengkap</label>
            <div className="relative">
              <User size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-sm text-[var(--text-primary)]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">Email Terverifikasi</label>
            <div className="px-3.5 py-2.5 rounded-[10px] border border-[var(--border-subtle)] bg-[var(--bg-muted)]/60 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {user.email}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--forest-surface)] text-[var(--forest-ink)] border border-[var(--forest-ink)]/35 shrink-0">
                {user.authProvider === 'GOOGLE' ? 'Akun Google' : 'OTP Gmail Aktif'}
              </span>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[var(--text-primary)]">
              Daerah Pantauan Default
            </label>
            <div className="relative">
              <MapPin size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
              <select
                value={regionId}
                onChange={(e) => setRegionId(e.target.value)}
                className="w-full appearance-none pl-10 pr-9 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-sm font-semibold text-[var(--text-primary)]"
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

          <div className="pt-3 border-t border-[var(--border-subtle)] space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--text-primary)]">
              <LockKey size={15} weight="bold" />
              <span>Ubah Kata Sandi (Opsional)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Sandi saat ini"
                className="w-full px-3.5 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-xs text-[var(--text-primary)]"
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Sandi baru (min. 6 karakter)"
                className="w-full px-3.5 py-2.5 rounded-[10px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] text-xs text-[var(--text-primary)]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="market-btn-primary w-full py-3 text-xs font-bold inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-55"
          >
            <FloppyDisk size={16} weight="bold" />
            <span>{isSaving ? 'Menyimpan Perubahan...' : 'Simpan Pengaturan'}</span>
          </button>
        </form>

        <div className="lg:col-span-5 space-y-5">
          <div className="market-card p-5 sm:p-6 space-y-4">
            <div className="pb-2.5 border-b-2 border-[var(--border-ink)]">
              <h2 className="text-base font-bold text-[var(--text-primary)]">
                Preferensi Tampilan
              </h2>
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 rounded-[12px] bg-[var(--bg-paper)] border border-[var(--border-subtle)]">
              <div>
                <div className="text-xs font-bold text-[var(--text-primary)]">
                  {theme === 'dark' ? 'Mode Subuh (Gelap)' : 'Mode Siang (Terang)'}
                </div>
                <div className="text-[11px] text-[var(--text-secondary)]">
                  Nyaman dibaca saat belanja pagi pukul 04:00 WIB maupun siang hari.
                </div>
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="market-btn-secondary px-3 py-2 text-xs font-bold inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun size={15} weight="bold" className="text-[#EEF773]" />
                    <span>Siang</span>
                  </>
                ) : (
                  <>
                    <Moon size={15} weight="bold" />
                    <span>Subuh</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="market-card p-5 sm:p-6 space-y-2.5">
            <h3 className="text-sm font-bold text-[var(--text-primary)]">
              Jaminan Privasi Pelapor
            </h3>
            <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
              Nama dan email akun Anda hanya dipakai untuk verifikasi anti-fraud dan menampilkan Riwayat Laporan pribadi. Di papan publik, seluruh laporan tetap ditampilkan anonim per pasar rakyat dan foto bebas metadata EXIF GPS.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
