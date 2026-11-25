import { fetchCommodities } from '@/lib/api/commodities.api';
import { CommodityDashboardView } from '@/components/dashboard/CommodityDashboardView';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';

export default async function DashboardPage() {
  const commodities = await fetchCommodities();
  const formattedToday = new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="w-full px-4 sm:px-8 lg:px-12 py-10 sm:py-14">
      <div className="max-w-[1240px] mx-auto space-y-8">
        <DashboardHeader lastUpdatedText={`${formattedToday}, 06:00 WIB`} />
        <CommodityDashboardView initialCommodities={commodities} />
      </div>
    </div>
  );
}
