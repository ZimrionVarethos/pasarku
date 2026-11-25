import Link from 'next/link';
import { Compass, House, Scales } from '@phosphor-icons/react/dist/ssr';

export default function NotFound() {
  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-12 bg-[var(--bg-paper)]">
      <div className="market-card max-w-md w-full p-6 sm:p-8 text-center space-y-5 bg-[var(--bg-card)]">
        <div className="w-12 h-12 mx-auto rounded-full bg-[var(--ochre-surface)] border-2 border-[var(--border-ink)] flex items-center justify-center text-[var(--warning-ink)]">
          <Compass size={26} weight="bold" />
        </div>
        <div className="space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[var(--text-muted)]">
            404 &middot; Halaman Tidak Ditemukan
          </span>
          <h1 className="text-xl font-bold text-[var(--text-primary)]">
            Lorong yang Kamu Cari Belum Tersedia
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
            Halaman mungkin sudah dipindahkan atau alamatnya keliru. Kamu bisa langsung cek harga wajar atau kembali ke beranda PasarKu.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
          <Link
            href="/"
            className="market-btn-primary w-full sm:w-auto px-4 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 no-underline"
          >
            <House size={15} weight="bold" />
            <span>Beranda PasarKu</span>
          </Link>
          <Link
            href="/cek-harga"
            className="market-btn-secondary w-full sm:w-auto px-4 py-2.5 text-xs font-bold inline-flex items-center justify-center gap-1.5 no-underline"
          >
            <Scales size={15} weight="bold" />
            <span>Cek Harga Wajar</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
