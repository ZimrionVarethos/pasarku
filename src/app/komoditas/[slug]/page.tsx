import { notFound } from 'next/navigation';
import { fetchCommodityDetail } from '@/lib/api/commodities.api';
import { CommodityBreadcrumb } from '@/components/commodity-detail/CommodityBreadcrumb';
import { CommodityHeroHeader } from '@/components/commodity-detail/CommodityHeroHeader';
import { ThreeLayerPriceCards } from '@/components/commodity-detail/ThreeLayerPriceCards';
import { PriceFluctuationChartCard } from '@/components/commodity-detail/PriceFluctuationChartCard';
import { MarketComparisonCard } from '@/components/commodity-detail/MarketComparisonCard';
import { RecentCitizenReportsTable } from '@/components/commodity-detail/RecentCitizenReportsTable';
import { CommodityHitTracker } from '@/components/commodity-detail/CommodityHitTracker';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CommodityDetailPage({ params }: Props) {
  const { slug } = await params;
  const commodity = await fetchCommodityDetail(slug);

  if (!commodity) {
    notFound();
  }

  const history = commodity.priceHistory || [];
  const latestPrice = history.length > 0 ? history[history.length - 1].avgPrice : commodity.currentPriceStats.cityAverage;
  const prevPrice = history.length > 1 ? history[history.length - 2].avgPrice : latestPrice;
  const changePercentage =
    prevPrice > 0 ? Math.round(((latestPrice - prevPrice) / prevPrice) * 1000) / 10 : 0;

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
      <div className="max-w-[1240px] mx-auto space-y-8">
        <CommodityHitTracker slug={commodity.slug} />
        <CommodityBreadcrumb commodityName={commodity.name} />

        <CommodityHeroHeader detail={commodity} changePercentage={changePercentage} />

        <ThreeLayerPriceCards detail={commodity} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          <PriceFluctuationChartCard detail={commodity} />
          <MarketComparisonCard detail={commodity} />
        </div>

        <RecentCitizenReportsTable detail={commodity} />
      </div>
    </div>
  );
}
