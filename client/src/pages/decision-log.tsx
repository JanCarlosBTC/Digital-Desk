import { useState } from "react";
import DecisionList from "@/components/decision-log/decision-list";
import DecisionForm from "@/components/decision-log/decision-form";
import { useQuery } from "@tanstack/react-query";
import { Decision } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

const DecisionLog = () => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  // Fetch decisions
  const { data: decisions, isLoading } = useQuery<Decision[]>({
    queryKey: ['/api/decisions'],
  });

  // Reset selected decision when opening the dialog for a new decision
  const handleNewDecisionClick = () => {
    setSelectedDecision(null);
    setDialogOpen(true);
  };

  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex justify-between items-center mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Decision Log Dashboard</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewDecisionClick}
              className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium"
            >
              <PlusIcon className="mr-1 h-4 w-4" /> New Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DecisionForm 
              selectedDecision={selectedDecision} 
              onSuccess={() => setDialogOpen(false)}
              isDialog={true}
            />
          </DialogContent>
        </Dialog>
      </div>

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
            onNewDecisionClick={() => setDialogOpen(true)}
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
