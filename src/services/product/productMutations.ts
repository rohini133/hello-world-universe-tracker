
import { Product } from "@/types/supabase-extensions";
import { supabase, debugAuthStatus, refreshSession } from "@/integrations/supabase/client";
import { mapProductToDatabaseProduct, mapDatabaseProductToProduct } from "./productHelpers";
import { 
  showLowStockNotification, 
  showOutOfStockNotification,
  showInsufficientStockNotification 
} from "./notificationService";

/**
 * Update an existing product - only using Supabase
 */
export const updateProduct = async (updatedProduct: Product): Promise<Product> => {
  try {
    console.log("Updating product directly in Supabase:", updatedProduct);
    
    // Check active session first
    const authStatus = await debugAuthStatus();
    console.log("Auth status before updating product:", authStatus);
    
    if (!authStatus.isAuthenticated) {
      console.warn("No authenticated session found for product update");
      
      // Try to refresh session
      console.log("Attempting to refresh session...");
      const refreshed = await refreshSession();
      if (!refreshed) {
        throw new Error("Authentication required to update products");
      }
    }
    
    // Prepare the product data for Supabase - remove user_id field
    const productData = mapProductToDatabaseProduct(updatedProduct);
    
    // Update in Supabase with detailed logging
    console.log("Sending update to Supabase:", productData);
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', updatedProduct.id)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating product in Supabase:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (data) {
      console.log("Product successfully updated in Supabase:", data);
      
      // Use helper function to map database response to Product type
      return mapDatabaseProductToProduct(data);
    }
    
    throw new Error("Failed to update product: No data returned from database");
  } catch (e) {
    console.error("Error in updateProduct:", e);
    throw e; // Re-throw to be handled by the caller
  }
};

/**
 * Add a new product directly to Supabase
 */
export const addProduct = async (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> => {
  try {
    console.log("Adding product directly to Supabase:", newProduct);
    
    // First, debug the authentication status
    const authStatus = await debugAuthStatus();
    console.log("Auth debug before product addition:", authStatus);
    
    if (!authStatus.isAuthenticated) {
      // Try to refresh the session
      console.log("Attempting to refresh session...");
      const refreshed = await refreshSession();
      
      if (!refreshed) {
        console.warn("No authenticated session found for product addition");
        throw new Error("Authentication required to add products");
      }
    }
    
    // Check for required fields
    if (!newProduct.name || !newProduct.price || !newProduct.brand || 
        !newProduct.category || !newProduct.itemNumber) {
      throw new Error("Required fields missing: Product must have name, price, brand, category, and item number");
    }
    
    // Check for duplicate item number
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, item_number')
      .eq('item_number', newProduct.itemNumber);
    
    if (checkError) {
      console.error("Error checking for duplicate item number:", checkError);
      throw new Error(`Database error while checking for duplicates: ${checkError.message}`);
    }
    
    if (existingProducts && existingProducts.length > 0) {
      throw new Error(`Item number ${newProduct.itemNumber} already exists. Please use a unique item number.`);
    }
    
    // Prepare product data for Supabase - remove user_id field
    const productData = {
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock || 0,
      brand: newProduct.brand,
      category: newProduct.category,
      item_number: newProduct.itemNumber,
      discount_percentage: newProduct.discountPercentage || 0,
      low_stock_threshold: newProduct.lowStockThreshold || 5,
      buying_price: newProduct.buyingPrice || 0,
      image: newProduct.image || '',
      description: newProduct.description || '',
      color: newProduct.color || null,
      size: newProduct.size || null,
      // Remove the user_id field from the insert operation
      sizes_stock: newProduct.sizes_stock || null  // Make sure to include the sizes_stock field
    };
    
    console.log("Prepared data for Supabase insertion:", productData);
    
    // Insert in Supabase with more detailed error handling
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();
      
    if (error) {
      console.error("Error adding product to Supabase:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    if (data) {
      console.log("Product added successfully to Supabase:", data);
      
      // Use helper function to map database response to Product type
      return mapDatabaseProductToProduct(data);
    }
    
    throw new Error("Failed to add product: No data returned from database");
  } catch (e) {
    console.error("Error in addProduct:", e);
    throw e;
  }
};

/**
 * Delete a product from Supabase by ID
 */
export const deleteProduct = async (productId: string): Promise<boolean> => {
  try {
    console.log(`Deleting product ${productId} from Supabase`);
    
    // Check active session first
    const authStatus = await debugAuthStatus();
    console.log("Auth status before deleting product:", authStatus);
    
    if (!authStatus.isAuthenticated) {
      console.warn("No authenticated session found for product deletion");
      
      // Try to refresh session
      console.log("Attempting to refresh session...");
      const refreshed = await refreshSession();
      if (!refreshed) {
        throw new Error("Authentication required to delete products");
      }
    }
    
    // Delete the product from Supabase
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);
      
    if (error) {
      console.error("Error deleting product from Supabase:", error);
      console.error("Detailed error:", {
        message: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      throw new Error(`Database error: ${error.message}`);
    }
    
    console.log(`Successfully deleted product ${productId} from Supabase`);
    return true;
  } catch (e) {
    console.error("Error in deleteProduct:", e);
    throw e;
  }
};

/**
 * Decrease stock for a product directly in Supabase
 */
export const decreaseStock = async (productId: string, quantity: number = 1): Promise<Product> => {
  try {
    console.log(`Decreasing stock for product ${productId} by ${quantity} directly in Supabase`);
    
    // Get the current product from Supabase
    const { data: product, error: getError } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (getError) {
      console.error("Error getting product from Supabase:", getError);
      throw new Error(`Database error while getting product: ${getError.message}`);
    }
    
    if (!product) {
      throw new Error("Product not found");
    }
    
    if (product.stock < quantity) {
      // Use helper function to map database product to Product type
      const mappedProduct = mapDatabaseProductToProduct(product);
      showInsufficientStockNotification(mappedProduct, quantity);
      throw new Error("Insufficient stock");
    }
    
    const newStock = product.stock - quantity;
    
    // Update in Supabase
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: newStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select()
      .single();
      
    if (error) {
      console.error("Error updating stock in Supabase:", error);
      throw new Error(`Database error while updating stock: ${error.message}`);
    }
    
    if (data) {
      // Use helper function to map database response to Product type
      const updatedProduct = mapDatabaseProductToProduct(data);
      
      // Check if stock is low after update
      if (updatedProduct.stock <= updatedProduct.lowStockThreshold && updatedProduct.stock > 0) {
        showLowStockNotification(updatedProduct);
      }
      
      // Check if out of stock after update
      if (updatedProduct.stock === 0) {
        showOutOfStockNotification(updatedProduct);
      }
      
      return updatedProduct;
    }
    
    throw new Error("Failed to update stock");
  } catch (e) {
    console.error("Error in decreaseStock:", e);
    throw e;
  }
};

export function buildProductForUpdate(product) {
  return {
    name: product.name,
    brand: product.brand,
    category: product.category,
    description: product.description || '',
    price: product.price,
    buying_price: product.buyingPrice || 0,
    discount_percentage: product.discountPercentage || 0,
    stock: product.stock,
    low_stock_threshold: product.lowStockThreshold || 5,
    image: product.image || '',
    color: product.color || null,
    size: product.size || null,
    item_number: product.itemNumber,
    updated_at: new Date().toISOString(),
    sizes_stock: product.sizes_stock || null
    // Removed the user_id field
  };
}
