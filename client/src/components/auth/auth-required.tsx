import React from 'react';
import { useUser } from '@/context/user-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, LogInIcon } from 'lucide-react';
import { useLocation } from 'wouter';

interface AuthRequiredProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * A component that renders children only if the user is authenticated
 * Otherwise, it renders a login prompt
 */
export function AuthRequired({ children, fallback }: AuthRequiredProps) {
  const { user, isLoading } = useUser();
  const [_, navigate] = useLocation();
  
  // If still loading, show nothing (or could add a loading spinner)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }
  
  // If user is authenticated, render children
  if (user) {
    return <>{children}</>;
  }
  
  // If custom fallback is provided, render it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Otherwise render the default login prompt
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockIcon className="h-5 w-5" />
          Authentication Required
        </CardTitle>
        <CardDescription>
          You need to be logged in to access this feature
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This section contains your personal data and requires authentication.
          Please log in to view your content.
        </p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => navigate('/login?returnTo=' + encodeURIComponent(window.location.pathname))}
          className="gap-2"
        >
          <LogInIcon className="h-4 w-4" />
          Log In
        </Button>
      </CardFooter>
    </Card>
  );
}