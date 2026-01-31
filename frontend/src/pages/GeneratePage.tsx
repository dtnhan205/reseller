import { useState, useEffect } from 'react';
import { sellerApi } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import type { Product } from '@/types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { Minus, Plus, Zap } from 'lucide-react';
import { formatCurrency } from '@/utils/format';

export default function GeneratePage() {
  const { user, updateUser } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setError('');
      console.log('GeneratePage: Loading products...');
      const data = await sellerApi.getProducts();
      console.log('GeneratePage: Products loaded:', data);
      const availableProducts = data.filter((p) => p.remainingQuantity > 0);
      setProducts(availableProducts);
      if (availableProducts.length > 0 && !selectedProduct) {
        setSelectedProduct(availableProducts[0]._id);
      } else if (availableProducts.length === 0) {
        setError('No products available');
      }
    } catch (err: any) {
      console.error('GeneratePage: Error loading products:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load products';
      setError(errorMessage);
    }
  };

  const handlePurchase = async () => {
    if (!selectedProduct) {
      setError('Please select a product');
      return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const promises = [];
      for (let i = 0; i < quantity; i++) {
        promises.push(sellerApi.purchase({ productId: selectedProduct }));
      }
      const results = await Promise.all(promises);
      
      // Update user balance from last result
      if (results.length > 0) {
        updateUser({ ...user!, wallet: results[results.length - 1].newBalance });
      }
      
      setSuccess(`Successfully purchased ${quantity} key(s)!`);
      setQuantity(1);
      await loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Purchase failed');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedProductData = products.find((p) => p._id === selectedProduct);
  const totalPrice = selectedProductData ? selectedProductData.price * quantity : 0;

  return (
    <div className="flex justify-center">
      <Card title="Key Generator" className="max-w-4xl w-full">
      <div className="space-y-8">
        {/* Product Selection */}
        <div>
          <label className="block text-base font-medium text-gray-300 mb-3">
            Product Type
          </label>
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="input-field text-base"
          >
            <option value="">Select a product</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name} - {formatCurrency(product.price)} (Stock: {product.remainingQuantity})
              </option>
            ))}
          </select>
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-base font-medium text-gray-300 mb-3">
            Quantity
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-14 h-14 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center transition-colors"
            >
              <Minus className="w-6 h-6" />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-28 text-center input-field text-lg font-semibold"
            />
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="w-14 h-14 rounded-lg bg-gray-900 hover:bg-gray-800 border border-gray-800 flex items-center justify-center transition-colors"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Price Display */}
        {selectedProductData && (
          <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-800">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-300 text-base">Price per key:</span>
              <span className="text-cyan-400 font-semibold text-lg">
                {formatCurrency(selectedProductData.price)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-300 text-base">Total:</span>
              <span className="text-teal-400 font-bold text-2xl">
                {formatCurrency(totalPrice)}
              </span>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 text-base">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/50 rounded-lg p-4 text-green-400 text-base">
            {success}
          </div>
        )}

        {/* Generate Button */}
        <Button
          onClick={handlePurchase}
          className="w-full text-lg"
          isLoading={isLoading}
          disabled={!selectedProduct || quantity < 1}
        >
          <Zap className="w-6 h-6 inline mr-2" />
          GENERATE KEYS
        </Button>
      </div>
    </Card>
    </div>
  );
}

