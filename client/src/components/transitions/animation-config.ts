/**
 * Animation Configuration
 * Centralized animation variants and configurations for consistent animations across the application
 * Enhanced with optimized timing functions and advanced animation variants
 */
import { MotionProps, Variant, Transition } from 'framer-motion';
import { MicroInteractionType } from './micro-interactions';

// Define types for animation configurations with improved type safety
export interface AnimationVariant {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  whileHover?: Record<string, any>;
  whileTap?: Record<string, any>;
  whileFocus?: Record<string, any>;
  whileDrag?: Record<string, any>;
}

export interface TransitionConfig {
  type?: "tween" | "spring" | "inertia" | "just";
  duration?: number;
  delay?: number;
  ease?: string | number[] | ((t: number) => number);
  staggerChildren?: number;
  delayChildren?: number;
  staggerDirection?: number;
  when?: "beforeChildren" | "afterChildren" | false;
}

// Enhanced easing functions for more natural and polished animations
export const easingFunctions = {
  // Standard easings
  easeOut: [0.2, 0, 0.15, 1],   // Optimized easeOut
  easeIn: [0.6, 0.05, 1, 0.3],  // Optimized easeIn
  easeInOut: [0.65, 0, 0.35, 1],  // Optimized easeInOut
  
  // Custom advanced easings
  anticipate: [0.68, -0.6, 0.32, 1.6],  // Slight overshoot at end
  gentleBounce: [0.175, 0.885, 0.32, 1.5],  // Gentle bounce
  strongBounce: [0.68, -0.55, 0.265, 1.55],  // More pronounced bounce  
  quickStart: [0.05, 0.7, 0.1, 1],  // Quick start, smooth end
  quickEnd: [0.9, 0, 0.1, 1],  // Smooth start, quick end
  elastic: [0.68, -0.55, 0.27, 1.55],  // Elastic motion
  
  // Custom function-based easings
  overshoot: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (2 * Math.PI) / 3),
  backOut: (t: number) => 1 + 2.70158 * Math.pow(t - 1, 3) + 1.70158 * Math.pow(t - 1, 2)
};

// Standard transition configurations
export const transitions = {
  // Basic transitions
  default: {
    duration: 0.3,
    ease: easingFunctions.easeOut
  },
  
  // Spring physics based transitions
  spring: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 30,
    mass: 1
  },
  
  gentleSpring: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 40,
    mass: 1.2,
    restDelta: 0.01
  },
  
  bouncySpring: {
    type: 'spring' as const,
    stiffness: 550,
    damping: 20,
    mass: 1,
    velocity: 5
  },
  
  // Timing based transitions
  slow: {
    duration: 0.6,
    ease: easingFunctions.easeInOut
  },
  
  quick: {
    duration: 0.2,
    ease: easingFunctions.quickEnd
  },
  
  elastic: {
    duration: 0.5,
    ease: easingFunctions.elastic
  },
  
  // Staggered transitions
  stagger: {
    staggerChildren: 0.1,
    delayChildren: 0.2,
    when: 'beforeChildren' as const
  },
  
  quickStagger: {
    staggerChildren: 0.05,
    delayChildren: 0.1,
    when: 'beforeChildren' as const,
    staggerDirection: 1
  },
  
  // Delayed transitions
  delayed: {
    duration: 0.4,
    delay: 0.2,
    ease: easingFunctions.easeOut
  }
};

// Enhanced animation variants for micro-interactions with improved timing
export const microAnimationVariants: Record<MicroInteractionType, AnimationVariant> = {
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    whileHover: { y: -3 }
  },
  
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 },
    whileHover: { y: 3 }
  },
  
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
    whileHover: { x: -3 }
  },
  
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 },
    whileHover: { x: 3 }
  },
  
  'scale': {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.98 }
  },
  
  'pop': {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.95 }
  },
  
  'none': {
    initial: {},
    animate: {}
  }
};

// Advanced specialized variants for different UI elements
// Page transition configurations
export const pageTransitionVariants: AnimationVariant = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

// Layout element animations with optimized timing
export const layoutAnimations = {
  sidebar: {
    initial: { x: -20, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    transition: { ...transitions.default, delay: 0.1 }
  },
  
  mainContent: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    transition: { ...transitions.default, delay: 0.2 }
  },
  
  mobileNav: {
    initial: { y: 20, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { ...transitions.default, delay: 0.3 }
  },
  
  header: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...transitions.default, delay: 0.05 }
  },
  
  footer: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { ...transitions.default, delay: 0.4 }
  }
};

