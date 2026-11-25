'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { RegionProvider } from '@/lib/store/region-store';
import { AssistantProvider } from '@/lib/store/assistant-store';
import { AdminStoreProvider } from '@/lib/store/admin-store';
import { UserAuthProvider } from '@/lib/store/user-auth-store';
import { ThemeProvider } from '@/lib/store/theme-store';
import { AssistantDrawer } from '@/components/assistant/AssistantDrawer';
import { PuntenScrollMascot } from '@/components/assistant/PuntenScrollMascot';

interface PublicLayoutWrapperProps {
  children: React.ReactNode;
}

export function PublicLayoutWrapper({ children }: PublicLayoutWrapperProps) {
  const pathname = usePathname();
  const isStandaloneConsole =
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/akun') ||
    pathname?.startsWith('/masuk') ||
    pathname?.startsWith('/daftar');

  return (
    <ThemeProvider>
      <UserAuthProvider>
        <AdminStoreProvider>
          <RegionProvider>
            <AssistantProvider>
              {isStandaloneConsole ? (
                <div className="min-h-screen w-full flex flex-col bg-[var(--bg-paper)] text-[var(--text-primary)]">
                  {children}
                </div>
              ) : (
                <>
                  <Navbar />
                  <main className="flex-1">{children}</main>
                  <Footer />
                  <AssistantDrawer />
                  <PuntenScrollMascot />
                </>
              )}
            </AssistantProvider>
          </RegionProvider>
        </AdminStoreProvider>
      </UserAuthProvider>
    </ThemeProvider>
  );
}
