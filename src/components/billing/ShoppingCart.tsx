
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart as ShoppingCartIcon, SendHorizonal, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CartItem } from "@/data/models";
import { CartItemRow } from "@/components/billing/CartItemRow";
import { createBill } from "@/services/billService";

interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  paymentMethod: "cash" | "card" | "digital-wallet";
}

interface ShoppingCartProps {
  cartItems: CartItem[];
  onUpdateCartItem: (item: CartItem, newQuantity: number) => void;
  onRemoveCartItem: (item: CartItem) => void;
  onCheckoutComplete: (billId: string, customerInfo: CustomerInfo) => void;
  onCartClear: () => void;
  subtotal: number;
  tax: number;
  total: number;
}

export const ShoppingCart = ({ 
  cartItems, 
  onUpdateCartItem, 
  onRemoveCartItem, 
  onCheckoutComplete,
  onCartClear,
  subtotal,
  tax,
  total
}: ShoppingCartProps) => {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "digital-wallet">("cash");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const formattedSubtotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(subtotal).replace('₹', '₹ ');

  const formattedTax = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(tax).replace('₹', '₹ ');

  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(total).replace('₹', '₹ ');

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty cart",
        description: "Please add items to the cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    if (!customerPhone) {
      toast({
        title: "Phone number required",
        description: "Please enter customer's phone number to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Fix here: Pass individual parameters instead of an object
      const bill = await createBill(
        cartItems,
        customerName,
        customerPhone,
        customerEmail,
        paymentMethod
      );
      
      onCheckoutComplete(bill.id, {
        name: customerName,
        phone: customerPhone,
        email: customerEmail,
        paymentMethod
      });
      
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setPaymentMethod("cash");
      
      onCartClear();
      
    } catch (error) {
      toast({
        title: "Checkout failed",
        description: "There was an error processing your bill. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="dmart-card h-full flex flex-col">
      <CardHeader className="pb-3 bg-gradient-to-r from-primary/10 to-transparent">
        <div className="flex items-center justify-between">
          <CardTitle>Shopping Cart</CardTitle>
          <ShoppingCartIcon className="h-5 w-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent className="flex-grow overflow-auto">
        {cartItems.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingCartIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500">Your cart is empty</p>
            <p className="text-sm text-gray-400 mt-1">
              Scan products or search to add items
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {cartItems.map((item) => (
              <CartItemRow
                key={item.product.id}
                item={item}
                onUpdateQuantity={onUpdateCartItem}
                onRemoveItem={onRemoveCartItem}
              />
            ))}
          </div>
        )}

        <div className="mt-6 pt-4 border-t">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span>{formattedSubtotal}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tax (8%)</span>
            <span>{formattedTax}</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formattedTotal}</span>
          </div>
        </div>
      </CardContent>
      <Separator />
      <CardHeader className="pb-3 pt-4">
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Customer Name
          </label>
          <Input
            placeholder="Enter customer name"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="Enter phone number (for WhatsApp receipt)"
            value={customerPhone}
            onChange={(e) => setCustomerPhone(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Email (optional)
          </label>
          <Input
            placeholder="Enter email address"
            type="email"
            value={customerEmail}
            onChange={(e) => setCustomerEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Payment Method
          </label>
          <Select
            value={paymentMethod}
            onValueChange={(value) => 
              setPaymentMethod(value as "cash" | "card" | "digital-wallet")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent position="popper" className="bg-white">
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="card">Credit/Debit Card</SelectItem>
              <SelectItem value="digital-wallet">Digital Wallet</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter className="mt-auto">
        <Button 
          className="w-full dmart-button" 
          onClick={handleCheckout}
          disabled={isLoading || cartItems.length === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <SendHorizonal className="h-4 w-4 mr-2" />
              Complete Checkout
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};
