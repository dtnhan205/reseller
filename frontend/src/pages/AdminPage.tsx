import { useState } from 'react';
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
  Activity
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
import ResetRequestsTab from '@/components/admin/ResetRequestsTab';
import HacksTab from '@/components/admin/HacksTab';

type TabType = 
  | 'dashboard' 
  | 'sellers' 
  | 'categories' 
  | 'products' 
  | 'inventory' 
  | 'exchange-rate' 
  | 'banks' 
  | 'orders'
  | 'reset-requests'
  | 'hacks-status';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  const { sellers, isLoading: isLoadingSellers, createSeller } = useSellers();
  const {
    categories,
    isLoading: isLoadingCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  } = useCategories();
  const {
    products,
    isLoading: isLoadingProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    addInventory,
  } = useProducts();

  const isLoading = isLoadingSellers || isLoadingCategories || isLoadingProducts;

  const tabs: Array<{ id: TabType; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sellers', label: 'Sellers', icon: Users },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Database },
    { id: 'orders', label: 'Lịch sử mua', icon: History },
    { id: 'reset-requests', label: 'Yêu cầu reset', icon: RotateCcw },
    { id: 'hacks-status', label: 'Status hack', icon: Activity },
    { id: 'banks', label: 'Ngân hàng', icon: Building2 },
    { id: 'exchange-rate', label: 'Tỷ giá', icon: DollarSign },
  ];

  // Handlers for Exchange Rate and Bank Accounts
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
              <div
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setActiveTab('sellers')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Tổng số Sellers</div>
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {isLoadingSellers ? '...' : sellers.length}
                </div>
              </div>

              <div
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setActiveTab('categories')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Danh mục</div>
                  <FolderTree className="w-5 h-5 text-blue-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {isLoadingCategories ? '...' : categories.length}
                </div>
              </div>

              <div
                className="rounded-xl border border-white/10 bg-white/5 p-6 hover:bg-white/10 transition-colors cursor-pointer"
                onClick={() => setActiveTab('products')}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm text-white/60">Sản phẩm</div>
                  <Package className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-3xl font-bold text-white">
                  {isLoadingProducts ? '...' : products.length}
                </div>
              </div>
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
              <p className="mt-2 text-sm text-white/40">
                Chọn các tab phía trên để bắt đầu quản lý hệ thống.
              </p>
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

        {activeTab === 'reset-requests' && <ResetRequestsTab />}

        {activeTab === 'hacks-status' && <HacksTab />}

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
