import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/data/models";
import { getProducts } from "@/services/productService";
import { ProductSearchItem } from "@/components/billing/ProductSearchItem";

interface ProductSearchProps {
  onAddToCart: (product: Product) => void;
}

export const ProductSearch = ({ onAddToCart }: ProductSearchProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    setIsSearching(true);
    try {
      const allProducts = await getProducts();
      
      if (searchTerm.trim() === "") {
        setProducts(allProducts);
      } else {
        const filtered = allProducts.filter(
          (product) =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.itemNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setProducts(filtered);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Product Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by name, brand, or item number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              style={{ backgroundColor: '#ea384c', color: 'white' }}
            >
              {isSearching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Search Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {products.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {isSearching
                  ? "Searching for products..."
                  : "No products found. Try searching for products above."}
              </p>
            ) : (
              products.map((product) => (
                <ProductSearchItem
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
};
