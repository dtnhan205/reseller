export type UserRole = 'admin' | 'seller';

export interface User {
  _id: string;
  email: string;
  role: UserRole;
  wallet?: number;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
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
}

export interface TopupTransaction {
  _id: string;
  seller: string;
  amount: number;
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
  amount: number;
}

export interface PurchaseRequest {
  productId: string;
}

export interface PurchaseResponse {
  order: Order;
  newBalance: number;
}

