import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import {
  UserPlus,
  Mail,
  Lock,
  Shield,
  Package,
  Folder,
  Key,
  Plus,
} from 'lucide-react';
import type { User, Category, Product } from '@/types';
import { formatCurrency } from '@/utils/format';

type TabType = 'sellers' | 'categories' | 'products' | 'inventory';

export default function AdminPage() {
  const { user } = useAuthStore();
  const { success: showSuccess, error: showError } = useToastStore();
  const [activeTab, setActiveTab] = useState<TabType>('sellers');

  // Sellers state
  const [sellerForm, setSellerForm] = useState({ email: '', password: '' });
  const [sellers, setSellers] = useState<User[]>([]);
  const [isLoadingSellers, setIsLoadingSellers] = useState(false);

  // Categories state
  const [categoryName, setCategoryName] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  // Products state
  const [productForm, setProductForm] = useState({ name: '', categoryId: '', price: '' });
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);

  // Inventory state
  const [selectedProductForInventory, setSelectedProductForInventory] = useState('');
  const [inventoryKeys, setInventoryKeys] = useState('');
  const [isLoadingInventory, setIsLoadingInventory] = useState(false);

  useEffect(() => {
    if (activeTab === 'sellers') {
      loadSellers();
    } else if (activeTab === 'categories') {
      loadCategories();
    } else if (activeTab === 'products') {
      loadProducts();
      loadCategories(); // Need categories for product form
    } else if (activeTab === 'inventory') {
      loadProducts();
    }
  }, [activeTab]);

  // Sellers
  const loadSellers = async () => {
    setIsLoadingSellers(true);
    try {
      const data = await adminApi.getSellers();
      setSellers(data);
    } catch (err) {
      showError('Failed to load sellers');
    } finally {
      setIsLoadingSellers(false);
    }
  };

  const handleCreateSeller = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createSeller(sellerForm);
      showSuccess('Seller created successfully!');
      setSellerForm({ email: '', password: '' });
      loadSellers();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create seller');
    }
  };

  // Categories
  const loadCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const data = await adminApi.getCategories();
      setCategories(data);
    } catch (err) {
      showError('Failed to load categories');
    } finally {
      setIsLoadingCategories(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createCategory(categoryName);
      showSuccess('Category created successfully!');
      setCategoryName('');
      loadCategories();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create category');
    }
  };

  // Products
  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const data = await adminApi.getProducts();
      setProducts(data);
    } catch (err) {
      showError('Failed to load products');
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminApi.createProduct({
        name: productForm.name,
        categoryId: productForm.categoryId,
        price: parseFloat(productForm.price),
      });
      showSuccess('Product created successfully!');
      setProductForm({ name: '', categoryId: '', price: '' });
      loadProducts();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to create product');
    }
  };

  // Inventory
  const handleAddInventory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductForInventory || !inventoryKeys.trim()) {
      showError('Please select a product and enter keys');
      return;
    }

    setIsLoadingInventory(true);
    try {
      const keys = inventoryKeys
        .split('\n')
        .map((k) => k.trim())
        .filter((k) => k.length > 0);
      
      await adminApi.addInventory(selectedProductForInventory, keys);
      showSuccess(`Added ${keys.length} key(s) to inventory!`);
      setInventoryKeys('');
      loadProducts();
    } catch (err: any) {
      showError(err.response?.data?.message || 'Failed to add inventory');
    } finally {
      setIsLoadingInventory(false);
    }
  };

  const tabs = [
    { id: 'sellers' as TabType, label: 'SELLERS', icon: UserPlus },
    { id: 'categories' as TabType, label: 'CATEGORIES', icon: Folder },
    { id: 'products' as TabType, label: 'PRODUCTS', icon: Package },
    { id: 'inventory' as TabType, label: 'INVENTORY', icon: Key },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-teal-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
            <p className="text-gray-400 text-sm">Manage sellers and system settings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-gray-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-medium'
                  : 'bg-gray-950 text-gray-300 hover:bg-gray-900 border border-gray-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div>
        {/* Sellers Tab */}
        {activeTab === 'sellers' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Create New Seller">
              <form onSubmit={handleCreateSeller} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Input
                      type="email"
                      placeholder="Enter seller email"
                      value={sellerForm.email}
                      onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
                      className="pl-12 bg-black/50 border-gray-800"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                    <Input
                      type="password"
                      placeholder="Enter password"
                      value={sellerForm.password}
                      onChange={(e) => setSellerForm({ ...sellerForm, password: e.target.value })}
                      className="pl-12 bg-black/50 border-gray-800"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500"
                >
                  <UserPlus className="w-5 h-5 inline mr-2" />
                  CREATE SELLER
                </Button>
              </form>
            </Card>

            <Card title="Sellers List">
              {isLoadingSellers ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : sellers.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No sellers yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sellers.map((seller) => (
                    <div
                      key={seller._id}
                      className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {seller.email.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{seller.email}</p>
                          <p className="text-gray-400 text-xs">
                            Wallet: {formatCurrency(seller.wallet || 0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Create Category">
              <form onSubmit={handleCreateCategory} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Category Name</label>
                  <Input
                    placeholder="Enter category name"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    className="bg-black/50 border-gray-800"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  CREATE CATEGORY
                </Button>
              </form>
            </Card>

            <Card title="Categories List">
              {isLoadingCategories ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : categories.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Folder className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No categories yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {categories.map((category) => (
                    <div
                      key={category._id}
                      className="flex items-center justify-between p-4 bg-gray-950/50 rounded-lg border border-gray-800"
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-white font-medium">{category.name}</p>
                          <p className="text-gray-400 text-xs">{category.slug}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card title="Create Product">
              <form onSubmit={handleCreateProduct} className="space-y-5">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Product Name</label>
                  <Input
                    placeholder="Enter product name"
                    value={productForm.name}
                    onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                    className="bg-black/50 border-gray-800"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Category</label>
                  <select
                    value={productForm.categoryId}
                    onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                    className="input-field bg-black/50 border-gray-800"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">Price</label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="bg-black/50 border-gray-800"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  CREATE PRODUCT
                </Button>
              </form>
            </Card>

            <Card title="Products List">
              {isLoadingProducts ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No products yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {products.map((product) => (
                    <div
                      key={product._id}
                      className="p-4 bg-gray-950/50 rounded-lg border border-gray-800"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Package className="w-5 h-5 text-blue-400" />
                          <div>
                            <p className="text-white font-medium">{product.name}</p>
                            <p className="text-gray-400 text-xs">
                              {typeof product.category === 'object' ? product.category.name : 'N/A'}
                            </p>
                          </div>
                        </div>
                        <p className="text-cyan-400 font-semibold">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                      <div className="flex gap-4 text-xs text-gray-400 mt-2">
                        <span>Stock: {product.remainingQuantity}</span>
                        <span>Sold: {product.soldQuantity}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <Card title="Add Inventory Keys" className="max-w-2xl">
            <form onSubmit={handleAddInventory} className="space-y-5">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Product</label>
                <select
                  value={selectedProductForInventory}
                  onChange={(e) => setSelectedProductForInventory(e.target.value)}
                  className="input-field bg-black/50 border-gray-800"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product._id} value={product._id}>
                      {product.name} - {formatCurrency(product.price)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Keys (one per line)
                </label>
                <textarea
                  value={inventoryKeys}
                  onChange={(e) => setInventoryKeys(e.target.value)}
                  placeholder="Enter keys, one per line..."
                  rows={8}
                  className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                  required
                />
              </div>
              <Button
                type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500"
                  isLoading={isLoadingInventory}
              >
                <Key className="w-5 h-5 inline mr-2" />
                ADD INVENTORY
              </Button>
            </form>
          </Card>
        )}
      </div>

      {/* Admin Info */}
      <Card className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border-cyan-500/30">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <p className="text-gray-300 text-sm">Logged in as</p>
            <p className="text-cyan-400 font-semibold">{user?.email}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
