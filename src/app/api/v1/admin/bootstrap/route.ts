import { NextRequest, NextResponse } from 'next/server';
import { fetchBootstrapFromDb } from '@/lib/server/admin-db';
import { isAuthorizedAdminRequest } from '@/lib/server/admin-session';
import { INITIAL_ADMIN_STATE } from '@/lib/store/admin-seed';
import type { AdminReport } from '@/lib/types/admin';

function sanitizePublicReports(reports: AdminReport[]): AdminReport[] {
  return reports
    .filter((r) => r.status === 'APPROVED')
    .map((r) => ({
      ...r,
      userId: undefined,
      reporterName: undefined,
      reporterEmail: undefined,
    }));
}

export async function GET(req: NextRequest) {
  const isAdmin = isAuthorizedAdminRequest(req);
  try {
    const data = await fetchBootstrapFromDb();
    const visibleReports = isAdmin ? data.reports : sanitizePublicReports(data.reports);
    return NextResponse.json({
      success: true,
      message: 'Data terpusat Supabase berhasil dimuat.',
      data: {
        source: 'supabase',
        commodities: data.commodities.length > 0 ? data.commodities : INITIAL_ADMIN_STATE.commodities,
        markets: data.markets.length > 0 ? data.markets : INITIAL_ADMIN_STATE.markets,
        dailyPrices:
          Object.keys(data.dailyPrices).length > 0 ? data.dailyPrices : INITIAL_ADMIN_STATE.dailyPrices,
        reports: visibleReports,
      },
    });
  } catch (err) {
    const fallbackReports = isAdmin
      ? INITIAL_ADMIN_STATE.reports
      : sanitizePublicReports(INITIAL_ADMIN_STATE.reports);
    return NextResponse.json({
      success: true,
      message: err instanceof Error ? `Fallback aktif: ${err.message}` : 'Fallback aktif.',
      data: {
        source: 'fallback',
        commodities: INITIAL_ADMIN_STATE.commodities,
        markets: INITIAL_ADMIN_STATE.markets,
        dailyPrices: INITIAL_ADMIN_STATE.dailyPrices,
        reports: fallbackReports,
      },
    });
  }
}
