import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

/**
 * PageTransition component provides smooth transitions between pages
 * Uses Framer Motion for fluid animations and supports different transition styles
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ 
  children, 
  locationKey 
}) => {
  // Animation variants for page transitions
  const pageVariants = {
    initial: {
      opacity: 0,
      y: 8,
      scale: 0.98
    },
    in: {
      opacity: 1,
      y: 0,
      scale: 1
    },
    out: {
      opacity: 0,
      y: -8,
      scale: 0.98
    }
  };

  // Timing for transitions
  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.3
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
        className="w-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Hook that provides the current location key for page transitions
 * Creates a stable key that changes when the route changes
 */
export const useLocationKey = (): string => {
  const [location] = useLocation();
  // Using the pathname as the key for the transition
  return location;
};