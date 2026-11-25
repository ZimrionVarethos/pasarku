import { Metadata } from 'next';
import { AboutHeroHeader } from '@/components/about/AboutHeroHeader';
import { AboutDemoNotice } from '@/components/about/AboutDemoNotice';
import { AboutDataSourceCards } from '@/components/about/AboutDataSourceCards';
import { AboutMethodologySection } from '@/components/about/AboutMethodologySection';
import { AboutEthicsPrinciples } from '@/components/about/AboutEthicsPrinciples';
import { AboutTeamAndTechStack } from '@/components/about/AboutTeamAndTechStack';

export const metadata: Metadata = {
  title: 'Tentang & Sumber Data Resmi · PasarKu',
  description:
    'Transparansi data pangan, metodologi evaluasi 3 lapis, filter anomali harga, serta 5 prinsip etika perlindungan lapak pedagang pasar tradisional.',
};

export default function TentangPage() {
  return (
    <div className="w-full bg-[var(--bg-paper)] py-10 sm:py-14 px-4 sm:px-8 lg:px-12 transition-colors">
      <div className="max-w-[1240px] mx-auto space-y-12">
        <AboutHeroHeader />

        <AboutDemoNotice />

        <AboutDataSourceCards />

        <AboutMethodologySection />

        <AboutEthicsPrinciples />

        <AboutTeamAndTechStack />
      </div>
    </div>
  );
}
