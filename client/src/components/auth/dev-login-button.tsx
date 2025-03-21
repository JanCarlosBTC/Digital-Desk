import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import { useLocation } from 'wouter';

/**
 * DevLoginButton - Simple direct access login for demo user
 * 
 * This component provides a streamlined way to log in as the demo user
 * without going through the standard login form. It makes a direct API
 * call to the server and stores the token in localStorage.
 */
export function DevLoginButton({ 
  afterLoginPath = '/', 
  variant = 'default' as 'default' | 'outline' | 'link' | 'destructive' | 'secondary' | 'ghost'
}: {
  afterLoginPath?: string;
  variant?: 'default' | 'outline' | 'link' | 'destructive' | 'secondary' | 'ghost';
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { refreshUser } = useUser();
  const [, setLocation] = useLocation();

  const handleDevLogin = async () => {
    setIsLoading(true);

    try {
      // Direct fetch call to dev-login endpoint
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'demo' })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(e => ({ message: 'Invalid response format' }));
        throw new Error(errorData.message || 'Dev login failed');
      }

      const result = await response.json();

      // Store token in localStorage
      localStorage.setItem('authToken', result.token);

      // Show success message
      toast({
        title: 'Logged in as Demo User',
        description: `Welcome back, ${result.user.name}!`,
      });

      // Refresh user context
      await refreshUser();

      // Navigate to specified path
      setLocation(afterLoginPath);
    } catch (error) {
      console.error('Dev login failed:', error);
      
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant={variant}
      onClick={handleDevLogin}
      disabled={isLoading}
    >
      {isLoading ? 'Logging in...' : 'Login as Demo User'}
    </Button>
  );
}