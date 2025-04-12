
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
    const { data, error } = await supabase
      .from('products')
      .select('*');
    
    if (error) {
      console.error("Error fetching products:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Try session refresh if auth error
      if (error.code === 'PGRST301' || error.message.includes('JWT')) {
        console.log("Attempting to refresh session...");
        const refreshed = await refreshSession();
        if (refreshed) {
          return getProducts(); // Retry with fresh token
        }
      }
      
      console.log("Authentication error or database error. Falling back to sample data.");
      return sampleProducts; // Return sample data as fallback
    }
    
    // If we got data from Supabase, use it
    if (data && data.length > 0) {
      console.log(`Successfully fetched ${data.length} products from Supabase`);
      const mappedProducts = data.map(item => mapDatabaseProductToProduct(item));
      return mappedProducts;
    }
    
    console.log("No products found in database, returning sample data");
    return sampleProducts; // Return sample data if no products in DB
  } catch (e) {
    console.error("Error in getProducts:", e);
    console.log("Falling back to sample data after error");
    return sampleProducts; // Return sample data after any error
  }
};

/**
 * Get a single product by ID with fallback to sample data
 */
export const getProduct = async (id: string): Promise<Product | undefined> => {
  try {
    console.log(`Fetching product ${id} directly from Supabase...`);
    
    // Get product from Supabase
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error("Error fetching product:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Fallback to sample data if not found
      console.log("Falling back to sample data");
      return sampleProducts.find(p => p.id === id);
    }
    
    if (data) {
      // Map database fields to Product type
      return mapDatabaseProductToProduct(data);
    }
    
    // Fallback to sample data if not found
    return sampleProducts.find(p => p.id === id);
  } catch (e) {
    console.error("Error in getProduct:", e);
    // Fallback to sample data
    return sampleProducts.find(p => p.id === id);
  }
};
