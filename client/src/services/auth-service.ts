import { User } from '@shared/schema';

/**
 * API endpoints for authentication 
 * Note: IMPORTANT - These endpoints must match EXACTLY with what's in the
 * server routes.ts file. The '/api' prefix is already included there!
 */
const AUTH_ENDPOINTS = {
  LOGIN: '/api/auth/login',
  DEV_LOGIN: '/api/auth/dev-login',
  REGISTER: '/api/auth/register',
  USER_PROFILE: '/api/user/profile',
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
   * Login a user with credentials
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    try {
      // Make API request to login endpoint - endpoints already include /api prefix
      const response = await fetch(AUTH_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }
      
      const result = await response.json();
      
      // Store the token
      this.setToken(result.token);
      
      return result;
    } catch (error) {
      this.clearToken();
      throw error;
    }
  }
  
  /**
   * Dev login for testing purposes
   */
  async devLogin(username: string): Promise<LoginResponse> {
    console.log(`[AuthService] Attempting dev login for user: ${username}`);
    console.log(`[AuthService] Using endpoint: ${AUTH_ENDPOINTS.DEV_LOGIN}`);
    
    try {
      // Make API request to dev login endpoint - endpoints already include /api prefix
      const response = await fetch(AUTH_ENDPOINTS.DEV_LOGIN, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      
      console.log(`[AuthService] Dev login response status: ${response.status}`);
      
      if (!response.ok) {
        console.log('[AuthService] Dev login response not OK');
        const errorData = await response.json().catch(e => {
          console.error('[AuthService] Failed to parse error response:', e);
          return { message: 'Invalid response format' };
        });
        console.log('[AuthService] Error data:', errorData);
        throw new Error(errorData.message || 'Dev login failed');
      }
      
      console.log('[AuthService] Parsing successful response body');
      const result = await response.json().catch(e => {
        console.error('[AuthService] Failed to parse success response:', e);
        throw new Error('Invalid response format');
      });
      
      console.log('[AuthService] Dev login successful, token present:', !!result.token);
      console.log('[AuthService] User data retrieved:', result.user);
      
      // Store the token
      this.setToken(result.token);
      console.log('[AuthService] Token stored in local storage');
      
      return result;
    } catch (error) {
      console.error('[AuthService] Dev login error:', error);
      if (error instanceof Error) {
        console.log('[AuthService] Error name:', error.name);
        console.log('[AuthService] Error message:', error.message);
      }
      this.clearToken();
      console.log('[AuthService] Token cleared due to error');
      throw error;
    }
  }
  
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<User> {
    try {
      const response = await fetch(AUTH_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Registration failed');
      }
      
      const result = await response.json();
      
      // Store the token if returned
      if (result.token) {
        this.setToken(result.token);
      }
      
      return result.user;
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
    
    // Optional: make an API request to invalidate the token on the server
    try {
      await fetch(AUTH_ENDPOINTS.LOGOUT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
  
  /**
   * Get the current user data
   */
  async getCurrentUser(): Promise<User> {
    try {
      // Check if we have a token first
      if (!this.getToken()) {
        throw new Error('Not authenticated');
      }
      
      const response = await fetch(AUTH_ENDPOINTS.USER_PROFILE, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getToken()}`
        }
      });
      
      if (!response.ok) {
        // If unauthorized, clear the token
        if (response.status === 401) {
          this.clearToken();
        }
        
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to get user profile');
      }
      
      return await response.json();
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Request a password reset
   */
  async resetPassword(data: ResetPasswordRequest): Promise<void> {
    try {
      const response = await fetch(AUTH_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Password reset failed');
      }
    } catch (error) {
      throw error;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();