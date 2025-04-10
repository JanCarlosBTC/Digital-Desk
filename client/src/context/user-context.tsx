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
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const login = (userData: Partial<User>) => {
    const newUser = {
      id: Date.now(),
      name: userData.name || 'Guest',
      email: userData.email || 'guest@example.com',
      ...userData
    };

    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);

    toast({
      title: 'Logged in',
      description: `Welcome, ${newUser.name}!`,
    });
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);

    toast({
      title: 'Logged out',
      description: 'You have been logged out',
    });
  };

  const refreshUser = () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setUser(JSON.parse(stored));
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