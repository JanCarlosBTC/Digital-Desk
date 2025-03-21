import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

// Import the auth service
import { authService } from '@/services/auth-service';

const DevLogin: React.FC = () => {
  const [username, setUsername] = useState('demo');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username) {
      toast({
        title: 'Error',
        description: 'Please enter a username',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Use the dev login directly
      const response = await authService.devLogin(username);
      
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
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Development Login</CardTitle>
        <CardDescription>Login with any username for testing</CardDescription>
      </CardHeader>
      <form onSubmit={handleDevLogin}>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                id="username"
                type="text"
                placeholder="Username (default: demo)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
              <p className="text-sm text-muted-foreground">
                This is for development purposes only. No password required.
              </p>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login (Dev Mode)'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DevLogin;