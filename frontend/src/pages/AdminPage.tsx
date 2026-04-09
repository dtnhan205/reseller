import { useEffect, useState } from 'react';
import {
  Users,
  FolderTree,
  Package,
  Database,
  LayoutDashboard,
  DollarSign,
  Building2,
  History,
  RotateCcw,
  Activity,
  Tags,
  ShoppingCart,
  Wallet,
  CalendarDays,
  Key,
  Trophy,
  Medal,
  TrendingUp,
  PieChart as PieChartIcon,
} from 'lucide-react';

import { useSellers, useCategories, useProducts } from '@/hooks/useAdminData';
import { adminApi } from '@/services/api';
import SellersTab from '@/components/admin/SellersTab';
import CategoriesTab from '@/components/admin/CategoriesTab';
import ProductsTab from '@/components/admin/ProductsTab';
import InventoryTab from '@/components/admin/InventoryTab';
import ExchangeRateTab from '@/components/admin/ExchangeRateTab';
import BankAccountsTab from '@/components/admin/BankAccountsTab';
import OrdersHistoryTab from '@/components/admin/OrdersHistoryTab';
import TopupHistoryTab from '@/components/admin/TopupHistoryTab';
import ResetRequestsTab from '@/components/admin/ResetRequestsTab';
import HacksTab from '@/components/admin/HacksTab';
import SellerPricesTab from '@/components/admin/SellerPricesTab';
import ProxyVipRequestsTab from '@/components/admin/ProxyVipRequestsTab';
import ProxyVipAccessKeyTab from '@/components/admin/ProxyVipAccessKeyTab';
import { useTranslation } from '@/hooks/useTranslation';
import { useExchangeRate } from '@/hooks/useExchangeRate';
import { formatCurrency } from '@/utils/format';
import type { AdminDashboardStats, TopProductItem } from '@/types';
import {
  RevenueAreaChart,
  RevenueBarChart,
  RevenuePieChart,
  usePreparePieChartData,
} from '@/components/admin/DashboardCharts';

type TabType =
  | 'dashboard'
  | 'sellers'
  | 'categories'
  | 'products'
  | 'inventory'
  | 'exchange-rate'
  | 'banks'
  | 'orders'
  | 'topup-history'
  | 'reset-requests'
  | 'hacks-status'
  | 'seller-prices'
  | 'proxyvip-requests'
  | 'proxyvip-access-key';

