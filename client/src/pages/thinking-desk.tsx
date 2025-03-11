import { 
  LightbulbIcon, 
  NetworkIcon, 
  ClipboardListIcon, 
  FlaskConicalIcon 
} from "lucide-react";
import TabNavigation from "@/components/tab-navigation";
import BrainDump from "@/components/thinking-desk/brain-dump";
import ProblemTrees from "@/components/thinking-desk/problem-trees";
import DraftedPlans from "@/components/thinking-desk/drafted-plans-new";
import ClarityLab from "@/components/thinking-desk/clarity-lab";

const ThinkingDesk = () => {
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

  return (
    <section className="p-4 sm:p-6 max-w-6xl mx-auto pb-20 md:pb-8">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Thinking Desk</h1>
        <p className="text-gray-600 mt-2">Capture, organize, and refine your ideas</p>
      </header>

      <TabNavigation tabs={tabs} defaultTabId="brain-dump">
        <div id="brain-dump" className="tab-pane w-full">
          <BrainDump />
        </div>
        
        <div id="problem-trees" className="tab-pane w-full">
          <ProblemTrees />
        </div>
        
        <div id="drafted-plans" className="tab-pane w-full">
          <DraftedPlans />
        </div>
        
        <div id="clarity-lab" className="tab-pane w-full">
          <ClarityLab />
        </div>
      </TabNavigation>
    </section>
  );
};

export default ThinkingDesk;
