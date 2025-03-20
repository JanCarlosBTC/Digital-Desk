/**
 * Thinking Desk Page (Current Implementation)
 * 
 * This is the current active implementation of the Thinking Desk page.
 * It replaces the original thinking-desk.tsx implementation with a more
 * stable and maintainable architecture.
 * 
 * Key improvements:
 * - Uses the FixedProblemTrees component from thinking-desk-new
 * - Cleaner context implementation
 * - Better state management
 * - More consistent UI patterns
 */

import React, { useState } from "react";
import { 
  LightbulbIcon, 
  NetworkIcon, 
  ClipboardListIcon, 
  FlaskConicalIcon,
  PlusIcon
} from "lucide-react";
import TabNavigation from "@/components/tab-navigation";
import BrainDump from "@/components/thinking-desk/brain-dump";
import { DraftedPlans } from "@/components/thinking-desk/drafted-plans-new";
import ClarityLab from "@/components/thinking-desk/clarity-lab";
import { PageHeader } from "@/components/ui/page-header";
import ProblemTrees from "@/components/thinking-desk/problem-trees";

// Create context for ThinkingDesk 
interface ThinkingDeskContextType {
  activeTab: string;
  createProblemTree: () => void;
  createPlan: () => void;
  createClarityEntry: () => void;
}

const defaultContext: ThinkingDeskContextType = {
  activeTab: "brain-dump",
  createProblemTree: () => {},
  createPlan: () => {},
  createClarityEntry: () => {}
};

export const ThinkingDeskContext = React.createContext<ThinkingDeskContextType>(defaultContext);

// Hook for consuming context
export const useThinkingDesk = () => React.useContext(ThinkingDeskContext);

const ThinkingDesk = () => {
  // State
  const [activeTab, setActiveTab] = useState("brain-dump");
  const [showNewProblemTree, setShowNewProblemTree] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showNewClarityEntry, setShowNewClarityEntry] = useState(false);
  
  // Tab configuration
  const tabs = [
    { id: "brain-dump", label: "Brain Dump", icon: LightbulbIcon },
    { id: "problem-trees", label: "Problem Trees", icon: NetworkIcon },
    { id: "drafted-plans", label: "Drafted Plans", icon: ClipboardListIcon },
    { id: "clarity-lab", label: "Clarity Lab", icon: FlaskConicalIcon }
  ];

  // Context value
  const contextValue = {
    activeTab,
    createProblemTree: () => setShowNewProblemTree(true),
    createPlan: () => setShowNewPlan(true),
    createClarityEntry: () => setShowNewClarityEntry(true)
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

        <TabNavigation 
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
            <ProblemTrees 
              showNewProblemTree={showNewProblemTree}
              onDialogClose={() => setShowNewProblemTree(false)}
            />
          </div>
          
          {/* Drafted Plans Tab */}
          <div id="drafted-plans" className="tab-pane w-full">
            <DraftedPlans 
              showNewPlan={showNewPlan}
              onDialogClose={() => setShowNewPlan(false)}
            />
          </div>
          
          {/* Clarity Lab Tab */}
          <div id="clarity-lab" className="tab-pane w-full">
            <ClarityLab 
              showNewEntry={showNewClarityEntry}
              onDialogClose={() => setShowNewClarityEntry(false)}
            />
          </div>
        </TabNavigation>
      </section>
    </ThinkingDeskContext.Provider>
  );
};

export default ThinkingDesk;