
import { Product } from "@/types/supabase-extensions";
import { toast } from "@/components/ui/use-toast";

export const showInsufficientStockNotification = (product: Product, quantity: number): void => {
  toast({
    title: "Insufficient stock",
    description: `Cannot decrease stock of ${product.name} by ${quantity} as only ${product.stock} remain.`,
    variant: "destructive"
  });
};

export const showLowStockNotification = (product: Product): void => {
  toast({
    title: "Low Stock Alert",
    description: `${product.name} is running low on stock (${product.stock} remaining).`,
    variant: "default"
  });
};

export const showOutOfStockNotification = (product: Product): void => {
  toast({
    title: "Out of Stock Alert",
    description: `${product.name} is now out of stock.`,
    variant: "destructive"
  });
};

export const showProductUpdatedNotification = (productName: string): void => {
  toast({
    title: "Product updated",
    description: `${productName} has been updated successfully.`,
  });
};

export const showProductAddedNotification = (productName: string): void => {
  toast({
    title: "Product Added",
    description: `${productName} has been added to inventory.`,
  });
};
