import { ReactNode } from "react";
import Sidebar from "@/components/ui/sidebar";
import MobileNavigation from "@/components/layout/mobile-navigation";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Sidebar for desktop */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-6 max-w-full">
        {children}
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default AppLayout;
