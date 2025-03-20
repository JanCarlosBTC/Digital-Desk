import React, { ReactNode, memo, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence, useReducedMotion, Variant } from 'framer-motion';
import { useLocation } from 'wouter';
import { 
  pageTransitionVariants, 
  transitions, 
  easingFunctions, 
  createCustomVariant 
} from './animation-config';

// Define different page transition types
export type PageTransitionType = 
  | 'fade' 
  | 'slide-horizontal' 
  | 'slide-vertical'
  | 'scale'
  | 'flip'
  | 'none';

// Props for the PageTransition component with enhanced options
interface PageTransitionProps {
  children: ReactNode;
  mode?: 'wait' | 'sync';
  motionKey?: string;
  type?: PageTransitionType;
  duration?: number;
  delay?: number;
  fallback?: ReactNode;
  layoutId?: string;
  customVariants?: {
    initial?: Variant;
    animate?: Variant;
    exit?: Variant;
  };
  onAnimationComplete?: () => void;
  onExitComplete?: () => void;
}

// Loading fallback component
const DefaultFallback = () => (
  <div className="w-full h-full flex items-center justify-center p-8">
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
  </div>
);

/**
 * Enhanced PageTransition component provides smooth transitions between pages
 * Uses Framer Motion for fluid animations with optimized performance
 * Includes advanced transition types and lazy loading support
 */
export const PageTransition = memo<PageTransitionProps>(({ 
  children, 
  mode = 'wait',
  motionKey,
  type = 'fade',
  duration = 0.3,
  delay = 0,
  fallback = <DefaultFallback />,
  layoutId,
  customVariants,
  onAnimationComplete,
  onExitComplete
}) => {
  const [location] = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  // Use location as motion key for transitions
  const key = motionKey || location;
  
  // Define specialized variants based on transition type
  const transitionVariants = useMemo(() => {
    // If user prefers reduced motion, use simple fade
    if (shouldReduceMotion) {
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    }
    
    // Use custom variants if provided
    if (customVariants) {
      return createCustomVariant(
        customVariants.initial || {},
        customVariants.animate || {},
        customVariants.exit || {}
      );
    }
    
    // Select transition variant based on type
    switch (type) {
      case 'fade':
        return pageTransitionVariants;
        
      case 'slide-horizontal':
        return createCustomVariant(
          { opacity: 0, x: 30 },
          { opacity: 1, x: 0 },
          { opacity: 0, x: -30 }
        );
        
      case 'slide-vertical':
        return createCustomVariant(
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0 },
          { opacity: 0, y: -30 }
        );
        
      case 'scale':
        return createCustomVariant(
          { opacity: 0, scale: 0.9 },
          { opacity: 1, scale: 1 },
          { opacity: 0, scale: 1.1 }
        );
        
      case 'flip':
        return createCustomVariant(
          { opacity: 0, rotateX: 90, perspective: 1000 },
          { opacity: 1, rotateX: 0, perspective: 1000 },
          { opacity: 0, rotateX: -90, perspective: 1000 }
        );
        
      case 'none':
        return createCustomVariant({}, {}, {});
        
      default:
        return pageTransitionVariants;
    }
  }, [type, shouldReduceMotion, customVariants]);
  
  // Configure transition with respect to type and preferences
  const transitionConfig = useMemo(() => {
    if (shouldReduceMotion) {
      return {
        duration: 0.1,
        ease: easingFunctions.easeOut
      };
    }
    
    // Specialized transitions based on type
    switch (type) {
      case 'fade':
        return {
          ...transitions.default,
          duration,
          delay
        };
        
      case 'slide-horizontal':
      case 'slide-vertical':
        return {
          type: 'spring' as const,
          stiffness: 350,
          damping: 30,
          delay
        };
        
      case 'scale':
        return {
          type: 'spring' as const,
          stiffness: 300,
          damping: 25,
          delay
        };
        
      case 'flip':
        return {
          type: 'spring' as const,
          stiffness: 400,
          damping: 35,
          delay
        };
        
      case 'none':
        return {
          duration: 0,
          delay: 0
        };
        
      default:
        return {
          ...transitions.default,
          duration,
          delay
        };
    }
  }, [type, duration, delay, shouldReduceMotion]);

  return (
    <AnimatePresence 
      mode={mode} 
      onExitComplete={onExitComplete}
    >
      <motion.div
        key={key}
        layoutId={layoutId}
        initial={transitionVariants.initial}
        animate={transitionVariants.animate}
        exit={transitionVariants.exit}
        transition={transitionConfig}
        onAnimationComplete={onAnimationComplete}
        className="w-full h-full"
      >
        <Suspense fallback={fallback}>
          {children}
        </Suspense>
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';

/**
 * LazyPageTransition - A wrapper around PageTransition for component code-splitting
 * Automatically handles Suspense and fallback UI for lazily loaded components
 */
interface LazyPageTransitionProps extends PageTransitionProps {
  component: React.LazyExoticComponent<React.ComponentType<any>>;
  componentProps?: Record<string, any>;
}

export const LazyPageTransition = memo<LazyPageTransitionProps>(({
  component: Component,
  componentProps = {},
  fallback = <DefaultFallback />,
  ...pageTransitionProps
}) => {
  return (
    <PageTransition {...pageTransitionProps} fallback={fallback}>
      <Component {...componentProps} />
    </PageTransition>
  );
});

LazyPageTransition.displayName = 'LazyPageTransition';