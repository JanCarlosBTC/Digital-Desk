import React, { useState, useEffect } from "react";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from 'date-fns';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TrashIcon } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Decision } from "@shared/schema";

interface DecisionFormProps {
  selectedDecision: Decision | null;
  onSuccess?: () => void;
  isDialog?: boolean; // Controls whether the form is rendered in a dialog
}

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(1, "Category is required"),
  decisionDate: z.string().refine(val => val !== "", {
    message: "Decision date is required",
  }),
  why: z.string().min(5, "Reasoning must be at least 5 characters"),
  alternatives: z.string().optional(),
  expectedOutcome: z.string().optional(),
  followUpDate: z.string().optional(),
  whatDifferent: z.string().optional(),
  status: z.enum(["Pending", "Successful", "Failed"]).default("Pending"),
});

type FormValues = z.infer<typeof formSchema>;

const DecisionForm: React.FC<DecisionFormProps> = ({ 
  selectedDecision, 
  onSuccess,
  isDialog = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      category: "",
      decisionDate: format(new Date(), "yyyy-MM-dd"),
      why: "",
      alternatives: "",
      expectedOutcome: "",
      followUpDate: "",
      whatDifferent: "",
      status: "Pending",
    },
  });

  // When selected decision changes, update form values
  useEffect(() => {
    if (selectedDecision) {
      setIsEditing(true);
      form.reset({
        title: selectedDecision.title,
        category: selectedDecision.category,
        decisionDate: format(new Date(selectedDecision.decisionDate), "yyyy-MM-dd"),
        why: selectedDecision.why,
        alternatives: selectedDecision.alternatives || "",
        expectedOutcome: selectedDecision.expectedOutcome || "",
        followUpDate: selectedDecision.followUpDate 
          ? format(new Date(selectedDecision.followUpDate), "yyyy-MM-dd") 
          : "",
        whatDifferent: selectedDecision.whatDifferent || "",
        status: (selectedDecision.status as "Pending" | "Successful" | "Failed") || "Pending",
      });
    } else {
      setIsEditing(false);
      form.reset({
        title: "",
        category: "",
        decisionDate: format(new Date(), "yyyy-MM-dd"),
        why: "",
        alternatives: "",
        expectedOutcome: "",
        followUpDate: "",
        whatDifferent: "",
        status: "Pending",
      });
    }
  }, [selectedDecision, form]);

  // Define the response type for the mutation
  type DecisionResponse = {
    id: number;
    title: string;
    status: string;
    [key: string]: any;
  };

  // Create or update decision with improved type safety
  const mutation = useMutation<DecisionResponse, Error, FormValues>({
    mutationFn: async (data: FormValues) => {
      try {
        // Format dates for API transmission
        const formattedData = {
          ...data,
          decisionDate: new Date(data.decisionDate),
          followUpDate: data.followUpDate ? new Date(data.followUpDate) : null,
        };

        console.log('Submitting decision:', formattedData);

        // Ensure category is selected
        if (!formattedData.category) {
          throw new Error("Category is required");
        }

        let response;
        if (selectedDecision) {
          response = await apiRequest<DecisionResponse>(
            'PUT', 
            `/api/decisions/${selectedDecision.id}`, 
            formattedData
          );
        } else {
          response = await apiRequest<DecisionResponse>(
            'POST', 
            '/api/decisions', 
            formattedData
          );
        }
        
        console.log('API response:', response);
        return response;
      } catch (error) {
        console.error('Error in mutation function:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      // More specific query invalidation with proper type
      queryClient.invalidateQueries({ queryKey: ['/api/decisions'] });
      
      // Log success for debugging
      console.log('Decision saved successfully:', data);

      // Notify user of success
      toast({
        title: selectedDecision ? "Decision updated" : "Decision logged",
        description: selectedDecision 
          ? "Your decision has been updated successfully." 
          : "Your decision has been logged successfully.",
        variant: "success",
      });

      // Reset form if creating a new decision
      if (!selectedDecision) {
        form.reset({
          title: "",
          category: "",
          decisionDate: format(new Date(), "yyyy-MM-dd"),
          why: "",
          alternatives: "",
          expectedOutcome: "",
          followUpDate: "",
          whatDifferent: "",
          status: "Pending",
        });
      }
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      // Log error for debugging
      console.error('Error saving decision:', error);
      
      // Extract and display a user-friendly error message
      toast({
        title: "Error saving decision",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
    onMutate: () => {
      setIsSubmitting(true);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Delete decision mutation with improved type safety
  const deleteMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      if (!selectedDecision) {
        throw new Error("No decision selected for deletion");
      }
      
      console.log('Deleting decision:', selectedDecision.id);
      await apiRequest<void>('DELETE', `/api/decisions/${selectedDecision.id}`);
    },
    onSuccess: () => {
      // More specific query invalidation
      queryClient.invalidateQueries({ queryKey: ['/api/decisions'] });
      
      toast({
        title: "Decision deleted",
        description: "The decision has been deleted successfully.",
        variant: "success",
      });
      
      setIsEditing(false);
      
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      // Log error for debugging
      console.error('Error deleting decision:', error);
      
      toast({
        title: "Error deleting decision",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    console.log("Form submitted with data:", data);
    
    // Validate that all required fields are present
    if (!data.title || !data.category || !data.decisionDate || !data.why) {
      console.error("Missing required fields:", {
        title: !data.title,
        category: !data.category,
        decisionDate: !data.decisionDate,
        why: !data.why
      });
      
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Now mutate with the data
    mutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Create the form content
  const formContent = (
    <div className="space-y-8">
      {/* Basic Information Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Basic Information</h3>
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Decision Title</FormLabel>
                    <FormControl>
                      <Input className="bg-white" placeholder="What did you decide?" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10 px-4 py-2 flex items-center bg-white">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
                      <SelectItem value="Strategy">Strategy</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Operations">Operations</SelectItem>
                      <SelectItem value="Product">Product</SelectItem>
                      <SelectItem value="Hiring">Hiring</SelectItem>
                      <SelectItem value="Financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="decisionDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Decision Date</FormLabel>
                  <FormControl>
                    <Input className="bg-white" type="date" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>

      {/* Reasoning Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Context & Reasoning</h3>
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-5">
          <FormField
            control={form.control}
            name="why"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Why did you make this decision?</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Explain your reasoning..."
                    className="min-h-24 bg-white"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternatives"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-medium">Alternatives Considered</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What other options did you consider?"
                    className="min-h-20 bg-white"
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Outcome Section */}
      <div>
        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Outcomes & Follow-up</h3>
        <div className="bg-gray-50 rounded-lg p-5 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            <div className="md:col-span-2">
              <FormField
                control={form.control}
                name="expectedOutcome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Expected Outcome</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What result do you anticipate?"
                        className="min-h-20 bg-white"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="followUpDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">Follow-up Date</FormLabel>
                  <FormControl>
                    <Input className="bg-white" type="date" {...field} />
                  </FormControl>
                  <p className="text-xs text-gray-500 mt-1">
                    When will you review the results of this decision?
                  </p>
                </FormItem>
              )}
            />

            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Decision Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 px-4 py-2 flex items-center bg-white">
                          <SelectValue placeholder="Select the status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent position="popper" className="bg-white shadow-lg" style={{zIndex: 1000}}>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Successful">Successful</SelectItem>
                        <SelectItem value="Failed">Failed</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      Track whether this decision was successful or failed over time.
                    </p>
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
      </div>

      {/* Reflection Section - Only for editing */}
      {isEditing && (
        <div>
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-4">Reflection</h3>
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-100 space-y-5">
            <FormField
              control={form.control}
              name="whatDifferent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-medium">What would you do differently?</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Reflecting on this decision, what would you change?"
                      className="min-h-20 bg-white"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between space-x-2 pt-4 border-t border-gray-100">
        <div>
          {isEditing && (
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50 font-medium h-10 px-4 py-2 flex items-center"
                >
                  <TrashIcon className="mr-1 h-4 w-4" /> Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="p-0 gap-0 overflow-hidden max-w-md">
                <AlertDialogHeader className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-red-50 to-white">
                  <AlertDialogTitle className="text-xl font-semibold text-gray-800">Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 mt-1.5">
                    This action cannot be undone. This will permanently delete the decision.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="px-6 py-5 bg-white">
                  <p className="text-gray-600">
                    Once deleted, you will not be able to recover any data associated with this decision.
                  </p>
                </div>
                <AlertDialogFooter className="flex justify-end space-x-2 px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <AlertDialogCancel className="font-medium h-10 px-5 py-2 flex items-center">Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    className="bg-red-500 text-white hover:bg-red-600 font-medium shadow-sm h-10 px-5 py-2 flex items-center"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          {isEditing && (
            <Button
              variant="outline"
              type="button"
              onClick={handleCancel}
              className="h-10 px-4 py-2 flex items-center"
            >
              Cancel
            </Button>
          )}
          <Button
            variant="default"
            type="submit"
            disabled={isSubmitting}
            className="h-10 px-4 py-2 flex items-center"
          >
            {isSubmitting ? "Saving..." : "Save Decision"}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`bg-white ${!isDialog ? 'rounded-lg shadow-md p-6 border border-gray-200 sticky top-6' : ''}`}>
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

      {isDialog ? (
        // When used in dialog, don't wrap in a form element to avoid nesting
        <Form {...form}>
          {formContent}
        </Form>
      ) : (
        // When used standalone, wrap in a form element
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {formContent}
          </form>
        </Form>
      )}
    </div>
  );
};

export default DecisionForm;