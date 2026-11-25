import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizedUserFromRequest } from '@/lib/server/user-session';
import {
  findUserById,
  getSeedReportsForUser,
  toPublicUserProfile,
} from '@/lib/server/user-db';
import { fetchCatalogFromDb, fetchUserReportsFromDb } from '@/lib/server/admin-db';
import { INITIAL_ADMIN_STATE } from '@/lib/store/admin-seed';
import { MOCK_REGIONS, DEFAULT_REGION } from '@/lib/mock/regions.data';
import type { AdminReport } from '@/lib/types/admin';
import type { UserCommodityHitSummary } from '@/lib/types/user';

const DEFAULT_TOP_SLUGS = ['cabai-rawit-merah', 'bawang-merah-brebes', 'beras-medium-ir64'];

export async function GET(req: NextRequest) {
  const auth = getAuthorizedUserFromRequest(req);
  if (!auth) {
    return NextResponse.json(
      { success: false, message: 'Autentikasi pengguna diperlukan.' },
      { status: 401 }
    );
  }

  const user = await findUserById(auth.userId);
  if (!user) {
    return NextResponse.json(
      { success: false, message: 'Profil pengguna tidak ditemukan.' },
      { status: 404 }
    );
  }

  const region =
    MOCK_REGIONS.find(
      (r) => r.id === user.preferredRegionId || r.slug === user.preferredRegionId
    ) || DEFAULT_REGION;

  const catalog = await fetchCatalogFromDb().catch(() => null);
  const commodities =
    catalog && catalog.commodities.length > 0
      ? catalog.commodities
      : INITIAL_ADMIN_STATE.commodities;
  const dailyPrices =
    catalog && Object.keys(catalog.dailyPrices).length > 0
      ? catalog.dailyPrices
      : INITIAL_ADMIN_STATE.dailyPrices;

  const priceSums = new Map<string, { sum: number; count: number }>();
  for (const record of Object.values(dailyPrices)) {
    if (record.price <= 0) continue;
    const prev = priceSums.get(record.commodityId) || { sum: 0, count: 0 };
    priceSums.set(record.commodityId, {
      sum: prev.sum + record.price,
      count: prev.count + 1,
    });
  }

  const getRegionalPrice = (commodityId: string, hapHetPrice: number): number => {
    const agg = priceSums.get(commodityId);
    const base = agg && agg.count > 0 ? Math.round(agg.sum / agg.count) : hapHetPrice;
    return Math.round(base * region.disparityIndex);
  };

  const activeCommodities = commodities.filter((c) => c.isActive);
  const freqEntries = Object.entries(user.frequentCommodities || {})
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1]);

  const selectedSlugs: Array<{ slug: string; count: number }> = [];
  for (const [slug, count] of freqEntries) {
    if (selectedSlugs.length >= 3) break;
    if (activeCommodities.some((c) => c.slug === slug || c.id === slug)) {
      selectedSlugs.push({ slug, count });
    }
  }
  for (const fallbackSlug of DEFAULT_TOP_SLUGS) {
    if (selectedSlugs.length >= 3) break;
    if (!selectedSlugs.some((s) => s.slug === fallbackSlug)) {
      selectedSlugs.push({ slug: fallbackSlug, count: 1 });
    }
  }

  const topCommodities: UserCommodityHitSummary[] = selectedSlugs
    .map<UserCommodityHitSummary | null>(({ slug, count }) => {
      const com = activeCommodities.find((c) => c.slug === slug || c.id === slug);
      if (!com) return null;
      const regionalPrice = getRegionalPrice(com.id, com.hapHetPrice);
      const regionalHap = Math.round(com.hapHetPrice * region.disparityIndex);
      const diffPercent =
        regionalHap > 0
          ? Math.round(((regionalPrice - regionalHap) / regionalHap) * 1000) / 10
          : 0;
      return {
        commodityId: com.id,
        slug: com.slug,
        name: com.name,
        category: String(com.category),
        unit: com.unit,
        queryCount: count,
        regionalPrice,
        hapHetPrice: regionalHap,
        diffPercent,
      };
    })
    .filter((item): item is UserCommodityHitSummary => item !== null);

  const regionalSummary = activeCommodities.slice(0, 8).map((com) => {
    const regionalPrice = getRegionalPrice(com.id, com.hapHetPrice);
    const regionalHap = Math.round(com.hapHetPrice * region.disparityIndex);
    const diffPercent =
      regionalHap > 0
        ? Math.round(((regionalPrice - regionalHap) / regionalHap) * 1000) / 10
        : 0;
    return {
      commodityId: com.id,
      slug: com.slug,
      name: com.name,
      category: com.category,
      unit: com.unit,
      regionalPrice,
      hapHetPrice: regionalHap,
      diffPercent,
    };
  });

  let dbReports: AdminReport[] = [];
  try {
    dbReports = await fetchUserReportsFromDb(user.id, user.email);
  } catch {
    dbReports = [];
  }

  const seedReports = getSeedReportsForUser(user.id, user.email);
  const seenIds = new Set(dbReports.map((r) => r.id));
  const reports = [...dbReports, ...seedReports.filter((r) => !seenIds.has(r.id))];

  return NextResponse.json({
    success: true,
    message: 'Data dashboard pengguna dimuat.',
    data: {
      user: toPublicUserProfile(user),
      region,
      topCommodities,
      regionalSummary,
      reports,
    },
  });
}
