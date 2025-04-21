
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/types/supabase-extensions";
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export function useBillingCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [discountType, setDiscountType] = useState<"percent" | "amount">("percent");
  const [discountValue, setDiscountValue] = useState(0);
  const { toast } = useToast();

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product.price * (1 - item.product.discountPercentage / 100);
      return total + price * item.quantity;
    }, 0);
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0;  // No tax for now, can be adjusted later
  };

  const calculateDiscountAmount = () => {
    const subtotal = calculateSubtotal();
    if (discountType === "percent") {
      return subtotal * (discountValue / 100);
    } else {
      return discountValue;
    }
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax();
    const discount = calculateDiscountAmount();
    return subtotal + tax - discount;
  };

  const applyDiscount = (type: "percent" | "amount", value: number) => {
    setDiscountType(type);
    setDiscountValue(value);
  };

  const removeDiscount = () => {
    setDiscountType("percent");
    setDiscountValue(0);
  };

  const addToCart = (product: Product, selectedSize?: string) => {
    if (product.sizes_stock && selectedSize) {
      const sizeQty = product.sizes_stock[selectedSize] || 0;
      if (sizeQty <= 0) {
        toast({ title: "Out of stock", description: `${product.name} (${selectedSize}) is out of stock.`, variant: "destructive" });
        return;
      }
      const existingIdx = cartItems.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      if (existingIdx >= 0) {
        const currentQuantity = cartItems[existingIdx].quantity;
        if (currentQuantity < sizeQty) {
          const updated = [...cartItems];
          updated[existingIdx].quantity += 1;
          setCartItems(updated);
        } else {
          toast({ title: "Max stock reached", description: `Cannot add more of ${product.name} (${selectedSize})`, variant: "destructive" });
        }
      } else {
        setCartItems([...cartItems, { product, quantity: 1, selectedSize }]);
        toast({ title: "Added to cart", description: `${product.name} (${selectedSize}) added.` });
      }
    } else {
      const existingItemIndex = cartItems.findIndex(
        (item) => item.product.id === product.id && !item.selectedSize
      );
      if (existingItemIndex >= 0) {
        const currentQuantity = cartItems[existingItemIndex].quantity;
        if (currentQuantity < product.stock) {
          const updated = [...cartItems];
          updated[existingItemIndex].quantity += 1;
          setCartItems(updated);
        } else {
          toast({ title: "Max stock reached", description: `Cannot add more of ${product.name}.`, variant: "destructive" });
        }
      } else {
        setCartItems([...cartItems, { product, quantity: 1 }]);
        toast({ title: "Added to cart", description: `${product.name} added to cart.` });
      }
    }
  };

  const updateQuantity = (item: CartItem, newQuantity: number) => {
    const product = item.product;
    if (product.sizes_stock && item.selectedSize) {
      const maxQty = product.sizes_stock[item.selectedSize] || 0;
      if (newQuantity > maxQty) {
        toast({ title: "Max stock reached", description: `Cannot set more than stock for ${product.name} (${item.selectedSize})`, variant: "destructive" });
        return;
      }
    } else if (!item.selectedSize) {
      if (newQuantity > product.stock) {
        toast({ title: "Max stock reached", description: `Cannot set more than stock for ${product.name}.`, variant: "destructive" });
        return;
      }
    }
    if (newQuantity <= 0) {
      removeItem(item);
      return;
    }
    setCartItems((prev) =>
      prev.map((cartItem) =>
        cartItem.product.id === item.product.id &&
        (cartItem.selectedSize === item.selectedSize)
          ? { ...cartItem, quantity: newQuantity }
          : cartItem
      )
    );
  };

  const removeItem = (item: CartItem) => {
    setCartItems((prev) =>
      prev.filter(
        (cartItem) =>
          !(
            cartItem.product.id === item.product.id &&
            cartItem.selectedSize === item.selectedSize
          )
      )
    );
    toast({
      title: "Item removed",
      description: `${item.product.name}${item.selectedSize ? " (" + item.selectedSize + ")" : ""} removed from cart.`,
    });
  };

  const clearCart = () => setCartItems([]);

  const updateStock = async (item: CartItem) => {
    if (item.product.sizes_stock && item.selectedSize) {
      const sizesStock = { ...item.product.sizes_stock };
      sizesStock[item.selectedSize] = Math.max((sizesStock[item.selectedSize] || 0) - item.quantity, 0);
      const newTotalStock = Object.values(sizesStock).reduce((a, b) => a + b, 0);
      const { error } = await supabase
        .from('products')
        .update({
          sizes_stock: sizesStock,
          stock: newTotalStock,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.product.id);
      if (error) {
        console.error("Error updating size stock:", error);
        return false;
      }
      return true;
    } else {
      const { error } = await supabase
        .from('products')
        .update({
          stock: item.product.stock - item.quantity,
          updated_at: new Date().toISOString(),
        })
        .eq('id', item.product.id);
      if (error) {
        console.error("Error updating stock:", error);
        return false;
      }
      return true;
    }
  };

  return {
    cartItems,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    calculateSubtotal,
    calculateTotal,
    calculateTax,
    updateStock,
    // Adding missing properties
    subtotal: calculateSubtotal(),
    tax: calculateTax(),
    total: calculateTotal(),
    discountAmount: calculateDiscountAmount(),
    discountType,
    discountValue,
    applyDiscount,
    removeDiscount,
  };
}
