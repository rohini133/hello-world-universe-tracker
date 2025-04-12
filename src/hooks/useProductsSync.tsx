
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/types/supabase-extensions';
import { getProducts } from '@/services/productService';
import { checkActiveSession } from '@/integrations/supabase/client';

export const useProductsSync = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  // Check auth status on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const hasSession = await checkActiveSession();
        setIsAuthenticated(hasSession);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
  }, []);
  
  // Use React Query to fetch products
  // Note: We're not blocking data fetching based on authentication
  // since we have a fallback to sample data in getProducts
  const { 
    data: products = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    staleTime: 60000, // 1 minute
    refetchOnWindowFocus: false,
  });
  
  return {
    products,
    isLoading,
    error: error ? (error as Error).message : null,
    isAuthenticated,
    refetchProducts: refetch
  };
};
