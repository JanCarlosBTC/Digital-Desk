import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/user-context';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'wouter';

const Login = () => {
  const { login } = useUser();
  const { isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  
  // In development mode, auto-redirect to home page if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setLocation('/');
    }
  }, [isAuthenticated, setLocation]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white px-4">
      <Card className="w-full max-w-md shadow-lg border-none">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-3xl font-bold text-primary">Digital Desk</CardTitle>
          <CardDescription className="text-lg">
            Clarity Client Hub
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2 mb-4">
            <h2 className="text-2xl font-medium">Welcome Back</h2>
            <p className="text-gray-500">
              Sign in to continue to your personal workspace
            </p>
          </div>
          
          <div className="flex flex-col items-center space-y-4">
            <Button
              onClick={login}
              className="w-full py-6 text-lg"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in with Replit'}
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-gray-500 px-4">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;