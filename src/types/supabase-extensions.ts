import type { Database } from '@/integrations/supabase/types';

// Re-export the Database type for easier imports throughout the app
export type { Database };

// Raw database types (with snake_case)
type RawProduct = Database['public']['Tables']['products']['Row'];
type RawBill = Database['public']['Tables']['bills']['Row'];
type RawBillItem = Database['public']['Tables']['bill_items']['Row'];
type RawProfile = Database['public']['Tables']['profiles']['Row'];

// Convenience type for Products table with camelCase properties
export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  price: number;
  discountPercentage: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
  size?: string;
  color?: string;
  itemNumber: string;
  createdAt: string;
  updatedAt: string;
}

// Convert from snake_case database model to camelCase interface
export function mapRawProductToProduct(raw: RawProduct): Product {
  return {
    id: raw.id,
    name: raw.name,
    brand: raw.brand,
    category: raw.category,
    description: raw.description,
    price: raw.price,
    discountPercentage: raw.discount_percentage,
    stock: raw.stock,
    lowStockThreshold: raw.low_stock_threshold,
    image: raw.image,
    size: raw.size,
    color: raw.color,
    itemNumber: raw.item_number,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at
  };
}

// Convert from camelCase interface to snake_case database model
export function mapProductToRawProduct(product: Product): RawProduct {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description,
    price: product.price,
    discount_percentage: product.discountPercentage,
    stock: product.stock,
    low_stock_threshold: product.lowStockThreshold,
    image: product.image,
    size: product.size,
    color: product.color,
    item_number: product.itemNumber,
    created_at: product.createdAt,
    updated_at: product.updatedAt
  };
}

// Convenience type for Bills table with camelCase properties
export interface Bill {
  id: string;
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: string;
  createdAt: string;
  status: string;
  userId: string;
  items?: BillItemWithProduct[]; // Optional for extended bill with items
}

// Convert from snake_case database model to camelCase interface
export function mapRawBillToBill(raw: RawBill): Bill {
  return {
    id: raw.id,
    subtotal: raw.subtotal,
    tax: raw.tax,
    total: raw.total,
    customerName: raw.customer_name,
    customerPhone: raw.customer_phone,
    customerEmail: raw.customer_email,
    paymentMethod: raw.payment_method,
    createdAt: raw.created_at,
    status: raw.status,
    userId: raw.user_id
  };
}

// Convert from camelCase interface to snake_case database model
export function mapBillToRawBill(bill: Bill): RawBill {
  return {
    id: bill.id,
    subtotal: bill.subtotal,
    tax: bill.tax,
    total: bill.total,
    customer_name: bill.customerName,
    customer_phone: bill.customerPhone,
    customer_email: bill.customerEmail,
    payment_method: bill.paymentMethod,
    created_at: bill.createdAt,
    status: bill.status,
    user_id: bill.userId
  };
}

// Convenience type for Bill Items table
export interface BillItem {
  id: string;
  billId: string;
  productId: string;
  productPrice: number;
  discountPercentage: number;
  quantity: number;
  total: number;
  productName: string;
}

// Convert from snake_case database model to camelCase interface
export function mapRawBillItemToBillItem(raw: RawBillItem): BillItem {
  return {
    id: raw.id,
    billId: raw.bill_id,
    productId: raw.product_id,
    productPrice: raw.product_price,
    discountPercentage: raw.discount_percentage,
    quantity: raw.quantity,
    total: raw.total,
    productName: raw.product_name
  };
}

// Extended bill item type with product details
export interface BillItemWithProduct extends BillItem {
  product: Product;
}

// Extended bill type with items included
export interface BillWithItems extends Bill {
  items: BillItemWithProduct[];
}

// Convenience type for Profiles table
export interface Profile {
  id: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Convert from snake_case database model to camelCase interface
export function mapRawProfileToProfile(raw: RawProfile): Profile {
  return {
    id: raw.id,
    fullName: raw.full_name,
    avatarUrl: raw.avatar_url,
    role: raw.role,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at
  };
}

// Extended product type with calculated fields
export interface ProductWithStatus extends Product {
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
}

// Custom CartItem type that matches your current model
export interface CartItem {
  product: Product;
  quantity: number;
}

// Define the type for authentication roles
export type UserRole = 'admin' | 'cashier';

// Define customer information type
export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

// Dashboard statistics type
export interface DashboardStats {
  totalSales: number;
  todaySales: number;
  lowStockItems: number;
  outOfStockItems: number;
  recentSales: BillWithItems[];
  topSellingProducts: { product: Product; soldCount: number }[];
}
