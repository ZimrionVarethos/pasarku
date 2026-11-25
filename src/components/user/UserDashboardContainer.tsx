'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useUserAuth } from '@/lib/store/user-auth-store';
import { useAdminStore } from '@/lib/store/admin-store';
import { fetchUserDashboardApi, type UserDashboardPayload } from '@/lib/api/user-auth.api';
import { DEFAULT_REGION, MOCK_REGIONS } from '@/lib/mock/regions.data';
import type { UserDashboardModule } from '@/lib/types/user';
import { UserTopbar } from './UserTopbar';
import { UserSidebar } from './UserSidebar';
import { UserHomeView } from './UserHomeView';
import { UserReportsHistoryView } from './UserReportsHistoryView';
import { UserSettingsView } from './UserSettingsView';

function resolveInitialTab(param: string | null): UserDashboardModule {
  if (param === 'riwayat') return 'riwayat';
  if (param === 'pengaturan') return 'pengaturan';
  return 'home';
}

export function UserDashboardContainer() {
  const searchParams = useSearchParams();
  const { user, token } = useUserAuth();
  const { reports: storeReports, commodities: storeCommodities, dailyPrices } = useAdminStore();

  const [activeModule, setActiveModule] = useState<UserDashboardModule>(() =>
    resolveInitialTab(searchParams.get('tab'))
  );
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState<UserDashboardPayload | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetchUserDashboardApi(token);
      if (res.success && res.data) {
        setDashboardData(res.data);
      }
    } catch {
    }
  }, [token]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard, user?.preferredRegionId]);

  const activeRegion = useMemo(() => {
    if (dashboardData?.region) return dashboardData.region;
    return (
      MOCK_REGIONS.find((r) => r.id === user?.preferredRegionId) || DEFAULT_REGION
    );
  }, [dashboardData?.region, user?.preferredRegionId]);

  const mergedReports = useMemo(() => {
    const serverReports = dashboardData?.reports || [];
    const seen = new Set(serverReports.map((r) => r.id));
    const localOwn = storeReports.filter(
      (r) =>
        !seen.has(r.id) &&
        user &&
        (r.userId === user.id ||
          (r.reporterEmail && r.reporterEmail.toLowerCase() === user.email.toLowerCase()))
    );
    return [...localOwn, ...serverReports];
  }, [dashboardData?.reports, storeReports, user]);

  const fallbackRegionalSummary = useMemo(() => {
    if (dashboardData?.regionalSummary && dashboardData.regionalSummary.length > 0) {
      return dashboardData.regionalSummary;
    }
    return storeCommodities
      .filter((c) => c.isActive)
      .slice(0, 8)
      .map((c) => {
        const prices = Object.values(dailyPrices)
          .filter((p) => p.commodityId === c.id && p.price > 0)
          .map((p) => p.price);
        const avg =
          prices.length > 0
            ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)
            : c.hapHetPrice;
        const regionalPrice = Math.round(avg * activeRegion.disparityIndex);
        const hapHetPrice = Math.round(c.hapHetPrice * activeRegion.disparityIndex);
        const diffPercent =
          hapHetPrice > 0
            ? Math.round(((regionalPrice - hapHetPrice) / hapHetPrice) * 1000) / 10
            : 0;
        return {
          commodityId: c.id,
          slug: c.slug,
          name: c.name,
          category: c.category,
          unit: c.unit,
          regionalPrice,
          hapHetPrice,
          diffPercent,
        };
      });
  }, [dashboardData?.regionalSummary, storeCommodities, dailyPrices, activeRegion]);

  const topCommodities = useMemo(() => {
    if (dashboardData?.topCommodities && dashboardData.topCommodities.length > 0) {
      return dashboardData.topCommodities;
    }
    return fallbackRegionalSummary.slice(0, 3).map((item, idx) => ({
      ...item,
      queryCount: Math.max(1, 3 - idx),
    }));
  }, [dashboardData?.topCommodities, fallbackRegionalSummary]);

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col justify-between gap-6">
      <div className="space-y-6 flex-1 flex flex-col">
        <UserTopbar
          regionName={activeRegion.name}
          onOpenMobileSidebar={() => setIsMobileNavOpen(true)}
        />

        <div className="flex-1 flex flex-col lg:flex-row gap-6 items-start">
          <UserSidebar
            user={user}
            activeModule={activeModule}
            onSelectModule={setActiveModule}
            reportCount={mergedReports.length}
            isOpenMobile={isMobileNavOpen}
            onCloseMobile={() => setIsMobileNavOpen(false)}
          />

          <main className="flex-1 w-full min-w-0">
            {activeModule === 'home' && (
              <UserHomeView
                user={user}
                region={activeRegion}
                topCommodities={topCommodities}
                regionalSummary={fallbackRegionalSummary}
                reports={mergedReports}
                onNavigate={setActiveModule}
              />
            )}
            {activeModule === 'riwayat' && (
              <UserReportsHistoryView reports={mergedReports} />
            )}
            {activeModule === 'pengaturan' && (
              <UserSettingsView user={user} onProfileSaved={loadDashboard} />
            )}
          </main>
        </div>
      </div>

      <footer className="mt-auto pt-5 pb-2 text-xs text-[var(--text-muted)] flex flex-col sm:flex-row items-center justify-between gap-2 border-t-2 border-[var(--border-subtle)]">
        <span className="font-semibold text-[var(--text-secondary)]">
          PasarKu Dashboard Warga &middot; Tawar Pintar, Belanja Wajar
        </span>
        <span className="font-mono-num text-[11px]">
          Sistem Pantauan Harga Pasar Rakyat
        </span>
      </footer>
    </div>
  );
}
