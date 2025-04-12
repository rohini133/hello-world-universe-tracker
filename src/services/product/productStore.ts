
import { Product } from "@/types/supabase-extensions";
import { sampleProducts } from "@/data/sampleData";

// This file has been deprecated - we've removed all local storage functionality
// to ensure that all data is saved directly to Supabase.
// These methods have been kept for backwards compatibility but will log warnings.

export const getLocalProducts = (): Product[] => {
  console.warn("DEPRECATED: getLocalProducts() - Local storage is disabled. Please use Supabase directly.");
  return [];
};

export const getLocalProductById = (id: string): Product | undefined => {
  console.warn("DEPRECATED: getLocalProductById() - Local storage is disabled. Please use Supabase directly.");
  return undefined;
};

export const updateLocalProductStore = (updatedProducts: Product[]): void => {
  console.warn("DEPRECATED: updateLocalProductStore() - Local storage is disabled. Please use Supabase directly.");
  // No-op
};

export const addProductToLocalStore = (product: Product): void => {
  console.warn("DEPRECATED: addProductToLocalStore() - Local storage is disabled. Please use Supabase directly.");
  // No-op
};

export const updateProductInLocalStore = (updatedProduct: Product): void => {
  console.warn("DEPRECATED: updateProductInLocalStore() - Local storage is disabled. Please use Supabase directly.");
  // No-op
};

export const removeProductFromLocalStore = (productId: string): void => {
  console.warn("DEPRECATED: removeProductFromLocalStore() - Local storage is disabled. Please use Supabase directly.");
  // No-op
};
