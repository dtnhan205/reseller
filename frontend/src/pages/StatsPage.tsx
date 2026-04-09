import { BarChart3 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import SellerStatsPanel from '@/components/seller/SellerStatsPanel';

export default function StatsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
          <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('stats.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">{t('stats.subtitle')}</p>
        </div>
      </div>

      <SellerStatsPanel />
    </div>
  );
}
