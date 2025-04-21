
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingCart, UserCircle, UserCog, ShieldCheck, CreditCard, Package, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoggedIn, login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      console.log("User is logged in, redirecting to root path");
      navigate('/', { replace: true });
    }
  }, [isLoggedIn, navigate]);

  const handleLogin = async () => {
    setIsLoading(true);
    
    if (!email || !password) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Please provide both email and password.",
      });
      setIsLoading(false);
      return;
    }
    
    try {
      const success = await login(email, password);
      if (success) {
        // Login function now handles the redirection
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer>
      <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl login-container overflow-hidden" style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <div className="grid md:grid-cols-5 min-h-[550px]">
            <div className="login-sidebar md:col-span-2 p-8 flex flex-col justify-between" style={{ backgroundColor: '#ea384c', color: 'white' }}>
              <div>
                <h2 className="text-xl font-bold mb-4 mt-6">Welcome to the Ultimate Retail Management System</h2>
                <p className="text-white/80 mb-6">
                  Streamline your operations with our comprehensive platform designed specifically for retail businesses.
                </p>
                
                <div className="space-y-4 mt-8">
                  <div className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-full mr-3">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Secure Management</h3>
                      <p className="text-sm text-white/70">Role-based access control for your team</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-full mr-3">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Effortless Billing</h3>
                      <p className="text-sm text-white/70">Process sales transactions quickly</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white/20 p-2 rounded-full mr-3">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Inventory Control</h3>
                      <p className="text-sm text-white/70">Track stock levels in real-time</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="p-3 bg-white/10 rounded-lg">
                  <p className="text-sm text-white/90">
                    "Vivaas has transformed how we manage our store inventory and sales. Highly recommended!"
                  </p>
                  <p className="text-xs text-white/70 mt-2">- Sarah Johnson, Fashion Boutique Owner</p>
                </div>
              </div>
            </div>
            
            <div className="login-form md:col-span-3 p-8">
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Sign in to your account</h2>
                  <p className="text-gray-500 mt-2">Enter your credentials to continue</p>
                </div>

                <Tabs defaultValue="admin" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-8 p-1 bg-gray-100 rounded-lg">
                    <TabsTrigger value="admin" className="rounded-md py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <div className="flex flex-col items-center">
                        <UserCog className="h-5 w-5 mb-1 text-orange-500" />
                        <span>Admin</span>
                      </div>
                    </TabsTrigger>
                    <TabsTrigger value="cashier" className="rounded-md py-3 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                      <div className="flex flex-col items-center">
                        <UserCircle className="h-5 w-5 mb-1 text-blue-600" />
                        <span>Cashier</span>
                      </div>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="admin">
                    <div className="border border-gray-200 rounded-lg p-6 shadow-md">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <UserCog className="h-6 w-6 text-orange-500" />
                          Admin Login
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Sign in with your admin credentials to manage inventory and view reports
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="admin-email">Email</Label>
                          <Input 
                            id="admin-email" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="animated-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="admin-password">Password</Label>
                          <div className="relative">
                            <Input 
                              id="admin-password" 
                              type="password" 
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="animated-input"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <input type="checkbox" id="remember" className="rounded border-gray-300 text-orange-500 mr-2" />
                            <label htmlFor="remember" className="text-gray-600">Remember me</label>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        style={{ backgroundColor: '#ea384c', color: 'white' }}
                        onClick={handleLogin}
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="cashier">
                    <div className="border border-gray-200 rounded-lg p-6 shadow-md">
                      <div className="mb-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          <UserCircle className="h-6 w-6 text-blue-600" />
                          Cashier Login
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                          Sign in with your cashier credentials to process sales and generate bills
                        </p>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="cashier-email">Email</Label>
                          <Input 
                            id="cashier-email" 
                            placeholder="Enter your email" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="animated-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cashier-password">Password</Label>
                          <div className="relative">
                            <Input 
                              id="cashier-password" 
                              type="password" 
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="animated-input"
                            />
                            <Lock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <div className="flex items-center">
                            <input type="checkbox" id="remember-cashier" className="rounded border-gray-300 text-blue-600 mr-2" />
                            <label htmlFor="remember-cashier" className="text-gray-600">Remember me</label>
                          </div>
                        </div>
                      </div>
                      <Button 
                        className="w-full mt-4"
                        style={{ backgroundColor: 'blue', color: 'white' }}
                        onClick={handleLogin}
                        disabled={isLoading}
                      >
                        {isLoading ? "Signing in..." : "Sign In"}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Login;
