'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { LockKey, ShieldCheck, SignIn, UserPlus } from '@phosphor-icons/react';
import { CommoditySummary, Market, ReportType, ReporterRole, StockStatus } from '@/types';
import { LaporFormCard } from './LaporFormCard';
import { LaporVerificationCard } from './LaporVerificationCard';
import { LaporSuccessCard } from './LaporSuccessCard';
import { submitCitizenReport } from '@/lib/api/reports.api';
import { filterMarketsForRegion } from '@/lib/mock/markets.data';
import { resolveCanonicalMarket } from '@/lib/market-insights';
import { useRegion } from '@/lib/store/region-store';
import { useAdminStore } from '@/lib/store/admin-store';
import { useLiveCatalog } from '@/lib/store/use-live-catalog';
import { useUserAuth } from '@/lib/store/user-auth-store';

interface Props {
  commodities: CommoditySummary[];
  markets: Market[];
  initialCommoditySlug?: string;
  initialMarketId?: string;
  initialPrice?: string;
  initialMode?: ReportType;
}

interface SubmittedReportState {
  reportId: string;
  commodityName: string;
  marketName: string;
  pricePerUnit: number;
  unitLabel: string;
  normalizedPricePerKg: number;
  reportType: ReportType;
  stockStatus?: StockStatus;
  photoCount: number;
}

export function LaporContainer({
  commodities,
  markets,
  initialCommoditySlug,
  initialMarketId,
  initialPrice,
  initialMode = 'PRICE',
}: Props) {
  const { selectedRegion, regionMarkets } = useRegion();
  const { addReport } = useAdminStore();
  const { commodities: liveCommodities, markets: liveMarkets } = useLiveCatalog();
  const { user, isAuthLoaded, getAuthHeaders } = useUserAuth();

  const currentCommodities = liveCommodities.length > 0 ? liveCommodities : commodities;
  const currentMarkets = useMemo(() => {
    const base = liveMarkets.length > 0 ? liveMarkets : markets;
    const filtered = filterMarketsForRegion(base, selectedRegion.id);
    if (filtered.length > 0) return filtered;
    return regionMarkets.length > 0 ? regionMarkets : markets;
  }, [liveMarkets, markets, regionMarkets, selectedRegion.id]);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submittedReport, setSubmittedReport] = useState<SubmittedReportState | null>(null);

  const handleSubmit = async (data: {
    commodityId: string;
    marketId: string;
    price: number;
    quantity: number;
    unit: string;
    normalizedPrice: number;
    reportType: ReportType;
    reporterRole: ReporterRole;
    stockStatus?: StockStatus;
    purchaseDate: string;
    photoUrls: string[];
    notes: string;
  }) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const res = await submitCitizenReport({
        commodityId: data.commodityId,
        marketId: data.marketId,
        reportedPrice: data.price,
        quantity: data.quantity,
        unit: data.unit,
        normalizedPrice: data.normalizedPrice,
        reportType: data.reportType,
        reporterRole: data.reporterRole,
        stockStatus: data.stockStatus,
        purchaseDate: data.purchaseDate,
        photoUrls: data.photoUrls,
        notes: data.notes,
        authHeaders: getAuthHeaders(),
      });

      const matchedCommodity = currentCommodities.find((c) => c.id === data.commodityId);
      const matchedMarket = resolveCanonicalMarket(currentMarkets, data.marketId);

      if (res.data.reportRecord) {
        addReport(res.data.reportRecord, true);
      }

      setSubmittedReport({
        reportId: res.data.reportId,
        commodityName: matchedCommodity?.name || res.data.commodityName || 'Komoditas Pangan',
        marketName: matchedMarket?.name || res.data.marketName || 'Pasar Rakyat',
        pricePerUnit: data.price,
        unitLabel: data.unit,
        normalizedPricePerKg: data.normalizedPrice,
        reportType: data.reportType,
        stockStatus: data.stockStatus,
        photoCount: data.photoUrls.length,
      });
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Gagal mengirim laporan saat ini. Silakan periksa data lalu coba lagi.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-7 xl:col-span-7 space-y-3">
        {submitError && (
          <div className="p-3.5 rounded-xl bg-[var(--accent-chili-soft)] border-2 border-[var(--accent-chili)] text-xs font-bold text-[var(--accent-chili)]">
            {submitError}
          </div>
        )}

        {!isAuthLoaded ? (
          <div className="market-card p-8 text-center text-xs font-bold text-[var(--text-muted)]">
            Memeriksa status akun PasarKu...
          </div>
        ) : !user ? (
          <div className="market-card p-6 sm:p-8 flex flex-col gap-5">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-xl bg-[var(--accent-chili-soft)] border-2 border-[var(--border-ink)] text-[var(--accent-chili)] flex items-center justify-center shrink-0">
                <LockKey size={24} weight="bold" />
              </div>
              <div className="space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--accent-chili)]">
                  Perlindungan Anti-Fraud Laporan
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
                  Masuk Terlebih Dahulu untuk Mengirim Laporan
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
                  Untuk menjaga keakuratan data Lapis 3 dan mencegah spam fiktif, pelaporan harga maupun kelangkaan memerlukan akun terverifikasi Google atau OTP Gmail.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-[12px] bg-[var(--bg-muted)] border border-[var(--border-subtle)] space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 font-bold text-[var(--forest-ink)]">
                <ShieldCheck size={16} weight="bold" />
                <span>Manfaat Akun Terverifikasi PasarKu:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Unggah hingga 4 foto bukti struk/lapak per laporan (EXIF GPS dibersihkan otomatis).</li>
                <li>Pantau status laporan Anda (Diproses, Selesai/Diterima, atau Ditolak) di Dashboard Pengguna.</li>
                <li>Identitas Anda hanya untuk audit moderator dan tetap anonim di papan publik.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-1">
              <Link
                href="/masuk?next=/lapor"
                className="market-btn-primary flex-1 py-3 px-5 text-xs font-bold inline-flex items-center justify-center gap-2 no-underline"
              >
                <SignIn size={16} weight="bold" />
                <span>Masuk (Google / OTP Gmail)</span>
              </Link>
              <Link
                href="/daftar?next=/lapor"
                className="market-btn-secondary flex-1 py-3 px-5 text-xs font-bold inline-flex items-center justify-center gap-2 no-underline"
              >
                <UserPlus size={16} weight="bold" />
                <span>Daftar Akun Baru</span>
              </Link>
            </div>
          </div>
        ) : submittedReport ? (
          <LaporSuccessCard
            reportId={submittedReport.reportId}
            commodityName={submittedReport.commodityName}
            marketName={submittedReport.marketName}
            pricePerUnit={submittedReport.pricePerUnit}
            unitLabel={submittedReport.unitLabel}
            normalizedPricePerKg={submittedReport.normalizedPricePerKg}
            reportType={submittedReport.reportType}
            stockStatus={submittedReport.stockStatus}
            photoCount={submittedReport.photoCount}
            onReset={() => setSubmittedReport(null)}
          />
        ) : (
          <LaporFormCard
            commodities={currentCommodities}
            markets={currentMarkets}
            isSubmitting={isSubmitting}
            reporterLabel={`${user.name} (${user.email})`}
            initialCommoditySlug={initialCommoditySlug}
            initialMarketId={initialMarketId}
            initialPrice={initialPrice}
            initialMode={initialMode}
            onSubmit={handleSubmit}
          />
        )}
      </div>

      <div className="lg:col-span-5 xl:col-span-5">
        <LaporVerificationCard />
      </div>
    </div>
  );
}
