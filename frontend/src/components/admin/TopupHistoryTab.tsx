import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import { History } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';

interface AdminTopupHistoryItem {
  _id: string;
  sellerEmail: string;
  amount: number; // VND (backward compatibility)
  amountUSD?: number; // USD
  transferContent?: string;
  note?: string;
  createdAt: string;
}

export default function TopupHistoryTab() {
  const { t, language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  const [history, setHistory] = useState<AdminTopupHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllTopupHistory();
      setHistory(
        data.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader />
        <SkeletonLoader />
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card
        title="Lịch sử nạp tiền"
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {history.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-16 h-16 text-white/20 mx-auto mb-4" />
            <p className="text-white/70">{t('admin.noTopupHistory')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Gmail</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">Nội dung nạp</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-white/80">Số tiền</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-white/80">Ngày giờ</th>
                </tr>
              </thead>
              <tbody>
                {history.map((item) => {
                  const amountUSD = item.amountUSD || item.amount / usdToVnd;
                  const content = item.note || item.transferContent || '-';
                  return (
                    <tr
                      key={item._id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="text-white text-sm break-all">{item.sellerEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white/80 text-sm break-all">{content}</p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-white text-sm font-semibold">
                          +{formatCurrency(amountUSD, language, usdToVnd)}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <p className="text-white/70 text-sm">{formatDateShort(item.createdAt)}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
