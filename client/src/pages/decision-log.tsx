import React, { useState } from "react";
import DecisionList from "@/components/decision-log/decision-list";
import DecisionForm from "@/components/decision-log/decision-form";
import { useQuery } from "@tanstack/react-query";
import { Decision } from "@shared/prisma-schema";
import { Button } from "@/components/ui/button";
import { PlusIcon, ClipboardListIcon, CheckSquare } from "lucide-react";
import { DialogForm } from "@/components/ui/dialog-form";
import { PageHeader } from "@/components/ui/page-header";
import { StatusBadge } from "@/components/ui/feature-card";

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
      <PageHeader
        title="Decision Log"
        description="Record, track, and learn from your business decisions."
        icon={<CheckSquare className="h-8 w-8" />}
        action={{
          label: "New Decision",
          onClick: handleNewDecisionClick,
          icon: <PlusIcon className="mr-2 h-4 w-4" />,
          variant: "decisionLog"
        }}
      />

      {/* New Decision Form Dialog */}
      <DialogForm
        title={selectedDecision ? "Edit Decision" : "Log a New Decision"}
        description="Record important decisions to track outcomes and improve over time"
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="lg"
        onSubmit={(e) => {
          e.preventDefault();
          // The form will handle its own submission through DecisionForm
        }}
      >
        <DecisionForm 
          selectedDecision={selectedDecision} 
          onSuccess={() => setDialogOpen(false)}
          isDialog={true}
        />
      </DialogForm>

      {/* View Decision Dialog */}
      <DialogForm
        title={viewingDecision?.title || "Decision Details"}
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        size="lg"
        submitLabel=""
        onSubmit={(e) => {
          e.preventDefault();
        }}
        footerContent={
          viewingDecision && (
            <Button 
              onClick={() => {
                setViewDialogOpen(false);
                setSelectedDecision(viewingDecision);
                setDialogOpen(true);
              }}
            >
              Edit Decision
            </Button>
          )
        }
      >
        {viewingDecision && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex gap-2 md:col-span-2 mb-4">
              <StatusBadge status={viewingDecision.category} className="mr-2" />
              <StatusBadge status={viewingDecision.status} />
            </div>
            
            <div className="md:col-span-2 space-y-3 border-b border-gray-100 pb-5 mb-2">
              <h3 className="font-semibold text-gray-700 text-base">Why this decision was made</h3>
              <p className="text-gray-700 whitespace-pre-line">{viewingDecision.why}</p>
            </div>
            
            <div className="space-y-2 p-3 bg-gray-50 rounded-md">
              <h3 className="font-medium text-gray-700">Decision Date</h3>
              <p className="text-gray-700">{new Date(viewingDecision.decisionDate).toLocaleDateString()}</p>
            </div>
            
            {viewingDecision.followUpDate && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-700">Follow-up Date</h3>
                <p className="text-gray-700">{new Date(viewingDecision.followUpDate).toLocaleDateString()}</p>
              </div>
            )}
            
            {viewingDecision.alternatives && (
              <div className="md:col-span-2 space-y-3 mt-2">
                <h3 className="font-semibold text-gray-700 text-base">Alternatives Considered</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">{viewingDecision.alternatives}</p>
                </div>
              </div>
            )}
            
            {viewingDecision.expectedOutcome && (
              <div className="md:col-span-2 space-y-3 mt-2">
                <h3 className="font-semibold text-gray-700 text-base">Expected Outcome</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">{viewingDecision.expectedOutcome}</p>
                </div>
              </div>
            )}
            
            {viewingDecision.whatDifferent && (
              <div className="md:col-span-2 space-y-3 mt-2">
                <h3 className="font-semibold text-gray-700 text-base">What I'd Do Differently</h3>
                <div className="bg-gray-50 p-4 rounded-md">
                  <p className="text-gray-700 whitespace-pre-line">{viewingDecision.whatDifferent}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogForm>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Decision List - Now takes full width when no form is shown */}
        <div className={selectedDecision ? "lg:col-span-8" : "lg:col-span-12"}>
          <DecisionList 
            decisions={decisions || []} 
            isLoading={isLoading} 
            setSelectedDecision={setSelectedDecision}
            onNewDecisionClick={() => setDialogOpen(true)}
            onViewDetailsClick={handleViewDetailsClick}
          />
        </div>
        
        {/* Decision Form - Only shown when a decision is selected */}
        {selectedDecision && (
          <div className="lg:col-span-4">
            <DecisionForm 
              selectedDecision={selectedDecision} 
              onSuccess={() => setSelectedDecision(null)} 
              isDialog={false}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default DecisionLog;
