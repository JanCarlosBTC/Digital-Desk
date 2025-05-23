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
  
  // Redirect to Replit Auth login page
  const login = () => {
    // In a real implementation, this would redirect to login
    window.location.href = '/api/login';
  };

  // Logout using Replit Auth
  const logout = () => {
    // Replit Auth uses a GET request for logout
    window.location.href = '/api/logout';
  };

  // Refresh user data from the server
  const refreshUser = () => {
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