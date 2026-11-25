'use client';

import Link from 'next/link';
import {
  MapPin,
  ClipboardText,
  CheckCircle,
  Hourglass,
  MagnifyingGlass,
  PlusCircle,
  ArrowRight,
  Fire,
} from '@phosphor-icons/react';
import type { Region } from '@/types';
import type { AdminReport } from '@/lib/types/admin';
import type { UserCommodityHitSummary, UserDashboardModule, UserProfile } from '@/lib/types/user';
import { formatRupiah } from '@/lib/utils';

interface RegionalPriceRow {
  commodityId: string;
  slug: string;
  name: string;
  category: string;
  unit: string;
  regionalPrice: number;
  hapHetPrice: number;
  diffPercent: number;
}

interface Props {
  user: UserProfile;
  region: Region;
  topCommodities: UserCommodityHitSummary[];
  regionalSummary: RegionalPriceRow[];
  reports: AdminReport[];
  onNavigate: (mod: UserDashboardModule) => void;
}

export function UserHomeView({
  user,
  region,
  topCommodities,
  regionalSummary,
  reports,
  onNavigate,
}: Props) {
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const pendingCount = reports.filter((r) => r.status === 'PENDING' || r.status === 'ANOMALY').length;
  const rejectedCount = reports.filter((r) => r.status === 'REJECTED').length;

  return (
    <div className="space-y-6">
      <div className="market-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              Halo, {user.name}
            </h1>
            <p className="text-sm text-[var(--text-secondary)]">
              Ringkasan harga pangan hari ini di <strong>{region.name}</strong> serta 3 komoditas yang paling sering Anda cek.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <Link
              href="/cek-harga"
              className="market-btn-secondary inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-bold no-underline"
            >
              <MagnifyingGlass size={15} weight="bold" />
              <span>Cek Harga</span>
            </Link>
            <Link
              href="/lapor"
              className="market-btn-primary inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold no-underline"
            >
              <PlusCircle size={16} weight="bold" />
              <span>Lapor Harga Baru</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="market-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Daerah Pantauan</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--forest-surface)] border border-[var(--border-ink)] flex items-center justify-center text-[var(--forest-ink)]">
              <MapPin size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-lg font-bold text-[var(--text-primary)] truncate">{region.name}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">
              {region.phaseLabel || region.islandName} &middot; Indeks {region.disparityIndex.toFixed(2)}x
            </div>
          </div>
        </div>

        <div className="market-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Total Laporan Saya</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--forest-surface)] border border-[var(--border-ink)] flex items-center justify-center text-[var(--forest-ink)]">
              <ClipboardText size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono-num text-3xl font-bold text-[var(--text-primary)]">{reports.length}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">kontribusi harga &amp; stok pasar</div>
          </div>
        </div>

        <div className="market-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Selesai / Diterima</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--forest-surface)] border border-[var(--border-ink)] flex items-center justify-center text-[var(--forest-ink)]">
              <CheckCircle size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono-num text-3xl font-bold text-[var(--forest-ink)]">{approvedCount}</div>
            <div className="text-xs text-[var(--text-secondary)] mt-1">masuk acuan Lapis 3 publik</div>
          </div>
        </div>

        <div className="market-card p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--text-muted)]">Diproses / Ditolak</span>
            <div className="w-8 h-8 rounded-lg bg-[var(--ochre-surface)] border border-[var(--border-ink)] flex items-center justify-center text-[var(--warning-ink)]">
              <Hourglass size={18} weight="bold" />
            </div>
          </div>
          <div className="mt-4">
            <div className="font-mono-num text-3xl font-bold text-[var(--text-primary)]">{pendingCount}</div>
            <div className="text-xs text-[var(--accent-chili)] font-bold mt-1">
              {rejectedCount > 0 ? `${rejectedCount} laporan ditolak` : '0 laporan ditolak'}
            </div>
          </div>
        </div>
      </div>

      <div className="market-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b-2 border-[var(--border-ink)]">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--text-primary)] tracking-tight flex items-center gap-2">
              <Fire size={18} weight="fill" className="text-[var(--accent-chili)]" />
              <span>3 Pangan yang Sering Anda Tanya</span>
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Diperbarui otomatis setiap kali Anda mengecek harga atau berkonsultasi dengan PUNTEN AI.
            </p>
          </div>
          <span className="text-[11px] font-bold text-[var(--forest-ink)] bg-[var(--forest-surface)] px-2.5 py-1 rounded-full border border-[var(--forest-ink)]/35">
            Top 3 Personal
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topCommodities.slice(0, 3).map((item, idx) => {
            const isHigher = item.diffPercent > 10;
            return (
              <div
                key={item.commodityId}
                className="p-4 rounded-[12px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] shadow-[var(--shadow-hard-sm)] flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="w-7 h-7 rounded-full bg-[var(--forest-surface)] border border-[var(--border-ink)] text-[var(--forest-ink)] font-mono-num text-xs font-extrabold inline-flex items-center justify-center">
                      #{idx + 1}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-mono-num">
                      Dicek {item.queryCount}x
                    </span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">
                      {item.name}
                    </h3>
                    <div className="font-mono-num text-xl font-extrabold text-[var(--forest-ink)] mt-1">
                      {formatRupiah(item.regionalPrice)}
                      <span className="text-xs font-semibold text-[var(--text-muted)]">/{item.unit}</span>
                    </div>
                  </div>
                  <div className="text-[11px] flex items-center justify-between gap-2 pt-1.5 border-t border-[var(--border-subtle)]">
                    <span className="text-[var(--text-muted)]">HAP Daerah: {formatRupiah(item.hapHetPrice)}</span>
                    <span
                      className={`font-bold font-mono-num ${
                        isHigher ? 'text-[var(--accent-chili)]' : 'text-[var(--forest-ink)]'
                      }`}
                    >
                      {item.diffPercent > 0 ? `+${item.diffPercent}%` : `${item.diffPercent}%`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/cek-harga?komoditas=${encodeURIComponent(item.slug)}`}
                    className="market-btn-primary flex-1 py-2 px-3 text-[11px] font-bold text-center no-underline"
                  >
                    Cek Harga
                  </Link>
                  <Link
                    href={`/komoditas/${encodeURIComponent(item.slug)}`}
                    className="market-btn-secondary py-2 px-3 text-[11px] font-bold no-underline"
                  >
                    Detail
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="market-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[var(--border-ink)]">
          <div>
            <h2 className="text-[17px] font-bold text-[var(--text-primary)] tracking-tight">
              Ringkasan Harga Pangan: {region.name}
            </h2>
            <p className="text-xs text-[var(--text-secondary)]">
              Rerata pasar daerah dibandingkan batas acuan HAP/HET Bapanas terkalibrasi.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('pengaturan')}
            className="market-btn-secondary px-3 py-1.5 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <span>Ganti Daerah</span>
            <ArrowRight size={13} weight="bold" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-[var(--border-subtle)] text-[11px] text-[var(--text-muted)] uppercase">
                <th className="py-2.5 pr-3 font-bold">#</th>
                <th className="py-2.5 pr-3 font-bold">Komoditas</th>
                <th className="py-2.5 pr-3 font-bold text-right">Harga Daerah</th>
                <th className="py-2.5 pr-3 font-bold text-right">Acuan HAP/HET</th>
                <th className="py-2.5 pr-3 font-bold text-center">Status</th>
                <th className="py-2.5 font-bold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {regionalSummary.map((row, idx) => {
                const isHigh = row.diffPercent > 10;
                const isCheap = row.diffPercent < -5;
                return (
                  <tr key={row.commodityId} className="hover:bg-[var(--bg-muted)]/35 transition-colors">
                    <td className="py-3 pr-3">
                      <span className="w-6 h-6 rounded-full bg-[var(--bg-muted)] border border-[var(--border-subtle)] text-[11px] font-bold inline-flex items-center justify-center">
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-3 font-bold text-[var(--text-primary)]">{row.name}</td>
                    <td className="py-3 pr-3 text-right font-mono-num font-extrabold text-[var(--forest-ink)]">
                      {formatRupiah(row.regionalPrice)}/{row.unit}
                    </td>
                    <td className="py-3 pr-3 text-right font-mono-num text-[var(--text-secondary)]">
                      {formatRupiah(row.hapHetPrice)}/{row.unit}
                    </td>
                    <td className="py-3 pr-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isHigh
                            ? 'bg-[var(--accent-chili-soft)] text-[var(--accent-chili)] border-[var(--accent-chili)]/35'
                            : isCheap
                            ? 'bg-[var(--forest-surface)] text-[var(--forest-ink)] border-[var(--forest-ink)]/35'
                            : 'bg-[var(--ochre-surface)] text-[var(--warning-ink)] border-[var(--earth-ochre)]/45'
                        }`}
                      >
                        {isHigh ? 'Di Atas Acuan' : isCheap ? 'Lebih Murah' : 'Wajar'}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/cek-harga?komoditas=${encodeURIComponent(row.slug)}`}
                        className="market-btn-secondary inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold no-underline"
                      >
                        <span>Cek</span>
                        <ArrowRight size={11} weight="bold" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
