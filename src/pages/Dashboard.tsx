
import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardStats } from "@/data/models";
import { sampleDashboardStats } from "@/data/sampleData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AlertCircle, DollarSign, Package, ShoppingBag, TrendingUp, Settings2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { userRole, checkAuthAccess } = useAuth();
  const navigate = useNavigate();
  
  const canViewSalesStats = checkAuthAccess("sales_statistics");

  useEffect(() => {
    // Simulate API fetch
    const fetchStats = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setStats(sampleDashboardStats);
      setLoading(false);
    };

    fetchStats();
  }, []);

  // Format currency in Indian Rupees
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value).replace('₹', '₹ '); // Add a space after the symbol
  };

  if (loading || !stats) {
    return (
      <PageContainer title="Dashboard">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-32 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
          
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-5 bg-gray-200 rounded w-40"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-center">
                    <div className="h-10 w-10 bg-gray-200 rounded-md mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  // Prepare data for sales chart
  const salesData = [
    { name: "Mon", sales: 430 },
    { name: "Tue", sales: 528 },
    { name: "Wed", sales: 376 },
    { name: "Thu", sales: 390 },
    { name: "Fri", sales: 624 },
    { name: "Sat", sales: 578 },
    { name: "Sun", sales: 332 },
  ];

  return (
    <PageContainer 
      title="Dashboard" 
      subtitle={userRole === "admin" 
        ? "Overview of store performance and inventory status" 
        : "Quick access to billing functions"}
    >
      {/* Quick Action Buttons */}
      <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 fade-in">
        {userRole === "admin" ? (
          <>
            <Button 
              onClick={() => navigate("/admin")} 
              className="bg-purple-600 hover:bg-purple-700 h-auto py-3"
            >
              <Settings2 className="mr-2 h-5 w-5" />
              Admin Panel
            </Button>
            <Button 
              onClick={() => navigate("/inventory")} 
              className="bg-blue-600 hover:bg-blue-700 h-auto py-3"
            >
              <Package className="mr-2 h-5 w-5" />
              Manage Inventory
            </Button>
            <Button 
              onClick={() => navigate("/products")} 
              className="bg-indigo-600 hover:bg-indigo-700 h-auto py-3"
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              Product Catalog
            </Button>
            <Button 
              onClick={() => navigate("/billing")} 
              className="bg-emerald-600 hover:bg-emerald-700 h-auto py-3"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              Sales Dashboard
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={() => navigate("/billing")} 
              className="bg-emerald-600 hover:bg-emerald-700 h-auto py-3"
            >
              <DollarSign className="mr-2 h-5 w-5" />
              New Sale
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 hover:bg-gray-50 h-auto py-3"
            >
              <Package className="mr-2 h-5 w-5 text-gray-700" />
              View Stock
            </Button>
          </>
        )}
      </div>

      {canViewSalesStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 fade-in">
          <StatsCard
            title="Total Sales"
            value={formatCurrency(stats.totalSales)}
            icon={<DollarSign />}
            trend={{ value: 12.5, label: "from last month", direction: "up" }}
          />
          <StatsCard
            title="Today's Sales"
            value={formatCurrency(stats.todaySales)}
            icon={<ShoppingBag />}
          />
          <StatsCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={<AlertCircle />}
            trend={{ value: 8.2, label: "from last week", direction: "up" }}
          />
          <StatsCard
            title="Out of Stock Items"
            value={stats.outOfStockItems}
            icon={<Package />}
            trend={{ value: 2.1, label: "from last week", direction: "down" }}
          />
        </div>
      )}

      {userRole === "cashier" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 fade-in">
          <StatsCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={<AlertCircle />}
            trend={{ value: 8.2, label: "from last week", direction: "up" }}
          />
          <StatsCard
            title="Out of Stock Items"
            value={stats.outOfStockItems}
            icon={<Package />}
            trend={{ value: 2.1, label: "from last week", direction: "down" }}
          />
        </div>
      )}

      {canViewSalesStats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 fade-in">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Weekly Sales Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
                    <Bar
                      dataKey="sales"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Top Selling Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {stats.topSellingProducts.map(({ product, soldCount }) => (
                  <div key={product.id} className="flex items-center">
                    <div className="h-10 w-10 rounded-md overflow-hidden mr-3 flex-shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.brand} • Item #{product.itemNumber}
                      </p>
                    </div>
                    <div className="flex items-center">
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm font-medium">{soldCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {userRole === "admin" && (
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                Admin Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start border-gray-200"
                  onClick={() => navigate("/inventory")}
                >
                  <Package className="mr-2 h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <p className="font-medium">Inventory Management</p>
                    <p className="text-xs text-gray-500">Add, update or remove items</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start border-gray-200"
                  onClick={() => navigate("/products")}
                >
                  <DollarSign className="mr-2 h-5 w-5 text-green-600" />
                  <div className="text-left">
                    <p className="font-medium">Pricing & Discounts</p>
                    <p className="text-xs text-gray-500">Manage product pricing</p>
                  </div>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-auto py-4 justify-start border-gray-200"
                  onClick={() => navigate("/admin")}
                >
                  <TrendingUp className="mr-2 h-5 w-5 text-purple-600" />
                  <div className="text-left">
                    <p className="font-medium">Sales Reports</p>
                    <p className="text-xs text-gray-500">View detailed analytics</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </PageContainer>
  );
};

export default Dashboard;
