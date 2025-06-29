export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  avatar?: string;
  points?: number;
  level?: string;
  phone?: string;
  address?: string;
  city?: string;
  district?: string;
  ward?: string;
  birthDate?: string;
  gender?: string;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  category: string;
  inStock: boolean;
  maxQuantity: number;
}

export interface Product {
  id: number;
  name: string;
  price: string;
  priceNumber: number;
  originalPrice?: string;
  image: string;
  rating: number;
  category: string;
  isPopular?: boolean;
  isTrending?: boolean;
  maxQuantity: number;
  brand?: string;
  inStock?: boolean;
  stockCount?: number;
  images?: string[];
  description?: string;
  features?: string[];
  specifications?: Record<string, string>;
  reviewCount?: number;
  discount?: number;
}

export interface Review {
  id: number;
  userName: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface Event {
  id: number;
  title: string;
  date: string;
  type: string;
  daysLeft: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  note: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
}

export interface DeliveryOption {
  id: string;
  name: string;
  time: string;
  price: number;
  description: string;
}

export interface Order {
  id: string;
  date: string;
  total: string;
  status: string;
  items: number;
  estimatedDelivery: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  birthDate: string;
  gender: string;
}

export type Screen = 
  | 'landing' 
  | 'login' 
  | 'register' 
  | 'dashboard' 
  | 'product-detail' 
  | 'cart' 
  | 'checkout' 
  | 'order-success' 
  | 'profile' 
  | 'search' 
  | 'wishlist' 
  | 'notifications' 
  | 'order-history' 
  | 'categories' 
  | 'events' 
  | 'settings'
  | 'admin-dashboard'
  | 'admin-products'
  | 'admin-orders'
  | 'admin-users'
  | 'admin-analytics'
  | 'admin-inventory'
  | 'admin-promotions'
  | 'admin-reviews';

export interface ToastType {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
  duration?: number;
}

export interface Category {
  name: string;
  icon: string;
  color: string;
}

export interface Notification {
  id: number;
  type: 'order' | 'promotion' | 'reminder' | 'system';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: React.ReactNode;
  actionLabel?: string;
  actionUrl?: string;
}