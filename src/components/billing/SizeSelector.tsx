
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Product } from "@/types/supabase-extensions";
import { Badge } from "@/components/ui/badge";

interface SizeSelectorProps {
  product: Product;
  onSizeSelect: (size: string) => void;
}

export function SizeSelector({ product, onSizeSelect }: SizeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const hasSizes = product.sizes_stock && Object.keys(product.sizes_stock).length > 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          style={{ borderColor: '#ea384c', color: '#ea384c' }}
          disabled={!hasSizes}
        >
          {hasSizes ? "Select Size" : "No Sizes Available"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogHeader>
          <DialogTitle>Select Size</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-2 p-4">
          {hasSizes && Object.entries(product.sizes_stock || {}).map(([size, stock]) => (
            <Button
              key={size}
              variant="outline"
              className={`w-full ${stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={stock === 0}
              onClick={() => {
                onSizeSelect(size);
                setIsOpen(false);
              }}
            >
              {size} <Badge variant="outline" className="ml-1">{stock}</Badge>
            </Button>
          ))}
        </div>
        {!hasSizes && (
          <p className="text-center text-gray-500">No sizes available</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
