import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import type { Order, Product } from '@/types';
import Card from '@/components/ui/Card';
import { BarChart3, TrendingUp, Package, DollarSign } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function StatsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [ordersData, productsData] = await Promise.all([
        sellerApi.getOrders(),
        sellerApi.getProducts(),
      ]);
      setOrders(ordersData);
      setProducts(productsData);
    } catch (err) {
      console.error('Failed to load stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalSpent = orders.reduce((sum, order) => sum + order.price, 0);
  const totalKeys = orders.length;
  const avgPrice = totalKeys > 0 ? totalSpent / totalKeys : 0;

  // Group by product
  const productStats = products.map((product) => {
    const productOrders = orders.filter((o) => {
      if (typeof o.product === 'object' && o.product !== null) {
        return o.product._id === product._id;
      }
      return o.product === product._id || o.productName === product.name;
    });
    return {
      name: product.name,
      purchased: productOrders.length,
      revenue: productOrders.reduce((sum, o) => sum + o.price, 0),
    };
  });

  if (isLoading) {
    return <Card>Loading stats...</Card>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Keys</p>
              <p className="text-2xl font-bold text-cyan-400">{totalKeys}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-teal-500/10 to-emerald-500/10 border-teal-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-teal-400">{formatCurrency(totalSpent)}</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/30">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg Price</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(avgPrice)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Product Stats */}
      <Card title="Product Statistics">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-row">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">Product</th>
                <th className="text-right py-3 px-4 text-gray-300 font-semibold">Purchased</th>
                <th className="text-right py-3 px-4 text-gray-300 font-semibold">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {productStats.map((stat, idx) => (
                <tr key={idx} className="table-row">
                  <td className="py-3 px-4 text-gray-200">{stat.name}</td>
                  <td className="py-3 px-4 text-right text-cyan-400">{stat.purchased}</td>
                  <td className="py-3 px-4 text-right text-teal-400 font-semibold">
                    {formatCurrency(stat.revenue)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}

