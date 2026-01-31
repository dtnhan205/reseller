import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import type { Order } from '@/types';
import Card from '@/components/ui/Card';
import { Key, Download } from 'lucide-react';
import { formatCurrency, formatDateShort, truncateKey } from '@/utils/format';

export default function HistoryPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const data = await sellerApi.getOrders();
      setOrders(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadCSV = () => {
    const headers = ['#', 'KEY', 'TYPE', 'PRICE', 'DATE'];
    const rows = orders.map((order, idx) => [
      idx + 1,
      order.key,
      order.productName,
      order.price.toString(),
      formatDateShort(order.createdAt),
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `key-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <Card>Loading history...</Card>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
      <Card title="Key History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-row">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">#</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">KEY</th>
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">TYPE</th>
                <th className="text-right py-3 px-4 text-gray-300 font-semibold">PRICE</th>
                <th className="text-right py-3 px-4 text-gray-300 font-semibold">DATE</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">
                    No purchase history yet
                  </td>
                </tr>
              ) : (
                orders.map((order, idx) => (
                  <tr key={order._id} className="table-row">
                    <td className="py-3 px-4 text-gray-200">#{idx + 1}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Key className="w-4 h-4 text-cyan-400" />
                        <span className="text-gray-200 font-mono text-sm">
                          {truncateKey(order.key, 20)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-200">{order.productName}</td>
                    <td className="py-3 px-4 text-right text-teal-400 font-semibold">
                      {formatCurrency(order.price)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 text-sm">
                      {formatDateShort(order.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {orders.length > 0 && (
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleDownloadCSV}
              className="btn-secondary flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download CSV
            </button>
          </div>
        )}
      </Card>
      </div>
    </div>
  );
}

