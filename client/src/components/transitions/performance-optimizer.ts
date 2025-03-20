/**
 * Animation Performance Optimizer
 * 
 * Utilities for optimizing animation performance and managing animation complexity
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

// Define constants for performance budget
export const PERFORMANCE_CONSTANTS = {
  // Maximum number of concurrent animations to maintain 60fps
  MAX_CONCURRENT_ANIMATIONS: 12,
  
  // Time threshold for debouncing animations (ms)
  ANIMATION_DEBOUNCE_THRESHOLD: 16, // ~1 frame at 60fps
  
  // Animation priority levels
  PRIORITY: {
    CRITICAL: 10,  // Must animate (navigation, key interactions)
    HIGH: 8,       // Should animate (important UI elements)
    MEDIUM: 5,     // Can animate (enhancements)
    LOW: 2,        // Animate if resources permit
    IDLE: 0        // Only animate during idle periods
  },
  
  // FPS thresholds for scaling animations
  FPS_THRESHOLDS: {
    HIGH: 55,      // Full animations
    MEDIUM: 40,    // Simplified animations
    LOW: 30,       // Minimal animations
    CRITICAL: 20   // Disable non-critical animations
  }
};

/**
 * Tracks global animation performance state
 */
class AnimationPerformanceController {
  private static instance: AnimationPerformanceController;
  
  // Track active animations
  private activeAnimations: Set<string> = new Set();
  
  // Track FPS data
  private fpsData: number[] = [];
  private lastFrameTime = performance.now();
  private frameCount = 0;
  private measurementInterval = 1000; // 1 second measurement interval
  private currentFps = 60;
  
  // Listeners for performance changes
  private fpsListeners: Set<(fps: number) => void> = new Set();
  private performanceModeListeners: Set<(mode: PerformanceMode) => void> = new Set();
  
  // Current performance mode
  private _performanceMode: PerformanceMode = 'high';
  
  private constructor() {
    this.startFpsMeasurement();
  }
  
  static getInstance(): AnimationPerformanceController {
    if (!AnimationPerformanceController.instance) {
      AnimationPerformanceController.instance = new AnimationPerformanceController();
    }
    return AnimationPerformanceController.instance;
  }
  
  /**
   * Start monitoring FPS
   */
  private startFpsMeasurement() {
    const measureFrame = () => {
      const now = performance.now();
      const elapsed = now - this.lastFrameTime;
      
      this.frameCount++;
      
      // Update FPS measurement every second
      if (elapsed >= this.measurementInterval) {
        const fps = Math.round((this.frameCount * 1000) / elapsed);
        this.frameCount = 0;
        this.lastFrameTime = now;
        
        // Add to rolling buffer
        this.fpsData.push(fps);
        if (this.fpsData.length > 5) {
          this.fpsData.shift();
        }
        
        // Calculate average FPS
        const avgFps = this.fpsData.reduce((sum, fps) => sum + fps, 0) / this.fpsData.length;
        this.currentFps = avgFps;
        
        // Notify listeners
        this.fpsListeners.forEach(listener => listener(avgFps));
        
        // Update performance mode based on FPS
        this.updatePerformanceMode(avgFps);
      }
      
      // Continue measurement
      requestAnimationFrame(measureFrame);
    };
    
    // Start measurement loop
    requestAnimationFrame(measureFrame);
  }
  
  /**
   * Update performance mode based on FPS
   */
  private updatePerformanceMode(fps: number) {
    let newMode: PerformanceMode;
    
    if (fps >= PERFORMANCE_CONSTANTS.FPS_THRESHOLDS.HIGH) {
      newMode = 'high';
    } else if (fps >= PERFORMANCE_CONSTANTS.FPS_THRESHOLDS.MEDIUM) {
      newMode = 'medium';
    } else if (fps >= PERFORMANCE_CONSTANTS.FPS_THRESHOLDS.LOW) {
      newMode = 'low';
    } else {
      newMode = 'minimal';
    }
    
    if (newMode !== this._performanceMode) {
      this._performanceMode = newMode;
      // Notify listeners
      this.performanceModeListeners.forEach(listener => listener(newMode));
    }
  }
  
  /**
   * Register an animation
   */
  registerAnimation(id: string): boolean {
    // Check if we're at capacity
    if (this.activeAnimations.size >= PERFORMANCE_CONSTANTS.MAX_CONCURRENT_ANIMATIONS) {
      // Only allow if in high performance mode
      if (this._performanceMode !== 'high') {
        return false;
      }
    }
    
    this.activeAnimations.add(id);
    return true;
  }
  
  /**
   * Unregister an animation
   */
  unregisterAnimation(id: string) {
    this.activeAnimations.delete(id);
  }
  
  /**
   * Get current performance mode
   */
  get performanceMode(): PerformanceMode {
    return this._performanceMode;
  }
  
  /**
   * Get current FPS
   */
  get fps(): number {
    return this.currentFps;
  }
  
  /**
   * Get number of active animations
   */
  get animationCount(): number {
    return this.activeAnimations.size;
  }
  
