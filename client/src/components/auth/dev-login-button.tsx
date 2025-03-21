import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/user-context';
import { useLocation } from 'wouter';
import { authService } from '@/services/auth-service';

/**
 * DevLoginButton - Simple direct access login for demo user
 * 
 * This component provides a streamlined way to log in as the demo user
 * without going through the standard login form. It uses the authService
 * to perform the login and handle token storage consistently.
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
      console.log('[DevLoginButton] Attempting demo user login via authService');
      
      // Use authService for consistent token handling
      const result = await authService.devLogin('demo');
      
      console.log('[DevLoginButton] Login successful, token exists:', !!result.token);

      // Show success message
      toast({
        title: 'Logged in as Demo User',
        description: `Welcome back, ${result.user.name}!`,
      });

      // Refresh user context to update UI
      console.log('[DevLoginButton] Refreshing user context');
      await refreshUser();

      // Navigate to specified path
      console.log('[DevLoginButton] Navigating to', afterLoginPath);
      setLocation(afterLoginPath);
    } catch (error) {
      console.error('[DevLoginButton] Login failed:', error);
      
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