import React, { ReactNode, memo } from "react";
import Sidebar from "@/components/ui/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { motion, useReducedMotion } from "framer-motion";
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
  
  // Use simple fade animation or the defined animations based on preference
  const sidebarAnimation = shouldReduceMotion 
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }}
    : layoutAnimations.sidebar;
    
  const mainContentAnimation = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }}
    : layoutAnimations.mainContent;
    
  const mobileNavAnimation = shouldReduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }}
    : layoutAnimations.mobileNav;
  
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for desktop with subtle slide animation */}
      <motion.div
        {...sidebarAnimation}
        className="hidden md:block"
      >
        <Sidebar />
      </motion.div>
      
      {/* Main Content Area with fade animation */}
      <motion.main 
        className="flex-1 overflow-y-auto pb-24 md:pb-6 max-w-full"
        {...mainContentAnimation}
      >
        {children}
      </motion.main>
      
      {/* Mobile Navigation with slide up animation */}
      <motion.div
        className="md:hidden"
        {...mobileNavAnimation}
      >
        <MobileNavigation />
      </motion.div>
    </div>
  );
});

AppLayout.displayName = 'AppLayout';

export default AppLayout;
