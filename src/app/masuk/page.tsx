import { Suspense } from 'react';
import type { Metadata } from 'next';
import { UserAuthShowcase } from '@/components/auth/UserAuthShowcase';
import { UserLoginForm } from '@/components/auth/UserLoginForm';

export const metadata: Metadata = {
  title: 'Masuk Akun Warga · PasarKu',
  description:
    'Masuk menggunakan akun Google atau email dengan verifikasi OTP Gmail untuk melapor harga pasar dan memantau dashboard pribadi.',
};

export default function MasukPage() {
  return (
    <div className="w-full min-h-screen bg-[var(--bg-paper)] text-[var(--text-primary)] flex items-center justify-center p-3 sm:p-6 lg:p-8 transition-colors">
      <div className="w-full max-w-5xl min-h-[640px] market-card overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        <div className="lg:col-span-7 hidden lg:block">
          <UserAuthShowcase />
        </div>

        <div className="lg:col-span-5 bg-[var(--bg-paper)] lg:border-l-2 border-[var(--border-ink)] p-6 sm:p-10 flex flex-col justify-center items-center">
          <Suspense fallback={<div className="text-xs text-[var(--text-muted)]">Memuat formulir masuk...</div>}>
            <UserLoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
