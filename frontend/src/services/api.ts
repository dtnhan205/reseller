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
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
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
  getCategories: async (): Promise<Category[]> => {
    const res = await api.get('/admin/categories');
    return res.data;
  },
  createCategory: async (name: string): Promise<Category> => {
    const res = await api.post('/admin/categories', { name });
    return res.data;
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
  addInventory: async (
    productId: string,
    keys: string[]
  ): Promise<Product> => {
    const res = await api.post(`/admin/products/${productId}/inventory`, {
      keys,
    });
    return res.data;
  },
};

// Seller APIs
export const sellerApi = {
  topup: async (data: TopupRequest): Promise<{ newBalance: number }> => {
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
};

export default api;

