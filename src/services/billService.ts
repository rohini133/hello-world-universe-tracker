
import { supabase } from "@/integrations/supabase/client";
import { Bill, BillItem, BillWithItems, mapRawBillToBill, mapRawBillItemToBillItem, Product } from "@/types/supabase-extensions";
import { CartItem } from "@/hooks/useBillingCart";

export const createBill = async (billData: {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  paymentMethod: string;
  status?: string;
  discountAmount?: number;
  discountType?: "percent" | "amount";
  discountValue?: number;
}) => {
  try {
    // First, create the bill
    const { data: billResult, error: billError } = await supabase
      .from('bills')
      .insert({
        subtotal: billData.subtotal,
        tax: billData.tax,
        total: billData.total,
        customer_name: billData.customerName,
        customer_phone: billData.customerPhone,
        customer_email: billData.customerEmail,
        payment_method: billData.paymentMethod,
        status: billData.status || 'completed',
        user_id: (await supabase.auth.getUser()).data.user?.id || ''
      })
      .select()
      .single();

    if (billError) throw billError;
    if (!billResult) throw new Error('No bill created');

    // Then, create bill items
    const billItems = billData.cartItems.map(item => ({
      bill_id: billResult.id,
      product_id: item.product.id,
      product_name: item.product.name,
      product_price: item.product.price,
      quantity: item.quantity,
      discount_percentage: item.product.discountPercentage,
      total: item.product.price * item.quantity * (1 - item.product.discountPercentage / 100)
    }));

    const { error: itemsError } = await supabase
      .from('bill_items')
      .insert(billItems);

    if (itemsError) throw itemsError;

    // Create a properly formatted bill with items for the return value
    const billWithItems: BillWithItems = {
      ...mapRawBillToBill(billResult),
      discountAmount: billData.discountAmount,
      discountType: billData.discountType,
      discountValue: billData.discountValue,
      items: billData.cartItems.map(item => ({
        id: '',
        createdAt: new Date().toISOString(),
        billId: billResult.id,
        productId: item.product.id,
        productName: item.product.name,
        productPrice: item.product.price,
        quantity: item.quantity,
        discountPercentage: item.product.discountPercentage,
        total: item.product.price * item.quantity * (1 - item.product.discountPercentage / 100),
        product: item.product
      })),
      subtotal: billData.subtotal,
      tax: billData.tax,
      total: billData.total,
      paymentMethod: billData.paymentMethod
    };

    return billWithItems;
  } catch (error) {
    console.error('Error creating bill:', error);
    throw error;
  }
};

export const getBillById = async (billId: string): Promise<BillWithItems | null> => {
  try {
    // Get the bill
    const { data: billData, error: billError } = await supabase
      .from('bills')
      .select('*')
      .eq('id', billId)
      .single();

    if (billError) throw billError;
    if (!billData) return null;

    // Convert raw bill to our Bill type
    const bill = mapRawBillToBill(billData);

    // Get the bill items
    const { data: itemsData, error: itemsError } = await supabase
      .from('bill_items')
      .select('*, products(*)')
      .eq('bill_id', billId);

    if (itemsError) throw itemsError;

    // Map the items with their products
    const items = itemsData ? itemsData.map(item => {
      const billItem = mapRawBillItemToBillItem(item);
      
      // Create the product object from the joined data
      const product = item.products ? {
        id: item.products.id,
        name: item.products.name,
        brand: item.products.brand,
        category: item.products.category,
        description: item.products.description || '',
        price: item.products.price,
        buyingPrice: item.products.buying_price || 0,
        discountPercentage: item.products.discount_percentage,
        stock: item.products.stock,
        lowStockThreshold: item.products.low_stock_threshold,
        image: item.products.image || '',
        color: item.products.color || null,
        itemNumber: item.products.item_number,
        createdAt: item.products.created_at,
        updatedAt: item.products.updated_at,
        quantity: item.products.stock || 0,
        imageUrl: item.products.image || '',
        userId: 'system', // Default value instead of referencing non-existent column
        sizes_stock: item.products.sizes_stock || {} // Ensure sizes_stock is available
      } : null;

      return {
        ...billItem,
        product: product as Product
      };
    }) : [];

    return {
      ...bill,
      items: items || [],
      subtotal: bill.subtotal || 0,
      tax: bill.tax || 0,
      total: bill.total || 0,
      paymentMethod: bill.paymentMethod || 'cash'
    };
  } catch (error) {
    console.error('Error fetching bill by ID:', error);
    throw error;
  }
};

