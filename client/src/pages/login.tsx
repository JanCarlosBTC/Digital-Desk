import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/context/user-context";
import { useLocation, Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/auth-service";

export default function LoginPage() {
  const { user, isLoading } = useUser();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [isDevLoading, setIsDevLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();
  
  // If user is already logged in, redirect to home
  if (user && !isLoading) {
    return <Redirect to="/" />;
  }
  
  // Function to handle dev login with the demo user
  const handleDevLogin = async () => {
    setIsDevLoading(true);
    try {
      const response = await authService.devLogin('demo');
      
      toast({
        title: 'Success',
        description: `Logged in as ${response.user.name}`,
      });
      
      // Navigate to dashboard after successful login
      setLocation('/');
      window.location.reload(); // Force reload to update authentication state
    } catch (error) {
      console.error('Dev login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Could not log in with dev account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsDevLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-primary">Digital Desk</h1>
          <p className="text-gray-600">Sign in to your account</p>
        </div>
        
        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-bold">
              {activeTab === "login" ? "Welcome back" : "Create an account"}
            </CardTitle>
            <CardDescription>
              {activeTab === "login" 
                ? "Enter your credentials to access your account" 
                : "Fill out the form below to create your account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as "login" | "register")}
              className="space-y-4"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <LoginForm redirectTo="/" />
                
                {/* Development Login Button */}
                <div className="text-center mt-6">
                  <p className="text-sm text-gray-500 mb-2">For development:</p>
                  <Button 
                    onClick={handleDevLogin} 
                    disabled={isDevLoading}
                    variant="outline"
                    className="w-full"
                  >
                    {isDevLoading ? "Logging in..." : "Login as Demo User"}
                  </Button>
                </div>
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>
                    Don't have an account?{" "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setActiveTab("register")}
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </TabsContent>
              
              <TabsContent value="register" className="space-y-4">
                <RegisterForm redirectTo="/login" />
                
                <div className="text-center text-sm text-gray-500 mt-4">
                  <p>
                    Already have an account?{" "}
                    <button
                      className="text-blue-600 hover:underline"
                      onClick={() => setActiveTab("login")}
                    >
                      Sign in
                    </button>
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <p>
            By continuing, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
} 