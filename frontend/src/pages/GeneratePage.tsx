import { useState, useEffect, useMemo } from 'react';
import { sellerApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { useTranslation } from '@/hooks/useTranslation';
import type { Product, Order } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Minus, Plus, Zap, Package, Search, X, Copy, Check } from 'lucide-react';
import { formatPrice, formatBalance } from '@/utils/format';

// Product Image Component
function ProductImage({ product }: { product: Product }) {
  const categoryImage =
    typeof product.category === 'object' ? product.category.image : null;

  if (categoryImage) {
    return (
      <img
        src={categoryImage}
        alt={product.name}
        className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-lg sm:rounded-xl object-cover border-2 border-gray-800 group-hover:border-cyan-500/50 transition-colors flex-shrink-0"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = 'flex';
          }
        }}
      />
    );
  }
  return (
    <div className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform flex-shrink-0">
      <Package className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-white" />
    </div>
  );
}

export default function GeneratePage() {
  const { user, updateUser } = useAuthStore();
  const { success: showSuccess, error: showError } = useToastStore();
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [purchasedKeys, setPurchasedKeys] = useState<Order[]>([]);
  const [copiedKeyIndex, setCopiedKeyIndex] = useState<number | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setIsLoadingProducts(true);
    try {
      console.log('GeneratePage: Loading products...');
      const data = await sellerApi.getProducts();
      console.log('GeneratePage: Products received:', data);
      console.log('GeneratePage: Products count:', data?.length || 0);
      
      if (!Array.isArray(data)) {
        console.error('GeneratePage: Products is not an array:', data);
        showError('Invalid products data format');
        return;
      }
      
      if (data.length === 0) {
        console.warn('GeneratePage: No products found in database');
        setProducts([]);
        return;
      }
      
      // Show all products, but filter available ones for selection
      setProducts(data);
      const availableProducts = data.filter((p) => (p.remainingQuantity || 0) > 0);
      console.log('GeneratePage: Available products:', availableProducts.length);
      
      if (availableProducts.length > 0 && !selectedProduct) {
        setSelectedProduct(availableProducts[0]._id);
      } else if (availableProducts.length === 0 && data.length > 0) {
        // Don't show error, just show out of stock message in UI
        console.warn('GeneratePage: All products are out of stock');
      }
    } catch (err: any) {
      console.error('GeneratePage: Error loading products:', err);
      console.error('GeneratePage: Error response:', err.response?.data);
      console.error('GeneratePage: Error status:', err.response?.status);
      
      let errorMessage = 'Failed to load products';
      if (err.response?.status === 401) {
        errorMessage = 'Authentication failed. Please login again.';
      } else if (err.response?.status === 403) {
        errorMessage = 'Access denied. Seller role required.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      showError(errorMessage);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (typeof p.category === 'object' &&
          p.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [products, searchQuery]);

  // Nhóm products theo category
  const groupedProducts = useMemo(() => {
    const groups: Record<string, Product[]> = {};
    
    filteredProducts.forEach((product) => {
      const categoryName = typeof product.category === 'object' 
        ? product.category.name 
        : 'Other';
      
      if (!groups[categoryName]) {
        groups[categoryName] = [];
      }
      groups[categoryName].push(product);
    });
    
    // Sắp xếp products trong mỗi category
    Object.keys(groups).forEach((key) => {
      groups[key].sort((a, b) => a.name.localeCompare(b.name));
    });
    
    return groups;
  }, [filteredProducts]);

  const handlePurchase = async () => {
    if (!selectedProduct) {
      showError('Please select a product');
      return;
    }

    setIsLoading(true);
    try {
      const promises = [];
      for (let i = 0; i < quantity; i++) {
        promises.push(sellerApi.purchase({ productId: selectedProduct }));
      }
      const results = await Promise.all(promises);
      
      if (results.length > 0) {
        updateUser({ ...user!, wallet: results[results.length - 1].newBalance });
        
        // Lưu danh sách keys đã mua
        const orders = results.map((r) => r.order);
        setPurchasedKeys(orders);
        setShowKeyModal(true);
      }
      
      setQuantity(1);
      await loadProducts();
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Purchase failed';
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (key: string | undefined, index: number) => {
    if (!key) {
      showError('No key to copy');
      return;
    }
    
    try {
      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(key);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = key;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          throw err;
        }
        document.body.removeChild(textArea);
      }
      setCopiedKeyIndex(index);
      showSuccess('Copied!');
      setTimeout(() => setCopiedKeyIndex(null), 2000);
    } catch (err) {
      console.error('Copy error:', err);
      showError('Failed to copy. Please try selecting and copying manually.');
    }
  };

  const copyAllKeys = async () => {
    try {
      const allKeys = purchasedKeys
        .map((order) => order.key)
        .filter((key) => key) // Filter out null/undefined keys
        .join('\n');
      
      if (!allKeys) {
        showError('No keys to copy');
        return;
      }

      // Check if clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(allKeys);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = allKeys;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          throw err;
        }
        document.body.removeChild(textArea);
      }
      showSuccess('All keys copied!');
    } catch (err) {
      console.error('Copy all keys error:', err);
      showError('Failed to copy. Please try selecting and copying manually.');
    }
  };

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const totalPrice = selectedProductData ? selectedProductData.price * quantity : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-xl flex-shrink-0">
          <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
            {t('generate.title')}
          </h1>
          <p className="text-gray-400 text-xs sm:text-sm mt-1">
            {t('generate.subtitle')}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Product Selection */}
        <div className="lg:col-span-2 space-y-6">
          <Card title={t('generate.selectProduct')}>
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={t('generate.searchProducts')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/50 border border-gray-800 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 pl-10 sm:pl-12 text-sm sm:text-base text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {isLoadingProducts ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500 mx-auto"></div>
                <p className="text-gray-400 mt-4">{t('common.loading')}</p>
              </div>
            ) : Object.keys(groupedProducts).length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">
                  {searchQuery ? t('admin.noSearchResults') : t('generate.noProductsAvailable')}
                </p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {Object.entries(groupedProducts).map(([categoryName, categoryProducts]) => (
                  <div key={categoryName} className="space-y-2">
                    {/* Category Header */}
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-l-4 border-purple-500 rounded-lg">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-purple-300 truncate">{categoryName}</h3>
                    </div>
                    
                    {/* Products in Category */}
                    <div className="space-y-2 pl-2 sm:pl-4">
                      {categoryProducts.map((product) => {
                        const isSelected = selectedProduct === product._id;
                        const isOutOfStock = (product.remainingQuantity || 0) === 0;
                        return (
                          <div
                            key={product._id}
                            onClick={() => !isOutOfStock && setSelectedProduct(product._id)}
                            className={`group p-2.5 sm:p-3 rounded-lg border transition-all duration-300 ${
                              isOutOfStock
                                ? 'border-gray-800 bg-gray-950/30 opacity-60 cursor-not-allowed'
                                : isSelected
                                ? 'border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20 cursor-pointer'
                                : 'border-gray-800 bg-gray-950/50 hover:border-cyan-500/50 hover:bg-gray-900/50 cursor-pointer'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 sm:gap-4">
                              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                <div className="flex-shrink-0">
                                <ProductImage product={product} />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className={`font-semibold text-sm sm:text-base truncate ${
                                    isSelected ? 'text-cyan-400' : isOutOfStock ? 'text-gray-500' : 'text-white'
                                  }`}>
                                    {product.name}
                                  </p>
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-xs sm:text-sm mt-1">
                                    <span className={`font-bold ${
                                      isOutOfStock ? 'text-gray-500' : 'text-cyan-400'
                                    }`}>
                                      ${formatPrice(product.price)}
                                    </span>
                                    <span className={isOutOfStock ? 'text-red-400' : 'text-gray-500'}>
                                      {isOutOfStock ? t('generate.outOfStock') : `${t('generate.stock')}: ${product.remainingQuantity}`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              {isSelected && !isOutOfStock && (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-cyan-500 rounded-full flex items-center justify-center flex-shrink-0">
                                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full"></div>
                                </div>
                              )}
                              {isOutOfStock && (
                                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                  <span className="text-red-400 text-xs">×</span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Purchase Panel */}
        <div className="space-y-6">
          <Card title={t('generate.purchaseDetails')} className="h-fit">
            {selectedProductData ? (
              <div className="space-y-6">
                {/* Selected Product Info */}
                <div className="p-3 sm:p-4 bg-gray-950/50 rounded-xl border border-gray-800">
                  <div className="flex items-center gap-2 sm:gap-3 mb-3">
                    <div className="flex-shrink-0">
                    <ProductImage product={selectedProductData} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-md text-purple-300 text-xs font-semibold whitespace-nowrap">
                          {typeof selectedProductData.category === 'object'
                            ? selectedProductData.category.name
                            : 'N/A'}
                        </span>
                      </div>
                      <p className="text-white font-medium truncate text-sm sm:text-base">
                        {selectedProductData.name}
                      </p>
                      <p className="text-gray-400 text-xs">
                        ${formatPrice(selectedProductData.price)} each
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quantity */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2 sm:mb-3">
                    {t('generate.quantity')}
                  </label>
                  <div className="flex items-center gap-2 sm:gap-4">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
                    >
                      <Minus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-300" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max={selectedProductData.remainingQuantity}
                      value={quantity}
                      onChange={(e) => {
                        const val = Math.max(1, Math.min(selectedProductData.remainingQuantity, parseInt(e.target.value) || 1));
                        setQuantity(val);
                      }}
                      className="flex-1 sm:w-28 text-center bg-black/50 border border-gray-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-gray-100 text-base sm:text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.min(selectedProductData.remainingQuantity, quantity + 1))}
                      className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-lg sm:rounded-xl bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center transition-all hover:scale-110 flex-shrink-0"
                    >
                      <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-300" />
                    </button>
                  </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      {t('generate.maxAvailable')}: {selectedProductData.remainingQuantity} available
                    </p>
                </div>

                {/* Price Summary */}
                <div className="bg-gradient-to-r from-cyan-500/10 to-teal-500/10 border border-cyan-500/30 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">{t('generate.pricePerKey')}</span>
                    <span className="text-cyan-400 font-semibold">
                      ${formatPrice(selectedProductData.price)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300 text-sm">{t('generate.quantity')}:</span>
                    <span className="text-gray-300 font-medium">{quantity}</span>
                  </div>
                  <div className="border-t border-gray-800 pt-2 mt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium">{t('generate.total')}</span>
                      <span className="text-teal-400 font-bold text-2xl">
                        ${formatPrice(totalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Wallet Balance */}
                <div className="bg-gray-950/50 rounded-xl p-4 border border-gray-800">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">{t('generate.yourBalance')}</span>
                    <span className="text-white font-semibold">
                      {formatBalance(user?.wallet || 0)}$
                    </span>
                  </div>
                  {totalPrice > (user?.wallet || 0) && (
                    <p className="text-red-400 text-xs mt-2 text-right">
                      {t('generate.insufficientBalance')}
                    </p>
                  )}
                </div>

                {/* Purchase Button */}
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"
                  isLoading={isLoading}
                  disabled={!selectedProduct || quantity < 1 || totalPrice > (user?.wallet || 0)}
                >
                  <Zap className="w-5 h-5 inline mr-2" />
                  {isLoading ? t('generate.processing') : t('generate.generateKeys')}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-600" />
                <p className="text-sm">{t('generate.selectProductToPurchase')}</p>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* Key Modal */}
      {showKeyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
                  <Check className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    {t('generate.keysGenerated')}
                  </h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">
                    {purchasedKeys.length} {t('generate.key')}(s) {t('generate.purchased')}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
              </button>
            </div>

            {/* Keys List */}
            <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              {purchasedKeys.map((order, index) => {
                if (!order || !order.key) {
                  console.warn('Invalid order in purchasedKeys:', order);
                  return null;
                }
                return (
                <div
                    key={order._id || index}
                    className="bg-gray-950/50 rounded-lg sm:rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-cyan-500/50 transition-colors"
                >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                      <div className="flex-1 min-w-0 w-full sm:w-auto">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1 truncate">{order.productName || 'N/A'}</p>
                        <p className="font-mono text-sm sm:text-base md:text-lg font-bold text-cyan-400 break-all">{order.key}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(order.key, index)}
                        className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 rounded-lg transition-all flex items-center gap-2 min-w-[100px] justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!order.key}
                    >
                      {copiedKeyIndex === index ? (
                        <>
                          <Check className="w-4 h-4 text-white" />
                            <span className="text-white">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 text-white" />
                            <span className="text-white">Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button
                onClick={copyAllKeys}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                <Copy className="w-5 h-5 inline mr-2" />
                {t('generate.copyAllKeys')}
              </Button>
              <Button
                onClick={() => setShowKeyModal(false)}
                className="flex-1 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500"
              >
                {t('common.close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
