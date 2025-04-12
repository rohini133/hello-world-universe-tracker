
import { useState, useEffect } from "react";
import { Product } from "@/data/models";
import { getProducts, updateProduct } from "@/services/productService";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, Edit, Loader2, Percent, RefreshCw, Search, Tag } from "lucide-react";

export function DiscountManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editedDiscount, setEditedDiscount] = useState<number>(0);
  const [bulkDiscountPercent, setBulkDiscountPercent] = useState<number>(0);
  const [bulkCategorySelection, setBulkCategorySelection] = useState<string>("all");
  const [isApplyingBulk, setIsApplyingBulk] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, categoryFilter]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.map(p => p.category)));
      setCategories(uniqueCategories);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load products. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterProducts = () => {
    let filtered = [...products];

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category === categoryFilter
      );
    }

    // Apply search filter
    if (searchTerm.trim() !== "") {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(search) ||
          product.brand.toLowerCase().includes(search) ||
          product.itemNumber.toLowerCase().includes(search)
      );
    }

    setFilteredProducts(filtered);
  };

  const handleEditDiscount = (productId: string, currentDiscount: number) => {
    setEditingProductId(productId);
    setEditedDiscount(currentDiscount);
  };

  const handleSaveDiscount = async (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    try {
      const updatedProduct = {
        ...product,
        discountPercentage: editedDiscount,
      };

      await updateProduct(updatedProduct);
      
      // Update local state
      setProducts(products.map(p => p.id === productId ? updatedProduct : p));
      setEditingProductId(null);
      
      toast({
        title: "Discount updated",
        description: `Discount for ${product.name} has been updated to ${editedDiscount}%.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update discount. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleApplyBulkDiscount = async () => {
    if (bulkDiscountPercent < 0 || bulkDiscountPercent > 100) {
      toast({
        title: "Invalid discount",
        description: "Discount percentage must be between 0 and 100.",
        variant: "destructive",
      });
      return;
    }

    setIsApplyingBulk(true);
    
    try {
      let updatedProducts = [...products];
      let affectedCount = 0;
      
      // Update products based on category filter
      for (let i = 0; i < updatedProducts.length; i++) {
        if (bulkCategorySelection === "all" || updatedProducts[i].category === bulkCategorySelection) {
          updatedProducts[i] = {
            ...updatedProducts[i],
            discountPercentage: bulkDiscountPercent,
          };
          
          // In a real app, you would make API calls to update each product
          await updateProduct(updatedProducts[i]);
          affectedCount++;
        }
      }
      
      setProducts(updatedProducts);
      
      toast({
        title: "Bulk discount applied",
        description: `${bulkDiscountPercent}% discount applied to ${affectedCount} products.`,
      });
      
      // Reset the form
      setBulkDiscountPercent(0);
    } catch (error) {
      toast({
        title: "Bulk update failed",
        description: "Failed to apply bulk discounts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsApplyingBulk(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Tag className="mr-2 h-5 w-5" />
            Bulk Discount Manager
          </CardTitle>
          <CardDescription>
            Apply discounts to multiple products at once
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="bulk-category">Product Category</Label>
              <Select 
                value={bulkCategorySelection} 
                onValueChange={setBulkCategorySelection}
              >
                <SelectTrigger id="bulk-category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="bulk-discount">Discount Percentage</Label>
              <div className="relative">
                <Input
                  id="bulk-discount"
                  type="number"
                  min="0"
                  max="100"
                  value={bulkDiscountPercent}
                  onChange={(e) => setBulkDiscountPercent(Number(e.target.value))}
                />
                <Percent className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button 
                onClick={handleApplyBulkDiscount} 
                className="w-full"
                disabled={isApplyingBulk}
              >
                {isApplyingBulk ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                Apply Discount
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Percent className="mr-2 h-5 w-5" />
            Individual Product Discounts
          </CardTitle>
          <CardDescription>
            Manage discounts for individual products
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button variant="outline" onClick={fetchProducts}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Current Discount</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => {
                    const discountedPrice = product.price * (1 - product.discountPercentage / 100);
                    const isEditing = editingProductId === product.id;
                    
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="h-8 w-8 rounded object-cover"
                            />
                            <div>
                              <div>{product.name}</div>
                              <div className="text-xs text-muted-foreground">{product.brand}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{product.category}</TableCell>
                        <TableCell>
                          <div>{formatCurrency(product.price)}</div>
                          {product.discountPercentage > 0 && (
                            <div className="text-xs text-green-600">
                              {formatCurrency(discountedPrice)} after discount
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="relative w-20">
                              <Input
                                type="number"
                                min="0"
                                max="100"
                                value={editedDiscount}
                                onChange={(e) => setEditedDiscount(Number(e.target.value))}
                                className="pl-2 pr-8"
                              />
                              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                %
                              </span>
                            </div>
                          ) : (
                            <span>
                              {product.discountPercentage}%
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <Button 
                              size="sm" 
                              onClick={() => handleSaveDiscount(product.id)}
                              className="h-8"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Save
                            </Button>
                          ) : (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => handleEditDiscount(product.id, product.discountPercentage)}
                              className="h-8"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
