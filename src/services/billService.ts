
import { Bill, CartItem, BillItem, BillWithItems } from "@/data/models";
import { updateProduct } from "./productService";

// Function to get all bills from localStorage
export const getBills = (): Bill[] => {
  try {
    const billsData = localStorage.getItem('retailSystemBills');
    return billsData ? JSON.parse(billsData) : [];
  } catch (error) {
    console.error("Error fetching bills:", error);
    return [];
  }
};

// Function to get a single bill by ID
export const getBillById = (id: string): Bill | null => {
  try {
    const bills = getBills();
    return bills.find(bill => bill.id === id) || null;
  } catch (error) {
    console.error("Error fetching bill:", error);
    return null;
  }
};

// Function to create a new bill
export const createBill = (
  cartItems: CartItem[],
  customerName?: string,
  customerPhone?: string,
  customerEmail?: string,
  paymentMethod: "cash" | "card" | "digital-wallet" = "cash"
): BillWithItems => {
  try {
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cannot create bill with empty cart");
    }

    // Generate a new bill ID
    const bills = getBills();
    const billId = `B${String(bills.length + 1).padStart(3, "0")}`;

    // Calculate bill totals
    const subtotal = cartItems.reduce((total, item) => {
      const discountedPrice = item.product.price * (1 - item.product.discountPercentage / 100);
      return total + (discountedPrice * item.quantity);
    }, 0);
    
    const taxRate = 0.08; // 8% tax
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    // Create bill items
    const billItems = cartItems.map(item => {
      const discountedPrice = item.product.price * (1 - item.product.discountPercentage / 100);
      return {
        id: `bi-${Math.random().toString(36).substring(2, 9)}`,
        billId: billId,
        productId: item.product.id,
        productPrice: item.product.price,
        discountPercentage: item.product.discountPercentage,
        quantity: item.quantity,
        total: discountedPrice * item.quantity,
        productName: item.product.name,
        product: item.product // Add the full product for PDF generation
      };
    });

    // Create the bill object with full item details
    const newBill: BillWithItems = {
      id: billId,
      items: billItems,
      subtotal,
      tax,
      total,
      customerName,
      customerPhone,
      customerEmail,
      paymentMethod,
      createdAt: new Date().toISOString(),
      status: "completed",
      userId: "system" // In a real system, this would be the logged-in user ID
    };

    // Save the bill to localStorage
    bills.push(newBill);
    localStorage.setItem('retailSystemBills', JSON.stringify(bills));

    // Update product stock quantities
    for (const item of cartItems) {
      const newStockQty = item.product.stock - item.quantity;
      // Fix: Using updateProduct instead of updateProductStock
      updateProduct({
        ...item.product,
        stock: newStockQty
      });
    }

    return newBill;
  } catch (error) {
    console.error("Error creating bill:", error);
    throw error;
  }
};

// Function to send bill to WhatsApp (mock implementation)
export const sendBillToWhatsApp = async (bill: BillWithItems): Promise<boolean> => {
  // In a real app, this would connect to a WhatsApp API service
  // For now we'll simulate a successful send after a short delay
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`WhatsApp bill sent to ${bill.customerPhone}:`, bill);
      resolve(true);
    }, 1000);
  });
};

// Function to get a bill with its items
export const getBillWithItems = (billId: string): BillWithItems | null => {
  const bill = getBillById(billId);
  if (!bill) return null;
  
  // In a real database system, we would join bills with items
  // Here we're simulating this by finding items with matching billId
  try {
    const billsData = localStorage.getItem('retailSystemBillItems');
    const allBillItems = billsData ? JSON.parse(billsData) : [];
    const billItems = allBillItems.filter((item: BillItem) => item.billId === billId);
    
    return {
      ...bill,
      items: billItems
    };
  } catch (error) {
    console.error("Error fetching bill items:", error);
    return null;
  }
};
