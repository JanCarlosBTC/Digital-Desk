import React, { useState, useEffect } from "react";
import { format } from 'date-fns';
import { toast } from "@/hooks/use-toast";
import { TrashIcon } from "lucide-react";
import { Decision } from "@shared/schema";

interface DirectDecisionFormProps {
  selectedDecision: Decision | null;
  onSuccess?: () => void;
  isDialog?: boolean;
}

const DirectDecisionForm: React.FC<DirectDecisionFormProps> = ({ 
  selectedDecision, 
  onSuccess,
  isDialog = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (selectedDecision) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [selectedDecision]);

  // Extract the form values directly from the DOM
  const extractFormDataFromDOM = () => {
    const title = document.getElementById('title') as HTMLInputElement;
    const category = document.getElementById('category') as HTMLSelectElement;
    const decisionDate = document.getElementById('decisionDate') as HTMLInputElement;
    const why = document.getElementById('why') as HTMLTextAreaElement;
    const alternatives = document.getElementById('alternatives') as HTMLTextAreaElement;
    const expectedOutcome = document.getElementById('expectedOutcome') as HTMLTextAreaElement;
    const followUpDate = document.getElementById('followUpDate') as HTMLInputElement;
    const status = document.getElementById('status') as HTMLSelectElement;
    const whatDifferent = document.getElementById('whatDifferent') as HTMLTextAreaElement;
    
    return {
      title: title?.value,
      category: category?.value,
      decisionDate: decisionDate?.value,
      why: why?.value,
      alternatives: alternatives?.value || null,
      expectedOutcome: expectedOutcome?.value || null,
      followUpDate: followUpDate?.value || null,
      status: isEditing ? (status?.value || "Pending") : "Pending",
      whatDifferent: whatDifferent?.value || null,
    };
  };

  // This function will be called in both dialog and non-dialog mode
  const handleSubmitClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    console.log("Submit button clicked");
    
    // Extract form data
    const formValues = extractFormDataFromDOM();
    console.log("Extracted form data:", formValues);
    
    // Check required fields
    const requiredFields = [
      { name: 'title', value: formValues.title },
      { name: 'category', value: formValues.category },
      { name: 'decisionDate', value: formValues.decisionDate },
      { name: 'why', value: formValues.why }
    ];
    
    const missingFields = requiredFields
      .filter(field => !field.value || field.value.trim() === '')
      .map(field => field.name);
    
    if (missingFields.length > 0) {
      console.error("Missing required fields:", missingFields);
      toast({
        title: "Missing required fields",
        description: `Please fill in: ${missingFields.join(', ')}`,
        variant: "destructive"
      });
      return;
    }
    
    // Process data
    const processedData = {
      title: formValues.title,
      category: formValues.category,
      decisionDate: formValues.decisionDate,
      why: formValues.why,
      alternatives: formValues.alternatives,
      expectedOutcome: formValues.expectedOutcome,
      followUpDate: formValues.followUpDate,
      whatDifferent: formValues.whatDifferent,
      status: formValues.status
    };
    
    console.log("Processed data for submission:", processedData);
    
    try {
      // Call the API directly instead of using the mutation
      const apiEndpoint = selectedDecision 
        ? `/api/decisions/${selectedDecision.id}`
        : '/api/decisions';
      
      const method = selectedDecision ? 'PUT' : 'POST';
      
      setIsSubmitting(true);
      
      fetch(apiEndpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(processedData),
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => {
            throw new Error(err.message || "Failed to save decision");
          });
        }
        return response.json();
      })
      .then(data => {
        console.log("Decision saved successfully:", data);
        
        // Show success toast
        toast({
          title: selectedDecision ? "Decision updated" : "Decision logged",
          description: selectedDecision 
            ? "Your decision has been updated successfully." 
            : "Your decision has been logged successfully.",
          variant: "success",
        });
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch(error => {
        console.error("Error saving decision:", error);
        toast({
          title: "Error saving decision",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
      
    } catch (error) {
      console.error("Exception during form submission:", error);
      setIsSubmitting(false);
      
      toast({
        title: "Error submitting form",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    }
  };
  
  const handleCancel = () => {
    if (onSuccess) {
      onSuccess();
    }
  };
  
  const handleDelete = () => {
    if (!selectedDecision) return;
    
    try {
      setIsSubmitting(true);
      
      fetch(`/api/decisions/${selectedDecision.id}`, {
        method: 'DELETE',
      })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to delete decision");
        }
        
        toast({
          title: "Decision deleted",
          description: "The decision has been deleted successfully.",
          variant: "success",
        });
        
        setShowDeleteConfirm(false);
        
        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess();
        }
      })
      .catch(error => {
        console.error("Error deleting decision:", error);
        toast({
          title: "Error deleting decision",
          description: error.message || "Please try again.",
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsSubmitting(false);
      });
    } catch (error) {
      console.error("Exception during deletion:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      {!isDialog && (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? "Edit Decision" : "Log a New Decision"}
          </h2>
          <p className="text-gray-600 mb-6">
            Record important decisions to track outcomes and improve over time.
          </p>
        </>
      )}

      <div className="space-y-8">
        {/* Basic Information Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Basic Information</h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label htmlFor="title" className="font-medium block">Decision Title</label>
                  <input 
                    id="title"
                    name="title"
                    type="text"
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
                    placeholder="What did you decide?"
                    defaultValue={selectedDecision?.title || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="category" className="font-medium block">Category</label>
                <select 
                  id="category"
                  name="category"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
                  defaultValue={selectedDecision?.category || ""}
                >
                  <option value="" disabled>Select a category</option>
                  <option value="Strategy">Strategy</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                  <option value="Product">Product</option>
                  <option value="Hiring">Hiring</option>
                  <option value="Financial">Financial</option>
                </select>
              </div>

              <div className="space-y-2">
                <label htmlFor="decisionDate" className="font-medium block">Decision Date</label>
                <input 
                  id="decisionDate"
                  name="decisionDate"
                  type="date"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
                  defaultValue={selectedDecision?.decisionDate 
                    ? format(new Date(selectedDecision.decisionDate), "yyyy-MM-dd")
                    : format(new Date(), "yyyy-MM-dd")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reasoning Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Context & Reasoning</h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-5">
            <div className="space-y-2">
              <label htmlFor="why" className="font-medium block">Why did you make this decision?</label>
              <textarea 
                id="why"
                name="why"
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 min-h-24 bg-white"
                placeholder="Explain your reasoning..."
                defaultValue={selectedDecision?.why || ""}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="alternatives" className="font-medium block">Alternatives Considered</label>
              <textarea 
                id="alternatives"
                name="alternatives"
                className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 min-h-20 bg-white"
                placeholder="What other options did you consider?"
                defaultValue={selectedDecision?.alternatives || ""}
              />
            </div>
          </div>
        </div>

        {/* Outcome Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Outcomes & Follow-up</h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
              <div className="md:col-span-2">
                <div className="space-y-2">
                  <label htmlFor="expectedOutcome" className="font-medium block">Expected Outcome</label>
                  <textarea 
                    id="expectedOutcome"
                    name="expectedOutcome"
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 min-h-20 bg-white"
                    placeholder="What result do you anticipate?"
                    defaultValue={selectedDecision?.expectedOutcome || ""}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="followUpDate" className="font-medium block">Follow-up Date</label>
                <input 
                  id="followUpDate"
                  name="followUpDate"
                  type="date"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
                  defaultValue={selectedDecision?.followUpDate 
                    ? format(new Date(selectedDecision.followUpDate), "yyyy-MM-dd")
                    : ""}
                />
                <p className="text-xs text-gray-500 mt-1">
                  When will you review the results of this decision?
                </p>
              </div>

              {isEditing && (
                <div className="space-y-2">
                  <label htmlFor="status" className="font-medium block">Decision Status</label>
                  <select 
                    id="status"
                    name="status"
                    className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white"
                    defaultValue={selectedDecision?.status || "Pending"}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Successful">Successful</option>
                    <option value="Failed">Failed</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Track whether this decision was successful or failed over time.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reflection Section - Only for editing */}
        {isEditing && (
          <div>
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Reflection</h3>
            <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-5">
              <div className="space-y-2">
                <label htmlFor="whatDifferent" className="font-medium block">What would you do differently?</label>
                <textarea 
                  id="whatDifferent"
                  name="whatDifferent"
                  className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 min-h-20 bg-white"
                  placeholder="Reflecting on this decision, what would you change?"
                  defaultValue={selectedDecision?.whatDifferent || ""}
                />
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between space-x-2 pt-4 border-t border-gray-100">
          <div>
            {isEditing && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="border border-red-500 text-red-600 hover:bg-red-50 font-medium h-10 px-4 py-2 rounded-md flex items-center"
              >
                <TrashIcon className="mr-1 h-4 w-4" /> Delete
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {onSuccess && (
              <button 
                type="button" 
                onClick={handleCancel}
                className="border border-gray-300 text-gray-700 h-10 px-4 py-2 rounded-md flex items-center"
              >
                Cancel
              </button>
            )}
            <button 
              type="button"
              onClick={handleSubmitClick}
              disabled={isSubmitting}
              className="h-10 px-4 py-2 flex items-center bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
            >
              {isSubmitting ? "Saving..." : "Save Decision"}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
              <h3 className="text-xl font-semibold text-gray-800">Are you sure?</h3>
              <p className="text-gray-600 mt-1.5">
                This action cannot be undone. This will permanently delete the decision.
              </p>
            </div>
            <div className="px-6 py-5 bg-white">
              <p className="text-gray-600">
                Once deleted, you will not be able to recover any data associated with this decision.
              </p>
            </div>
            <div className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="font-medium h-10 px-5 py-2 flex items-center border border-gray-300 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="font-medium h-10 px-5 py-2 flex items-center bg-red-500 hover:bg-red-600 text-white rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectDecisionForm;