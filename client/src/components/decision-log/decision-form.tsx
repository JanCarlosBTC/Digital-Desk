import React, { useState, useEffect } from "react";
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

// Define the Decision interface based on Prisma model
interface Decision {
  id: number;
  userId: number;
  title: string;
  category: string;
  decisionDate: string | Date;
  why: string;
  alternatives?: string | null;
  expectedOutcome?: string | null;
  followUpDate?: string | Date | null;
  status: string;
  whatDifferent?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}
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

      {/* Using Form from shadcn/ui, which is FormProvider under the hood */}
      <Form {...form} onSubmit={form.handleSubmit(onSubmit)}>
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
                    variant="decisionLogOutline"
                    type="button"
                    onClick={handleCancel}
                    className="h-10 px-4 py-2 flex items-center"
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  variant="decisionLog"
                  type="submit"
                  disabled={isSubmitting}
                  className="h-10 px-4 py-2 flex items-center"
                >
                  {isSubmitting ? "Saving..." : "Save Decision"}
                </Button>
              </div>
            </div>
          </div>
      </Form>
    </div>
  );
};

export default DecisionForm;