/**
 * Demo Storage Service
 * 
 * This service provides local storage functionality with automatic expiration
 * for demo purposes. Data stored using this service will expire after 4 hours
 * to keep demo data fresh and prevent stale data accumulation.
 */

interface StoredItem<T> {
  value: T;
  timestamp: number;
}

export class DemoStorageService {
  private prefix: string = 'demo_';
  private expirationTime: number = 4 * 60 * 60 * 1000; // 4 hours in milliseconds

  constructor() {
    // Clean up any expired items on initialization
    this.cleanupExpiredItems();
  }

  /**
   * Store data in local storage with expiration
   * @param key Storage key
   * @param value Data to store
   */
  setItem<T>(key: string, value: T): void {
    try {
      const prefixedKey = this.prefix + key;
      const item: StoredItem<T> = {
        value,
        timestamp: Date.now() + this.expirationTime
      };
      
      localStorage.setItem(prefixedKey, JSON.stringify(item));
    } catch (error) {
      console.error('Error saving to demo storage:', error);
    }
  }

  /**
   * Get data from local storage if not expired
   * @param key Storage key
   * @returns The stored value or null if expired or not found
   */
  getItem<T>(key: string): T | null {
    try {
      const prefixedKey = this.prefix + key;
      const storedItem = localStorage.getItem(prefixedKey);
      
      if (!storedItem) return null;
      
      const item: StoredItem<T> = JSON.parse(storedItem);
      
      // Check if the item has expired
      if (item.timestamp < Date.now()) {
        // Remove expired item
        localStorage.removeItem(prefixedKey);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error retrieving from demo storage:', error);
      return null;
    }
  }

  /**
   * Remove item from storage
   * @param key Storage key
   */
  removeItem(key: string): void {
    try {
      const prefixedKey = this.prefix + key;
      localStorage.removeItem(prefixedKey);
    } catch (error) {
      console.error('Error removing from demo storage:', error);
    }
  }

  /**
   * Clear all demo storage items
   */
  clearAll(): void {
    try {
      // Get all keys in localStorage
      const keys = Object.keys(localStorage);
      
      // Remove only keys with our prefix
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing demo storage:', error);
    }
  }

  /**
   * Clean up expired items
   * Called automatically when accessing items, but can be called manually
   * for maintenance purposes
   */
  cleanupExpiredItems(): void {
    try {
      const keys = Object.keys(localStorage);
      const now = Date.now();
      
      keys.forEach(key => {
        // Only process keys with our prefix
        if (key.startsWith(this.prefix)) {
          const storedItem = localStorage.getItem(key);
          if (storedItem) {
            try {
              const item = JSON.parse(storedItem);
              if (item.timestamp < now) {
                localStorage.removeItem(key);
              }
            } catch (e) {
              // If we can't parse it, it's not our format, so remove it
              localStorage.removeItem(key);
            }
          }
        }
      });
    } catch (error) {
      console.error('Error cleaning up expired items:', error);
    }
  }

  /**
   * Get the remaining time until expiration in milliseconds
   * @param key Storage key
   * @returns Remaining time in milliseconds, 0 if expired or not found
   */
  getTimeRemaining(key: string): number {
    try {
      const prefixedKey = this.prefix + key;
      const storedItem = localStorage.getItem(prefixedKey);
      
      if (!storedItem) return 0;
      
      const item = JSON.parse(storedItem);
      const remaining = item.timestamp - Date.now();
      
      return remaining > 0 ? remaining : 0;
    } catch (error) {
      console.error('Error getting time remaining:', error);
      return 0;
    }
  }
}

// Export a singleton instance
export const demoStorage = new DemoStorageService();