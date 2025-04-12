import React, { useState, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PageContainer } from "@/components/layout/PageContainer";
import { ItemScanner } from "@/components/billing/ItemScanner";
import { ProductSearch } from "@/components/billing/ProductSearch";
import { CartItem, Product, BillWithItems } from "@/data/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartItemRow } from "@/components/billing/CartItemRow";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createBill } from "@/services/billService";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";
import { useToast } from "@/components/ui/use-toast";

const Billing = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital-wallet">("cash");
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<BillWithItems | null>(null);
  const { toast } = useToast();

  const subtotal = cartItems.reduce((total, item) => {
    const discountedPrice = item.product.price * (1 - item.product.discountPercentage / 100);
    return total + (discountedPrice * item.quantity);
  }, 0);
  
  const taxRate = 0.08; // 8% tax
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  const handleAddToCart = (product: Product) => {
    const existingItemIndex = cartItems.findIndex(
      item => item.product.id === product.id
    );

    if (existingItemIndex >= 0) {
      const updatedCart = [...cartItems];
      updatedCart[existingItemIndex].quantity += 1;
      setCartItems(updatedCart);
    } else {
      setCartItems([...cartItems, { product, quantity: 1 }]);
    }
    
    toast({
      title: "Item added",
      description: `${product.name} has been added to cart`,
    });
  };

  const handleUpdateQuantity = (item: CartItem, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(item);
      return;
    }

    if (newQuantity > item.product.stock) {
      toast({
        title: "Quantity exceeds stock",
        description: `Only ${item.product.stock} units available`,
        variant: "destructive",
      });
      return;
    }

    const updatedCart = cartItems.map(cartItem => {
      if (cartItem.product.id === item.product.id) {
        return { ...cartItem, quantity: newQuantity };
      }
      return cartItem;
    });
    
    setCartItems(updatedCart);
  };

  const handleRemoveItem = (item: CartItem) => {
    const updatedCart = cartItems.filter(
      cartItem => cartItem.product.id !== item.product.id
    );
    setCartItems(updatedCart);
  };

  const handleCartClear = () => {
    setCartItems([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setPaymentMethod("cash");
    setCurrentBill(null);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to the cart before checkout",
        variant: "destructive",
      });
      return;
    }

    try {
      const newBill = createBill(
        cartItems,
        customerName || undefined,
        customerPhone || undefined,
        customerEmail || undefined,
        paymentMethod
      );
      
      setCurrentBill(newBill);
      
      setIsCheckoutOpen(true);
    } catch (error) {
      console.error("Checkout error:", error);
      toast({
        title: "Checkout failed",
        description: "There was an error processing your checkout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCheckoutClose = () => {
    setIsCheckoutOpen(false);
    handleCartClear();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
      currencyDisplay: 'symbol'
    }).format(amount).replace('₹', '₹ ');
  };

  return (
    <PageContainer title="Billing" subtitle="Manage sales and transactions">
      <div className="container mx-auto py-6">
        <h1 className="text-3xl font-semibold mb-6">Billing</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="search" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="search">Search Products</TabsTrigger>
                <TabsTrigger value="scan">Scan Items</TabsTrigger>
              </TabsList>
              
              <TabsContent value="search">
                <ProductSearch onAddToCart={handleAddToCart} />
              </TabsContent>
              
              <TabsContent value="scan">
                <ItemScanner onItemScanned={handleAddToCart} />
              </TabsContent>
            </Tabs>
            
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100 mb-6">
              <h2 className="text-lg font-semibold mb-4">Customer Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input 
                    id="customerName" 
                    value={customerName} 
                    onChange={e => setCustomerName(e.target.value)} 
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Phone Number</Label>
                  <Input 
                    id="customerPhone" 
                    value={customerPhone} 
                    onChange={e => setCustomerPhone(e.target.value)} 
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input 
                    id="customerEmail" 
                    value={customerEmail} 
                    onChange={e => setCustomerEmail(e.target.value)} 
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border border-gray-100">
              <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
              <RadioGroup value={paymentMethod} onValueChange={(value: "cash" | "card" | "digital-wallet") => setPaymentMethod(value)}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cash" id="cash" />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card">Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="digital-wallet" id="digital-wallet" />
                    <Label htmlFor="digital-wallet">Digital Wallet</Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          
          <div>
            <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold">Shopping Cart</h2>
                  <Button variant="ghost" size="sm" onClick={handleCartClear}>
                    Clear Cart
                  </Button>
                </div>
                <div className="text-sm text-gray-500">
                  {cartItems.length === 0
                    ? "Cart is empty"
                    : `${cartItems.length} ${cartItems.length === 1 ? 'item' : 'items'} in cart`}
                </div>
              </div>
              
              <div className="flex-grow overflow-y-auto p-4">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No items in cart
                  </div>
                ) : (
                  <div className="space-y-1">
                    {cartItems.map((item, index) => (
                      <CartItemRow
                        key={`${item.product.id}-${index}`}
                        item={item}
                        onUpdateQuantity={handleUpdateQuantity}
                        onRemoveItem={handleRemoveItem}
                      />
                    ))}
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-100 p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between mb-3">
                  <span className="text-gray-600">Tax (8%):</span>
                  <span>{formatCurrency(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Total:</span>
                  <span>{formatCurrency(total)}</span>
                </div>
                <Button 
                  className="w-full"
                  style={{ backgroundColor: '#ea384c', color: 'white' }}
                  disabled={cartItems.length === 0}
                  onClick={handleCheckout}
                >
                  Complete Checkout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <CheckoutDialog 
        open={isCheckoutOpen} 
        onOpenChange={handleCheckoutClose}
        bill={currentBill}
      />
    </PageContainer>
  );
};

export default Billing;
