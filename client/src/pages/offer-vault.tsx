import OfferList from "@/components/offer-vault/offer-list";
import OfferMetrics from "@/components/offer-vault/offer-metrics";
import { useQuery, useMutation } from "@tanstack/react-query";
import { OfferNote } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const OfferVault = () => {
  const { toast } = useToast();
  const [noteContent, setNoteContent] = useState("");
  
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

  return (
    <section className="p-6 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Offer Vault</h1>
        <p className="text-gray-600 mt-2">Store and refine your products, services, and pricing strategies</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Offer List */}
        <div className="md:col-span-8">
          <OfferList />
        </div>
        
        {/* Offer Metrics & Notes */}
        <div className="md:col-span-4 space-y-6">
          <OfferMetrics />
          
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Offer Notes</h2>
            <p className="text-gray-600 mb-4">Capture insights on positioning, client feedback, and pricing strategy.</p>
            
            <Textarea 
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-warning focus:border-transparent mb-4"
              placeholder="Add notes about your offers, pricing strategy, or positioning ideas..."
              rows={8}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              disabled={notesLoading || updateNotesMutation.isPending}
            />
            
            <div className="flex justify-end">
              <Button 
                className="bg-warning text-white hover:bg-amber-600"
                onClick={handleSaveNotes}
                disabled={notesLoading || updateNotesMutation.isPending}
              >
                {updateNotesMutation.isPending ? "Saving..." : "Save Notes"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OfferVault;
