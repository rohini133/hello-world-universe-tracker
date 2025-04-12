
import { Product } from "@/types/supabase-extensions";

// Stock status type
export type ProductStockStatus = "in-stock" | "low-stock" | "out-of-stock";

// Common types for product services
export interface ProductQueryResult {
  success: boolean;
  data?: Product | Product[];
  error?: string;
}
