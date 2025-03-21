/**
 * Media Query Hook
 * 
 * A hook that detects if a media query matches the current viewport.
 * Useful for responsive design logic in React components.
 */

import { useState, useEffect } from 'react';

/**
 * Hook to detect if a media query matches
 * @param query The media query to check (e.g. "(min-width: 768px)")
 * @returns Whether the media query matches
 */
export function useMediaQuery(query: string): boolean {
  // Initial state based on the current match
  const getMatches = (): boolean => {
    // SSR check - return false if window is not available
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches());

  useEffect(() => {
    // Function to handle media query change
    const handleChange = () => {
      setMatches(getMatches());
    };

    // Initial check
    const matchMedia = window.matchMedia(query);
    
    // Set up the listener
    if (matchMedia.addEventListener) {
      // Modern browsers
      matchMedia.addEventListener('change', handleChange);
    } else {
      // Older browsers
      matchMedia.addListener(handleChange);
    }

    // Clean up
    return () => {
      if (matchMedia.removeEventListener) {
        // Modern browsers
        matchMedia.removeEventListener('change', handleChange);
      } else {
        // Older browsers
        matchMedia.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}

export default useMediaQuery; 