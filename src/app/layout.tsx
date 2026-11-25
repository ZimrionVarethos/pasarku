import type { Metadata } from 'next';
import './globals.css';
import { ubuntu } from '@/app/fonts';
import { PublicLayoutWrapper } from '@/components/layout/PublicLayoutWrapper';

export const metadata: Metadata = {
  title: 'PasarKu: Tawar Pintar, Belanja Wajar',
  description:
    'Platform independen alat bantu keputusan harga pangan pasar rakyat lintas wilayah Indonesia, membandingkan tawaran eceran lapak terhadap acuan Bapanas, PIHPS BI, dan laporan warga.',
  icons: {
    icon: '/images/pasarku/logo-nav.webp',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" data-theme="light" className={`${ubuntu.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans bg-[var(--bg-paper)] text-[var(--text-primary)] antialiased transition-colors duration-200">
        <PublicLayoutWrapper>{children}</PublicLayoutWrapper>
      </body>
    </html>
  );
}
