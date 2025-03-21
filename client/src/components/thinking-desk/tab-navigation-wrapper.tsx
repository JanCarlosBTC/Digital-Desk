import React, { ReactNode } from "react";
import TabNavigation from "@/components/tab-navigation";
import { LucideIcon } from "lucide-react";

// Define a wrapper for TabNavigation that accepts React elements for icons
interface SimpleTab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationWrapperProps {
  tabs: SimpleTab[];
  defaultTabId?: string;
  children: ReactNode;
  onTabChange?: (tabId: string) => void;
}

const TabNavigationWrapper = ({ 
  tabs, 
  defaultTabId, 
  children, 
  onTabChange 
}: TabNavigationWrapperProps) => {
  return (
    <TabNavigation
      tabs={tabs}
      defaultTabId={defaultTabId}
      onTabChange={onTabChange}
    >
      {children}
    </TabNavigation>
  );
};

export default TabNavigationWrapper;