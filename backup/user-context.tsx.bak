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
      
      console.log('[UserContext] Loading user, token exists:', !!token);
      
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        console.log('[UserContext] Fetching user profile with token');
        
        // IMPORTANT: Log full token to debug issues (token will be masked in production)
        if (token) {
          console.log('[UserContext] Token value:', token.substring(0, 15) + '...');
          console.log('[UserContext] FULL TOKEN FOR DEBUGGING:', token);
          
          try {
            // Decode and log token parts
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              // Safe decoding for browser compatibility
              const decodeBase64 = (str: string): string => {
                // Replace non-url compatible chars with base64 standard chars
                const input = str.replace(/-/g, '+').replace(/_/g, '/');
                // Add padding if needed
                const pad = input.length % 4;
                if (pad) {
                  if (pad === 1) {
                    throw new Error('Invalid base64 string');
                  }
                  const padding = '=='.substring(0, 4 - pad);
                  return window.atob(input + padding);
                }
                return window.atob(input);
              };
              
              // Completely safe parsing with all checks
              try {
                // Make sure we have strings before decoding
                const part0 = tokenParts[0] || '';
                const part1 = tokenParts[1] || '';
                
                // Only try to parse if we have actual content
                if (part0.length > 0 && part1.length > 0) {
                  const header = JSON.parse(decodeBase64(part0));
                  const payload = JSON.parse(decodeBase64(part1));
                  console.log('[UserContext] Token header:', header);
                  console.log('[UserContext] Token payload:', payload);
                  if (payload && typeof payload.userId !== 'undefined') {
                    console.log('[UserContext] UserId from token:', payload.userId);
                  }
                } else {
                  console.warn('[UserContext] Token parts incomplete - cannot decode');
                }
              } catch (parseError) {
                console.error('[UserContext] Error parsing token parts:', parseError);
              }
            }
          } catch (e) {
            console.error('[UserContext] Failed to decode token:', e);
          }
        } else {
          console.log('[UserContext] No token available');
        }
        
        // Make direct fetch request to profile endpoint using the stored token
        const response = await fetch('/api/auth/profile', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include' // Include credentials in the request
        });
        
        console.log('[UserContext] Profile response status:', response.status);
        console.log('[UserContext] Profile response type:', response.headers.get('content-type'));
        
        if (!response.ok) {
          // Handle non-2xx responses
          let errorData;
          try {
            errorData = await response.json();
          } catch (jsonError) {
            console.error('[UserContext] Failed to parse error response:', await response.text());
            errorData = { message: 'Invalid response format' };
          }
          
          console.error('[UserContext] Profile fetch failed:', response.status, errorData);
          
          if (response.status === 401 || response.status === 403) {
            console.log('[UserContext] Authentication error, clearing token');
            authService.clearToken();
          }
          
          throw new Error(errorData.message || 'Failed to load user profile');
        }
        
        // Safely parse the response
        let userData;
        try {
          userData = await response.json();
          console.log('[UserContext] User profile loaded successfully:', userData);
        } catch (jsonError) {
          console.error('[UserContext] Failed to parse user profile response:', jsonError);
          const responseText = await response.text();
          console.log('[UserContext] Raw response:', responseText.substring(0, 200) + '...');
          throw new Error('Invalid response format from server');
        }
        
        setUser(userData);
        setIsError(false);
      } catch (error) {
        console.error('[UserContext] Failed to load user data:', error);
        setIsError(true);
        
        // More detailed error logging
        if (error instanceof Error) {
          console.log('[UserContext] Error type:', error.name);
          console.log('[UserContext] Error message:', error.message);
          
          // Clear token if authentication issues are detected
          if (error.message.includes('Authentication required') || 
              error.message.includes('Unauthorized') ||
              error.message.includes('Invalid token')) {
            console.log('[UserContext] Clearing invalid token');
            authService.clearToken();
          }
        }
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUser();
  }, []);

  /**
   * Login function - uses direct fetch to authentication endpoint
   */
  const login = async (username: string, password: string): Promise<boolean> => {
    console.log(`[UserContext] Login attempt for user: ${username}`);
    
    try {
      setIsLoading(true);
      console.log('[UserContext] Calling login API endpoint directly');
      
      // Make direct fetch request to login endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      
      console.log(`[UserContext] Login response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[UserContext] Login failed:', response.status, errorData);
        throw new Error(errorData.message || 'Login failed');
      }
      
      const result = await response.json();
      
      console.log('[UserContext] Login successful, received token and user data');
      console.log('[UserContext] User:', result.user);
      console.log('[UserContext] Token exists:', !!result.token);
      
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
      console.error('[UserContext] Login failed:', error);
      setIsError(true);
      
      // More detailed error logging
      if (error instanceof Error) {
        console.log('[UserContext] Error type:', error.name);
        console.log('[UserContext] Error message:', error.message);
      }
      
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
   * Register function - uses direct fetch to registration endpoint
   */
  const register = async (userData: any): Promise<boolean> => {
    console.log('[UserContext] Registration attempt');
    
    try {
      setIsLoading(true);
      
      // Make direct fetch request to register endpoint
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      console.log(`[UserContext] Registration response status: ${response.status}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[UserContext] Registration failed:', response.status, errorData);
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const result = await response.json();
      console.log('[UserContext] Registration successful, received user data');
      
      // Set token if provided in response
      if (result.token) {
        console.log('[UserContext] Token received, saving to local storage');
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
      console.error('[UserContext] Registration failed:', error);
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
   * Refresh user data from the API using direct fetch
   */
  const refreshUser = async () => {
    console.log('[UserContext] Refreshing user data');
    const token = authService.getToken();
    
    if (!token) {
      console.log('[UserContext] No token available, cannot refresh user');
      return;
    }
    
    console.log('[UserContext] Token for refresh:', token ? token.substring(0, 15) + '...' : 'none');
    
    try {
      setIsLoading(true);
      
      // Make direct fetch request to profile endpoint
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include' // Include credentials in request
      });
      
      console.log('[UserContext] Refresh profile response status:', response.status);
      console.log('[UserContext] Refresh profile response type:', response.headers.get('content-type'));
      
      if (!response.ok) {
        // Handle non-2xx responses
        let errorData;
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.error('[UserContext] Failed to parse refresh error response:', await response.text());
          errorData = { message: 'Invalid response format' };
        }
        
        console.error('[UserContext] Profile refresh failed:', response.status, errorData);
        throw new Error(errorData.message || 'Failed to refresh user data');
      }
      
      // Safely parse the response
      let userData;
      try {
        userData = await response.json();
        console.log('[UserContext] User data refreshed successfully:', userData);
      } catch (jsonError) {
        console.error('[UserContext] Failed to parse refresh response:', jsonError);
        const responseText = await response.text();
        console.log('[UserContext] Raw refresh response:', responseText.substring(0, 200) + '...');
        throw new Error('Invalid response format from server');
      }
      
      setUser(userData);
      setIsError(false);
    } catch (error) {
      console.error('[UserContext] Failed to refresh user data:', error);
      setIsError(true);
      
      if (error instanceof Error) {
        console.log('[UserContext] Refresh error type:', error.name);
        console.log('[UserContext] Refresh error message:', error.message);
        
        if (error.message.includes('Authentication required') || 
            error.message.includes('Unauthorized') ||
            error.message.includes('Invalid token')) {
          console.log('[UserContext] Authentication error during refresh, clearing token');
          authService.clearToken();
        }
      }
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