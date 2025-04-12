
import React from "react";
import { Header } from "./Header";
import { useAuth } from "@/contexts/AuthContext";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ 
  children, 
  title,
  subtitle 
}) => {
  const auth = useAuth();
  const isLoggedIn = auth?.isLoggedIn || false;
  const userRole = auth?.userRole || null;
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoggedIn && (title || subtitle) && (
          <div className="mb-6 bg-white p-6 rounded-lg shadow-md border border-gray-100 fade-in">
            {title && (
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                {title}
                {userRole && (
                  <span className={`ml-3 text-xs font-medium py-1 px-2 rounded-full ${
                    userRole === "admin" 
                      ? "bg-orange-100 text-orange-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {userRole === "admin" ? "Admin View" : "Cashier View"}
                  </span>
                )}
              </h1>
            )}
            {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
          </div>
        )}
        <div className="fade-in">{children}</div>
      </main>
      
      {isLoggedIn && (
        <footer className="bg-white border-t mt-10 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                &copy; 2025 Demo. All rights reserved.
              </div>
              <div className="text-sm text-gray-400">
                Version 1.0.0
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
};
