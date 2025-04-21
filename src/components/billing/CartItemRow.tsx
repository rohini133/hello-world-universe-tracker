
import React from "react";
import { CartItem } from "@/data/models";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
  return (
    <div className="flex items-center gap-2 border rounded px-2 py-1 mb-1">
      <div className="flex-1">
        <div className="font-semibold">
          {item.product.name}
          {item.selectedSize && (
            <Badge variant="outline" className="ml-2 text-xs px-2 py-1 bg-gray-100 font-normal text-gray-700">
              {item.selectedSize}
            </Badge>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {item.product.brand} &bull; {item.product.category}
        </div>
      </div>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item, item.quantity - 1)}
        >-</Button>
        <span className="px-2">{item.quantity}</span>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onUpdateQuantity(item, item.quantity + 1)}
        >+</Button>
      </div>
      <div>
        <Button
          size="sm"
          variant="ghost"
          className="text-red-400"
          onClick={() => onRemoveItem(item)}
        >
          Remove
        </Button>
      </div>
    </div>
  );
};
