
import { Product, ProductWithStatus } from "@/types/supabase-extensions";

// Re-export functions from the refactored modules
export { getProducts, getProduct } from "./product/productQueries";
export { updateProduct, addProduct, decreaseStock } from "./product/productMutations";
export { getProductStockStatus } from "./product/productHelpers";

// Export an online mode flag to control behavior throughout the app
export const ONLINE_MODE = true; // Force online mode to ensure direct Supabase writes
