
import { Product } from "@/types/supabase-extensions";
import { supabase, debugAuthStatus, refreshSession } from "@/integrations/supabase/client";
import { mapDatabaseProductToProduct } from "./productHelpers";
import { sampleProducts } from "@/data/sampleData";

/**
 * Fetch all products from Supabase with local fallback to sample data
 */
export const getProducts = async (): Promise<Product[]> => {
  try {
    console.log("Fetching products directly from Supabase...");
    
    // Check authentication status first
    const authStatus = await debugAuthStatus();
    console.log("Auth status before fetching products:", authStatus);
    
    // Fetch products from Supabase
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*');
    
    if (productError) {
      console.error("Error fetching products:", productError);
      console.error("Detailed error:", {
        message: productError.message, 
        code: productError.code,
        details: productError.details,
        hint: productError.hint
      });
      
      // Try session refresh if auth error
      if (productError.code === 'PGRST301' || productError.message.includes('JWT')) {
        console.log("Attempting to refresh session...");
        const refreshed = await refreshSession();
        if (refreshed) {
          return getProducts(); // Retry with fresh token
        }
      }
      
      console.log("Authentication error or database error. Falling back to sample data.");
      return sampleProducts;
    }
    
    // If we got data from Supabase, map it to our Product type
    if (productData && productData.length > 0) {
      console.log(`Successfully fetched ${productData.length} products from Supabase`);
      return productData.map(item => mapDatabaseProductToProduct(item));
    }
    
    console.log("No products found in database, returning sample data");
    return sampleProducts;
  } catch (e) {
    console.error("Error in getProducts:", e);
    console.log("Falling back to sample data after error");
    return sampleProducts;
  }
};

/**
 * Get a single product by ID with fallback to sample data
 */
export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    console.log(`Fetching product ${id} directly from Supabase...`);
    
    // Get product from Supabase
    const { data: productData, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (productError) {
      console.error("Error fetching product:", productError);
      console.error("Detailed error:", {
        message: productError.message, 
        code: productError.code,
        details: productError.details,
        hint: productError.hint
      });
      
      // Fallback to sample data if not found
      console.log("Falling back to sample data");
      return sampleProducts.find(p => p.id === id);
    }
    
    if (productData) {
      // Map database fields to Product type
      const mappedProduct = mapDatabaseProductToProduct(productData);
      return mappedProduct;
    }
    
    // Fallback to sample data if not found
    return sampleProducts.find(p => p.id === id);
  } catch (e) {
    console.error("Error in getProduct:", e);
    // Fallback to sample data
    return sampleProducts.find(p => p.id === id);
  }
};
