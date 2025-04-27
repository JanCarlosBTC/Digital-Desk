import React, { createContext, useContext } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@prisma/client';
import { useAuth } from '@/hooks/useAuth';

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
  const { 
    user, 
    isLoading, 
    error: isError, 
    redirectToLogin, 
    logout: authLogout,
    refetch
  } = useAuth();
  
  // Redirect to Replit Auth login page
  const login = () => {
    redirectToLogin();
  };

  // Logout using Replit Auth
  const logout = () => {
    authLogout();
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  // Refresh user data from the server
  const refreshUser = () => {
    refetch();
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isError: !!isError,
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