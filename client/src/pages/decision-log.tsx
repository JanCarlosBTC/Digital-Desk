import React, { useState } from "react";
import DecisionList from "@/components/decision-log/decision-list";
import DecisionForm from "@/components/decision-log/decision-form";
import { useQuery } from "@tanstack/react-query";
import { Decision } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";

const DecisionLog = () => {
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingDecision, setViewingDecision] = useState<Decision | null>(null);
  
  // Fetch decisions
  const { data: decisions, isLoading } = useQuery<Decision[]>({
    queryKey: ['/api/decisions'],
  });

  // Reset selected decision when opening the dialog for a new decision
  const handleNewDecisionClick = () => {
    setSelectedDecision(null);
    setDialogOpen(true);
  };

  // Handle view details click
  const handleViewDetailsClick = (decision: Decision) => {
    setViewingDecision(decision);
    setViewDialogOpen(true);
  };

  return (
    <section className="p-6 max-w-6xl mx-auto">
      {/* Top Action Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-white rounded-lg shadow-sm p-4 border border-gray-100">
        <h2 className="text-lg font-medium text-gray-800">Decision Log Dashboard</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={handleNewDecisionClick}
              className="bg-emerald-500 text-white hover:bg-emerald-600 transition-colors font-medium h-10 px-4 py-2 flex items-center"
            >
              <PlusIcon className="mr-1 h-4 w-4" /> New Decision
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader className="pb-4 border-b">
              <DialogTitle className="text-2xl font-semibold text-gray-800">
                {selectedDecision ? "Edit Decision" : "Log a New Decision"}
              </DialogTitle>
              <DialogDescription className="text-gray-600">
                Record important decisions to track outcomes and improve over time.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <DecisionForm 
                selectedDecision={selectedDecision} 
                onSuccess={() => setDialogOpen(false)}
                isDialog={true}
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Details View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          {viewingDecision && (
            <>
              <DialogHeader className="pb-4 border-b">
                <DialogTitle className="text-2xl font-semibold text-gray-800">
                  {viewingDecision.title}
                </DialogTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded inline-block ${
                    viewingDecision.category === "Strategy" ? "bg-blue-100 text-blue-800" :
                    viewingDecision.category === "Marketing" ? "bg-purple-100 text-purple-800" :
                    viewingDecision.category === "Operations" ? "bg-amber-100 text-amber-800" :
                    viewingDecision.category === "Product" ? "bg-emerald-100 text-emerald-800" :
                    viewingDecision.category === "Hiring" ? "bg-indigo-100 text-indigo-800" :
                    viewingDecision.category === "Financial" ? "bg-rose-100 text-rose-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {viewingDecision.category}
                  </span>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded inline-block ${
                    viewingDecision.status === "Failed" 
                      ? "bg-red-100 text-red-800" 
                      : viewingDecision.status === "Successful" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-blue-100 text-blue-800"
                  }`}>
                    {viewingDecision.status}
                  </span>
                </div>
              </DialogHeader>

              <div className="py-6 px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                  <div className="md:col-span-2 space-y-2 border-b border-gray-100 pb-4">
                    <h3 className="font-medium text-gray-700">Why this decision was made</h3>
                    <p className="text-gray-700 whitespace-pre-line">{viewingDecision.why}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-700">Decision Date</h3>
                    <p className="text-gray-700">{new Date(viewingDecision.decisionDate).toLocaleDateString()}</p>
                  </div>
                  
                  {viewingDecision.followUpDate && (
                    <div className="space-y-2">
                      <h3 className="font-medium text-gray-700">Follow-up Date</h3>
                      <p className="text-gray-700">{new Date(viewingDecision.followUpDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  
                  {viewingDecision.alternatives && (
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-medium text-gray-700">Alternatives Considered</h3>
                      <p className="text-gray-700 whitespace-pre-line">{viewingDecision.alternatives}</p>
                    </div>
                  )}
                  
                  {viewingDecision.expectedOutcome && (
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-medium text-gray-700">Expected Outcome</h3>
                      <p className="text-gray-700 whitespace-pre-line">{viewingDecision.expectedOutcome}</p>
                    </div>
                  )}
                  
                  {viewingDecision.whatDifferent && (
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-medium text-gray-700">What I'd Do Differently</h3>
                      <p className="text-gray-700 whitespace-pre-line">{viewingDecision.whatDifferent}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter className="border-t border-gray-100 pt-4">
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    setSelectedDecision(viewingDecision);
                    setDialogOpen(true);
                  }}
                  className="bg-blue-500 text-white hover:bg-blue-600 h-10 px-4 py-2 flex items-center"
                >
                  Edit Decision
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

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
            onViewDetailsClick={handleViewDetailsClick}
          />
        </div>
        
        {/* Decision Form */}
        <div className="lg:col-span-1">
          <DecisionForm selectedDecision={selectedDecision} onSuccess={() => setSelectedDecision(null)} />
        </div>
      </div>
    </section>
  );
};

export default DecisionLog;
