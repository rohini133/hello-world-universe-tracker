
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { PageContainer } from "@/components/layout/PageContainer"; 

const Index = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    // If logged in, navigate to dashboard, otherwise to login
    // Using "/" instead of "/dashboard" to match the actual route in App.tsx
    if (isLoggedIn) {
      console.log("User is logged in, navigating to dashboard");
      navigate("/", { replace: true });
    } else {
      console.log("User is not logged in, navigating to login");
      navigate("/login", { replace: true });
    }
  }, [isLoggedIn, navigate]);

  // Add a placeholder div as children to satisfy the PageContainerProps requirement
  return (
    <PageContainer>
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome to Vivaas</h1>
          <p className="text-gray-500">
            Redirecting you to the appropriate page...
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default Index;
