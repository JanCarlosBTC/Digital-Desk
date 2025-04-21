import React, { createContext, useContext, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { User } from '@shared/schema';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isError: boolean;
  login: (userData: Partial<User>) => void;
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
  
  // Create a fixed demo user - no login needed
  const [user, setUser] = useState<User | null>(() => {
    const demoUser = {
      id: 1,
      name: "Demo User",
      username: "demo",
      initials: "DU",
      plan: "Premium"
    };
    
    // Store in localStorage to persist between refreshes
    localStorage.setItem('user', JSON.stringify(demoUser));
    return demoUser;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  // Since authentication is removed, login always uses demo user
  const login = (userData: Partial<User>) => {
    // Ignore credentials - always use demo user
    const demoUser = {
      id: 1,
      name: "Demo User",
      username: "demo",
      initials: "DU",
      plan: "Premium",
      ...userData  // Allow overriding some values if needed
    };

    localStorage.setItem('user', JSON.stringify(demoUser));
    setUser(demoUser);

    toast({
      title: 'Demo mode activated',
      description: `Using demo account`,
    });
  };

  // Logout reinitializes the demo user
  const logout = () => {
    const demoUser = {
      id: 1,
      name: "Demo User",
      username: "demo",
      initials: "DU",
      plan: "Premium"
    };
    
    localStorage.setItem('user', JSON.stringify(demoUser));
    setUser(demoUser);

    toast({
      title: 'Demo reset',
      description: 'Using fresh demo account',
    });
  };

  // Refresh user retrieves from localStorage but ensures a demo user exists
  const refreshUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      // If no user in storage, create a new demo user
      const demoUser = {
        id: 1,
        name: "Demo User",
        username: "demo",
        initials: "DU",
        plan: "Premium"
      };
      localStorage.setItem('user', JSON.stringify(demoUser));
      setUser(demoUser);
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