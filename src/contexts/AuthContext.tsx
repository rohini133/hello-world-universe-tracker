
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase, enhancedLogin, debugAuthStatus } from "@/integrations/supabase/client";

// Define fixed users for the system
const USERS = [
  {
    username: "owner",
    password: "owner@123",
    role: "admin",
    name: "Owner",
    email: "owner@vivaas.com"
  },
  {
    username: "cashier",
    password: "cashier@123",
    role: "cashier",
    name: "Cashier",
    email: "cashier@vivaas.com"
  }
];

interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userName: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuthAccess: (requiredRole?: string) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Create a default auth context for when it's being used outside of the provider
const defaultAuthContext: AuthContextType = {
  isLoggedIn: false,
  userRole: null,
  userName: null,
  login: async () => false,
  logout: () => {},
  checkAuthAccess: () => false,
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // We don't want to auto-login on the login page
  const shouldAutoLogin = location.pathname !== "/login";

  // Auto-login for development - this will automatically log in with admin credentials
  useEffect(() => {
    const autoLogin = async () => {
      console.log("Checking for existing session...");
      const { data } = await supabase.auth.getSession();
      
      if (!data.session && shouldAutoLogin) {
        console.log("No session found. Attempting auto-login for development...");
        try {
          // Auto-login with first admin user
          const adminUser = USERS[0]; // Use the first user (admin)
          const { success, error } = await enhancedLogin(adminUser.email, adminUser.password);
          
          if (success) {
            console.log("Auto-login successful");
            localStorage.setItem("isLoggedIn", "true");
            localStorage.setItem("userRole", adminUser.role);
            localStorage.setItem("username", adminUser.name);
            
            setIsLoggedIn(true);
            setUserRole(adminUser.role);
            setUserName(adminUser.name);
            
            toast({
              title: "Auto-Login Successful",
              description: `Welcome back, ${adminUser.name}! (Auto-login for development)`,
            });
          } else {
            console.error("Auto-login failed:", error);
          }
        } catch (err) {
          console.error("Auto-login error:", err);
        }
      }
      setIsInitializing(false);
    };
    
    autoLogin();
  }, [toast, shouldAutoLogin]);

  // Check for active Supabase session on mount and auth state changes
  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change:", event, session ? "Session exists" : "No session");
        const hasSession = !!session;
        
        // Only update if auth status changes
        if (hasSession !== isLoggedIn) {
          console.log(`Auth status changed: ${isLoggedIn} -> ${hasSession}`);
          setIsLoggedIn(hasSession);
          
          if (hasSession) {
            // Retrieve user role and name from localStorage as a fallback
            const storedRole = localStorage.getItem("userRole");
            const storedName = localStorage.getItem("username");
            
            if (storedRole && storedName) {
              setUserRole(storedRole);
              setUserName(storedName);
            }
          } else {
            // If logged out, clear role and name
            setUserRole(null);
            setUserName(null);
          }
        }
      }
    );
    
    // Then check for existing session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error("Error fetching session:", error);
        return;
      }
      
      const hasSession = !!data.session;
      console.log("Initial session check:", hasSession ? "Logged in" : "Not logged in");
      
      setIsLoggedIn(hasSession);
      
      if (hasSession) {
        // Retrieve user role and name from localStorage as a fallback
        const storedRole = localStorage.getItem("userRole");
        const storedName = localStorage.getItem("username");
        
        if (storedRole && storedName) {
          setUserRole(storedRole);
          setUserName(storedName);
        }
      }
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    // Find user with matching credentials
    const user = USERS.find(
      u => u.username === username && u.password === password
    );
    
    if (user) {
      try {
        // Log in to Supabase with the corresponding email/password
        const { success, error } = await enhancedLogin(user.email, user.password);
        
        if (!success) {
          console.error("Supabase login failed:", error);
          
          // If Supabase login fails, we'll fall back to local authentication
          toast({
            variant: "destructive",
            title: "Supabase Auth Warning",
            description: "Using local auth mode. Some features may be limited.",
          });
        } else {
          console.log("Supabase login successful");
        }
        
        // Store authentication state
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userRole", user.role);
        localStorage.setItem("username", user.name);
        
        // Update state
        setIsLoggedIn(true);
        setUserRole(user.role);
        setUserName(user.name);
        
        // Show success notification
        toast({
          title: "Login Successful",
          description: `Welcome back, ${user.name}!`,
        });
        
        // Debug auth status after login
        setTimeout(() => {
          debugAuthStatus();
        }, 500);
        
        return true;
      } catch (err) {
        console.error("Login error:", err);
        
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "An error occurred during login. Please try again.",
        });
        
        return false;
      }
    }
    
    toast({
      variant: "destructive",
      title: "Login Failed",
      description: "Invalid username or password. Please try again.",
    });
    
    return false;
  };

  const logout = async () => {
    try {
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear local storage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      
      // Update state
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
      
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      
      // Force logout even if Supabase fails
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("userRole");
      localStorage.removeItem("username");
      setIsLoggedIn(false);
      setUserRole(null);
      setUserName(null);
      navigate("/login");
    }
  };

  const checkAuthAccess = (requiredRole?: string) => {
    if (!isLoggedIn) return false;
    if (!requiredRole) return true;
    
    // If required role is "admin", only admins can access
    if (requiredRole === "admin" && userRole !== "admin") return false;
    
    // Cashiers should not have access to inventory, product details, and admin panel
    // Also restrict access to dashboard statistics
    if (userRole === "cashier" && (
      requiredRole === "inventory" || 
      requiredRole === "products" || 
      requiredRole === "admin" ||
      requiredRole === "sales_statistics"
    )) {
      return false;
    }
    
    return true;
  };

  // If still initializing, we can show a loading state or return children
  if (isInitializing) {
    // You can either return null or a loading component here
    // For simplicity, we'll just return children so the app loads
    return <>{children}</>;
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, userRole, userName, login, logout, checkAuthAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    console.error("useAuth was called outside of AuthProvider");
    return defaultAuthContext;
  }
  return context;
};
