import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import { History, Search, Calendar, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatDateShort } from '@/utils/format';
import Input from '@/components/ui/Input';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalAmountUSD, setTotalAmountUSD] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, startDate, endDate, itemsPerPage]);

  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    } else {
      loadHistory();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getAllTopupHistory(
        currentPage,
        itemsPerPage,
        startDate || undefined,
        endDate || undefined,
        searchQuery || undefined
      );
      setHistory(data.items || []);
      setTotalPages(data.totalPages || 1);
      setTotalItems(data.totalItems || 0);
      setTotalAmountUSD(data.totalAmountUSD || 0);
    } catch {
      setHistory([]);
      setTotalPages(1);
      setTotalItems(0);
      setTotalAmountUSD(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
      {/* Search and Date Filter */}
      <div className="space-y-4">
        <Card
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                type="text"
                placeholder={t('common.search') || 'Tìm kiếm theo gmail hoặc nội dung nạp...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 bg-black/50 border-gray-800"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-white/70 whitespace-nowrap">Hiển thị:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="input-field bg-black/50 border-gray-800 min-w-[90px]"
              >
                {[10, 20, 50, 100].map((size) => (
                  <option key={size} value={size} className="bg-black text-white">
                    {size}
                  </option>
                ))}
              </select>
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
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2 text-white/70">
              <Calendar className="w-5 h-5 flex-shrink-0 text-white/70" />
              <span className="text-sm font-medium">Lọc theo ngày:</span>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-1">
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label className="text-sm text-white/70 whitespace-nowrap">Từ ngày:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="input-field flex-1 sm:w-auto min-w-[150px]"
                  style={{ fontSize: '16px' }}
                />
              </div>
              <div className="flex items-center gap-2 flex-1 sm:flex-initial">
                <label className="text-sm text-white/70 whitespace-nowrap">Đến ngày:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setCurrentPage(1);
                  }}
                  min={startDate || undefined}
                  className="input-field flex-1 sm:w-auto min-w-[150px]"
                  style={{ fontSize: '16px' }}
                />
              </div>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearDateFilter}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition-colors text-sm"
                >
                  <X className="w-4 h-4" />
                  <span>Xóa lọc</span>
                </button>
              )}
            </div>
          </div>
        </Card>
      </div>

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
          <>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <div className="text-sm text-white/70">
                Tổng nạp (theo bộ lọc):
                <span className="ml-2 text-white font-semibold">
                  {formatCurrency(totalAmountUSD, language, usdToVnd)}
                </span>
              </div>
              <div className="text-sm text-white/60">
                Tổng giao dịch: <span className="text-white">{totalItems}</span>
              </div>
            </div>

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

            {totalItems > 0 && totalPages > 1 && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-white/70">
                    {t('history.showing')} {((currentPage - 1) * itemsPerPage) + 1}-
                    {Math.min(currentPage * itemsPerPage, totalItems)} {t('history.of')} {totalItems}{' '}
                    {t('history.orders')}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/20 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4 text-white" />
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1);

                        if (!showPage && page === currentPage - 2 && currentPage > 3) {
                          return (
                            <span key="ellipsis-start" className="px-2 text-white/50">
                              ...
                            </span>
                          );
                        }
                        if (!showPage && page === currentPage + 2 && currentPage < totalPages - 2) {
                          return (
                            <span key="ellipsis-end" className="px-2 text-white/50">
                              ...
                            </span>
                          );
                        }
                        if (!showPage) return null;

                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`min-w-[2.25rem] h-9 px-2 rounded-lg text-sm font-semibold border ${
                              currentPage === page
                                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                                : 'bg-white/5 border-white/20 text-white/70 hover:bg-white/10'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="w-9 h-9 flex items-center justify-center rounded-lg border border-white/20 bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
