import * as React from "react"

// Define breakpoints as constants
export const breakpoints = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280
};

interface MediaQueryOptions {
  /** Time in ms to debounce the resize handler */
  debounceDelay?: number;
  /** Function to determine initial value before hydration (optional) */
  getInitialValueInSSR?: () => boolean;
}

/**
 * Custom hook to check if the current viewport is mobile
 * Includes debouncing to improve performance and SSR support
 */
export function useIsMobile(options: MediaQueryOptions = {}) {
  const { 
    debounceDelay = 200,
    // Default to not mobile for SSR to prevent layout shift
    getInitialValueInSSR = () => false 
  } = options;

  // Initialize with null for SSR detection
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Detect if we're in the browser
    if (typeof window === 'undefined') return;

    // Set initial value immediately to prevent layout shift
    setIsMobile(window.innerWidth < breakpoints.mobile);

    // Setup resize handler with debounce
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < breakpoints.mobile);
      }, debounceDelay);
    };

    // Use matchMedia for better performance
    const mql = window.matchMedia(`(max-width: ${breakpoints.mobile - 1}px)`);
    
    // Set up the handler
    if (mql.addEventListener) {
      mql.addEventListener('change', handleResize);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', handleResize);
    }

    // Initial check
    handleResize();

    // Cleanup
    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handleResize);
      } else {
        window.removeEventListener('resize', handleResize);
      }
      clearTimeout(timeoutId);
    };
  }, [debounceDelay]); // Only re-run if debounceDelay changes

  // If isMobile is null (during SSR), use the provided initial value
  if (isMobile === null) {
    return getInitialValueInSSR();
  }

  return isMobile;
}

/**
 * Hook that tracks viewport size and returns responsive breakpoint status
 */
export function useResponsive() {
  const [viewport, setViewport] = React.useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSize = () => {
      const width = window.innerWidth;
      setViewport({
        isMobile: width < breakpoints.mobile,
        isTablet: width >= breakpoints.mobile && width < breakpoints.desktop,
        isDesktop: width >= breakpoints.desktop
      });
    };

    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkSize, 200);
    };

    window.addEventListener('resize', handleResize);
    checkSize(); // Initial check

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  return viewport;
}
