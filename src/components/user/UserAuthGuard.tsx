'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useUserAuth } from '@/lib/store/user-auth-store';

export function UserAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, isAuthLoaded } = useUserAuth();

  useEffect(() => {
    if (isAuthLoaded && !user) {
      router.replace('/masuk?next=/akun');
    }
  }, [isAuthLoaded, user, router]);

  if (!isAuthLoaded || !user) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="market-card px-6 py-5 text-xs font-bold text-[var(--text-secondary)]">
          Memeriksa sesi akun PasarKu...
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
