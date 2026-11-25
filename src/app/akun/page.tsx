import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UserAuthGuard } from '@/components/user/UserAuthGuard';
import { UserDashboardContainer } from '@/components/user/UserDashboardContainer';

export const metadata: Metadata = {
  title: 'Dashboard Warga & Riwayat Laporan · PasarKu',
  description:
    'Ringkasan harga pangan daerah, 3 komoditas paling sering dicek, riwayat laporan multi-foto, dan pengaturan akun PasarKu.',
};

export default function AkunDashboardPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-paper)] text-[var(--text-primary)] p-3 sm:p-5 lg:p-6 flex flex-col transition-colors">
      <div className="max-w-[1440px] w-full mx-auto flex-1 flex flex-col">
        <UserAuthGuard>
          <Suspense fallback={<div className="text-xs text-[var(--text-muted)] p-6">Memuat dashboard...</div>}>
            <UserDashboardContainer />
          </Suspense>
        </UserAuthGuard>
      </div>
    </div>
  );
}
