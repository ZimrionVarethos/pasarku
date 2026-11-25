'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Hourglass,
  MagnifyingGlass,
  PlusCircle,
  Prohibit,
  WarningCircle,
  Package,
} from '@phosphor-icons/react';
import type { AdminReport } from '@/lib/types/admin';
import { formatRupiah } from '@/lib/utils';
import { ReportPhotoGallery } from '@/components/common/ReportPhotoGallery';

type HistoryTab = 'ALL' | 'DIPROSES' | 'SELESAI' | 'DITOLAK';

interface Props {
  reports: AdminReport[];
}

function getDisplayStatus(status: AdminReport['status']): {
  group: Exclude<HistoryTab, 'ALL'>;
  label: string;
} {
  if (status === 'APPROVED') return { group: 'SELESAI', label: 'Selesai · Diterima' };
  if (status === 'REJECTED') return { group: 'DITOLAK', label: 'Ditolak' };
  if (status === 'ANOMALY') return { group: 'DIPROSES', label: 'Diproses (Review MAD)' };
  return { group: 'DIPROSES', label: 'Diproses' };
}

export function UserReportsHistoryView({ reports }: Props) {
  const [activeTab, setActiveTab] = useState<HistoryTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const processedCount = reports.filter(
    (r) => r.status === 'PENDING' || r.status === 'ANOMALY'
  ).length;
  const approvedCount = reports.filter((r) => r.status === 'APPROVED').length;
  const rejectedCount = reports.filter((r) => r.status === 'REJECTED').length;

  const filtered = reports.filter((r) => {
    const mapped = getDisplayStatus(r.status);
    if (activeTab !== 'ALL' && mapped.group !== activeTab) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.id.toLowerCase().includes(q) ||
        r.commodityName.toLowerCase().includes(q) ||
        r.marketName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const tabs: Array<{ id: HistoryTab; label: string; count: number }> = [
    { id: 'ALL', label: 'Semua', count: reports.length },
    { id: 'DIPROSES', label: 'Diproses', count: processedCount },
    { id: 'SELESAI', label: 'Selesai', count: approvedCount },
    { id: 'DITOLAK', label: 'Ditolak', count: rejectedCount },
  ];

  return (
    <div className="space-y-6">
      <div className="market-card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            Riwayat Laporan Saya
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Pantau status verifikasi moderator (Diproses, Selesai/Diterima, atau Ditolak) beserta bukti foto Anda.
          </p>
        </div>
        <Link
          href="/lapor"
          className="market-btn-primary inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold no-underline shrink-0"
        >
          <PlusCircle size={16} weight="bold" />
          <span>Kirim Laporan Baru</span>
        </Link>
      </div>

      <div className="market-card p-5 sm:p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b-2 border-[var(--border-ink)]">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-2 text-xs font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    isActive
                      ? 'market-btn-primary'
                      : 'rounded-[10px] bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-subtle)] hover:border-[var(--border-ink)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="font-mono-num text-[10px] opacity-85">({tab.count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative md:w-72">
            <MagnifyingGlass
              size={15}
              weight="bold"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID, komoditas, pasar..."
              className="w-full pl-9 pr-3.5 py-2 rounded-[10px] bg-[var(--bg-paper)] border-2 border-[var(--border-ink)] text-xs text-[var(--text-primary)]"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-8 rounded-[12px] bg-[var(--bg-paper)] border border-[var(--border-subtle)] text-center space-y-3">
            <p className="text-sm font-bold text-[var(--text-primary)]">
              Belum ada laporan pada kategori ini.
            </p>
            <p className="text-xs text-[var(--text-secondary)]">
              Bantu warga lain tahu harga wajar dengan mengirim laporan dari pasar sekitar Anda.
            </p>
            <Link
              href="/lapor"
              className="market-btn-primary inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold no-underline"
            >
              <PlusCircle size={15} weight="bold" />
              <span>Mulai Lapor Sekarang</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((report) => {
              const info = getDisplayStatus(report.status);
              const isShortage = report.reportType === 'SHORTAGE';

              return (
                <article
                  key={report.id}
                  className="p-4 sm:p-5 rounded-[14px] border-2 border-[var(--border-ink)] bg-[var(--bg-paper)] space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-num text-[11px] font-bold text-[var(--text-muted)]">
                          {report.id}
                        </span>
                        <span className="text-[11px] text-[var(--text-secondary)]">
                          &middot; {report.submittedAt}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isShortage
                              ? 'bg-[#FEF3C7] text-[#92400E]'
                              : 'bg-[var(--bg-muted)] text-[var(--text-primary)]'
                          }`}
                        >
                          {isShortage ? 'Pedagang · Kelangkaan' : 'Warga · Laporan Harga'}
                        </span>
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                        {report.commodityName}
                      </h3>
                      <p className="text-xs text-[var(--text-secondary)]">{report.marketName}</p>
                    </div>

                    <div className="flex flex-col sm:items-end gap-1.5 shrink-0">
                      {info.group === 'SELESAI' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--forest-surface)] text-[var(--forest-ink)] border border-[var(--forest-ink)]/40 inline-flex items-center gap-1.5">
                          <CheckCircle size={14} weight="bold" />
                          <span>{info.label}</span>
                        </span>
                      )}
                      {info.group === 'DIPROSES' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--ochre-surface)] text-[var(--warning-ink)] border border-[var(--earth-ochre)]/45 inline-flex items-center gap-1.5">
                          <Hourglass size={14} weight="bold" />
                          <span>{info.label}</span>
                        </span>
                      )}
                      {info.group === 'DITOLAK' && (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--accent-chili-soft)] text-[var(--accent-chili)] border border-[var(--accent-chili)]/40 inline-flex items-center gap-1.5">
                          <Prohibit size={14} weight="bold" />
                          <span>{info.label}</span>
                        </span>
                      )}

                      {isShortage ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#92400E]">
                          <Package size={14} weight="bold" />
                          <span>Stok: {report.stockStatus || 'TERBATAS'}</span>
                        </span>
                      ) : (
                        <div className="sm:text-right">
                          <span className="font-mono-num text-sm font-extrabold text-[var(--forest-ink)] block">
                            {formatRupiah(report.reportedPrice)} / {report.unit}
                          </span>
                          <span className="font-mono-num text-[11px] text-[var(--text-muted)]">
                            Setara {formatRupiah(report.normalizedPricePerKg)}/kg
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {report.anomalyReason && (
                    <div
                      className={`p-3 rounded-[10px] border text-xs flex items-start gap-2 ${
                        report.status === 'REJECTED'
                          ? 'bg-[var(--accent-chili-soft)] border-[var(--accent-chili)]/45 text-[var(--accent-chili)]'
                          : 'bg-[var(--ochre-surface)] border-[var(--earth-ochre)]/45 text-[var(--warning-ink)]'
                      }`}
                    >
                      <WarningCircle size={16} weight="fill" className="shrink-0 mt-0.5" />
                      <div>
                        <strong className="block">
                          {report.status === 'REJECTED'
                            ? 'Alasan Penolakan Moderator:'
                            : 'Catatan Verifikasi Statistik:'}
                        </strong>
                        <span className="text-[var(--text-primary)]">{report.anomalyReason}</span>
                      </div>
                    </div>
                  )}

                  {report.citizenNotes && (
                    <p className="text-xs text-[var(--text-secondary)] italic">
                      Catatan Anda: &ldquo;{report.citizenNotes}&rdquo;
                    </p>
                  )}

                  <ReportPhotoGallery
                    photoUrls={report.photoUrls}
                    fallbackPhotoUrl={report.photoUrl}
                    hasPhoto={report.hasPhoto}
                    emptyLabel="Laporan ini dikirim tanpa lampiran foto."
                    compact
                  />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
