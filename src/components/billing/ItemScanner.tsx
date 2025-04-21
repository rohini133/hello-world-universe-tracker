
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getProduct } from "@/services/productService";
import { Product } from "@/types/supabase-extensions";

interface ItemScannerProps {
  onItemScanned: (product: Product) => void;
}

export function ItemScanner({ onItemScanned }: ItemScannerProps) {
  const [itemNumber, setItemNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleScan = async () => {
    if (!itemNumber.trim()) {
      toast({
        title: "Item number required",
        description: "Please enter an item number to scan",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const product = await getProduct(itemNumber);
      
      if (product) {
        onItemScanned(product);
        setItemNumber("");
        toast({
          title: "Product added to cart",
          description: `${product.name}${product.size ? ` (${product.size})` : ''} has been added to the cart`,
        });
      } else {
        toast({
          title: "Product not found",
          description: `No product found with item number ${itemNumber}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error scanning product:", error);
      toast({
        title: "Error scanning product",
        description: "There was an error scanning the product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Item</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-2">
          <Input
            placeholder="Enter item number..."
            value={itemNumber}
            onChange={(e) => setItemNumber(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleScan()}
            disabled={isLoading}
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleScan}
          disabled={isLoading}
          style={{ backgroundColor: '#ea384c', color: 'white' }}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Scanning...
            </>
          ) : (
            "Scan Item"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
