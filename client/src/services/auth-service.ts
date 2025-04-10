import { User } from '@shared/schema';
import { storageService } from './storage-service'; // Assuming the new service is in the same directory

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

// Export singleton instance
export const storageService = new StorageService();


/**
 * Authentication service for user management
 * - Handles login, logout, registration using only local storage
 */
class AuthService {
  private userKey = 'currentUser';

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
  }

  /**
   * Get the current user data
   */
  getCurrentUser(): User | null {
    return this.getUser();
  }
}

// Export a singleton instance
export const authService = new AuthService();