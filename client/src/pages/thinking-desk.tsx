import React, { useState, createContext, useContext } from "react";
import { 
  LightbulbIcon, 
  NetworkIcon, 
  ClipboardListIcon, 
  FlaskConicalIcon,
  BookOpenIcon,
  PlusIcon
} from "lucide-react";
import TabNavigation from "@/components/tab-navigation";
import BrainDump from "@/components/thinking-desk/brain-dump";
import ProblemTrees from "@/components/thinking-desk/problem-trees";
import { DraftedPlans } from "@/components/thinking-desk/drafted-plans-new";
import ClarityLab from "@/components/thinking-desk/clarity-lab";
import { PageHeader } from "@/components/ui/page-header";

// Create a context for Think Desk actions
interface ThinkingDeskContextType {
  activeTab: string;
  createProblemTree: () => void;
  createPlan: () => void;
  createClarityEntry: () => void;
}

export const ThinkingDeskContext = createContext<ThinkingDeskContextType>({
  activeTab: "brain-dump",
  createProblemTree: () => {},
  createPlan: () => {},
  createClarityEntry: () => {}
});

// Hook for components to consume the context
export const useThinkingDesk = () => useContext(ThinkingDeskContext);

const ThinkingDesk = () => {
  const [activeTab, setActiveTab] = useState("brain-dump");
  const [showNewProblemTree, setShowNewProblemTree] = useState(false);
  const [showNewPlan, setShowNewPlan] = useState(false);
  const [showNewClarityEntry, setShowNewClarityEntry] = useState(false);
  
  const tabs = [
    {
      id: "brain-dump",
      label: "Brain Dump",
      icon: LightbulbIcon,
    },
    {
      id: "problem-trees",
      label: "Problem Trees",
      icon: NetworkIcon,
    },
    {
      id: "drafted-plans",
      label: "Drafted Plans",
      icon: ClipboardListIcon,
    },
    {
      id: "clarity-lab",
      label: "Clarity Lab",
      icon: FlaskConicalIcon,
    }
  ];

  // Context value with action handlers
  const contextValue: ThinkingDeskContextType = {
    activeTab,
    createProblemTree: () => setShowNewProblemTree(true),
    createPlan: () => setShowNewPlan(true),
    createClarityEntry: () => setShowNewClarityEntry(true)
  };

  // Get action button configuration based on active tab
  const getAction = () => {
    switch (activeTab) {
      case "problem-trees":
        return {
          label: "New Problem Tree",
          onClick: () => contextValue.createProblemTree(),
          icon: <PlusIcon className="mr-2 h-4 w-4" />
        };
      case "drafted-plans":
        return {
          label: "New Plan",
          onClick: () => contextValue.createPlan(),
          icon: <PlusIcon className="mr-2 h-4 w-4" />
        };
      case "clarity-lab":
        return {
          label: "New Entry",
          onClick: () => contextValue.createClarityEntry(),
          icon: <PlusIcon className="mr-2 h-4 w-4" />
        };
      default:
        return undefined;
    }
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
            onClick: () => setActiveTab("Brain Dump"),
            icon: <PlusIcon className="mr-2 h-4 w-4" />,
            variant: "thinkingDesk"
          }}
        />

        <TabNavigation 
          tabs={tabs} 
          defaultTabId="brain-dump"
          onTabChange={(tabId: string) => setActiveTab(tabId)}
        >
          <div id="brain-dump" className="tab-pane w-full">
            <BrainDump />
          </div>
          
          <div id="problem-trees" className="tab-pane w-full">
            <ProblemTrees 
              showNewProblemTree={showNewProblemTree}
              onDialogClose={() => setShowNewProblemTree(false)}
              onEdit={(tree) => console.log('Edit problem tree', tree)}
            />
          </div>
          
          <div id="drafted-plans" className="tab-pane w-full">
            <DraftedPlans 
              showNewPlan={showNewPlan}
              onDialogClose={() => setShowNewPlan(false)}
              onEdit={(id) => console.log('Edit drafted plan', id)}
            />
          </div>
          
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