const emptyStats: AdminDashboardStats = {
  today: { totalOrders: 0, totalRevenue: 0 },
  thisMonth: { totalOrders: 0, totalRevenue: 0 },
  thisYear: { totalOrders: 0, totalRevenue: 0 },
  allTime: { totalOrders: 0, totalRevenue: 0 },
  chart: [],
  topProducts: { today: [], week: [], month: [], year: [] },
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats>(emptyStats);
  const [isLoadingDashboardStats, setIsLoadingDashboardStats] = useState(false);
  const [selectedChartType, setSelectedChartType] = useState<'area' | 'bar'>('area');

  const { language } = useTranslation();
  const { usdToVnd } = useExchangeRate();

  // Prepare pie chart data
  const pieChartData = usePreparePieChartData(dashboardStats);

  const { sellers, isLoading: isLoadingSellers, createSeller } = useSellers();
  const {
    isLoading: isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const {
    isLoading: isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addInventory,
  } = useProducts();

  const isLoading = isLoadingSellers || isLoadingCategories || isLoadingProducts;

  useEffect(() => {
    if (activeTab !== 'dashboard') return;

    const loadStats = async () => {
      setIsLoadingDashboardStats(true);
      try {
        const data = await adminApi.getDashboardStats();
        setDashboardStats(data);
      } catch {
        setDashboardStats(emptyStats);
      } finally {
        setIsLoadingDashboardStats(false);
      }
    };

    loadStats();
  }, [activeTab]);

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sellers', label: 'Sellers', icon: Users },
    { id: 'seller-prices', label: 'Set giá seller', icon: Tags },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'orders', label: 'Lịch sử mua', icon: History },
    { id: 'topup-history', label: 'Lịch sử nạp', icon: Wallet },
    { id: 'reset-requests', label: 'Yêu cầu reset', icon: RotateCcw },
    { id: 'hacks-status', label: 'Status hack', icon: Activity },
    { id: 'banks', label: 'Ngân hàng', icon: Building2 },
    { id: 'exchange-rate', label: 'Tỷ giá', icon: DollarSign },
    { id: 'proxyvip-requests', label: 'Proxy VIP IDs', icon: Key },
    { id: 'proxyvip-access-key', label: 'Proxy VIP Key', icon: Key },
  ];

  const handleUpdateExchangeRate = async (rate: number) => {
    return await adminApi.updateExchangeRate(rate);
  };

  const handleCreateBankAccount = async (data: any) => {
    return await adminApi.createBankAccount(data);
  };

  const handleUpdateBankAccount = async (id: string, data: any) => {
    return await adminApi.updateBankAccount(id, data);
  };

  const handleDeleteBankAccount = async (id: string) => {
    return await adminApi.deleteBankAccount(id);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-sm text-white/60">Quản trị hệ thống và phân phối</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={
                `flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all relative ` +
                (isActive
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-white/60 hover:text-white hover:bg-white/5 rounded-t-lg')
              }
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng số Sellers</div>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white">{isLoadingSellers ? '...' : sellers.length}</div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng đơn đã bán</div>
                  <ShoppingCart className="w-5 h-5 text-cyan-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {isLoadingDashboardStats ? '...' : dashboardStats.allTime.totalOrders}
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng doanh thu</div>
                  <Wallet className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {isLoadingDashboardStats
                    ? '...'
                    : formatCurrency(dashboardStats.allTime.totalRevenue, language, usdToVnd)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 text-blue-400" /> Hôm nay
                </div>
                <p className="text-white text-sm">Đơn: <span className="font-bold">{dashboardStats.today.totalOrders}</span></p>
                <p className="text-white text-sm">Tiền: <span className="font-bold text-green-400">{formatCurrency(dashboardStats.today.totalRevenue, language, usdToVnd)}</span></p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 text-purple-400" /> Tháng này
                </div>
                <p className="text-white text-sm">Đơn: <span className="font-bold">{dashboardStats.thisMonth.totalOrders}</span></p>
                <p className="text-white text-sm">Tiền: <span className="font-bold text-green-400">{formatCurrency(dashboardStats.thisMonth.totalRevenue, language, usdToVnd)}</span></p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center gap-2 mb-2 text-white/70 text-sm">
                  <CalendarDays className="w-4 h-4 text-amber-400" /> Năm nay
                </div>
                <p className="text-white text-sm">Đơn: <span className="font-bold">{dashboardStats.thisYear.totalOrders}</span></p>
                <p className="text-white text-sm">Tiền: <span className="font-bold text-green-400">{formatCurrency(dashboardStats.thisYear.totalRevenue, language, usdToVnd)}</span></p>
              </div>
            </div>

            {/* Top Sản Phẩm Bán Chạy */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {(
                [
                  { period: 'Hôm nay', icon: <CalendarDays className="w-4 h-4 text-blue-400" />, data: dashboardStats.topProducts.today, color: 'border-blue-500/30', accent: 'text-blue-400' },
                  { period: 'Tuần này', icon: <CalendarDays className="w-4 h-4 text-purple-400" />, data: dashboardStats.topProducts.week, color: 'border-purple-500/30', accent: 'text-purple-400' },
                  { period: 'Tháng này', icon: <CalendarDays className="w-4 h-4 text-amber-400" />, data: dashboardStats.topProducts.month, color: 'border-amber-500/30', accent: 'text-amber-400' },
                  { period: 'Năm nay', icon: <CalendarDays className="w-4 h-4 text-green-400" />, data: dashboardStats.topProducts.year, color: 'border-green-500/30', accent: 'text-green-400' },
                ] as const
              ).map(({ period, icon, data, color, accent }) => (
                <div
                  key={period}
                  className={`rounded-xl border ${color} bg-white/5 p-4`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    {icon}
                    <span className="text-sm font-semibold text-white/80">{period}</span>
                    <Trophy className={`w-4 h-4 ml-auto ${accent}`} />
                  </div>

                  {data.length === 0 ? (
                    <p className="text-xs text-white/40">Chưa có dữ liệu</p>
                  ) : (
                    <div className="space-y-2">
                      {data.map((item: TopProductItem) => (
                        <div
                          key={item.rank}
                          className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-lg px-3 py-2"
                        >
                          {item.rank === 1 && <Trophy className="w-4 h-4 text-yellow-400 flex-shrink-0" />}
                          {item.rank === 2 && <Medal className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                          {item.rank === 3 && <Medal className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                          {item.rank > 3 && <span className="text-xs text-white/40 w-4 flex-shrink-0">#{item.rank}</span>}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-white/80 truncate" title={item.productName}>
                              {item.productName}
                            </p>
                            <p className="text-xs text-white/50">
                              {item.totalOrders} đơn · {formatCurrency(item.totalRevenue, language, usdToVnd)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-medium text-white">Biểu đồ doanh thu 14 ngày</h3>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedChartType('area')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedChartType === 'area'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-black/20 text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    Diện tích
                  </button>
                  <button
                    onClick={() => setSelectedChartType('bar')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedChartType === 'bar'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'bg-black/20 text-gray-400 border border-gray-800 hover:text-white'
                    }`}
                  >
                    Cột
                  </button>
                </div>
              </div>

              {dashboardStats.chart.length === 0 ? (
                <p className="text-sm text-white/50">Chưa có dữ liệu biểu đồ.</p>
              ) : (
                <div className="space-y-4">
                  {selectedChartType === 'area' ? (
                    <RevenueAreaChart chartData={dashboardStats.chart} />
                  ) : (
                    <RevenueBarChart chartData={dashboardStats.chart} />
                  )}
                </div>
              )}
            </div>

            {/* Revenue Distribution Pie Chart */}
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center gap-2 mb-4">
                <PieChartIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-medium text-white">Phân bổ doanh thu theo kỳ</h3>
              </div>
              <RevenuePieChart periods={pieChartData} />
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-medium text-white mb-4">Trạng thái hệ thống</h3>
              <div className="flex items-center gap-3">
                <div
                  className={
                    `w-3 h-3 rounded-full ` +
                    (isLoading ? 'bg-yellow-500 animate-pulse' : 'bg-green-500')
                  }
                />
                <span className="text-white/80">
                  {isLoading ? 'Đang đồng bộ dữ liệu...' : 'Hệ thống sẵn sàng'}
                </span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sellers' && <SellersTab onCreateSeller={createSeller} />}

        {activeTab === 'categories' && (
          <CategoriesTab
            onCreateCategory={createCategory}
            onUpdateCategory={updateCategory}
            onDeleteCategory={deleteCategory}
          />
        )}

        {activeTab === 'products' && (
          <ProductsTab
            onCreateProduct={createProduct}
            onUpdateProduct={updateProduct}
            onDeleteProduct={deleteProduct}
          />
        )}

        {activeTab === 'inventory' && <InventoryTab onAddInventory={addInventory} />}

        {activeTab === 'orders' && <OrdersHistoryTab />}

        {activeTab === 'topup-history' && <TopupHistoryTab />}

        {activeTab === 'reset-requests' && <ResetRequestsTab />}

        {activeTab === 'hacks-status' && <HacksTab />}

        {activeTab === 'seller-prices' && <SellerPricesTab />}

        {activeTab === 'proxyvip-requests' && <ProxyVipRequestsTab />}

        {activeTab === 'proxyvip-access-key' && <ProxyVipAccessKeyTab />}

        {activeTab === 'banks' && (
          <BankAccountsTab
            onCreateBankAccount={handleCreateBankAccount}
            onUpdateBankAccount={handleUpdateBankAccount}
            onDeleteBankAccount={handleDeleteBankAccount}
          />
        )}

        {activeTab === 'exchange-rate' && (
          <ExchangeRateTab onUpdateExchangeRate={handleUpdateExchangeRate} />
        )}
      </div>
    </div>
  );
}
