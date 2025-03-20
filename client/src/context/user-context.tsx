import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';
import { authService } from '@/services/auth-service';
import { apiClient, authApi } from '@/services/api-service';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  register: (userData: any) => Promise<boolean>;
}

// Default context - will be overridden by provider
const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: false,
  isError: false,
  login: async () => false,
  logout: () => {},
  refreshUser: async () => {},
  register: async () => false,
});

/**
 * UserProvider component that will wrap the application
 * Provides user state and authentication methods to all components
 */
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Load user data on component mount or when token changes
  useEffect(() => {
    const loadUser = async () => {
      const token = authService.getToken();
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        // Get current user profile
        const userData = await authApi.getProfile();
        setUser(userData);
        setIsError(false);
      } catch (error) {
        console.error('Failed to load user data:', error);
        setIsError(true);
        // Clear token if invalid
        if (error instanceof Error && error.message.includes('Authentication required')) {
          authService.clearToken();
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  /**
   * Login function - uses the authentication API
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authApi.login({ username, password });
      
      // Save token
      authService.setToken(result.token);
      
      // Set user data
      setUser(result.user);
      setIsError(false);
      
      toast({
        title: 'Logged in',
        description: `Welcome back, ${result.user.name}!`,
      });
      
      return true;
    } catch (error) {
      setIsError(true);
      
      toast({
        title: 'Login failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Register function
   */
  const register = async (userData: any): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authApi.register(userData);
      
      // Set token if provided in response
      if (result.token) {
        authService.setToken(result.token);
      }
      
      // Set user data
      setUser(result.user);
      setIsError(false);
      
      toast({
        title: 'Registration successful',
        description: `Welcome, ${result.user.name}!`,
      });
      
      return true;
    } catch (error) {
      setIsError(true);
      
      toast({
        title: 'Registration failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout function - clears token and user data
   */
  const logout = () => {
    authService.clearToken();
    setUser(null);
    
    toast({
      title: 'Logged out',
      description: 'You have been logged out',
    });
  };

  /**
   * Refresh user data from the API
   */
  const refreshUser = async () => {
    try {
      setIsLoading(true);
      const userData = await authApi.getProfile();
      setUser(userData);
      setIsError(false);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isError,
        login,
        logout,
        refreshUser,
        register
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

/**
 * Hook to access user context from any component
 */
export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  
  return context;
}; 