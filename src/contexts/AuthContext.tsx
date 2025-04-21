
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

// Define context type
interface AuthContextType {
  isLoggedIn: boolean;
  userRole: string | null;
  userName: string | null;
  login: (email: string, password: string) => Promise<boolean>;
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
            const storedRole = localStorage.getItem("userRole") || "user";
            const storedName = localStorage.getItem("username") || session.user.email?.split('@')[0] || "User";
            
            setUserRole(storedRole);
            setUserName(storedName);
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
        const storedRole = localStorage.getItem("userRole") || "user";
        const storedName = localStorage.getItem("username") || data.session.user.email?.split('@')[0] || "User";
        
        setUserRole(storedRole);
        setUserName(storedName);
      }
      
      setIsInitializing(false);
    };
    
    checkSession();
    
    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [isLoggedIn]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Authenticate with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: error.message || "Invalid credentials. Please try again.",
        });
        
        return false;
      }
      
      if (!data.session) {
        console.error("No session returned after login");
        
        toast({
          variant: "destructive",
          title: "Login Error",
          description: "No session created. Please try again.",
        });
        
        return false;
      }
      
      console.log("Login successful with email:", email);
      
      // Determine role based on email (you could fetch this from a profiles table)
      // Default to 'cashier' unless it's a specific admin email
      const role = email.includes("guddu") ? "admin" : "cashier";
      
      // Store authentication state
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("username", data.user?.email?.split('@')[0] || "User");
      
      // Update state
      setIsLoggedIn(true);
      setUserRole(role);
      setUserName(data.user?.email?.split('@')[0] || "User");
      
      // Show success notification
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user?.email?.split('@')[0] || "User"}!`,
      });
      
      // Redirect to root route which will handle proper dashboard redirection
      // This fixes the 404 error by using a route that definitely exists
      navigate("/", { replace: true });
      
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
