'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  House,
  ClipboardText,
  GearSix,
  PlusCircle,
  SignOut,
  X,
  CheckCircle,
} from '@phosphor-icons/react';
import type { UserDashboardModule, UserProfile } from '@/lib/types/user';
import { useUserAuth } from '@/lib/store/user-auth-store';
import { AdminConfirmModal } from '@/components/admin/AdminConfirmModal';

interface UserSidebarProps {
  user: UserProfile;
  activeModule: UserDashboardModule;
  onSelectModule: (module: UserDashboardModule) => void;
  reportCount: number;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export function UserSidebar({
  user,
  activeModule,
  onSelectModule,
  reportCount,
  isOpenMobile,
  onCloseMobile,
}: UserSidebarProps) {
  const router = useRouter();
  const { logoutUser } = useUserAuth();
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  const confirmLogout = async () => {
    await logoutUser();
    router.push('/');
  };

  const menuItems: {
    id: UserDashboardModule;
    label: string;
    icon: React.ReactNode;
    badge?: number;
  }[] = [
    { id: 'home', label: 'Home', icon: <House size={18} weight="bold" /> },
    {
      id: 'riwayat',
      label: 'Riwayat Laporan',
      icon: <ClipboardText size={18} weight="bold" />,
      badge: reportCount > 0 ? reportCount : undefined,
    },
    { id: 'pengaturan', label: 'Pengaturan', icon: <GearSix size={18} weight="bold" /> },
  ];

  const navContent = (
    <div className="flex flex-col justify-between h-full space-y-4">
      <div className="space-y-1.5">
        <div className="px-3 pb-2 text-[11px] font-bold tracking-wider text-[var(--text-muted)] uppercase border-b-2 border-[var(--border-ink)]">
          Menu Pengguna
        </div>
        <div className="pt-1 space-y-1.5">
          {menuItems.map((item) => {
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectModule(item.id);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'market-btn-primary'
                    : 'rounded-[10px] border-2 border-transparent font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={isActive ? 'text-white shrink-0' : 'text-[var(--text-muted)] shrink-0'}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`font-mono-num text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      isActive
                        ? 'bg-white/20 text-white border border-white/30'
                        : 'bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2.5 pt-3 border-t-2 border-[var(--border-subtle)]">
        <Link
          href="/lapor"
          onClick={onCloseMobile}
          className="market-btn-secondary w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold no-underline"
        >
          <PlusCircle size={15} weight="bold" className="text-[var(--accent-chili)]" />
          <span>Buat Laporan Baru</span>
        </Link>

        <div className="p-3 rounded-[12px] bg-[var(--bg-paper)] border-2 border-[var(--border-ink)] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onSelectModule('pengaturan');
              onCloseMobile();
            }}
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--forest-surface)] border border-[var(--border-ink)] text-[var(--forest-ink)] font-bold text-xs flex items-center justify-center shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1 truncate">
                <span className="truncate">{user.name}</span>
                {user.emailVerified && (
                  <CheckCircle size={12} weight="fill" className="text-[var(--forest-ink)] shrink-0" />
                )}
              </div>
              <div className="text-[10px] text-[var(--text-muted)] truncate">{user.email}</div>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsLogoutOpen(true)}
            title="Keluar Akun"
            aria-label="Keluar Akun"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-chili)] rounded-lg transition-colors cursor-pointer"
          >
            <SignOut size={16} weight="bold" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden lg:block w-[248px] shrink-0 sticky top-6 self-start market-card p-4">
        {navContent}
      </aside>

      {isOpenMobile && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="fixed inset-0 bg-[#0A120E]/65 transition-opacity" onClick={onCloseMobile} />
          <div className="relative w-[280px] max-w-[85vw] bg-[var(--bg-card)] h-full p-5 flex flex-col justify-between border-r-2 border-[var(--border-ink)] z-10">
            <div className="flex items-center justify-between pb-3.5 border-b-2 border-[var(--border-ink)]">
              <span className="font-bold text-sm text-[var(--text-primary)]">Navigasi Pengguna</span>
              <button
                type="button"
                onClick={onCloseMobile}
                aria-label="Tutup menu pengguna"
                className="market-btn-secondary w-9 h-9 p-0 inline-flex items-center justify-center"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            <div className="py-4 flex-1 overflow-y-auto">{navContent}</div>
          </div>
        </div>
      )}

      <AdminConfirmModal
        isOpen={isLogoutOpen}
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => void confirmLogout()}
        title="Konfirmasi Keluar Akun"
        description="Apakah Anda yakin ingin keluar dari Dashboard PasarKu? Anda perlu masuk kembali untuk mengirim laporan baru."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        variant="warning"
      />
    </>
  );
}
