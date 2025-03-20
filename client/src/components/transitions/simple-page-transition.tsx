import React, { ReactNode, memo, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useLocation } from 'wouter';
import { pageTransitionVariants, transitions } from './animation-config';

interface PageTransitionProps {
  children: ReactNode;
  mode?: 'wait' | 'sync';
  motionKey?: string;
}

/**
 * Enhanced PageTransition component provides smooth transitions between pages
 * Uses Framer Motion for fluid animations with optimized performance
 */
export const PageTransition = memo<PageTransitionProps>(({ 
  children, 
  mode = 'wait',
  motionKey
}) => {
  const [location] = useLocation();
  const shouldReduceMotion = useReducedMotion();
  
  // Use location as motion key for transitions
  const key = motionKey || location;
  
  // Configure transition with respect to reduced motion preferences
  const transitionConfig = useMemo(() => ({
    ...transitions.default,
    duration: shouldReduceMotion ? 0.1 : 0.3,
  }), [shouldReduceMotion]);

  return (
    <AnimatePresence mode={mode}>
      <motion.div
        key={key}
        initial={shouldReduceMotion ? { opacity: 0 } : pageTransitionVariants.initial}
        animate={shouldReduceMotion ? { opacity: 1 } : pageTransitionVariants.animate}
        exit={shouldReduceMotion ? { opacity: 0 } : pageTransitionVariants.exit}
        transition={transitionConfig}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
});

PageTransition.displayName = 'PageTransition';