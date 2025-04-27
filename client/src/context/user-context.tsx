import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User, useAuth } from '@/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: () => void;
  logout: () => void;
  refreshUser: () => void;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  isError: false,
  login: () => {},
  logout: () => {},
  refreshUser: () => {},
});

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { 
    user, 
    isLoading, 
    isAuthenticated
  } = useAuth();
  
  // Redirect to login page
  const login = () => {
    // For local authentication, we'll redirect to the login form
    window.location.href = '/login';
  };

  // Logout using local auth
  const logout = () => {
    fetch('/api/logout', { method: 'POST' })
      .then(() => {
        // Invalidate all auth-related queries
        queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
        queryClient.invalidateQueries({ queryKey: ['/api/user'] });
        
        // Clear the cache explicitly by setting null
        queryClient.setQueryData(['/api/auth/user'], null);
        queryClient.setQueryData(['/api/user'], null);
        
        toast({
          title: 'Logged out',
          description: 'You have been logged out successfully',
        });
        
        // Force redirect to login page
        window.location.href = '/login';
      })
      .catch(error => {
        console.error('Logout error:', error);
        toast({
          title: 'Logout failed',
          description: 'There was an error logging out. Please try again.',
          variant: 'destructive'
        });
      });
  };

  // Refresh user data from the server
  const refreshUser = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    // Also invalidate the standard endpoint to ensure both are refreshed
    queryClient.invalidateQueries({ queryKey: ['/api/user'] });
  };

  // Flag to indicate if there's an error (user not authenticated but not loading)
  const hasError = !isAuthenticated && !isLoading;

  return (
    <UserContext.Provider
      value={{
        user: user as User | null,
        isLoading,
        isError: hasError,
        login,
        logout,
        refreshUser
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }

  return context;
};