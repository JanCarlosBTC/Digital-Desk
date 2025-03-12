import { Tabs, TabsContent } from "@/components/ui/tabs";
import WeeklyReflections from "@/components/personal-clarity/weekly-reflections";
import MonthlyCheckIns from "@/components/personal-clarity/monthly-check-ins";
import PrioritiesTracker from "@/components/personal-clarity/priorities-tracker";
import "@/components/personal-clarity/button-styles.css";

const PersonalClaritySystem = () => {
  return (
    <section className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Personal Clarity System</h1>
        <p className="text-gray-600 mt-2">Track your progress, reflections, and priorities</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Reflections and Monthly Check-ins */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyReflections />
          <MonthlyCheckIns />
        </div>
        
        {/* What Matters Most Tracker */}
        <div className="lg:col-span-1">
          <PrioritiesTracker />
        </div>
      </div>
    </section>
  );
};

export default PersonalClaritySystem;
