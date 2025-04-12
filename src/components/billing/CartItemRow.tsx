
import { CartItem } from "@/data/models";
import { Button } from "@/components/ui/button";
import { MinusIcon, PlusIcon, Trash2 } from "lucide-react";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (item: CartItem, newQuantity: number) => void;
  onRemoveItem: (item: CartItem) => void;
}

export const CartItemRow = ({
  item,
  onUpdateQuantity,
  onRemoveItem,
}: CartItemRowProps) => {
  const { product, quantity } = item;
  
  const discountedPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : product.price;
    
  const itemTotal = discountedPrice * quantity;
  
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(discountedPrice).replace('₹', '₹ '); // Add a space after the symbol
  
  const formattedTotal = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(itemTotal).replace('₹', '₹ '); // Add a space after the symbol

  return (
    <div className="flex items-center justify-between py-3 border-b">
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
          <img 
            src={product.image} 
            alt={product.name} 
            className="h-full w-full object-cover"
          />
        </div>
        <div className="ml-4">
          <h3 className="font-medium text-gray-900">{product.name}</h3>
          <div className="text-sm text-gray-500">
            {product.brand} • Item #{product.itemNumber}
          </div>
          <div className="text-sm mt-1">
            {formattedPrice} {product.discountPercentage > 0 && (
              <span className="text-red-600">(-{product.discountPercentage}%)</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center">
        <div className="flex items-center border rounded-md mr-4">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item, quantity - 1)}
            disabled={quantity <= 1}
          >
            <MinusIcon className="h-4 w-4" />
          </Button>
          <span className="px-2 text-center w-8">{quantity}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onUpdateQuantity(item, quantity + 1)}
            disabled={quantity >= product.stock}
          >
            <PlusIcon className="h-4 w-4" />
          </Button>
        </div>
        <div className="w-24 text-right">{formattedTotal}</div>
        <Button
          variant="ghost"
          size="icon"
          className="ml-4 text-gray-500 hover:text-red-500"
          onClick={() => onRemoveItem(item)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
