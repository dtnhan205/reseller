import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import type { TopupTransaction } from '@/types';
import Card from '@/components/ui/Card';
import { ArrowDownCircle } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TopupTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await sellerApi.getTopupHistory();
      setTransactions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const totalTopup = transactions.reduce((sum, t) => sum + t.amount, 0);

  if (isLoading) {
    return <Card>Loading transactions...</Card>;
  }

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-6xl space-y-6">
      <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
            <ArrowDownCircle className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <p className="text-gray-400 text-sm">Total Topup</p>
            <p className="text-2xl font-bold text-green-400">{formatCurrency(totalTopup)}</p>
          </div>
        </div>
      </Card>

      <Card title="Topup History">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="table-row">
                <th className="text-left py-3 px-4 text-gray-300 font-semibold">#</th>
                <th className="text-right py-3 px-4 text-gray-300 font-semibold">AMOUNT</th>
                <th className="text-right py-3 px-4 text-gray-300 font-semibold">DATE</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    No topup history yet
                  </td>
                </tr>
              ) : (
                transactions.map((transaction, idx) => (
                  <tr key={transaction._id} className="table-row">
                    <td className="py-3 px-4 text-gray-200">#{idx + 1}</td>
                    <td className="py-3 px-4 text-right text-green-400 font-semibold">
                      +{formatCurrency(transaction.amount)}
                    </td>
                    <td className="py-3 px-4 text-right text-gray-400 text-sm">
                      {formatDateShort(transaction.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
      </div>
    </div>
  );
}