  /**
   * Subscribe to FPS changes
   */
  subscribeFps(callback: (fps: number) => void): () => void {
    this.fpsListeners.add(callback);
    return () => this.fpsListeners.delete(callback);
  }
  
  /**
   * Subscribe to performance mode changes
   */
  subscribePerformanceMode(callback: (mode: PerformanceMode) => void): () => void {
    this.performanceModeListeners.add(callback);
    return () => this.performanceModeListeners.delete(callback);
  }
}

// Different performance modes for animations
export type PerformanceMode = 'high' | 'medium' | 'low' | 'minimal';

// Export singleton instance
export const animationPerformance = AnimationPerformanceController.getInstance();

/**
 * Hook to check if an animation should be performed based on priority
 * 
 * @param priority Animation priority level
 * @returns Boolean indicating if animation should be performed
 */
export function useAnimationPermission(priority: number = PERFORMANCE_CONSTANTS.PRIORITY.MEDIUM): boolean {
  const shouldReduceMotion = useReducedMotion();
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    animationPerformance.performanceMode
  );
  
  // Subscribe to performance mode changes
  useEffect(() => {
    const unsubscribe = animationPerformance.subscribePerformanceMode(mode => {
      setPerformanceMode(mode);
    });
    
    return unsubscribe;
  }, []);
  
  // Determine if animation should run based on priority and performance
  if (shouldReduceMotion) {
    return priority >= PERFORMANCE_CONSTANTS.PRIORITY.CRITICAL;
  }
  
  switch (performanceMode) {
    case 'high':
      return true; // Allow all animations
    case 'medium':
      return priority >= PERFORMANCE_CONSTANTS.PRIORITY.MEDIUM;
    case 'low':
      return priority >= PERFORMANCE_CONSTANTS.PRIORITY.HIGH;
    case 'minimal':
      return priority >= PERFORMANCE_CONSTANTS.PRIORITY.CRITICAL;
    default:
      return true;
  }
}

/**
 * Hook to provide optimized animation properties based on current performance conditions
 * 
 * @param animationId Unique identifier for the animation
 * @param priority Animation priority
 * @returns Optimized animation properties
 */
export function useOptimizedAnimation(
  animationId: string, 
  priority: number = PERFORMANCE_CONSTANTS.PRIORITY.MEDIUM
): {
  shouldAnimate: boolean;
  optimizedDuration: number;
  simplifyAnimation: boolean;
} {
  const baseRef = useRef(animationId);
  const uniqueId = `${baseRef.current}-${Math.random().toString(36).substr(2, 9)}`;
  const hasPermission = useAnimationPermission(priority);
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    animationPerformance.performanceMode
  );
  
  // Subscribe to performance mode changes
  useEffect(() => {
    const unsubscribe = animationPerformance.subscribePerformanceMode(mode => {
      setPerformanceMode(mode);
    });
    
    return unsubscribe;
  }, []);
  
  // Register animation on mount, unregister on unmount
  useEffect(() => {
    if (hasPermission) {
      animationPerformance.registerAnimation(uniqueId);
    }
    
    return () => {
      animationPerformance.unregisterAnimation(uniqueId);
    };
  }, [uniqueId, hasPermission]);
  
  // Calculate optimized duration based on performance mode
  const optimizedDuration = (() => {
    switch (performanceMode) {
      case 'high':
        return 1; // Normal duration
      case 'medium':
        return 0.8; // 80% of normal duration
      case 'low':
        return 0.6; // 60% of normal duration
      case 'minimal':
        return 0.4; // 40% of normal duration
      default:
        return 1;
    }
  })();
  
  // Determine if animation should be simplified
  const simplifyAnimation = performanceMode === 'low' || performanceMode === 'minimal';
  
  return {
    shouldAnimate: hasPermission,
    optimizedDuration,
    simplifyAnimation
  };
}

/**
 * Creates a debounced animation function
 * 
 * @param callback Animation callback
 * @param delay Debounce delay in ms
 * @returns Debounced callback
 */
export function useAnimationDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number = PERFORMANCE_CONSTANTS.ANIMATION_DEBOUNCE_THRESHOLD
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

/**
 * Hook to get the current performance mode
 * 
 * @returns Current performance mode and FPS
 */
export function usePerformanceMonitor(): {
  performanceMode: PerformanceMode;
  fps: number;
  animationCount: number;
} {
  const [performanceMode, setPerformanceMode] = useState<PerformanceMode>(
    animationPerformance.performanceMode
  );
  
  const [fps, setFps] = useState<number>(animationPerformance.fps);
  const [animationCount, setAnimationCount] = useState<number>(animationPerformance.animationCount);
  
  // Subscribe to performance changes
  useEffect(() => {
    const unsubscribeMode = animationPerformance.subscribePerformanceMode(mode => {
      setPerformanceMode(mode);
    });
    
    const unsubscribeFps = animationPerformance.subscribeFps(currentFps => {
      setFps(currentFps);
      setAnimationCount(animationPerformance.animationCount);
    });
    
    return () => {
      unsubscribeMode();
      unsubscribeFps();
    };
  }, []);
  
  return { performanceMode, fps, animationCount };
}