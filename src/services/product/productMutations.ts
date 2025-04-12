
import { Product } from "@/types/supabase-extensions";
import { supabase, debugAuthStatus, refreshSession } from "@/integrations/supabase/client";
import { mapProductToDatabaseProduct } from "./productHelpers";
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
    
    // Prepare the product data for Supabase
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
      
      // Create product object from Supabase response
      const product = {
        id: data.id,
        name: data.name,
        price: data.price,
        stock: data.stock,
        brand: data.brand,
        category: data.category,
        itemNumber: data.item_number,
        discountPercentage: data.discount_percentage,
        lowStockThreshold: data.low_stock_threshold,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        image: data.image || '',
        description: data.description || '',
        size: data.size || null,
        color: data.color || null
      };
      
      return product;
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
    
    // Prepare product data for Supabase
    const productData = {
      name: newProduct.name,
      price: newProduct.price,
      stock: newProduct.stock,
      brand: newProduct.brand,
      category: newProduct.category,
      item_number: newProduct.itemNumber,
      discount_percentage: newProduct.discountPercentage || 0,
      low_stock_threshold: newProduct.lowStockThreshold || 5,
      image: newProduct.image || '',
      description: newProduct.description || '',
      size: newProduct.size,
      color: newProduct.color
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
      
      // Create product object from Supabase response
      const product = {
        id: data.id,
        name: data.name,
        price: data.price,
        stock: data.stock,
        brand: data.brand,
        category: data.category,
        itemNumber: data.item_number,
        discountPercentage: data.discount_percentage,
        lowStockThreshold: data.low_stock_threshold,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        image: data.image || '',
        description: data.description || '',
        size: data.size || null,
        color: data.color || null
      };
      
      return product;
    }
    
    throw new Error("Failed to add product: No data returned from database");
  } catch (e) {
    console.error("Error in addProduct:", e);
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
      showInsufficientStockNotification({
        id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        brand: product.brand,
        category: product.category,
        itemNumber: product.item_number,
        discountPercentage: product.discount_percentage,
        lowStockThreshold: product.low_stock_threshold,
        createdAt: product.created_at,
        updatedAt: product.updated_at,
        image: product.image || '',
        description: product.description || '',
        size: product.size || null,
        color: product.color || null
      }, quantity);
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
      // Create the updated product object
      const updatedProduct = {
        id: data.id,
        name: data.name,
        price: data.price,
        stock: data.stock,
        brand: data.brand,
        category: data.category,
        itemNumber: data.item_number,
        discountPercentage: data.discount_percentage,
        lowStockThreshold: data.low_stock_threshold,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        image: data.image || '',
        description: data.description || '',
        size: data.size || null,
        color: data.color || null
      };
      
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
