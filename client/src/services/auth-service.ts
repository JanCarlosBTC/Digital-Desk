import { User } from '@shared/schema';
import { ApiError } from '@/lib/api-utils';

/**
 * API endpoints for authentication 
 */
const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  USER: '/api/user',
  LOGOUT: '/api/auth/logout',
  RESET_PASSWORD: '/api/auth/reset-password',
};

/**
 * Login request parameters
 */
export interface LoginRequest {
  username: string;
  password: string;
}

/**
 * Login response with user data and token
 */
export interface LoginResponse {
  user: User;
  token: string;
}

/**
 * Registration request parameters
 */
export interface RegisterRequest {
  username: string;
  password: string;
  name: string;
  email: string;
}

/**
 * Reset password request
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Authentication service for user management
 * - Handles login, logout, registration
 * - Saves and retrieves tokens from local storage
 */
class AuthService {
  private tokenKey = 'authToken';
  
  /**
   * Get the stored authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
  
  /**
   * Set the authentication token in local storage
   */
  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }
  
  /**
   * Clear the authentication token
   */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }
  
  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
  
  /**
   * Login a user
   * Currently a placeholder that will be implemented with real authentication
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // This is a placeholder - will be properly implemented later
      // Normally this would make a real API request
      const token = 'demo_token';
      this.setToken(token);
      
      // Mock user response
      const user: User = {
        id: 1,
        username: data.username,
        name: 'Demo User',
        initials: 'DU',
        plan: 'Premium',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      return { user, token };
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }
  
  /**
   * Register a new user
   * This is a placeholder for the future implementation
   */
  async register(data: RegisterRequest): Promise<User> {
    try {
      // This will make a real API request in the future
      throw new Error('Registration not yet implemented');
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Logout the current user
   */
  async logout(): Promise<void> {
    // Clear token regardless of API response
    this.clearToken();
    
    try {
      // Would normally make an API request to invalidate the token on the server
      // This is a placeholder
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  /**
   * Get the current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      // This will make a real API request in the future
      // For now it just returns a mock user
      return {
        id: 1,
        username: 'demo',
        name: 'Demo User',
        initials: 'DU',
        plan: 'Premium',
        createdAt: new Date(),
        updatedAt: new Date()
      };
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Request a password reset
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      // This will make a real API request in the future
      throw new Error('Password reset not yet implemented');
    } catch (error) {
      throw error;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService(); 