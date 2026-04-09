import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import type { Order } from '@/types';
import Card from '@/components/ui/Card';
import { BarChart3, TrendingUp, Package, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { getDisplayProductName } from '@/utils/translateProductName';

type Props = {
  /** Ẩn phần tiêu đề lớn (dùng trong tab Hồ sơ) */
  compactHeader?: boolean;
};

export default function SellerStatsPanel({ compactHeader = false }: Props) {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: showError } = useToastStore();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const ordersData = await sellerApi.getOrders();
      setOrders(ordersData);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load stats';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);
  const totalKeys = orders.length;
  const avgPrice = totalKeys > 0 ? totalSpent / totalKeys : 0;

  const productStats = orders.reduce(
    (acc, order) => {
      const productName =
        typeof order.product === 'object' && order.product !== null
          ? order.product.name
          : order.productName || 'Unknown';

      const key = productName;
      if (!acc[key]) {
        acc[key] = { name: getDisplayProductName(productName, language), purchased: 0, revenue: 0 };
      }
      acc[key].purchased += 1;
      acc[key].revenue += order.price || 0;
      return acc;
    },
    {} as Record<string, { name: string; purchased: number; revenue: number }>
  );

  const productStatsList = Object.values(productStats);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[280px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
          <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {compactHeader ? (
        <div className="flex items-center gap-3">
          <BarChart3 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
          <h2 className="text-lg font-semibold text-white">{t('stats.title')}</h2>
        </div>
      ) : null}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Card
          className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Package className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('stats.totalKeys')}</p>
              <p className="text-3xl font-bold text-cyan-400">{totalKeys}</p>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <DollarSign className="w-7 h-7 text-teal-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('stats.totalSpent')}</p>
              <p className="text-3xl font-bold text-teal-400">{formatCurrency(totalSpent, language, usdToVnd)}</p>
            </div>
          </div>
        </Card>

        <Card
          className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('stats.avgPrice')}</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(avgPrice, language, usdToVnd)}</p>
            </div>
          </div>
        </Card>
      </div>

      <Card
        title={t('stats.productStatistics')}
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {productStatsList.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{t('stats.noStatistics')}</p>
          </div>
        ) : (
          <>
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">Product</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">{t('stats.purchased')}</th>
                  </tr>
                </thead>
                <tbody>
                  {productStatsList.map((stat, idx) => (
                    <tr key={idx} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                      <td className="py-4 px-4 text-gray-200 font-medium">{stat.name}</td>
                      <td className="py-4 px-4 text-right text-cyan-400 font-semibold">{stat.purchased}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-3">
              {productStatsList.map((stat, idx) => (
                <div key={idx} className="bg-gray-950/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-200 font-medium text-sm">{stat.name}</p>
                    <p className="text-cyan-400 font-semibold">{stat.purchased}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
