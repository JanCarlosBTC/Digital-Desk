import React, { ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';

interface PageTransitionProps {
  children: ReactNode;
}

/**
 * Simple PageTransition component provides smooth transitions between pages
 * Uses Framer Motion for fluid animations
 */
export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const [location] = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ type: 'tween', ease: 'easeInOut', duration: 0.3 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};