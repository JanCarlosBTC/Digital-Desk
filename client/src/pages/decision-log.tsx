import { useState } from "react";
import DecisionList from "@/components/decision-log/decision-list";
import DecisionForm from "@/components/decision-log/decision-form";
import { useQuery } from "@tanstack/react-query";
import { Decision } from "@shared/schema";

const DecisionLog = () => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  
  // Fetch decisions
  const { data: decisions, isLoading } = useQuery<Decision[]>({
    queryKey: ['/api/decisions'],
  });

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Decision Log</h1>
        <p className="text-gray-600 mt-2">Record, track, and learn from your decisions</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Decision List */}
        <div className="lg:col-span-2">
          <DecisionList 
            decisions={decisions || []} 
            isLoading={isLoading} 
            setSelectedDecision={setSelectedDecision}
          />
        </div>
        
        {/* Decision Form */}
        <div className="lg:col-span-1">
          <DecisionForm selectedDecision={selectedDecision} />
        </div>
      </div>
    </section>
  );
};

export default DecisionLog;
