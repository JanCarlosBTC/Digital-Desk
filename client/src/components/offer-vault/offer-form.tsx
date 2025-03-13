import React, { useState } from 'react';
import { z } from 'zod';
import { toast } from '@radix-ui/react-toast'; // Or your preferred toast library

// Hypothetical offer schema
const offerSchema = z.object({
  title: z.string(),
  description: z.string(),
  // ... other fields
});

const OfferForm = () => {
  const [formOpen, setFormOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = React.useRef(null);


  const onSubmit = async (data: z.infer<typeof offerSchema>) => {
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
      form.current.reset();
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
        <form ref={form} onSubmit={(e) => {
          e.preventDefault();
          const formData = {
            title: e.target.title.value,
            description: e.target.description.value,
            // ... other fields
          }
          onSubmit(offerSchema.parse(formData));
        }}>
          <input type="text" name="title" placeholder="Title" />
          <textarea name="description" placeholder="Description" />
          {/* ... other form fields */}
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Offer'}
          </button>
        </form>
      )}
    </div>
  );
};

export default OfferForm;