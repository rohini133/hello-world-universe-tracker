
import { Product } from "@/data/models";
import { getProductStockStatus } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProductSearchItemProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export const ProductSearchItem = ({ product, onAddToCart }: ProductSearchItemProps) => {
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
    <div className="flex items-center justify-between p-4 border rounded-md mb-2">
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
          <div className="flex items-center mt-1">
            {discountedPrice ? (
              <>
                <span className="font-medium text-gray-900">{formattedDiscountedPrice}</span>
                <span className="ml-2 text-sm line-through text-gray-500">{formattedPrice}</span>
                <Badge variant="destructive" className="ml-2">-{product.discountPercentage}%</Badge>
              </>
            ) : (
              <span className="font-medium text-gray-900">{formattedPrice}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end">
        <div className="mb-2">
          {stockStatus === "in-stock" && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              In Stock ({product.stock})
            </Badge>
          )}
          {stockStatus === "low-stock" && (
            <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
              Low Stock ({product.stock})
            </Badge>
          )}
          {stockStatus === "out-of-stock" && (
            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
              Out of Stock
            </Badge>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={stockStatus === "out-of-stock"}
          onClick={() => onAddToCart(product)}
          style={{ borderColor: '#ea384c', color: '#ea384c' }}
        >
          Add to Cart
        </Button>
      </div>
    </div>
  );
};
