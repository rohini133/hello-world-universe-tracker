import { useState, useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { ProductCard } from "@/components/inventory/ProductCard";
import { Product } from "@/data/models";
import { updateProduct } from "@/services/productService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Package, PlusCircle, Search, Bug } from "lucide-react";
import { ProductForm } from "@/components/admin/ProductForm";
import { useProductsSync } from "@/hooks/useProductsSync";
import { DebugPanel } from "@/components/admin/DebugPanel";

const Inventory = () => {
  const { products: syncedProducts, isLoading: isSyncLoading, error: syncError, isAuthenticated } = useProductsSync();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isDebugMode, setIsDebugMode] = useState(false);

  useEffect(() => {
    filterProducts();
  }, [syncedProducts, searchTerm, categoryFilter]);

  const filterProducts = () => {
    let filtered = [...syncedProducts];

    if (categoryFilter !== "all") {
      filtered = filtered.filter(
        (product) => product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

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

  useEffect(() => {
    if (syncError) {
      toast({
        title: "Synchronization Error",
        description: syncError,
        variant: "destructive",
      });
    }
  }, [syncError]);

  const handleUpdateProduct = async () => {
    if (!editingProduct) return;

    try {
      await updateProduct(editingProduct);
      setIsEditDialogOpen(false);
      
      toast({
        title: "Product updated",
        description: `${editingProduct.name} has been updated successfully.`,
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProduct = async () => {
    if (!deletingProduct) return;

    try {
      setFilteredProducts(filtered => filtered.filter(p => p.id !== deletingProduct.id));
      setIsDeleteDialogOpen(false);
      
      toast({
        title: "Product deleted",
        description: `${deletingProduct.name} has been deleted successfully.`,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getUniqueCategories = () => {
    const categories = syncedProducts.map((product) => product.category);
    return ["all", ...new Set(categories)];
  };

  const handleAddProductSuccess = () => {
    setIsAddProductDialogOpen(false);
    
    toast({
      title: "Product Added",
      description: "The product has been successfully added to inventory.",
    });
  };

  return (
    <PageContainer title="Vivaas Inventory" subtitle="Manage your product inventory">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
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
          <div className="flex gap-2">
            <Button onClick={() => setIsAddProductDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New Product
            </Button>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setIsDebugMode(prev => !prev)}
              className={isDebugMode ? "border-red-400 text-red-500" : ""}
            >
              <Bug className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {isDebugMode && (
          <div className="mb-6">
            <DebugPanel />
          </div>
        )}

        {isAuthenticated === false && (
          <div className="p-4 mb-6 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-amber-800">
              <strong>Authentication Notice:</strong> You are not currently authenticated with the database.
              Products will be loaded from local data and changes may not persist.
              Please log out and log back in to reauthenticate.
            </p>
          </div>
        )}

        <Tabs defaultValue="all" value={categoryFilter} onValueChange={setCategoryFilter}>
          <TabsList className="mb-4 flex flex-wrap overflow-x-auto">
            {getUniqueCategories().map((category) => (
              <TabsTrigger
                key={category}
                value={category}
                className="capitalize"
              >
                {category}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={categoryFilter} className="mt-0">
            {isSyncLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No products found
                </h3>
                <p className="text-gray-500">
                  {searchTerm
                    ? "Try adjusting your search or filters"
                    : "Add some products to your inventory"}
                </p>
              </div>
            ) : (
              <div className="inventory-grid">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onEdit={(product) => {
                      setEditingProduct(product);
                      setIsEditDialogOpen(true);
                    }}
                    onDelete={(product) => {
                      setDeletingProduct(product);
                      setIsDeleteDialogOpen(true);
                    }}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product details below.
            </DialogDescription>
          </DialogHeader>
          {editingProduct && (
            <ProductForm
              product={editingProduct}
              onSuccess={() => {
                setIsEditDialogOpen(false);
              }}
              onCancel={() => setIsEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
            <DialogDescription>
              Enter the details for your new product below.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSuccess={handleAddProductSuccess}
            onCancel={() => setIsAddProductDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Product Confirmation */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingProduct?.name}. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProduct}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageContainer>
  );
};

export default Inventory;
