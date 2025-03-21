import React, { useState } from "react";
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
  const { user, isLoading, refreshUser } = useUser();
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
    console.log('[LoginPage] Starting dev login for demo user');
    setIsDevLoading(true);
    
    try {
      // Make direct fetch request to dev-login endpoint
      console.log('[LoginPage] Making direct fetch to /api/auth/dev-login');
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo' })
      });
      
      console.log(`[LoginPage] Dev login response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json().catch(e => {
          console.error('[LoginPage] Failed to parse error response:', e);
          return { message: 'Invalid response format' };
        });
        console.log('[LoginPage] Error data:', errorData);
        throw new Error(errorData.message || 'Dev login failed');
      }
      
      const result = await response.json();
      
      console.log('[LoginPage] Dev login successful. Response:', result);
      console.log('[LoginPage] Token received:', !!result.token);
      
      // Set token explicitly in local storage to ensure it's available
      console.log('[LoginPage] Setting token in local storage');
      localStorage.setItem('authToken', result.token);
      
      toast({
        title: 'Success',
        description: `Logged in as ${result.user.name}`,
      });
      
      // Navigate to dashboard after successful login
      console.log('[LoginPage] Redirecting to home page');
      setLocation('/');
      
      // Force a page reload to ensure the token is properly loaded
      console.log('[LoginPage] Scheduling page reload');
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error('[LoginPage] Dev login error:', error);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.log('[LoginPage] Error type:', error.name);
        console.log('[LoginPage] Error message:', error.message);
      }
      
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Could not log in with demo account. Please try again.',
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