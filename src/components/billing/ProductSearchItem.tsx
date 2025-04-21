
import React, { useState } from "react";
import { Product } from "@/types/supabase-extensions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SizeSelector } from "./SizeSelector";

interface ProductSearchItemProps {
  product: Product;
  onAddToCart: (product: Product, size?: string) => void;
}

export const ProductSearchItem = ({ product, onAddToCart }: ProductSearchItemProps) => {
  const hasSizes = product.sizes_stock && Object.keys(product.sizes_stock).length > 0;
  
  const handleAddToCart = () => {
    if (!hasSizes) {
      onAddToCart(product);
    }
  };

  const handleSizeSelect = (selectedSize: string) => {
    onAddToCart(product, selectedSize);
  };

  return (
    <div className="flex items-center justify-between border rounded p-2">
      <div>
        <div className="font-semibold">{product.name}</div>
        <div className="text-xs text-gray-500">
          {product.brand} • {product.category}
        </div>
      </div>
      <div>
        {hasSizes ? (
          <SizeSelector product={product} onSizeSelect={handleSizeSelect} />
        ) : (
          <Button 
            size="sm"
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
          >
            {product.stock > 0 ? "Add" : "Out of Stock"}
          </Button>
        )}
      </div>
    </div>
  );
};
