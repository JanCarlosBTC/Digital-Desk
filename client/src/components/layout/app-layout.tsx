import React, { ReactNode } from "react";
import Sidebar from "@/components/ui/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";
import { motion } from "framer-motion";

interface AppLayoutProps {
  children: ReactNode;
}

/**
 * AppLayout component with enhanced animations for a smoother user experience
 * Uses Framer Motion for subtle animations
 */
const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for desktop with subtle slide animation */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="hidden md:block"
      >
        <Sidebar />
      </motion.div>
      
      {/* Main Content Area with fade animation */}
      <motion.main 
        className="flex-1 overflow-y-auto pb-24 md:pb-6 max-w-full"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
      >
        {children}
      </motion.main>
      
      {/* Mobile Navigation with slide up animation */}
      <motion.div
        className="md:hidden"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
      >
        <MobileNavigation />
      </motion.div>
    </div>
  );
};

export default AppLayout;
