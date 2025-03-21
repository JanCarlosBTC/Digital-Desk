/**
 * Thinking Desk Page
 * 
 * A page that provides various tools for structured thinking and problem analysis.
 * Contains: Brain Dump, Problem Trees, Drafted Plans, and Clarity Lab
 */

import React, { useState, createContext, useContext } from "react";
import { 
  LightbulbIcon, 
  NetworkIcon, 
  ClipboardListIcon, 
  FlaskConicalIcon,
  PlusIcon
} from "lucide-react";
import TabNavigationWrapper from "@/components/thinking-desk/tab-navigation-wrapper";
import BrainDump from "@/components/thinking-desk/brain-dump";
import { DraftedPlans } from "@/components/thinking-desk/drafted-plans";
import ClarityLab from "@/components/thinking-desk/clarity-lab";
import { PageHeader } from "@/components/ui/page-header";
import ProblemTrees from "@/components/thinking-desk/problem-trees";
import { AuthRequired } from "@/components/auth/auth-required";

// Context type for sharing state across thinking desk components
interface ThinkingDeskContextType {
  showNewProblemTree: boolean;
  setShowNewProblemTree: (show: boolean) => void;
  showNewPlan: boolean;
  setShowNewPlan: (show: boolean) => void;
  showNewClarityEntry: boolean;
  setShowNewClarityEntry: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

// Create the context with default values
export const ThinkingDeskContext = createContext<ThinkingDeskContextType>({
  showNewProblemTree: false,
  setShowNewProblemTree: () => {},
  showNewPlan: false,
  setShowNewPlan: () => {},
  showNewClarityEntry: false,
  setShowNewClarityEntry: () => {},
  activeTab: "brain-dump",
  setActiveTab: () => {}
});

// Custom hook for components to use the ThinkingDesk context
export const useThinkingDesk = () => useContext(ThinkingDeskContext);

export default function ThinkingDesk() {
  // State for controlling dialog visibility
  const [showNewProblemTree, setShowNewProblemTree] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showNewClarityEntry, setShowNewClarityEntry] = useState(false);
  const [activeTab, setActiveTab] = useState("brain-dump");

  // Define the tabs for the navigation
  const tabs = [
    {
      id: "brain-dump",
      label: "Brain Dump",
      icon: LightbulbIcon
    },
    {
      id: "problem-trees",
      label: "Problem Trees",
      icon: NetworkIcon
    },
    {
      id: "drafted-plans",
      label: "Drafted Plans",
      icon: ClipboardListIcon
    },
    {
      id: "clarity-lab",
      label: "Clarity Lab",
      icon: FlaskConicalIcon
    }
  ];

  // Context value for sharing state with child components
  const contextValue: ThinkingDeskContextType = {
    showNewProblemTree,
    setShowNewProblemTree,
    showNewPlan,
    setShowNewPlan,
    showNewClarityEntry,
    setShowNewClarityEntry,
    activeTab,
    setActiveTab
  };

  return (
    <ThinkingDeskContext.Provider value={contextValue}>
      <section className="p-4 sm:p-6 max-w-6xl mx-auto pb-20 md:pb-8">
        <PageHeader
          title="Thinking Desk"
          description="Organize your thinking and develop new ideas."
          icon={<LightbulbIcon className="h-8 w-8" />}
          action={{
            label: "New Item",
            onClick: () => setActiveTab("brain-dump"),
            icon: <PlusIcon className="mr-2 h-4 w-4" />,
            variant: "thinkingDesk"
          }}
        />

        <TabNavigationWrapper 
          tabs={tabs} 
          defaultTabId="brain-dump"
          onTabChange={(tabId: string) => setActiveTab(tabId)}
        >
          {/* Brain Dump Tab */}
          <div id="brain-dump" className="tab-pane w-full">
            <BrainDump />
          </div>
          
          {/* Problem Trees Tab */}
          <div id="problem-trees" className="tab-pane w-full">
            <AuthRequired>
              <ProblemTrees 
                showNewProblemTree={showNewProblemTree}
                onDialogClose={() => setShowNewProblemTree(false)}
              />
            </AuthRequired>
          </div>
          
          {/* Drafted Plans Tab */}
          <div id="drafted-plans" className="tab-pane w-full">
            <AuthRequired>
              <DraftedPlans 
                showNewPlan={showNewPlan}
                onDialogClose={() => setShowNewPlan(false)}
              />
            </AuthRequired>
          </div>
          
          {/* Clarity Lab Tab */}
          <div id="clarity-lab" className="tab-pane w-full">
            <AuthRequired>
              <ClarityLab 
                showNewEntry={showNewClarityEntry}
                onDialogClose={() => setShowNewClarityEntry(false)}
              />
            </AuthRequired>
          </div>
        </TabNavigationWrapper>
      </section>
    </ThinkingDeskContext.Provider>
  );
}