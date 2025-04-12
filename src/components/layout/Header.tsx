
import { Bell, LogOut, MenuIcon, ShoppingCart, User, Settings } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";
import { NotificationsPanel } from "@/components/notifications/NotificationsPanel";

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isLoggedIn, userRole, userName, logout } = useAuth();

  // Helper function to check if a navigation item should be shown
  const shouldShowNavItem = (item: string): boolean => {
    if (userRole === "admin") return true;
    
    // Cashiers can only access dashboard and billing
    if (userRole === "cashier") {
      return item === "dashboard" || item === "billing";
    }
    
    return true;
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="flex items-center">
                <ShoppingCart className="h-8 w-8 text-primary dark:text-white" />
                <span className="ml-2 text-xl font-bold text-gray-800 dark:text-white">Vivaas</span>
              </Link>
            </div>
            {isLoggedIn && (
              <nav className="hidden md:ml-6 md:flex md:space-x-8">
                {shouldShowNavItem("dashboard") && (
                  <Link
                    to="/"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-primary text-sm font-medium text-gray-900 dark:text-gray-100"
                  >
                    Dashboard
                  </Link>
                )}
                {shouldShowNavItem("billing") && (
                  <Link
                    to="/billing"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600"
                  >
                    Billing
                  </Link>
                )}
                {shouldShowNavItem("inventory") && (
                  <Link
                    to="/inventory"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600"
                  >
                    Inventory
                  </Link>
                )}
                {shouldShowNavItem("products") && (
                  <Link
                    to="/products"
                    className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-300 dark:hover:text-white dark:hover:border-gray-600"
                  >
                    Products
                  </Link>
                )}
              </nav>
            )}
          </div>
          {isLoggedIn ? (
            <div className="hidden md:flex items-center">
              {userRole === "admin" && (
                <Badge variant="outline" className="mr-3 bg-primary/10 text-primary border-primary/20 dark:bg-primary/20">
                  Admin
                </Badge>
              )}
              {userRole === "cashier" && (
                <Badge variant="outline" className="mr-3 bg-secondary/10 text-secondary border-secondary/20 dark:bg-secondary/20">
                  Cashier
                </Badge>
              )}
              
              <div className="mr-2">
                <NotificationsPanel />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="dark:bg-gray-800 dark:border-gray-700">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium dark:text-white">{userName}</p>
                      <p className="text-xs text-muted-foreground mt-1 dark:text-gray-400">{userRole === "admin" ? "Store Owner" : "Sales Operator"}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer dark:text-gray-300 dark:hover:text-white">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer dark:text-gray-300 dark:hover:text-white">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-red-500 focus:text-red-500 dark:text-red-400 dark:focus:text-red-300">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden md:flex items-center">
              <Link to="/login">
                <Button>Login</Button>
              </Link>
            </div>
          )}
          <div className="flex md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary dark:hover:bg-gray-800 dark:hover:text-white"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden dark:bg-gray-900">
          {isLoggedIn && (
            <div className="pt-2 pb-3 space-y-1">
              {shouldShowNavItem("dashboard") && (
                <Link
                  to="/"
                  className="block pl-3 pr-4 py-2 border-l-4 border-primary text-base font-medium text-primary bg-primary-50 dark:bg-gray-800 dark:text-white"
                >
                  Dashboard
                </Link>
              )}
              {shouldShowNavItem("billing") && (
                <Link
                  to="/billing"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Billing
                </Link>
              )}
              {shouldShowNavItem("inventory") && (
                <Link
                  to="/inventory"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Inventory
                </Link>
              )}
              {shouldShowNavItem("products") && (
                <Link
                  to="/products"
                  className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Products
                </Link>
              )}
            </div>
          )}
          
          {isLoggedIn ? (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center px-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center dark:bg-gray-700">
                    <User className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800 dark:text-white">{userName}</div>
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {userRole === "admin" ? "Store Owner" : "Sales Operator"}
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Profile
                </Link>
                <Link
                  to="/settings"
                  className="block w-full text-left px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white"
                >
                  Settings
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-base font-medium text-red-500 hover:text-red-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-4 pb-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-center">
                <Link to="/login" className="w-full px-4">
                  <Button className="w-full">Login</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