// Enhanced card animations with hover effects
export const cardAnimations: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { 
    ...transitions.default,
    opacity: { duration: 0.4 },
    y: { type: "spring", stiffness: 300, damping: 25 }
  },
  whileHover: { 
    y: -5, 
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    transition: { duration: 0.2, ease: easingFunctions.easeOut } 
  }
};

// Staggered list animations with customized timing
export const staggeredListAnimations = {
  container: {
    initial: {},
    animate: { transition: transitions.stagger },
    exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
  },
  
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  
  // Quick list for performance-critical lists
  quickContainer: {
    initial: {},
    animate: { transition: transitions.quickStagger },
    exit: {}
  },
  
  quickItem: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }
};

// Enhanced button animations with tap feedback
export const buttonAnimations: MotionProps = {
  whileHover: { scale: 1.05, transition: { duration: 0.2 } },
  whileTap: { scale: 0.95, transition: { duration: 0.1 } },
  transition: { 
    duration: 0.2, 
    scale: { 
      type: "spring", 
      stiffness: 500, 
      damping: 30 
    }
  }
};

// Dialog/modal animations with backdrop interactions
export const dialogAnimations = {
  overlay: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { ...transitions.default }
  },
  
  content: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.95 },
    transition: { 
      duration: 0.3, 
      scale: { type: "spring", stiffness: 400, damping: 30 },
      opacity: { duration: 0.25 }
    }
  },
  
  // For alerts or notifications
  alert: {
    initial: { opacity: 0, y: -50, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    transition: { 
      type: "spring",
      stiffness: 500,
      damping: 30
    }
  }
};

// Form field animations with focus interactions
export const formFieldAnimations = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
  transition: { ...transitions.default },
  whileFocus: { scale: 1.01 },
  whileTap: { scale: 0.98 }
};

// Navigation menu animations
export const menuAnimations = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { staggerChildren: 0.05 }
  },
  
  item: {
    initial: { opacity: 0, x: -10 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 10 },
    whileHover: { x: 5 }
  },
  
  dropdown: {
    initial: { opacity: 0, height: 0, scaleY: 0, originY: 0 },
    animate: { opacity: 1, height: "auto", scaleY: 1 },
    exit: { opacity: 0, height: 0, scaleY: 0 },
    transition: { duration: 0.2, ease: easingFunctions.easeInOut }
  }
};

// Toast/notification animations
export const toastAnimations = {
  container: {
    initial: { opacity: 0, y: 50, scale: 0.8 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 20, scale: 0.9 },
    transition: { 
      type: "spring",
      damping: 25,
      stiffness: 350
    }
  }
};

// Get animation variants based on type with proper type safety
export function getAnimationVariant(type: MicroInteractionType): AnimationVariant {
  return microAnimationVariants[type] || microAnimationVariants.none;
}

// Helper to combine animation variants
export function combineAnimationVariants(
  baseVariant: AnimationVariant,
  overrides: Partial<AnimationVariant>
): AnimationVariant {
  return {
    initial: { ...baseVariant.initial, ...overrides.initial },
    animate: { ...baseVariant.animate, ...overrides.animate },
    exit: { ...(baseVariant.exit || {}), ...(overrides.exit || {}) },
    whileHover: { ...(baseVariant.whileHover || {}), ...(overrides.whileHover || {}) },
    whileTap: { ...(baseVariant.whileTap || {}), ...(overrides.whileTap || {}) },
    whileFocus: { ...(baseVariant.whileFocus || {}), ...(overrides.whileFocus || {}) },
    whileDrag: { ...(baseVariant.whileDrag || {}), ...(overrides.whileDrag || {}) },
  };
}

// Helper to create custom animation variants
export function createCustomVariant(
  initialProps: Record<string, any> = {},
  animateProps: Record<string, any> = {},
  exitProps: Record<string, any> = {},
  interactionProps: Partial<AnimationVariant> = {}
): AnimationVariant {
  return {
    initial: initialProps,
    animate: animateProps,
    exit: exitProps,
    ...interactionProps
  };
}