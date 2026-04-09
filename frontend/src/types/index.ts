export type UserRole = 'admin' | 'seller';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  wallet?: number;
  totalTopup?: number; // Tổng nạp tiền (USD)
  totalSpent?: number; // Tổng đã chi mua key (USD)
  isLocked?: boolean;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  image?: string;
  order?: number;
  status?: 'active' | 'inactive';
  createdAt: string;
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  price: number;
  category: Category | string;
  remainingQuantity: number;
  soldQuantity: number;
  createdAt: string;
  proxyvip?: number | null;
  proxyvipConfig?: {
    ip?: string;
    port?: string;
    aimLink?: string;
    installText?: string;
    installVideoUrl?: string;
    source?: 'v1' | 'v2' | 'v3';
    duration?: '1h' | '2h' | '1d' | '1w' | '1m' | '1y';
  } | null;
  status?: 'active' | 'inactive';
}

export interface InventoryItem {
  key: string;
  sold: boolean;
  soldTo?: string;
  soldAt?: string;
}

export interface Order {
  _id: string;
  product: Product | string;
  productName: string;
  key: string;
  price: number;
  seller: string;
  createdAt: string;
  proxyvipStatus?: 'pending' | 'processed' | null; // null nếu không phải Proxy VIP, 'pending' hoặc 'processed' nếu là Proxy VIP
}

export interface TopupTransaction {
  _id: string;
  seller: string;
  amount: number; // VND (backward compatibility)
  amountUSD?: number; // USD
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface TopupRequest {
  amountUSD: number; // Amount in USD
}

export interface PurchaseRequest {
  productId: string;
}

export interface PurchaseResponse {
  order: Order;
  newBalance: number;
}

export interface ProxyVipRequest {
  _id: string;
  sellerEmail?: string;
  sellerId: string;
  productName?: string;
  productId: string;
  gameId?: string; // legacy
  status: 'pending' | 'processed';
  createdAt: string;
  processedAt?: string;
  licenseKey?: string;
  licenseDuration?: '1h' | '2h' | '1d' | '1w' | '1m' | '1y';
  licenseSource?: 'v1' | 'v2' | 'v3';
}

export interface CreateProxyVipRequestRequest {
  productId: string;
}

export interface CreateProxyVipRequestResponse {
  request: ProxyVipRequest;
  order: Order | null;
  newBalance: number;
}

export interface BankAccount {
  _id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  apiUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  sellerId: string;
  amount: number; // VNĐ (backward compatibility)
  amountUSD?: number;
  amountVND?: number;
  transferContent: string;
  bankAccountId: BankAccount | string | null;
  status: 'pending' | 'completed' | 'expired';
  completedAt?: string;
  expiresAt: string;
  note?: string; // Ghi chú cho manual topup
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  usdToVnd: number;
}

export interface SellerProductPrice {
  _id: string;
  seller: User | string;
  product: Product | string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDashboardStats {
  today: { totalOrders: number; totalRevenue: number };
  thisMonth: { totalOrders: number; totalRevenue: number };
  thisYear: { totalOrders: number; totalRevenue: number };
  allTime: { totalOrders: number; totalRevenue: number };
  chart: Array<{ date: string; totalOrders: number; totalRevenue: number }>;
  topProducts: {
    today: TopProductItem[];
    week: TopProductItem[];
    month: TopProductItem[];
    year: TopProductItem[];
  };
}

export interface TopProductItem {
  rank: number;
  productId: string | null;
  productName: string;
  totalOrders: number;
  totalRevenue: number;
}

export type HackStatusType = 'updating' | 'safe';

export interface Hack {
  _id: string;
  name: string;
  image?: string;
  status: HackStatusType;
  downloadUrl?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ResetRequest {
  _id: string;
  orderId: string | Order;
  sellerId: string | User;
  categoryName: string;
  productName: string;
  key: string;
  requestedBy: string;
  status: 'pending' | 'approved' | 'rejected';
  processedAt?: string;
  processedBy?: string | User;
  createdAt: string;
  updatedAt: string;
}

