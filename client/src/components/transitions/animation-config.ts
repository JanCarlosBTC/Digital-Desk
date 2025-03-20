/**
 * Animation Configuration
 * Centralized animation variants and configurations for consistent animations across the application
 */
import { MotionProps } from 'framer-motion';
import { MicroInteractionType } from './micro-interactions';

// Define types for animation configurations
export interface AnimationVariant {
  initial: Record<string, any>;
  animate: Record<string, any>;
  exit?: Record<string, any>;
  whileHover?: Record<string, any>;
}

export interface TransitionConfig {
  type?: string;
  duration?: number;
  delay?: number;
  ease?: string | number[];
  staggerChildren?: number;
  delayChildren?: number;
}

// Standard transition configurations
export const transitions = {
  default: {
    duration: 0.3,
    ease: 'easeOut'
  },
  spring: {
    type: 'spring',
    stiffness: 400,
    damping: 30
  },
  slow: {
    duration: 0.6,
    ease: 'easeInOut'
  },
  stagger: {
    staggerChildren: 0.1,
    delayChildren: 0.2
  }
};

// Animation variants for micro-interactions
export const microAnimationVariants: Record<MicroInteractionType, AnimationVariant> = {
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  'scale': {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    whileHover: { scale: 1.05 }
  },
  'pop': {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
    whileHover: { scale: 1.1 }
  },
  'none': {
    initial: {},
    animate: {}
  }
};

// Page transition configurations
export const pageTransitionVariants: AnimationVariant = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 }
};

// Layout element animations
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
  }
};

// Card and list item animations
export const cardAnimations: MotionProps = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { ...transitions.default },
  whileHover: { y: -5, transition: { duration: 0.2 } }
};

// Staggered list animations
export const staggeredListAnimations = {
  container: {
    initial: {},
    animate: { transition: transitions.stagger },
    exit: {}
  },
  item: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  }
};

// Button animations
export const buttonAnimations: MotionProps = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 },
  transition: { duration: 0.2 }
};

// Dialog animations
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
    transition: { ...transitions.default }
  }
};

// Form field animations
export const formFieldAnimations = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { ...transitions.default }
};

/**
 * Get animation variants based on type with proper type safety
 */
export function getAnimationVariant(type: MicroInteractionType): AnimationVariant {
  return microAnimationVariants[type] || microAnimationVariants.none;
}