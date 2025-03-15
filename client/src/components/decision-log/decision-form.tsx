import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Decision } from "@shared/schema";
import { format } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { TrashIcon } from "lucide-react";

interface DecisionFormProps {
  selectedDecision: Decision | null;
  onSuccess?: () => void;
  isDialog?: boolean;
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

const DecisionForm = ({ selectedDecision, onSuccess, isDialog = false }: DecisionFormProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  // Create or update decision
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const formattedData = {
        ...data,
        decisionDate: new Date(data.decisionDate),
        followUpDate: data.followUpDate ? new Date(data.followUpDate) : undefined,
      };

      if (selectedDecision) {
        return apiRequest('PUT', `/api/decisions/${selectedDecision.id}`, formattedData);
      } else {
        return apiRequest('POST', '/api/decisions', formattedData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/decisions'] });
      toast({
        title: selectedDecision ? "Decision updated" : "Decision logged",
        description: selectedDecision 
          ? "Your decision has been updated successfully." 
          : "Your decision has been logged successfully.",
        variant: "success", // Added success variant
      });

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
    onError: (error) => {
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

  // Delete decision mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedDecision) return;
      return apiRequest('DELETE', `/api/decisions/${selectedDecision.id}`);
    },
    onSuccess: () => {
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
    onError: (error) => {
      toast({
        title: "Error deleting decision",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
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
    setIsEditing(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <div className={`bg-white ${!isDialog ? 'rounded-lg shadow-md p-6 border border-gray-200 sticky top-6' : ''}`}>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        {isEditing ? "Edit Decision" : "Log a New Decision"}
      </h2>
      <p className="text-gray-600 mb-6">
        Record important decisions to track outcomes and improve over time.
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Decision Title</FormLabel>
                <FormControl>
                  <Input placeholder="What did you decide?" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="h-10 px-4 py-2 flex items-center">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
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
                <FormLabel>Decision Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="why"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Why did you make this decision?</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Explain your reasoning..."
                    rows={3}
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
                <FormLabel>Alternatives Considered</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What other options did you consider?"
                    rows={2}
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="expectedOutcome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Expected Outcome</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="What result do you anticipate?"
                    rows={2}
                    {...field} 
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="followUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Follow-up Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <p className="text-xs text-gray-500 mt-1">
                  When will you review the results of this decision?
                </p>
              </FormItem>
            )}
          />

          {isEditing && (
            <>
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Decision Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-10 px-4 py-2 flex items-center">
                          <SelectValue placeholder="Select the status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
              
              <FormField
                control={form.control}
                name="whatDifferent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What would you do differently?</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Reflecting on this decision, what would you change?"
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </>
          )}

          <div className="flex justify-between space-x-2 pt-4">
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
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the decision.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="h-10 px-4 py-2 flex items-center">Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleDelete}
                        className="bg-red-500 text-white hover:bg-red-600 h-10 px-4 py-2 flex items-center"
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
                  type="button"
                  variant="outline"
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 font-medium h-10 px-4 py-2 flex items-center"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit"
                variant="default"
                className="bg-emerald-500 text-white hover:bg-emerald-600 font-medium shadow-sm h-10 px-4 py-2 flex items-center"
                disabled={mutation.isPending || isSubmitting} //Added isSubmitting to disable button
              >
                {mutation.isPending || isSubmitting
                  ? "Saving..." 
                  : isEditing 
                    ? "Update Decision" 
                    : "Save Decision"
                }
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default DecisionForm;