export const deleteBill = async (billId: string): Promise<boolean> => {
  try {
    // First delete all bill items
    const { error: itemsError } = await supabase
      .from('bill_items')
      .delete()
      .eq('bill_id', billId);

    if (itemsError) throw itemsError;

    // Then delete the bill
    const { error: billError } = await supabase
      .from('bills')
      .delete()
      .eq('id', billId);

    if (billError) throw billError;

    return true;
  } catch (error) {
    console.error('Error deleting bill:', error);
    throw error;
  }
};

export const sendBillToWhatsApp = async (bill: BillWithItems): Promise<boolean> => {
  try {
    if (!bill.customerPhone) {
      throw new Error('Customer phone number is required to send bill via WhatsApp');
    }

    // Here we would integrate with a WhatsApp API service
    // For now, we're just simulating successful sending
    console.log(`Sending bill ${bill.id} to ${bill.customerPhone} via WhatsApp`);
    
    // In a real implementation, you would:
    // 1. Format the bill data for WhatsApp
    // 2. Call the WhatsApp Business API or a service like Twilio
    // 3. Return success based on the API response

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Error sending bill to WhatsApp:', error);
    throw error;
  }
};

export const getBills = async (): Promise<BillWithItems[]> => {
  try {
    // First, get all bills
    const { data: billsData, error: billsError } = await supabase
      .from('bills')
      .select('*')
      .order('created_at', { ascending: false });

    if (billsError) throw billsError;
    if (!billsData) return [];

    // Convert raw bills to our Bill type
    const bills = billsData.map(rawBill => mapRawBillToBill(rawBill));

    // For each bill, get its items
    const billsWithItems: BillWithItems[] = await Promise.all(bills.map(async bill => {
      const { data: itemsData, error: itemsError } = await supabase
        .from('bill_items')
        .select('*, products(*)')
        .eq('bill_id', bill.id);

      if (itemsError) {
        console.error('Error fetching bill items:', itemsError);
        return { 
          ...bill, 
          items: [],
          subtotal: bill.subtotal || 0,
          tax: bill.tax || 0,
          total: bill.total || 0,
          paymentMethod: bill.paymentMethod || 'cash'
        };
      }

      if (!itemsData) return { 
        ...bill, 
        items: [],
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        total: bill.total || 0,
        paymentMethod: bill.paymentMethod || 'cash' 
      };

      // Map the items with their products
      const items = itemsData.map(item => {
        const billItem = mapRawBillItemToBillItem(item);
        
        // Create the product object from the joined data
        const product = item.products ? {
          id: item.products.id,
          name: item.products.name,
          brand: item.products.brand,
          category: item.products.category,
          description: item.products.description || '',
          price: item.products.price,
          buyingPrice: item.products.buying_price || 0,
          discountPercentage: item.products.discount_percentage,
          stock: item.products.stock,
          lowStockThreshold: item.products.low_stock_threshold,
          image: item.products.image || '',
          color: item.products.color || null,
          itemNumber: item.products.item_number,
          createdAt: item.products.created_at,
          updatedAt: item.products.updated_at,
          quantity: item.products.stock || 0,
          imageUrl: item.products.image || '',
          userId: 'system', // Default value instead of referencing non-existent column
          sizes_stock: item.products.sizes_stock || {} // Ensure sizes_stock is available
        } : null;

        return {
          ...billItem,
          product: product as Product
        };
      });

      return {
        ...bill,
        items,
        subtotal: bill.subtotal || 0,
        tax: bill.tax || 0,
        total: bill.total || 0,
        paymentMethod: bill.paymentMethod || 'cash'
      };
    }));

    return billsWithItems;
  } catch (error) {
    console.error('Error fetching bills with items:', error);
    throw error;
  }
};
