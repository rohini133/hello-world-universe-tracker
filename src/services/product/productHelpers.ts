
import { Product } from "@/types/supabase-extensions";
import { ProductStockStatus } from "./types";

/**
 * Determine product stock status based on current stock and threshold
 */
export const getProductStockStatus = (product: Product): ProductStockStatus => {
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
    // Handle potentially null fields
    image: item.image || '',
    description: item.description || '',
    size: item.size || null,
    color: item.color || null
  };
};

/**
 * Map our Product type to database fields
 */
export const mapProductToDatabaseProduct = (product: Product): any => {
  return {
    id: product.id,
    name: product.name,
    price: product.price,
    stock: product.stock,
    brand: product.brand,
    category: product.category,
    item_number: product.itemNumber,
    discount_percentage: product.discountPercentage,
    low_stock_threshold: product.lowStockThreshold,
    image: product.image,
    description: product.description,
    size: product.size,
    color: product.color,
    updated_at: new Date().toISOString()
  };
};
