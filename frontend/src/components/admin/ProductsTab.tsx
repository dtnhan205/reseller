import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useCategories, useProducts } from '@/hooks/useAdminData';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import SkeletonLoader from './SkeletonLoader';
import ProductImage from './ProductImage';
import { Plus, Search, X, Package, Edit, Trash2 } from 'lucide-react';
import type { Product } from '@/types';
import { formatPrice } from '@/utils/format';

interface ProductsTabProps {
  onCreateProduct: (data: { name: string; categoryId: string; price: number }) => Promise<boolean>;
  onUpdateProduct: (id: string, data: { name?: string; categoryId?: string; price?: number }) => Promise<boolean>;
  onDeleteProduct: (id: string) => Promise<boolean>;
}

export default function ProductsTab({
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct,
}: ProductsTabProps) {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const { products, isLoading: isLoadingProducts } = useProducts();
  const [productForm, setProductForm] = useState({
    name: '',
    categoryId: '',
    price: '',
  });
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSearch, setProductSearch] = useState('');

  const filteredProducts = useMemo(() => {
    if (!productSearch) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        (typeof product.category === 'object' &&
          product.category.name
            .toLowerCase()
            .includes(productSearch.toLowerCase()))
    );
  }, [products, productSearch]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await onCreateProduct({
      name: productForm.name,
      categoryId: productForm.categoryId,
      price: parseFloat(productForm.price),
    });
    if (success) {
      setProductForm({ name: '', categoryId: '', price: '' });
    }
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      categoryId: typeof product.category === 'object' ? product.category._id : product.category,
      price: product.price.toString(),
    });
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const success = await onUpdateProduct(editingProduct._id, {
      name: productForm.name,
      categoryId: productForm.categoryId,
      price: parseFloat(productForm.price),
    });
    if (success) {
      setProductForm({ name: '', categoryId: '', price: '' });
      setEditingProduct(null);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm(t('admin.confirmDeleteProduct'))) {
      await onDeleteProduct(id);
    }
  };

  const handleCancelEditProduct = () => {
    setEditingProduct(null);
    setProductForm({ name: '', categoryId: '', price: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 animate-fade-in">
      <Card title={t('admin.createProduct')} className="h-fit">
        <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.productName')}
            </label>
            <Input
              placeholder={t('admin.placeholderProductName')}
              value={productForm.name}
              onChange={(e) =>
                setProductForm({ ...productForm, name: e.target.value })
              }
              className="bg-black/50 border-gray-800 focus:border-cyan-500"
              required
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('common.select')}
            </label>
            <select
              value={productForm.categoryId}
              onChange={(e) =>
                setProductForm({
                  ...productForm,
                  categoryId: e.target.value,
                })
              }
              className="w-full bg-black/50 border border-gray-800 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
              required
            >
              <option value="">{t('admin.selectCategory')}</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              {t('admin.price')}
            </label>
            <Input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={productForm.price}
              onChange={(e) =>
                setProductForm({ ...productForm, price: e.target.value })
              }
              className="bg-black/50 border-gray-800 focus:border-cyan-500"
              required
            />
          </div>
          <div className="flex gap-3">
            {editingProduct && (
              <Button
                type="button"
                onClick={handleCancelEditProduct}
                className="flex-1 bg-gray-800 hover:bg-gray-700 border border-gray-700"
              >
                {t('common.cancel')}
              </Button>
            )}
            <Button
              type="submit"
              className={editingProduct ? "flex-1 bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg" : "w-full bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 shadow-lg"}
            >
              {editingProduct ? (
                <>
                  <Edit className="w-5 h-5 inline mr-2" />
                  {t('common.save')}
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5 inline mr-2" />
                  {t('admin.createProduct')}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <Card title={t('admin.productsList')} className="h-fit">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder={t('common.search') + ' products..."'}
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              className="pl-12 bg-black/50 border-gray-800"
            />
            {productSearch && (
              <button
                onClick={() => setProductSearch('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {isLoadingProducts ? (
          <SkeletonLoader />
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-900/50 rounded-full flex items-center justify-center">
              <Package className="w-10 h-10 text-gray-600" />
            </div>
            <p className="text-gray-400">
              {productSearch ? t('admin.noSearchResults') : t('admin.noProducts')}
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {filteredProducts.map((product, index) => (
              <div
                key={product._id}
                className="group p-3 sm:p-4 bg-gray-950/50 rounded-xl border border-gray-800 hover:border-cyan-500/50 hover:bg-gray-900/50 transition-all duration-300"
                style={{
                  animationDelay: `${index * 50}ms`,
                }}
              >
                <div className="flex items-start justify-between mb-3 gap-3">
                  <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                    <ProductImage product={product} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm sm:text-base md:text-lg truncate">
                        {product.name}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {typeof product.category === 'object'
                          ? product.category.name
                          : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-cyan-400 font-bold text-base sm:text-lg">
                      ${formatPrice(product.price)}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm flex-wrap">
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-green-500/10 rounded-lg border border-green-500/20">
                      <span className="text-green-400 font-medium whitespace-nowrap">
                        {t('admin.stock')}: {product.remainingQuantity}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-purple-500/10 rounded-lg border border-purple-500/20">
                      <span className="text-purple-400 font-medium whitespace-nowrap">
                        {t('admin.sold')}: {product.soldQuantity}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEditProduct(product)}
                      className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                      title={t('common.edit')}
                    >
                      <Edit className="w-4 h-4 text-cyan-400" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product._id)}
                      className="p-2 bg-gray-800 hover:bg-red-900/30 rounded-lg transition-colors flex-shrink-0"
                      title={t('common.delete')}
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

