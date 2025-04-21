
import { Product } from "@/types/supabase-extensions";
import { ProductStockStatus } from "./types";

/**
 * Determine product stock status based on current stock and threshold
 */
export const getProductStockStatus = (product: Product): ProductStockStatus => {
  // Simple check based on product stock and threshold
  if (product.stock === 0) {
    return "out-of-stock";
  }
  if (product.stock <= product.lowStockThreshold) {
    return "low-stock";
  }
  return "in-stock";
};

/**
 * Map database product fields to our Product type
 */
export const mapDatabaseProductToProduct = (item: any): Product => {
  return {
    id: item.id,
    name: item.name,
    price: item.price,
    stock: item.stock,
    brand: item.brand,
    category: item.category,
    itemNumber: item.item_number,
    discountPercentage: item.discount_percentage,
    lowStockThreshold: item.low_stock_threshold,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    buyingPrice: item.buying_price || 0,
    // Handle potentially null fields
    image: item.image || '',
    description: item.description || '',
    color: item.color || null,
    sizes_stock: item.sizes_stock || {}, // Ensure sizes_stock is always at least an empty object
    
    // Add required fields with default values
    quantity: item.stock || 0, // Set quantity same as stock
    imageUrl: item.image || '', // Use image as imageUrl
    userId: 'system' // Default userId value instead of trying to access non-existent field
  };
};

/**
 * Map product from application format to database format
 */
export function mapProductToDatabaseProduct(product: Product) {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description || '',
    price: product.price,
    buying_price: product.buyingPrice,
    discount_percentage: product.discountPercentage,
    stock: product.stock,
    low_stock_threshold: product.lowStockThreshold,
    image: product.image || '',
    color: product.color,
    item_number: product.itemNumber,
    updated_at: new Date().toISOString(),
    sizes_stock: product.sizes_stock || null  // Map the sizes_stock to the database
    // Removed size mapping
  };
}
