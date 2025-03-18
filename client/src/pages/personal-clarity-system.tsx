import React from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import WeeklyReflections from "@/components/personal-clarity/weekly-reflections";
import WeeklyReflectionLog from "@/components/personal-clarity/weekly-reflection-log";
import MonthlyCheckIns from "@/components/personal-clarity/monthly-check-ins";
import PrioritiesTracker from "@/components/personal-clarity/priorities-tracker";
import "@/components/personal-clarity/button-styles.css";
import { PageHeader } from "@/components/ui/page-header";
import { BrainIcon, Compass, CalendarIcon } from "lucide-react";

const PersonalClaritySystem = () => {
  return (
    <section className="p-6 max-w-6xl mx-auto">
      <PageHeader
        title="Personal Clarity System"
        description="Track your priorities and reflect on your progress."
        icon={<Compass className="h-8 w-8" />}
        action={{
          label: "Monthly Check-in",
          onClick: () => { /* Your action here */ },
          icon: <CalendarIcon className="mr-2 h-4 w-4" />,
          variant: "personalClarity"
        }}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Reflections, Weekly Reflection Log, and Monthly Check-ins */}
        <div className="lg:col-span-2 space-y-6">
          <WeeklyReflections />
          <WeeklyReflectionLog />
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
