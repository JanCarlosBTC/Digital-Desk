import { User } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

/**
 * Simplified storage service for user preferences
 */
class StorageService {
  private storageKey = 'userPreferences';

  /**
   * Get stored preferences
   */
  getPreferences(): any {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : {};
  }

  /**
   * Save preferences
   */
  savePreferences(data: any): void {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  /**
   * Clear all stored data
   */
  clearStorage(): void {
    localStorage.removeItem(this.storageKey);
  }
}

type LoginCredentials = {
  username: string;
  password: string;
};

type RegisterData = {
  username: string;
  password: string;
  name: string;
  email?: string;
  initials?: string;
  plan?: string;
};

/**
 * Authentication service for user management
 * - Handles API authentication with the server
 * - Provides local caching of user data for offline access
 */
class AuthService {
  private userKey = 'currentUser';
  private tokenKey = 'authToken';

  /**
   * Get the stored user data
   */
  getUser(): User | null {
    const stored = localStorage.getItem(this.userKey);
    return stored ? JSON.parse(stored) : null;
  }

  /**
   * Save user data
   */
  private saveUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Clear the user data
   */
  private clearUser(): void {
    localStorage.removeItem(this.userKey);
  }

  /**
   * Set authentication token
   */
  private setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  /**
   * Get authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Clear authentication token
   */
  private clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  /**
   * Authenticate user with server
   */
  async login(credentials: LoginCredentials): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/login', credentials);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      const user = await response.json();
      this.saveUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(userData: RegisterData): Promise<User> {
    try {
      const response = await apiRequest('POST', '/api/register', userData);
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }
      
      const user = await response.json();
      this.saveUser(user);
      return user;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    try {
      await apiRequest('POST', '/api/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearUser();
      this.clearToken();
    }
  }

  /**
   * Get the current user from the server
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiRequest('GET', '/api/user');
      
      if (!response.ok) {
        if (response.status === 401) {
          this.clearUser(); // Clear local user if unauthorized
          return null;
        }
        throw new Error('Failed to fetch user data');
      }
      
      const user = await response.json();
      this.saveUser(user);
      return user;
    } catch (error) {
      console.error('Get current user error:', error);
      return this.getUser(); // Fall back to cached user if API fails
    }
  }

  /**
   * Development mode login - for testing only
   */
  async devLogin(username: string): Promise<{ token: string, user: User }> {
    // For development: Create a mock user and token
    const mockUser = {
      id: 1,
      username,
      name: username,
      initials: username.substring(0, 2).toUpperCase(),
      plan: "Free"
    } as User;
    
    const mockToken = "dev-token-" + Date.now();
    
    // Save the mock data locally
    this.setToken(mockToken);
    this.saveUser(mockUser);
    
    console.log('[DevLogin] Created mock user in dev mode', mockUser);
    
    return {
      token: mockToken,
      user: mockUser
    };
  }
}

// Export a singleton instance
export const authService = new AuthService();