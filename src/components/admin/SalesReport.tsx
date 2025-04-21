import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  FileSpreadsheet, 
  FileText, 
  Loader2, 
  CalendarRange,
  Filter
} from "lucide-react";
import { Bill, BillWithItems, BillItemWithProduct } from "@/data/models";
import { sampleDashboardStats } from "@/data/sampleData";
import { useToast } from "@/components/ui/use-toast";
import { generateSalesReportPDF, generateSalesReportExcel } from "@/utils/pdfGenerator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { getBills } from "@/services/billService";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// Type definitions for product sales analysis
interface ProductSalesSummary {
  id: string;
  name: string;
  category: string;
  brand: string;
  totalQuantity: number;
  buyingPrice: number;
  sellingPrice: number;
  totalRevenue: number;
  totalProfit: number;
}

interface SalesReportData {
  dailySales: any[];
  weeklySales: any[];
  monthlySales: any[];
  yearlySales: any[];
  categoryDistribution: any[];
  topProducts: any[];
  recentTransactions: any[];
  productSalesDetails: ProductSalesSummary[];
  mostSellingProduct: ProductSalesSummary | null;
  mostProfitableProduct: ProductSalesSummary | null;
}

interface DateRange {
  from: Date;
  to: Date;
}

const generateSampleSalesData = () => {
  const dailySales = Array.from({ length: 30 }, (_, i) => ({
    day: `Day ${i + 1}`,
    sales: Math.floor(Math.random() * 1000) + 200,
  }));

  const weeklySales = Array.from({ length: 12 }, (_, i) => ({
    week: `Week ${i + 1}`,
    sales: Math.floor(Math.random() * 5000) + 1000,
  }));

  const monthlySales = [
    { name: "Jan", sales: 4000 },
    { name: "Feb", sales: 3000 },
    { name: "Mar", sales: 5000 },
    { name: "Apr", sales: 2780 },
    { name: "May", sales: 1890 },
    { name: "Jun", sales: 2390 },
    { name: "Jul", sales: 3490 },
    { name: "Aug", sales: 4000 },
    { name: "Sep", sales: 3200 },
    { name: "Oct", sales: 2800 },
    { name: "Nov", sales: 4300 },
    { name: "Dec", sales: 5100 },
  ];

  const yearlySales = [
    { year: "2021", sales: 45000 },
    { year: "2022", sales: 52000 },
    { year: "2023", sales: 49000 },
    { year: "2024", sales: 58000 },
    { year: "2025", sales: 31000 },
  ];

  const categoryDistribution = [
    { name: "Electronics", value: 35 },
    { name: "Clothing", value: 25 },
    { name: "Groceries", value: 20 },
    { name: "Home", value: 15 },
    { name: "Others", value: 5 },
  ];

  const topProducts = sampleDashboardStats.topSellingProducts;

  const recentTransactions = sampleDashboardStats.recentSales || [];

  const productSalesDetails: ProductSalesSummary[] = [
    {
      id: "1",
      name: "Smartphone X",
      category: "Electronics",
      brand: "TechBrand",
      totalQuantity: 42,
      buyingPrice: 15000,
      sellingPrice: 20000,
      totalRevenue: 840000,
      totalProfit: (20000 - 15000) * 42
    },
    {
      id: "2",
      name: "Laptop Pro",
      category: "Electronics",
      brand: "ComputerCo",
      totalQuantity: 15,
      buyingPrice: 45000,
      sellingPrice: 65000,
      totalRevenue: 975000,
      totalProfit: (65000 - 45000) * 15
    },
    {
      id: "3",
      name: "Cotton T-Shirt",
      category: "Clothing",
      brand: "FashionWear",
      totalQuantity: 78,
      buyingPrice: 200,
      sellingPrice: 599,
      totalRevenue: 46722,
      totalProfit: (599 - 200) * 78
    },
    {
      id: "4",
      name: "Premium Coffee",
      category: "Groceries",
      brand: "BeanMaster",
      totalQuantity: 120,
      buyingPrice: 250,
      sellingPrice: 450,
      totalRevenue: 54000,
      totalProfit: (450 - 250) * 120
    }
  ];

  const mostSellingProduct = productSalesDetails.length > 0 
    ? [...productSalesDetails].sort((a, b) => b.totalQuantity - a.totalQuantity)[0]
    : null;

  const mostProfitableProduct = productSalesDetails.length > 0
    ? [...productSalesDetails].sort((a, b) => b.totalProfit - a.totalProfit)[0]
    : null;

  return {
    dailySales,
    weeklySales,
    monthlySales,
    yearlySales,
    categoryDistribution,
    topProducts,
    recentTransactions,
    productSalesDetails,
    mostSellingProduct,
    mostProfitableProduct
  };
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export function SalesReport() {
  const [activeTab, setActiveTab] = useState("daily");
  const [isLoading, setIsLoading] = useState(true);
  const [reportData, setReportData] = useState<SalesReportData | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date()
  });
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBrand, setSelectedBrand] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [bills, setBills] = useState<BillWithItems[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const fetchedBills = await getBills();
        setBills(fetchedBills);
        
        setReportData(generateSalesData(fetchedBills));
      } catch (error) {
        console.error("Error fetching sales data:", error);
        setReportData(generateSampleSalesData());
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  const generateSalesData = (bills: BillWithItems[]): SalesReportData => {
    const filteredBills = bills.filter(bill => {
      const billDate = new Date(bill.createdAt);
      return billDate >= startOfDay(dateRange.from) && 
             billDate <= endOfDay(dateRange.to);
    });

    const productSalesMap = new Map<string, ProductSalesSummary>();
    
    filteredBills.forEach(bill => {
      if (bill.items && Array.isArray(bill.items)) {
        bill.items.forEach(item => {
          if (!item.product) return;
          
          const { id, name, category, brand } = item.product;
          const buyingPrice = item.product.buyingPrice || 0;
          const sellingPrice = item.productPrice;
          const quantity = item.quantity;
          
          if (productSalesMap.has(id)) {
            const existingProduct = productSalesMap.get(id)!;
            existingProduct.totalQuantity += quantity;
            existingProduct.totalRevenue += sellingPrice * quantity;
            existingProduct.totalProfit += (sellingPrice - buyingPrice) * quantity;
          } else {
            productSalesMap.set(id, {
              id,
              name,
              category: category || 'Uncategorized',
              brand: brand || 'Unknown',
              totalQuantity: quantity,
              buyingPrice,
              sellingPrice,
              totalRevenue: sellingPrice * quantity,
              totalProfit: (sellingPrice - buyingPrice) * quantity
            });
          }
        });
      }
    });
    
    const productSalesDetails = Array.from(productSalesMap.values());
    
    const mostSellingProduct = productSalesDetails.length > 0 
      ? [...productSalesDetails].sort((a, b) => b.totalQuantity - a.totalQuantity)[0]
      : null;
      
    const mostProfitableProduct = productSalesDetails.length > 0
      ? [...productSalesDetails].sort((a, b) => b.totalProfit - a.totalProfit)[0]
      : null;

    const sampleData = generateSampleSalesData();
    
    return {
      ...sampleData,
      productSalesDetails,
      mostSellingProduct,
      mostProfitableProduct,
      recentTransactions: filteredBills
    };
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleDownload = async (format: 'pdf' | 'excel') => {
    if (!reportData) return;
    
    setIsDownloading(true);
    
    try {
      let blob;
      let fileName;
      
      if (format === 'pdf') {
        blob = generateSalesReportPDF(reportData, activeTab);
        fileName = `sales-report-${activeTab}-${new Date().toISOString().split('T')[0]}.pdf`;
      } else {
        blob = generateSalesReportExcel(reportData, activeTab);
        fileName = `sales-report-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`;
      }
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Report Downloaded",
        description: `The ${activeTab} sales report has been downloaded as ${fileName}`,
      });
    } catch (error) {
      console.error("Download error:", error);
      toast({
        title: "Download Failed",
        description: "There was an error generating the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getFilteredProductSales = () => {
    if (!reportData) return [];
    
    return reportData.productSalesDetails.filter(product => {
      const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
      const matchesBrand = selectedBrand === "all" || product.brand === selectedBrand;
      const matchesSearch = searchQuery === "" || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesBrand && matchesSearch;
    });
  };

  const getCategories = () => {
    if (!reportData) return [];
    const categories = new Set(reportData.productSalesDetails.map(p => p.category));
    return Array.from(categories);
  };

  const getBrands = () => {
    if (!reportData) return [];
    const brands = new Set(reportData.productSalesDetails.map(p => p.brand));
    return Array.from(brands);
  };

  if (isLoading || !reportData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="daily" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-between items-center mb-4">
            <TabsList className="w-auto justify-start">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
              <TabsTrigger value="products">Products</TabsTrigger>
            </TabsList>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={isDownloading}>
                  {isDownloading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Download Report
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleDownload('pdf')}>
                  <FileText className="mr-2 h-4 w-4" />
                  <span>Download as PDF</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDownload('excel')}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  <span>Download as CSV</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex flex-wrap gap-4 mb-4 items-center">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="min-w-[240px]">
                  <CalendarRange className="mr-2 h-4 w-4" />
                  {dateRange.from ? (
                    <>
                      {format(dateRange.from, "PPP")} - {format(dateRange.to || new Date(), "PPP")}
                    </>
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  selected={{ from: dateRange.from, to: dateRange.to }}
                  onSelect={(range) => {
                    if (range?.from && range?.to) {
                      setDateRange({from: range.from, to: range.to});
                      setIsCalendarOpen(false);
                    }
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            {activeTab === "products" && (
              <>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Brand" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Brands</SelectItem>
                    {getBrands().map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="relative w-full max-w-sm">
                  <Input
                    type="search"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
              </>
            )}
          </div>

          <TabsContent value="daily" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales - Current Month</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.dailySales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weekly" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Sales - Last 12 Weeks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={reportData.weeklySales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="sales" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Sales - Current Year</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.monthlySales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="yearly" className="pt-4">
            <Card>
              <CardHeader>
                <CardTitle>Yearly Sales - Last 5 Years</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={reportData.yearlySales}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Legend />
                      <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="pt-4">
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Product Sales Analysis</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-auto" style={{ maxHeight: "500px" }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Brand</TableHead>
                        <TableHead className="text-right">Qty Sold</TableHead>
                        <TableHead className="text-right">Buying Price</TableHead>
                        <TableHead className="text-right">Selling Price</TableHead>
                        <TableHead className="text-right">Revenue</TableHead>
                        <TableHead className="text-right">Profit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredProductSales().map((product) => (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category}</TableCell>
                          <TableCell>{product.brand}</TableCell>
                          <TableCell className="text-right">{product.totalQuantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.buyingPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.sellingPrice)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.totalRevenue)}</TableCell>
                          <TableCell className="text-right">{formatCurrency(product.totalProfit)}</TableCell>
                        </TableRow>
                      ))}
                      {getFilteredProductSales().length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-4">No products found matching your filters</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Selling Product</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.mostSellingProduct ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{reportData.mostSellingProduct.name}</span>
                        <Badge variant="secondary">{reportData.mostSellingProduct.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Quantity:</p>
                          <p className="font-medium">{reportData.mostSellingProduct.totalQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Total Revenue:</p>
                          <p className="font-medium">{formatCurrency(reportData.mostSellingProduct.totalRevenue)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Selling Price:</p>
                          <p className="font-medium">{formatCurrency(reportData.mostSellingProduct.sellingPrice)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit:</p>
                          <p className="font-medium">{formatCurrency(reportData.mostSellingProduct.totalProfit)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No sales data available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Most Profitable Product</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportData.mostProfitableProduct ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold">{reportData.mostProfitableProduct.name}</span>
                        <Badge variant="secondary">{reportData.mostProfitableProduct.category}</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Total Profit:</p>
                          <p className="font-medium">{formatCurrency(reportData.mostProfitableProduct.totalProfit)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Profit Margin:</p>
                          <p className="font-medium">
                            {Math.round(((reportData.mostProfitableProduct.sellingPrice - reportData.mostProfitableProduct.buyingPrice) / 
                            reportData.mostProfitableProduct.sellingPrice) * 100)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Quantity Sold:</p>
                          <p className="font-medium">{reportData.mostProfitableProduct.totalQuantity} units</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Revenue:</p>
                          <p className="font-medium">{formatCurrency(reportData.mostProfitableProduct.totalRevenue)}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No profit data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sales by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={reportData.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.categoryDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Units Sold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.topProducts.map((item: any) => (
                  <TableRow key={item.product.id}>
                    <TableCell className="font-medium">{item.product.name}</TableCell>
                    <TableCell>{item.product.category}</TableCell>
                    <TableCell className="text-right">{item.soldCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.recentTransactions.slice(0, 5).map((bill: Bill) => (
                  <TableRow key={bill.id}>
                    <TableCell className="font-medium">{bill.id}</TableCell>
                    <TableCell>{bill.customerName || "Walk-in Customer"}</TableCell>
                    <TableCell>{new Date(bill.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{bill.items?.length || 0} items</TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(bill.total)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
