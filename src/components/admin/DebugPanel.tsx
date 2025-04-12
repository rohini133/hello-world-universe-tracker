
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase, debugAuthStatus, refreshSession } from '@/integrations/supabase/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { toast } from "@/components/ui/use-toast";

export const DebugPanel = () => {
  const [authState, setAuthState] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [testResponse, setTestResponse] = useState<any>(null);
  const [testError, setTestError] = useState<string | null>(null);
  
  const checkAuth = async () => {
    setLoading(true);
    try {
      const status = await debugAuthStatus();
      setAuthState(status);
    } catch (err) {
      console.error("Error checking auth:", err);
      setAuthState({ error: err.message });
    } finally {
      setLoading(false);
    }
  };
  
  const refreshAuth = async () => {
    setLoading(true);
    try {
      const result = await refreshSession();
      toast({
        title: result ? "Session Refreshed" : "Refresh Failed",
        description: result ? "Authentication token has been refreshed" : "Unable to refresh authentication token",
        variant: result ? "default" : "destructive",
      });
      await checkAuth();
    } catch (err) {
      console.error("Error refreshing session:", err);
      toast({
        title: "Refresh Error",
        description: `Error: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const testProductInsert = async () => {
    setLoading(true);
    setTestResponse(null);
    setTestError(null);
    
    try {
      const testProduct = {
        name: `Test Product ${new Date().toISOString()}`,
        price: 999,
        stock: 50,
        brand: "Test Brand",
        category: "Test Category",
        item_number: `TEST-${Math.floor(Math.random() * 10000)}`,
        discount_percentage: 0,
        low_stock_threshold: 5,
        description: "Test product for debug purposes",
        image: "https://via.placeholder.com/150"
      };
      
      console.log("Attempting direct test insert:", testProduct);
      
      const { data, error } = await supabase
        .from('products')
        .insert(testProduct)
        .select()
        .single();
      
      if (error) {
        console.error("Test insert error:", error);
        setTestError(JSON.stringify({
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }, null, 2));
      } else {
        console.log("Test insert successful:", data);
        setTestResponse(data);
        
        toast({
          title: "Test Insert Successful",
          description: `Product "${data.name}" was added successfully`,
        });
      }
    } catch (err) {
      console.error("Exception during test insert:", err);
      setTestError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  // Check auth on first render
  useEffect(() => {
    checkAuth();
  }, []);
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Database Connectivity Debugger</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <Button onClick={checkAuth} disabled={loading}>
            {loading ? "Checking..." : "Check Auth Status"}
          </Button>
          <Button onClick={refreshAuth} disabled={loading} variant="outline">
            {loading ? "Refreshing..." : "Refresh Session"}
          </Button>
          <Button onClick={testProductInsert} disabled={loading} variant="secondary">
            {loading ? "Testing..." : "Test Product Insert"}
          </Button>
        </div>
        
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="auth">
            <AccordionTrigger>Authentication State</AccordionTrigger>
            <AccordionContent>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                {JSON.stringify(authState, null, 2)}
              </pre>
            </AccordionContent>
          </AccordionItem>
          
          {testResponse && (
            <AccordionItem value="response">
              <AccordionTrigger>Test Response</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs">
                  {JSON.stringify(testResponse, null, 2)}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
          
          {testError && (
            <AccordionItem value="error">
              <AccordionTrigger>Test Error</AccordionTrigger>
              <AccordionContent>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-60 text-xs text-red-500">
                  {testError}
                </pre>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
};
