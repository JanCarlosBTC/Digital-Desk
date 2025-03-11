import { useState, ReactNode, Children, isValidElement } from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface Tab {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface TabNavigationProps {
  tabs: Tab[];
  defaultTabId?: string;
  children: ReactNode;
}

const TabNavigation = ({ tabs, defaultTabId = "", children }: TabNavigationProps) => {
  const [activeTab, setActiveTab] = useState(defaultTabId || tabs[0]?.id || "");

  // Filter React children to only show the active tab
  const childrenArray = Children.toArray(children);
  const activeChild = childrenArray.find((child) => {
    if (!isValidElement(child)) return false;
    return child.props.id === activeTab;
  });

  return (
    <div className="w-full">
      {/* Tab Navigation - Scrollable on mobile */}
      <div className="border-b border-gray-200 mb-6 overflow-x-auto">
        <ul className="flex whitespace-nowrap -mb-px min-w-full">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.id === activeTab;
            
            return (
              <li key={tab.id} className="mr-2">
                <button
                  className={cn(
                    "inline-flex items-center px-4 py-2 font-medium text-sm border-b-2 rounded-t-lg",
                    isActive 
                      ? "border-primary text-primary" 
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  )}
                  onClick={() => setActiveTab(tab.id)}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {tab.label}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      
      {/* Tab Content - Fully scrollable */}
      <div className="tab-content w-full overflow-visible">
        {activeChild}
      </div>
    </div>
  );
};

export default TabNavigation;
