import axios from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  Category,
  Product,
  Order,
  TopupTransaction,
  TopupRequest,
  PurchaseRequest,
  PurchaseResponse,
  BankAccount,
  Payment,
  ExchangeRate,
} from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('API URL configured:', API_URL);

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Request interceptor để thêm token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor để xử lý lỗi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to login if we're not already on login page and have a token
    // This prevents redirecting when login fails
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      const token = localStorage.getItem('token');
      if (token) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('API: Sending login request to:', `${api.defaults.baseURL}/auth/login`);
      const res = await api.post('/auth/login', data);
      console.log('API: Login response received:', res.data);
      return res.data;
    } catch (error: any) {
      console.error('API: Login error:', error);
      throw error;
    }
  },
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post('/auth/register', data);
    return res.data;
  },
  me: async (): Promise<User> => {
    const res = await api.get('/auth/me');
    return res.data;
  },
};

// Admin APIs
export const adminApi = {
  createSeller: async (data: RegisterRequest): Promise<AuthResponse> => {
    const res = await api.post('/admin/sellers', data);
    return res.data;
  },
  getSellers: async (): Promise<User[]> => {
    const res = await api.get('/admin/sellers');
    return res.data;
  },
  getSellerTopupHistory: async (sellerId: string): Promise<Payment[]> => {
    const res = await api.get(`/admin/sellers/${sellerId}/topup-history`);
    return res.data;
  },
  manualTopupSeller: async (sellerId: string, data: { amountUSD: number; note?: string }): Promise<{ payment: Payment; newBalance: number; message: string }> => {
    const res = await api.post(`/admin/sellers/${sellerId}/topup`, data);
    return res.data;
  },
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get('/admin/categories');
    return res.data;
  },
  createCategory: async (name: string, image?: string): Promise<Category> => {
    const res = await api.post('/admin/categories', { name, image });
    // Backend returns { category }, so we need to extract it
    return res.data.category || res.data;
  },
  updateCategory: async (id: string, data: { name?: string; image?: string }): Promise<Category> => {
    const res = await api.put(`/admin/categories/${id}`, data);
    return res.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/admin/categories/${id}`);
  },
  getProducts: async (): Promise<Product[]> => {
    const res = await api.get('/admin/products');
    return res.data;
  },
  createProduct: async (data: {
    name: string;
    categoryId: string;
    price: number;
  }): Promise<Product> => {
    const res = await api.post('/admin/products', data);
    return res.data;
  },
  updateProduct: async (id: string, data: {
    name?: string;
    categoryId?: string;
    price?: number;
  }): Promise<Product> => {
    const res = await api.put(`/admin/products/${id}`, data);
    return res.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/admin/products/${id}`);
  },
  addInventory: async (
    productId: string,
    keys: string[]
  ): Promise<Product> => {
    const res = await api.post(`/admin/products/${productId}/inventory`, {
      keys,
    });
    return res.data;
  },
  getProductKeys: async (productId: string): Promise<{
    productId: string;
    productName: string;
    totalAvailable: number;
    keys: Array<{
      _id: string;
      value: string;
      qtyAvailable: number;
      createdAt: string;
    }>;
  }> => {
    const res = await api.get(`/admin/products/${productId}/keys`);
    return res.data;
  },
  // Bank accounts management
  getBankAccounts: async (): Promise<BankAccount[]> => {
    const res = await api.get('/admin/bank-accounts');
    return res.data;
  },
  createBankAccount: async (data: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    apiUrl?: string;
  }): Promise<BankAccount> => {
    const res = await api.post('/admin/bank-accounts', data);
    return res.data;
  },
  updateBankAccount: async (
    id: string,
    data: {
      bankName?: string;
      accountNumber?: string;
      accountHolder?: string;
      apiUrl?: string;
      isActive?: boolean;
    }
  ): Promise<BankAccount> => {
    const res = await api.put(`/admin/bank-accounts/${id}`, data);
    return res.data;
  },
  deleteBankAccount: async (id: string): Promise<void> => {
    await api.delete(`/admin/bank-accounts/${id}`);
  },
  // Exchange rate management
  getExchangeRate: async (): Promise<{ usdToVnd: number }> => {
    const res = await api.get('/admin/exchange-rate');
    return res.data;
  },
  updateExchangeRate: async (usdToVnd: number): Promise<{ usdToVnd: number }> => {
    const res = await api.put('/admin/exchange-rate', { usdToVnd });
    return res.data;
  },
  // Reset requests
  getResetRequests: async (): Promise<any[]> => {
    const res = await api.get('/admin/reset-requests');
    return res.data;
  },
  approveResetRequest: async (id: string): Promise<any> => {
    const res = await api.put(`/admin/reset-requests/${id}/approve`);
    return res.data;
  },
  rejectResetRequest: async (id: string): Promise<any> => {
    const res = await api.put(`/admin/reset-requests/${id}/reject`);
    return res.data;
  },
};

// Seller APIs
export const sellerApi = {
  topup: async (data: TopupRequest): Promise<Payment> => {
    const res = await api.post('/wallet/topup', data);
    return res.data;
  },
  purchase: async (data: PurchaseRequest): Promise<PurchaseResponse> => {
    const res = await api.post('/purchase', data);
    return res.data;
  },
  getOrders: async (): Promise<Order[]> => {
    const res = await api.get('/orders');
    return res.data;
  },
  getTopupHistory: async (): Promise<TopupTransaction[]> => {
    const res = await api.get('/wallet/topup-history');
    return res.data;
  },
  getProducts: async (): Promise<Product[]> => {
    try {
      console.log('API: Fetching products from:', `${api.defaults.baseURL}/products`);
      const res = await api.get('/products');
      console.log('API: Products response:', res.data);
      // Backend returns array directly, not wrapped in { products: [...] }
      const products = Array.isArray(res.data) ? res.data : (res.data.products || []);
      console.log('API: Parsed products:', products);
      return products;
    } catch (error: any) {
      console.error('API: Error fetching products:', error);
      console.error('API: Error response:', error.response?.data);
      throw error;
    }
  },
  // Payment APIs
  getPayments: async (): Promise<Payment[]> => {
    const res = await api.get('/payments');
    return res.data;
  },
  getPaymentDetail: async (id: string): Promise<Payment> => {
    const res = await api.get(`/payments/${id}`);
    return res.data;
  },
  deletePayment: async (id: string): Promise<void> => {
    await api.delete(`/payments/${id}`);
  },
  // Exchange rate (public for sellers)
      getExchangeRate: async (): Promise<ExchangeRate> => {
        const res = await api.get('/exchange-rate');
        return res.data;
      },
      // Reset requests
      createResetRequest: async (orderId: string): Promise<any> => {
        const res = await api.post('/reset-request', { orderId });
        return res.data;
      },
      getResetRequests: async (): Promise<any[]> => {
        const res = await api.get('/reset-requests');
        return res.data;
      },
    };

