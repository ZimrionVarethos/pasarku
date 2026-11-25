'use client';

import { useState } from 'react';
import {
  CheckCircle,
  Prohibit,
  WarningCircle,
  Question,
  Package,
  UserCheck,
} from '@phosphor-icons/react';
import { AdminReport } from './admin-data';
import { formatRupiah } from '@/lib/utils';
import { ReportPhotoGallery } from '@/components/common/ReportPhotoGallery';

interface Props {
  report: AdminReport;
  onApprove: (id: string) => void;
  onReject: (id: string, reason?: string) => void;
  onRequestMoreInfo: (id: string) => void;
}

const REJECT_PRESETS = [
  'Foto bukti buram atau tidak sesuai komoditas.',
  'Nominal harga terindikasi anomali / tidak wajar dibanding struk.',
  'Laporan terdeteksi duplikat atau indikasi spam.',
];

export function AdminReportInspector({
  report,
  onApprove,
  onReject,
  onRequestMoreInfo,
}: Props) {
  const isShortage = report.reportType === 'SHORTAGE';
  const [showRejectBox, setShowRejectBox] = useState(false);
  const [rejectReason, setRejectReason] = useState(REJECT_PRESETS[0]);

  const handleConfirmReject = () => {
    onReject(report.id, rejectReason.trim() || REJECT_PRESETS[0]);
    setShowRejectBox(false);
  };

  return (
    <div className="market-card p-5 sm:p-7 flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b-2 border-[var(--border-ink)]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono-num text-[11px] font-bold text-[var(--text-muted)]">
              {report.id}
            </span>
            <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
            <span className="text-[11px] text-[var(--text-secondary)]">{report.submittedAt}</span>
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
          <h2 className="text-[20px] sm:text-[22px] font-bold text-[var(--text-primary)] tracking-tight mt-1">
            {report.commodityName}
          </h2>
          <span className="text-[12px] text-[var(--text-secondary)]">{report.marketName}</span>
        </div>

        <div>
          {report.status === 'ANOMALY' && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--ochre-surface)] text-[var(--warning-ink)] border border-[var(--earth-ochre)]/45 inline-flex items-center gap-1.5">
              <WarningCircle size={14} weight="bold" />
              <span>Peringatan Anomali Statistik</span>
            </span>
          )}
          {report.status === 'PENDING' && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--bg-muted)] text-[var(--text-primary)] border border-[var(--border-subtle)]">
              Menunggu Keputusan
            </span>
          )}
          {report.status === 'APPROVED' && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--forest-surface)] text-[var(--forest-ink)] border border-[var(--forest-ink)]/35 inline-flex items-center gap-1.5">
              <CheckCircle size={14} weight="bold" />
              <span>Telah Disetujui Masuk Publik</span>
            </span>
          )}
          {report.status === 'REJECTED' && (
            <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-[var(--accent-chili-soft)] text-[var(--accent-chili)] border border-[var(--accent-chili)]/35 inline-flex items-center gap-1.5">
              <Prohibit size={14} weight="bold" />
              <span>Ditolak / Dieliminasi</span>
            </span>
          )}
        </div>
      </div>

      {(report.reporterName || report.reporterEmail) && (
        <div className="px-3.5 py-2.5 rounded-[12px] bg-[var(--bg-paper)] border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1.5 font-bold text-[var(--text-primary)]">
            <UserCheck size={15} weight="bold" className="text-[var(--forest-ink)]" />
            <span>
              Akun Pelapor: {report.reporterName || 'Warga'}
              {report.reporterEmail ? ` (${report.reporterEmail})` : ''}
            </span>
          </span>
          <span className="text-[10px] font-bold text-[var(--text-muted)]">
            Audit internal · Anonim di publik
          </span>
        </div>
      )}

      {report.anomalyReason && (
        <div className="p-4 rounded-[12px] bg-[var(--ochre-surface)] border-2 border-[var(--border-ink)] flex items-start gap-3 text-[12px]">
          <WarningCircle size={20} weight="fill" className="text-[var(--warning-ink)] shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-bold text-[var(--warning-ink)]">
              {report.status === 'REJECTED' ? 'Alasan Penolakan / Diagnosa:' : 'Diagnosa Algoritma MAD:'}
            </span>
            <p className="text-[var(--text-secondary)] leading-relaxed">{report.anomalyReason}</p>
          </div>
        </div>
      )}

      {isShortage ? (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Detail Kelangkaan Pasokan (Agregat Anonim)
          </span>
          <div className="bg-[var(--bg-paper)] rounded-[12px] border-2 border-[var(--border-ink)] p-4 space-y-3 text-[13px]">
            <div className="flex items-center justify-between">
              <span className="text-[var(--text-secondary)] inline-flex items-center gap-1.5">
                <Package size={16} weight="bold" className="text-[var(--earth-ochre)]" />
                <span>Status Pasokan Dilaporkan</span>
              </span>
              <span className="px-3 py-1 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] font-extrabold text-xs">
                {report.stockStatus || 'TERBATAS'}
              </span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)] text-[12px]">
              <span className="text-[var(--text-muted)]">Tampilan Publik</span>
              <span className="font-bold text-[var(--forest-ink)]">
                Anonim (Hanya agregat {report.marketName})
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <span className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
            Komparasi 3 Lapis Harga
          </span>
          <div className="bg-[var(--bg-paper)] rounded-[12px] border-2 border-[var(--border-ink)] p-4 divide-y divide-[var(--border-subtle)] text-[13px]">
            <div className="flex items-center justify-between pb-2.5">
              <span className="text-[var(--text-secondary)]">Lapis 1: Acuan Bapanas (HAP/HET)</span>
              <span className="font-mono-num font-bold text-[var(--text-primary)] tabular-nums">
                {formatRupiah(report.officialHapPrice)} / kg
              </span>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[var(--text-secondary)]">Lapis 2: Rerata Daerah / PIHPS</span>
              <span className="font-mono-num font-bold text-[var(--text-primary)] tabular-nums">
                {formatRupiah(report.cityAvgPrice)} / kg
              </span>
            </div>
            <div className="flex items-center justify-between pt-2.5">
              <div className="flex flex-col">
                <span className="font-bold text-[var(--text-primary)]">Lapis 3: Laporan Warga</span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  Input: {formatRupiah(report.reportedPrice)} / {report.unit}
                </span>
              </div>
              <div className="text-right">
                <span className="font-mono-num font-extrabold text-[var(--forest-ink)] tabular-nums text-[15px] block">
                  {formatRupiah(report.normalizedPricePerKg)} / kg
                </span>
                <span
                  className={`text-[11px] font-bold tabular-nums ${
                    report.diffPercent > 20
                      ? 'text-[var(--accent-chili)]'
                      : report.diffPercent < 0
                      ? 'text-[var(--forest-ink)]'
                      : 'text-[var(--text-secondary)]'
                  }`}
                >
                  {report.diffPercent > 0 ? `+${report.diffPercent}%` : `${report.diffPercent}%`} vs Rerata
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ReportPhotoGallery
        photoUrls={report.photoUrls}
        fallbackPhotoUrl={report.photoUrl}
        hasPhoto={report.hasPhoto}
      />

      {report.citizenNotes && (
        <div className="p-3.5 rounded-[12px] bg-[var(--bg-paper)] border border-[var(--border-subtle)] flex flex-col gap-1 text-[12px]">
          <span className="font-bold text-[var(--text-muted)]">
            {isShortage ? 'Catatan Pedagang Pelapor:' : 'Catatan Warga Pelapor:'}
          </span>
          <p className="text-[var(--text-primary)] italic">&ldquo;{report.citizenNotes}&rdquo;</p>
        </div>
      )}

      {showRejectBox && (
        <div className="p-4 rounded-[12px] bg-[var(--accent-chili-soft)] border-2 border-[var(--accent-chili)] space-y-3">
          <div className="text-xs font-bold text-[var(--accent-chili)]">
            Pilih atau Tulis Alasan Penolakan (tampil di Riwayat Pengguna):
          </div>
          <div className="flex flex-wrap gap-1.5">
            {REJECT_PRESETS.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setRejectReason(preset)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border cursor-pointer ${
                  rejectReason === preset
                    ? 'bg-[var(--accent-chili)] text-white border-[var(--border-ink)]'
                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-subtle)]'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border-ink)] text-xs text-[var(--text-primary)]"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleConfirmReject}
              className="px-4 py-2 rounded-lg bg-[var(--accent-chili)] text-white text-xs font-bold border-2 border-[var(--border-ink)] cursor-pointer"
            >
              Konfirmasi Tolak
            </button>
            <button
              type="button"
              onClick={() => setShowRejectBox(false)}
              className="market-btn-secondary px-3 py-2 text-xs font-bold cursor-pointer"
            >
              Batal
            </button>
          </div>
        </div>
      )}

      <div className="pt-4 border-t-2 border-[var(--border-subtle)] flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setShowRejectBox(false);
            onApprove(report.id);
          }}
          className="flex-1 py-2.5 px-4 rounded-[10px] bg-[#245034] hover:bg-[#1A3B26] border-2 border-[var(--border-ink)] text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-[var(--shadow-hard-sm)] transition-all cursor-pointer"
        >
          <CheckCircle size={16} weight="bold" />
          <span>Setujui Laporan</span>
        </button>

        <button
          type="button"
          onClick={() => setShowRejectBox((prev) => !prev)}
          className="flex-1 py-2.5 px-4 rounded-[10px] bg-[var(--accent-chili-soft)] hover:bg-[var(--accent-chili)] hover:text-white border-2 border-[var(--border-ink)] text-[var(--accent-chili)] text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-[var(--shadow-hard-sm)] transition-all cursor-pointer"
        >
          <Prohibit size={16} weight="bold" />
          <span>Tolak Laporan</span>
        </button>

        <button
          type="button"
          onClick={() => onRequestMoreInfo(report.id)}
          className="market-btn-secondary py-2.5 px-3 text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer"
          title="Tandai Butuh Investigasi"
        >
          <Question size={16} weight="bold" />
          <span className="hidden sm:inline">Investigasi</span>
        </button>
      </div>
    </div>
  );
}
