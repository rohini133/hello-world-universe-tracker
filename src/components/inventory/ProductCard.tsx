
import { Product } from "@/data/models";
import { getProductStockStatus } from "@/services/productService";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductCard = ({ product, onEdit, onDelete }: ProductCardProps) => {
  const stockStatus = getProductStockStatus(product);
  
  const formattedPrice = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    currencyDisplay: 'symbol'
  }).format(product.price).replace('₹', '₹ '); // Add a space after the symbol
  
  const discountedPrice = product.discountPercentage > 0 
    ? product.price * (1 - product.discountPercentage / 100) 
    : null;
    
  const formattedDiscountedPrice = discountedPrice 
    ? new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        currencyDisplay: 'symbol'
      }).format(discountedPrice).replace('₹', '₹ ') // Add a space after the symbol
    : null;

  return (
    <Card className="product-card overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        <div
          className={`status-badge ${
            stockStatus === "in-stock"
              ? "status-in-stock"
              : stockStatus === "low-stock"
              ? "status-low-stock"
              : "status-out-of-stock"
          }`}
        >
          {stockStatus === "in-stock"
            ? "In Stock"
            : stockStatus === "low-stock"
            ? "Low Stock"
            : "Sold Out"}
        </div>
      </div>
      <CardContent className="p-4">
        <h3 className="font-medium text-lg mb-1">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          {product.brand} • {product.category}
        </p>
        <div className="flex items-center mb-2">
          {discountedPrice ? (
            <>
              <span className="font-bold text-gray-900">{formattedDiscountedPrice}</span>
              <span className="ml-2 text-sm line-through text-gray-500">{formattedPrice}</span>
              <Badge variant="destructive" className="ml-2">
                -{product.discountPercentage}%
              </Badge>
            </>
          ) : (
            <span className="font-bold text-gray-900">{formattedPrice}</span>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-gray-500">Item #</div>
          <div className="text-right">{product.itemNumber}</div>
          
          <div className="text-gray-500">Stock</div>
          <div className="text-right">{product.stock} units</div>
          
          {product.size && (
            <>
              <div className="text-gray-500">Size</div>
              <div className="text-right">{product.size}</div>
            </>
          )}
          
          {product.color && (
            <>
              <div className="text-gray-500">Color</div>
              <div className="text-right">{product.color}</div>
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4">
        <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => onDelete(product)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};
