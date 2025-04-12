import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ScanBarcode, QrCode } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Product } from "@/data/models";
import { getProducts } from "@/services/productService";

interface ItemScannerProps {
  onItemScanned: (product: Product) => void;
}

export const ItemScanner = ({ onItemScanned }: ItemScannerProps) => {
  const [itemNumberInput, setItemNumberInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const itemNumberInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (itemNumberInputRef.current) {
      itemNumberInputRef.current.focus();
    }
  }, [isScanning]);

  const handleItemNumberSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!itemNumberInput.trim()) return;
    
    setIsScanning(true);
    try {
      const allProducts = await getProducts();
      const foundProduct = allProducts.find(
        product => product.itemNumber.toLowerCase() === itemNumberInput.trim().toLowerCase()
      );
      
      if (foundProduct) {
        onItemScanned(foundProduct);
        toast({
          title: "Item scanned",
          description: `${foundProduct.name} has been added to the cart`,
        });
      } else {
        toast({
          title: "Product not found",
          description: `No product found with item number: ${itemNumberInput}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Scanning error",
        description: "Failed to scan product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setItemNumberInput("");
      setIsScanning(false);
      setTimeout(() => {
        if (itemNumberInputRef.current) {
          itemNumberInputRef.current.focus();
        }
      }, 100);
    }
  };

  return (
    <Card className="mb-6 border-2 border-primary/20">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-transparent">
        <CardTitle className="flex items-center">
          <ScanBarcode className="h-5 w-5 mr-2 text-primary" />
          Quick Item Entry
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={handleItemNumberSubmit} className="space-y-4">
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-gray-700">
              Scan Barcode or Enter Item Number
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <QrCode className="h-4 w-4" />
                </span>
                <Input
                  ref={itemNumberInputRef}
                  placeholder="Scan or type item number..."
                  value={itemNumberInput}
                  onChange={(e) => setItemNumberInput(e.target.value)}
                  className="pl-10"
                  autoComplete="off"
                  autoFocus
                />
              </div>
              <Button 
                type="submit" 
                style={{ backgroundColor: '#ea384c', color: 'white' }}
                disabled={isScanning || !itemNumberInput.trim()}
              >
                {isScanning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ScanBarcode className="h-4 w-4 mr-2" />
                )}
                Add Item
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
