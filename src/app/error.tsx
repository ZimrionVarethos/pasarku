'use client';

import Link from 'next/link';
import { ArrowClockwise, House, WarningCircle } from '@phosphor-icons/react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[var(--bg-paper)]">
      <div className="market-card max-w-md w-full p-6 sm:p-8 text-center space-y-5 bg-[var(--bg-card)]">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--accent-chili-soft)] border-2 border-[var(--accent-chili)] flex items-center justify-center text-[var(--accent-chili)]">
          <WarningCircle size={26} weight="bold" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Halaman Sedang Mengalami Gangguan
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Tenang, data acuan PasarKu tetap aman. Muat ulang halaman ini atau kembali ke beranda untuk melanjutkan.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={reset}
            className="market-btn-primary w-full sm:w-auto px-4 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ArrowClockwise size={15} weight="bold" />
            <span>Muat Ulang</span>
          </button>
          <Link
            href="/"
            className="market-btn-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 no-underline"
          >
            <House size={15} weight="bold" />
            <span>Kembali ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
