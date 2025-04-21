import { useState, useEffect, useCallback } from 'react';
import { demoStorage } from '@/services/demo-storage-service';

/**
 * Hook for using demo storage with React components
 * Provides a similar API to useState but persists data in localStorage
 * with automatic expiration after 4 hours
 * 
 * @param key Unique storage key
 * @param initialValue Default value if nothing is stored
 * @returns [storedValue, setValue, clearValue, timeRemaining]
 */
export function useDemoStorage<T>(key: string, initialValue: T) {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get from local storage by key or use initialValue
      const item = demoStorage.getItem<T>(key);
      return item !== null ? item : initialValue;
    } catch (error) {
      // If error, return initialValue
      console.error('Error retrieving from demo storage:', error);
      return initialValue;
    }
  });

  // Track time remaining (for UI indicators)
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    return demoStorage.getTimeRemaining(key);
  });

  // Update time remaining every minute
  useEffect(() => {
    const intervalId = setInterval(() => {
      const remaining = demoStorage.getTimeRemaining(key);
      setTimeRemaining(remaining);
      
      // If expired, reset to initial value
      if (remaining <= 0) {
        setStoredValue(initialValue);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [key, initialValue]);

  // Save to localStorage with expiration
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function for prev state pattern
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage with expiration timestamp
      demoStorage.setItem(key, valueToStore);
      
      // Reset time remaining
      setTimeRemaining(4 * 60 * 60 * 1000); // 4 hours
    } catch (error) {
      console.error('Error saving to demo storage:', error);
    }
  }, [key, storedValue]);

  // Clear this value from storage
  const clearValue = useCallback(() => {
    try {
      demoStorage.removeItem(key);
      setStoredValue(initialValue);
      setTimeRemaining(0);
    } catch (error) {
      console.error('Error clearing demo storage:', error);
    }
  }, [key, initialValue]);

  // Format time remaining for display (e.g. "3h 45m remaining")
  const formattedTimeRemaining = useCallback(() => {
    if (timeRemaining <= 0) return 'Expired';
    
    const hours = Math.floor(timeRemaining / (60 * 60 * 1000));
    const minutes = Math.floor((timeRemaining % (60 * 60 * 1000)) / (60 * 1000));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  }, [timeRemaining]);

  return { 
    value: storedValue, 
    setValue, 
    clearValue, 
    timeRemaining,
    formattedTimeRemaining: formattedTimeRemaining()
  };
}