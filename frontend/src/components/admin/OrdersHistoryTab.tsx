import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import { ShoppingBag, Copy, Check, Search, DollarSign } from 'lucide-react';
import { formatPrice, formatDateShort } from '@/utils/format';

interface Order {
  _id: string;
  sellerEmail: string;
  sellerId: string;
  productName: string;
  productId: string;
  keyValue: string;
  price: number;
  purchasedAt: string;
  createdAt: string;
}

export default function OrdersHistoryTab() {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const data = await adminApi.getAllOrders();
      setOrders(data.orders);
      setTotalRevenue(data.totalRevenue);
      setTotalOrders(data.totalOrders);
    } catch (error: any) {
      // console.error('Error loading orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      // console.error('Failed to copy key:', error);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const query = searchQuery.toLowerCase();
    return (
      order.sellerEmail.toLowerCase().includes(query) ||
      order.productName.toLowerCase().includes(query) ||
      order.keyValue.toLowerCase().includes(query)
    );
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <SkeletonLoader count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="water-droplet w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(2px) saturate(120%)',
                WebkitBackdropFilter: 'blur(2px) saturate(120%)',
              }}
            >
              <ShoppingBag className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">{t('admin.totalOrders') || 'Tổng đơn hàng'}</p>
              <p className="text-2xl font-bold text-white">{totalOrders}</p>
            </div>
          </div>
        </Card>

        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div
              className="water-droplet w-12 h-12 flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(2px) saturate(120%)',
                WebkitBackdropFilter: 'blur(2px) saturate(120%)',
              }}
            >
              <DollarSign className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-white/70">{t('admin.totalRevenue') || 'Tổng doanh thu'}</p>
              <p className="text-2xl font-bold text-white">{formatPrice(totalRevenue)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
          <input
            type="text"
            placeholder={t('common.search') || 'Tìm kiếm...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field w-full pl-12"
            style={{ fontSize: '16px' }}
          />
        </div>
      </Card>

      {/* Orders List */}
      <Card
        style={{
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="w-16 h-16 text-white/20 mx-auto mb-4" />
              <p className="text-white/70">
                {searchQuery ? t('common.noData') || 'Không tìm thấy' : t('admin.noOrders') || 'Chưa có đơn hàng nào'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                      {t('admin.seller') || 'Seller'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                      {t('admin.product') || 'Sản phẩm'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                      {t('admin.key') || 'Key'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                      {t('admin.price') || 'Giá'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                      {t('admin.purchasedAt') || 'Ngày mua'}
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-white/80">
                      {t('common.actions') || 'Thao tác'}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4">
                        <p className="text-white text-sm">{order.sellerEmail}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white text-sm">{order.productName}</p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <code className="text-xs text-cyan-400 bg-white/5 px-2 py-1 rounded font-mono max-w-[200px] truncate">
                            {order.keyValue}
                          </code>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white text-sm font-semibold">{formatPrice(order.price)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-white/70 text-sm">{formatDateShort(order.purchasedAt)}</p>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleCopyKey(order.keyValue)}
                          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                          title={copiedKey === order.keyValue ? t('common.copied') || 'Đã copy' : t('common.copy') || 'Copy'}
                        >
                          {copiedKey === order.keyValue ? (
                            <Check className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/60 hover:text-white" />
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

