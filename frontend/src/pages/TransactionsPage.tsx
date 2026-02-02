import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { TopupTransaction } from '@/types';
import Card from '@/components/ui/Card';
import { ArrowDownCircle, TrendingUp, Loader2, Calendar } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';

export default function TransactionsPage() {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState<TopupTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { error: showError } = useToastStore();

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await sellerApi.getTopupHistory();
      setTransactions(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to load transactions';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const totalTopup = transactions.reduce((sum, t) => sum + (t.amountUSD || t.amount / 25000), 0);
  const thisMonth = transactions.filter((t) => {
    const transactionDate = new Date(t.createdAt);
    const now = new Date();
    return transactionDate.getMonth() === now.getMonth() && transactionDate.getFullYear() === now.getFullYear();
  });
  const thisMonthTotal = thisMonth.reduce((sum, t) => sum + (t.amountUSD || t.amount / 25000), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-cyan-400 mx-auto mb-4" />
              <p className="text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
          <ArrowDownCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('transactions.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {t('transactions.subtitle')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card 
          className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('transactions.totalTopup')}</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(totalTopup, true)}</p>
            </div>
          </div>
        </Card>

        <Card 
          className="bg-gradient-to-br from-cyan-500/10 to-teal-500/10 border-cyan-500/30 hover:scale-[1.02] transition-transform"
          style={{
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-7 h-7 text-cyan-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">{t('transactions.thisMonth')}</p>
              <p className="text-3xl font-bold text-cyan-400">{formatCurrency(thisMonthTotal, true)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card 
        title={t('transactions.history')}
        style={{
          backdropFilter: 'blur(2px) saturate(120%)',
          WebkitBackdropFilter: 'blur(2px) saturate(120%)',
        }}
      >
        {transactions.length === 0 ? (
          <div className="text-center py-12">
            <ArrowDownCircle className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">{t('transactions.noHistory')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                    <th className="text-left py-4 px-4 text-gray-300 font-semibold text-sm">#</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">AMOUNT</th>
                    <th className="text-right py-4 px-4 text-gray-300 font-semibold text-sm">DATE</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction, idx) => (
                  <tr key={transaction._id} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                    <td className="py-4 px-4 text-gray-200">#{idx + 1}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="text-green-400 font-bold text-lg">
                        +{formatCurrency(transaction.amountUSD || (transaction.amount / 25000), true)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400 text-sm">
                      {formatDateShort(transaction.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-3">
              {transactions.map((transaction, idx) => (
                <div key={transaction._id} className="bg-gray-950/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-400 text-xs">#{idx + 1}</span>
                    <span className="text-gray-400 text-xs">{formatDateShort(transaction.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300 text-sm">Amount</span>
                    <span className="text-green-400 font-bold text-lg">
                      +{formatCurrency(transaction.amountUSD || (transaction.amount / 25000), true)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {transactions.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-800 text-center text-sm text-gray-400">
            {t('transactions.total')} {transactions.length} {transactions.length !== 1 ? t('transactions.transactions') : t('transactions.transaction')}
          </div>
        )}
      </Card>
    </div>
  );
}
