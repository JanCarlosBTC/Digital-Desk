import React, { useState, useEffect, createContext, useContext } from "react";
import OfferList from "@/components/offer-vault/offer-list";
import OfferMetrics from "@/components/offer-vault/offer-metrics";
import { useQuery, useMutation } from "@tanstack/react-query";
import { OfferNote } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/ui/page-header";
import { FeatureCard } from "@/components/ui/feature-card";
import { Package, PlusIcon } from "lucide-react";

// Create context for offer vault actions
interface OfferVaultContextType {
  showNewOfferDialog: () => void;
}

export const OfferVaultContext = createContext<OfferVaultContextType>({
  showNewOfferDialog: () => {},
});

// Hook for components to consume the context
export const useOfferVault = () => useContext(OfferVaultContext);

const OfferVault = () => {
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  const [showNewOffer, setShowNewOffer] = useState(false);
  
  // Fetch offer notes
  const { data: offerNotes, isLoading: notesLoading } = useQuery<OfferNote>({
    queryKey: ['/api/offer-notes'],
  });
  
  // Update offer notes
  const updateNotesMutation = useMutation({
    mutationFn: async () => {
      if (!offerNotes) return null;
      return apiRequest('PUT', `/api/offer-notes/${offerNotes.id}`, { content: noteContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offer-notes'] });
      toast({
        title: "Notes saved",
        description: "Your offer notes have been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving notes",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });
  
  useEffect(() => {
    if (offerNotes) {
      setNoteContent(offerNotes.content || "");
    }
  }, [offerNotes]);
  
  const handleSaveNotes = () => {
    updateNotesMutation.mutate();
  };
  
  // Context value with action handlers
  const contextValue: OfferVaultContextType = {
    showNewOfferDialog: () => setShowNewOffer(true)
  };

  return (
    <OfferVaultContext.Provider value={contextValue}>
      <section className="p-6 max-w-6xl mx-auto">
        <PageHeader
          title="Offer Vault"
          description="Create and manage your products, services, and packages."
          icon={<Package className="h-8 w-8" />}
          action={{
            label: "New Offer",
            onClick: () => contextValue.showNewOfferDialog(),
            icon: <PlusIcon className="mr-2 h-4 w-4" />,
            variant: "offerVault"
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-6">
          {/* Offer List */}
          <div className="md:col-span-8">
            <OfferList 
              showNewOffer={showNewOffer}
              onDialogClose={() => setShowNewOffer(false)}
            />
          </div>
          
          {/* Offer Metrics & Notes */}
          <div className="md:col-span-4 space-y-6">
            <OfferMetrics />
            
            <FeatureCard
              title="Offer Notes"
              description="Capture insights on positioning, client feedback, and pricing strategy."
              className="p-5"
            >
              <Textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:border-transparent mb-4"
                placeholder="Add notes about your offers, pricing strategy, or positioning ideas..."
                rows={8}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                disabled={notesLoading || updateNotesMutation.isPending}
              />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveNotes}
                  disabled={notesLoading || updateNotesMutation.isPending}
                  variant="offerVault"
                >
                  {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
                </Button>
              </div>
            </FeatureCard>
          </div>
        </div>
      </section>
    </OfferVaultContext.Provider>
  );
};

export default OfferVault;
