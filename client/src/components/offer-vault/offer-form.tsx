import React, { useState, useRef } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast'; // Using app's toast system
import { Button } from "@/components/ui/button";

// Hypothetical offer schema
const offerSchema = z.object({
  title: z.string(),
  description: z.string(),
  // ... other fields
});

type OfferFormData = z.infer<typeof offerSchema>;

interface Offer {
  id: number;
  title: string;
  description: string;
}

const OfferForm = () => {
  const { toast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useRef<HTMLFormElement>(null);

  const onSubmit = async (data: OfferFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedOffer) {
        // Update existing offer
        const response = await fetch(`/api/offers/${selectedOffer.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to update offer");
        }

        toast({
          title: "Offer updated",
          description: "Your offer has been updated successfully.",
          variant: "success",
        });
      } else {
        // Create new offer
        const response = await fetch("/api/offers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response.ok) {
          throw new Error("Failed to create offer");
        }

        toast({
          title: "Offer created",
          description: "Your new offer has been created successfully.",
          variant: "success",
        });
      }

      setRefreshKey(prev => prev + 1);
      setFormOpen(false);
      // Only reset if form.current is not null
      if (form.current) {
        form.current.reset();
      }
      setSelectedOffer(null);
    } catch (error) {
      console.error("Error submitting offer:", error);
      toast({
        title: "Error",
        description: "Failed to save your offer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => setFormOpen(true)}>Open Offer Form</button>
      {formOpen && (
        <form 
          ref={form} 
          onSubmit={(e) => {
            e.preventDefault();
            const formElement = e.target as HTMLFormElement;
            const titleInput = formElement.querySelector('input[name="title"]') as HTMLInputElement;
            const descriptionInput = formElement.querySelector('textarea[name="description"]') as HTMLTextAreaElement;
            
            const formData = {
              title: titleInput.value,
              description: descriptionInput.value,
              // ... other fields
            };
            
            onSubmit(offerSchema.parse(formData));
          }}
        >
          <input type="text" name="title" placeholder="Title" />
          <textarea name="description" placeholder="Description" />
          {/* ... other form fields */}
          <Button type="submit" variant="offerVault" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Offer'}
          </Button>
        </form>
      )}
    </div>
  );
};

export default OfferForm;