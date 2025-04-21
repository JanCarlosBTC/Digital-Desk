import { User } from '@shared/schema';

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


/**
 * Authentication service for user management
 * - Handles login, logout, registration using only local storage
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
  saveUser(user: User): void {
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Clear the user data
   */
  clearUser(): void {
    localStorage.removeItem(this.userKey);
  }

  /**
   * Set authentication token
   */
  setToken(token: string): void {
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
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getUser();
  }

  /**
   * Login a user (simplified to local storage)
   */
  login(user: User): void {
    this.saveUser(user);
  }

  /**
   * Logout the current user
   */
  logout(): void {
    this.clearUser();
    this.clearToken();
  }

  /**
   * Get the current user data
   */
  getCurrentUser(): User | null {
    return this.getUser();
  }

  /**
   * Development login
   */
  async devLogin(username: string): Promise<{ token: string, user: User }> {
    const response = await fetch('/api/auth/dev-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Dev login failed');
    }
    
    const result = await response.json();
    this.setToken(result.token);
    this.saveUser(result.user);
    
    return result;
  }
}

// Export a singleton instance
export const authService = new AuthService();