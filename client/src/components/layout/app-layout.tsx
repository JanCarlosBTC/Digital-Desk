import React, { ReactNode, memo, useCallback } from "react";
import Sidebar from "@/components/ui/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { LazyMotion, domAnimation, m as motion, useReducedMotion } from "framer-motion";
import { layoutAnimations } from "@/components/transitions/animation-config";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout component with enhanced animations for a smoother user experience
 * Uses Framer Motion for subtle animations with performance optimizations
 */
const AppLayout = memo<AppLayoutProps>(({ children }) => {
  // Check for user's reduced motion preference
  const shouldReduceMotion = useReducedMotion();
  
  // Memoize animation objects to prevent unnecessary recalculations
  const getAnimations = useCallback(() => {
    // Use simple fade animation or the defined animations based on preference
    return {
      sidebarAnimation: shouldReduceMotion 
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }}
        : layoutAnimations.sidebar,
        
      mainContentAnimation: shouldReduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.3 }}
        : layoutAnimations.mainContent,
        
      mobileNavAnimation: shouldReduceMotion
        ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.2 }}
        : layoutAnimations.mobileNav
    };
  }, [shouldReduceMotion]);
  
  const { sidebarAnimation, mainContentAnimation, mobileNavAnimation } = getAnimations();
  
  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col md:flex-row min-h-screen bg-background">
        {/* Sidebar for desktop with subtle slide animation */}
        <motion.div
          {...sidebarAnimation}
          className="hidden md:block sticky top-0 h-screen"
        >
          <Sidebar />
        </motion.div>
        
        {/* Main Content Area with fade animation */}
        <motion.main 
          className="flex-1 overflow-x-hidden overflow-y-auto pb-24 md:pb-6 max-w-full"
          {...mainContentAnimation}
        >
          <div className="container mx-auto px-4 py-6 md:px-6 max-w-7xl">
            {children}
          </div>
        </motion.main>
        
        {/* Mobile Navigation with slide up animation */}
        <motion.div
          className="md:hidden"
          {...mobileNavAnimation}
        >
          <MobileNavigation />
        </motion.div>
      </div>
    </LazyMotion>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;
