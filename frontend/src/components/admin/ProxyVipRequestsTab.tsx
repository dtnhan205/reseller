import { useEffect, useState } from 'react';
import { adminApi } from '@/services/api';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { ProxyVipRequest } from '@/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Key, Loader2, Check, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateShort } from '@/utils/format';

const ITEMS_PER_PAGE = 10;

export default function ProxyVipRequestsTab() {
  const { t } = useTranslation();
  const { error: showError, success: showSuccess } = useToastStore();
  const [requests, setRequests] = useState<ProxyVipRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getProxyVipRequests();
      setRequests(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to load Proxy VIP requests';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkProcessed = async (id: string) => {
    setProcessingId(id);
    try {
      await adminApi.markProxyVipRequestProcessed(id);
      showSuccess('Đã đánh dấu yêu cầu Proxy VIP là đã xử lý');
      await loadRequests();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to update request';
      showError(errorMessage);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: ProxyVipRequest['status']) => {
    if (status === 'processed') {
      return (
        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          <Check className="w-3 h-3" />
          Đã xử lý
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
        <Clock className="w-3 h-3" />
        Chờ xử lý
      </span>
    );
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [requests.length]);

  const totalPages = Math.ceil(requests.length / ITEMS_PER_PAGE) || 1;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedRequests = requests.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

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
    <Card
      style={{
        backdropFilter: 'blur(2px) saturate(120%)',
        WebkitBackdropFilter: 'blur(2px) saturate(120%)',
      }}
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-200 mb-1">
            Danh sách ID game Proxy VIP
          </h2>
          <p className="text-gray-400 text-sm">
            Seller mua Proxy VIP sẽ nhập ID game tại đây để admin xử lý thủ công.
          </p>
        </div>
        <div className="hidden sm:flex items-center justify-center w-12 h-12 rounded-2xl bg-cyan-500/15 border border-cyan-400/40">
          <Key className="w-6 h-6 text-cyan-300" />
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-900/70 border border-white/10 flex items-center justify-center">
            <Key className="w-10 h-10 text-slate-500" />
          </div>
          <p className="text-gray-400">Chưa có yêu cầu Proxy VIP nào.</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                    #
                  </th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                    Seller
                  </th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                    Sản phẩm
                  </th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                    ID game
                  </th>
                  <th className="text-left py-4 px-4 text-gray-300 font-semibold">
                    Thời gian
                  </th>
                  <th className="text-center py-4 px-4 text-gray-300 font-semibold">
                    Trạng thái
                  </th>
                  <th className="text-center py-4 px-4 text-gray-300 font-semibold">
                    ACTION
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedRequests.map((request, idx) => (
                  <tr
                    key={request._id}
                    className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors"
                  >
                    <td className="py-4 px-4 text-gray-200">
                      #{startIndex + idx + 1}
                    </td>
                    <td className="py-4 px-4 text-gray-200">
                      {request.sellerEmail || request.sellerId}
                    </td>
                    <td className="py-4 px-4 text-gray-200">
                      {request.productName || request.productId}
                    </td>
                    <td className="py-4 px-4">
                      <span className="font-mono text-sm text-cyan-400 break-all">
                        {request.gameId}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-400 text-sm">
                      {formatDateShort(request.createdAt)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {request.status === 'pending' ? (
                        <Button
                          onClick={() => handleMarkProcessed(request._id)}
                          disabled={processingId === request._id}
                          className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-600 hover:to-emerald-600 text-white text-sm"
                          isLoading={processingId === request._id}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Đánh dấu đã xử lý
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-500">
                          Đã xử lý lúc {request.processedAt && formatDateShort(request.processedAt)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {requests.length > 0 && totalPages > 1 && (
            <div className="mt-6 pt-4 border-t border-gray-800">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-400">
                  {t('history.showing')} {startIndex + 1}-
                  {Math.min(endIndex, requests.length)} {t('history.of')}{' '}
                  {requests.length} yêu cầu
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-gray-200" />
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => {
                        const showPage =
                          page === 1 ||
                          page === totalPages ||
                          (page >= currentPage - 1 &&
                            page <= currentPage + 1);

                        if (
                          !showPage &&
                          page === currentPage - 2 &&
                          currentPage > 3
                        ) {
                          return (
                            <span
                              key="ellipsis-start"
                              className="px-2 text-gray-500"
                            >
                              ...
                            </span>
                          );
                        }
                        if (
                          !showPage &&
                          page === currentPage + 2 &&
                          currentPage < totalPages - 2
                        ) {
                          return (
                            <span
                              key="ellipsis-end"
                              className="px-2 text-gray-500"
                            >
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
                                : 'bg-gray-900 border-gray-700 text-gray-200 hover:bg-gray-800'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-700 bg-gray-900 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-gray-200" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}

