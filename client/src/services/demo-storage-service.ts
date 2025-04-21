/**
 * Demo Storage Service
 * 
 * This service provides local storage functionality for demo purposes with:
 * - Automatic expiration of data after 4 hours
 * - No account required
 * - Persistent storage within the expiration window
 */

// Define the expiration time (4 hours in milliseconds)
const EXPIRATION_TIME = 4 * 60 * 60 * 1000; // 4 hours

// Type for stored items with expiration
interface StoredItem<T> {
  value: T;
  timestamp: number;
}

export class DemoStorageService {
  private prefix: string = 'demo_';

  /**
   * Store data in local storage with expiration
   * @param key Storage key
   * @param value Data to store
   */
  setItem<T>(key: string, value: T): void {
    const item: StoredItem<T> = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem(this.prefix + key, JSON.stringify(item));
  }

  /**
   * Get data from local storage if not expired
   * @param key Storage key
   * @returns The stored value or null if expired or not found
   */
  getItem<T>(key: string): T | null {
    const storedItem = localStorage.getItem(this.prefix + key);
    
    if (!storedItem) {
      return null;
    }
    
    try {
      const item: StoredItem<T> = JSON.parse(storedItem);
      const now = Date.now();
      
      // Check if item has expired
      if (now - item.timestamp > EXPIRATION_TIME) {
        // Remove expired item
        this.removeItem(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error parsing stored item:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   * @param key Storage key
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * Clear all demo storage items
   */
  clearAll(): void {
    // Get all keys that start with our prefix
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToRemove.push(key);
      }
    }
    
    // Remove all matching keys
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Clean up expired items
   * Called automatically when accessing items, but can be called manually
   * for maintenance purposes
   */
  cleanupExpiredItems(): void {
    const now = Date.now();
    const keysToCheck = [];
    
    // Get all demo storage keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keysToCheck.push(key);
      }
    }
    
    // Check each item for expiration
    keysToCheck.forEach(fullKey => {
      try {
        const storedItem = localStorage.getItem(fullKey);
        if (storedItem) {
          const item = JSON.parse(storedItem);
          if (now - item.timestamp > EXPIRATION_TIME) {
            localStorage.removeItem(fullKey);
          }
        }
      } catch (error) {
        // If there's any issue with the item, remove it
        localStorage.removeItem(fullKey);
      }
    });
  }

  /**
   * Get the remaining time until expiration in milliseconds
   * @param key Storage key
   * @returns Remaining time in milliseconds, 0 if expired or not found
   */
  getTimeRemaining(key: string): number {
    const storedItem = localStorage.getItem(this.prefix + key);
    
    if (!storedItem) {
      return 0;
    }
    
    try {
      const item: StoredItem<any> = JSON.parse(storedItem);
      const now = Date.now();
      const elapsed = now - item.timestamp;
      
      if (elapsed > EXPIRATION_TIME) {
        return 0;
      }
      
      return EXPIRATION_TIME - elapsed;
    } catch (error) {
      return 0;
    }
  }
}

// Export a singleton instance for use throughout the app
export const demoStorage = new DemoStorageService();