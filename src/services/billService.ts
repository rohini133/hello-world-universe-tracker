
import { v4 as uuidv4 } from 'uuid';
import { CartItem, Bill, BillWithItems, BillItem, BillItemWithProduct } from '@/types/supabase-extensions';
import { supabase } from '@/integrations/supabase/client';
import { decreaseStock } from './productService';
import { toast } from '@/components/ui/use-toast';

/**
 * Sends bill receipt via WhatsApp (placeholder function)
 */
export const sendBillToWhatsApp = async (bill: BillWithItems) => {
  console.log("Sending WhatsApp receipt for bill:", bill);
  // This is a placeholder. In a real implementation, this would integrate with WhatsApp Business API
  toast({
    title: "WhatsApp Integration",
    description: `Mock sending receipt to ${bill.customerPhone || "customer"}`
  });
  return Promise.resolve();
};

/**
 * Creates a new bill from the cart items
 */
export const createBill = async (
  cartItems: CartItem[],
  customerName?: string,
  customerPhone?: string,
  customerEmail?: string,
  paymentMethod: 'cash' | 'card' | 'digital-wallet' = 'cash'
): Promise<BillWithItems> => {
  console.log("Creating bill with items:", cartItems);
  
  try {
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("Authentication required to create bills");
    }
    
    const userId = session.user.id;
    console.log("Authenticated user:", userId);
    
    // Calculate totals
    const subtotal = cartItems.reduce((total, item) => {
      const price = item.product.discountPercentage > 0
        ? item.product.price * (1 - item.product.discountPercentage / 100)
        : item.product.price;
      return total + (price * item.quantity);
    }, 0);
    
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    
    // Create bill data
    const billData = {
      id: uuidv4(),
      user_id: userId,
      subtotal,
      tax,
      total,
      customer_name: customerName || null,
      customer_phone: customerPhone || null,
      customer_email: customerEmail || null,
      payment_method: paymentMethod,
      status: 'completed'
    };
    
    console.log("Inserting bill:", billData);
    
    // Insert bill into database
    const { data: billResult, error: billError } = await supabase
      .from('bills')
      .insert(billData)
      .select()
      .single();
    
    if (billError) {
      console.error("Error creating bill:", billError);
      throw new Error(`Failed to create bill: ${billError.message}`);
    }
    
    console.log("Bill created successfully:", billResult);
    
    // Create bill items
    const billItems: BillItemWithProduct[] = [];
    
    // Insert bill items into database one by one
    for (const item of cartItems) {
      const discountedPrice = item.product.discountPercentage > 0
        ? item.product.price * (1 - item.product.discountPercentage / 100)
        : item.product.price;
      
      const billItemData = {
        id: uuidv4(),
        bill_id: billData.id,
        product_id: item.product.id,
        product_name: item.product.name,
        product_price: item.product.price,
        discount_percentage: item.product.discountPercentage,
        quantity: item.quantity,
        total: discountedPrice * item.quantity
      };
      
      console.log("Inserting bill item:", billItemData);
      
      const { data: itemResult, error: itemError } = await supabase
        .from('bill_items')
        .insert(billItemData)
        .select()
        .single();
      
      if (itemError) {
        console.error("Error creating bill item:", itemError);
        toast({
          title: "Warning",
          description: `Failed to record item ${item.product.name}: ${itemError.message}`,
          variant: "destructive"
        });
      } else {
        console.log("Bill item created successfully:", itemResult);
        // Create a BillItemWithProduct object that includes the product information
        billItems.push({
          id: itemResult.id,
          billId: itemResult.bill_id,
          productId: itemResult.product_id,
          productName: itemResult.product_name,
          productPrice: itemResult.product_price,
          discountPercentage: itemResult.discount_percentage,
          quantity: itemResult.quantity,
          total: itemResult.total,
          product: item.product
        });
      }
      
      // Decrease stock for the product
      try {
        await decreaseStock(item.product.id, item.quantity);
      } catch (stockError) {
        console.error("Error decreasing stock:", stockError);
        toast({
          title: "Warning",
          description: `Failed to update stock for ${item.product.name}`,
          variant: "destructive"
        });
      }
    }
    
    // Return the created bill with items
    return {
      id: billData.id,
      createdAt: billResult.created_at,
      subtotal,
      tax,
      total,
      customerName: customerName || null,
      customerPhone: customerPhone || null,
      customerEmail: customerEmail || null,
      paymentMethod,
      status: billResult.status,
      userId: billResult.user_id,
      items: billItems
    };
  } catch (error) {
    console.error("Bill creation failed:", error);
    throw error;
  }
};

/**
 * Retrieves all bills
 */
export const getBills = async (): Promise<Bill[]> => {
  try {
    const { data, error } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching bills:", error);
      throw new Error(`Failed to fetch bills: ${error.message}`);
    }
    
    return data?.map(bill => ({
      id: bill.id,
      createdAt: bill.created_at,
      subtotal: bill.subtotal,
      tax: bill.tax,
      total: bill.total,
      customerName: bill.customer_name,
      customerPhone: bill.customer_phone,
      customerEmail: bill.customer_email,
      paymentMethod: bill.payment_method
    })) || [];
  } catch (error) {
    console.error("Error in getBills:", error);
    throw error;
  }
};

/**
 * Retrieves a bill by ID with all its items
 */
export const getBillWithItems = async (billId: string): Promise<BillWithItems | null> => {
  try {
    // Get the bill
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single();
    
    if (billError) {
      console.error("Error fetching bill:", billError);
      throw new Error(`Failed to fetch bill: ${billError.message}`);
    }
    
    if (!billData) {
      return null;
    }
    
    // Get bill items
    const { data: itemsData, error: itemsError } = await supabase
      .from('bill_items')
      .select('*')
      .eq('bill_id', billId);
    
    if (itemsError) {
      console.error("Error fetching bill items:", itemsError);
      throw new Error(`Failed to fetch bill items: ${itemsError.message}`);
    }
    
    // Convert to bill with items
    return {
      id: billData.id,
      createdAt: billData.created_at,
      subtotal: billData.subtotal,
      tax: billData.tax,
      total: billData.total,
      customerName: billData.customer_name,
      customerPhone: billData.customer_phone,
      customerEmail: billData.customer_email,
      paymentMethod: billData.payment_method,
      items: (itemsData || []).map(item => ({
        id: item.id,
        billId: item.bill_id,
        productId: item.product_id,
        productName: item.product_name,
        productPrice: item.product_price,
        discountPercentage: item.discount_percentage,
        quantity: item.quantity,
        total: item.total,
        product: null // Product details would need a separate query
      }))
    };
  } catch (error) {
    console.error("Error in getBillWithItems:", error);
    throw error;
  }
};
