export interface Product {
  id: string;
  createdAt: string;
  updatedAt?: string;
  name: string;
  description: string;
  price: number;
  buyingPrice: number;
  quantity: number;  // Required property
  category: string;
  brand: string;
  imageUrl: string;  // Required property
  userId: string;    // Required property
  
  // Properties also used in the app
  discountPercentage: number;
  stock: number;
  lowStockThreshold: number;
  image: string;
  color?: string;
  itemNumber: string;
  sizes_stock?: Record<string, number>; // Optional sizes_stock field for multiple sizes/stock
}

export interface BillItem {
  id: string;
  createdAt: string;
  billId: string;
  productId: string;
  quantity: number;
  productPrice: number;
  productName?: string;
  discountPercentage?: number;
  total?: number;
}

export interface BillItemWithProduct extends BillItem {
  product: Product;
}

export interface Bill {
  id: string;
  createdAt: string;
  status: string;
  userId: string;
  
  // Add discount properties to Bill interface
  discountAmount?: number;
  discountValue?: number;
  discountType?: "percent" | "amount";
  
  // Add customer properties
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  
  // Add financial properties
  subtotal?: number;
  tax?: number;
  total?: number;
  paymentMethod?: string;
  
  items?: BillItemWithProduct[]; // Optional for extended bill with items
}

export interface BillWithItems extends Bill {
  items: BillItemWithProduct[];
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string; // Which size was selected for this item (for size-stocked products)
}

export interface DashboardStats {
  totalProducts: number;
  totalSales: number;
  lowStock: number;
  recentSales: any[];
  topSellingProducts: Array<{product: Product; soldCount: number}>;
  todaySales?: number;
  outOfStockItems?: number;
  lowStockItems: number; // Adding the missing property
}

export interface ProductWithStatus extends Product {
  status: 'in-stock' | 'low-stock' | 'out-of-stock';
}

export interface Profile {
  id: string;
  fullName?: string;
  role: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomerInfo {
  name?: string;
  phone?: string;
  email?: string;
}

export type UserRole = 'admin' | 'manager' | 'cashier';

export function mapRawBillToBill(rawBill: any): Bill {
  return {
    id: rawBill.id,
    createdAt: rawBill.created_at,
    status: rawBill.status,
    userId: rawBill.user_id,
    customerName: rawBill.customer_name,
    customerPhone: rawBill.customer_phone,
    customerEmail: rawBill.customer_email,
    subtotal: rawBill.subtotal,
    tax: rawBill.tax,
    total: rawBill.total,
    paymentMethod: rawBill.payment_method
  };
}

export function mapRawBillItemToBillItem(rawItem: any): BillItem {
  return {
    id: rawItem.id,
    createdAt: rawItem.created_at || new Date().toISOString(),
    billId: rawItem.bill_id,
    productId: rawItem.product_id,
    quantity: rawItem.quantity,
    productPrice: rawItem.product_price,
    productName: rawItem.product_name,
    discountPercentage: rawItem.discount_percentage,
    total: rawItem.total
  };
}
