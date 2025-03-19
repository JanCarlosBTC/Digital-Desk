import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TextField, TextAreaField } from "@/components/ui/form-elements";
import { Tag } from "lucide-react";

// Define validation schema
const problemTreeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100, "Title cannot exceed 100 characters"),
  mainProblem: z.string().min(10, "Main problem must be at least 10 characters").max(500, "Main problem cannot exceed 500 characters"),
  subProblems: z.array(z.string()).min(1, "Add at least one sub-problem"),
  rootCauses: z.array(z.string()).min(1, "Add at least one root cause"),
  potentialSolutions: z.array(z.string()).min(1, "Add at least one potential solution"),
  nextActions: z.array(z.string()).optional()
});

// Define form values type
type FormValues = z.infer<typeof problemTreeSchema>;

interface ProblemTree {
  id: number;
  userId: number;
  title: string;
  mainProblem: string;
  subProblems: string[];
  rootCauses: string[];
  potentialSolutions: string[];
  nextActions: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProblemTreeFormProps {
  selectedProblemTree?: ProblemTree;
  onSuccess?: () => void;
  isDialog?: boolean;
}

const ProblemTreeForm = ({ selectedProblemTree, onSuccess, isDialog = false }: ProblemTreeFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(!!selectedProblemTree);
  
  // Initialize form with default values or selected problem tree
  const form = useForm<FormValues>({
    resolver: zodResolver(problemTreeSchema),
    defaultValues: selectedProblemTree ? {
      title: selectedProblemTree.title,
      mainProblem: selectedProblemTree.mainProblem,
      subProblems: selectedProblemTree.subProblems,
      rootCauses: selectedProblemTree.rootCauses,
      potentialSolutions: selectedProblemTree.potentialSolutions,
      nextActions: selectedProblemTree.nextActions || [],
    } : {
      title: "",
      mainProblem: "",
      subProblems: [""],
      rootCauses: [""],
      potentialSolutions: [""],
      nextActions: [""],
    }
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      if (isEditing && selectedProblemTree) {
        return apiRequest('PUT', `/api/problem-trees/${selectedProblemTree.id}`, data);
      } else {
        return apiRequest('POST', '/api/problem-trees', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: isEditing ? "Problem tree updated" : "Problem tree created",
        description: isEditing 
          ? "The problem tree has been updated successfully." 
          : "Your new problem tree has been created.",
        variant: "success",
      });
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProblemTree) return;
      return apiRequest('DELETE', `/api/problem-trees/${selectedProblemTree.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Problem tree deleted",
        description: "The problem tree has been deleted successfully.",
        variant: "success",
      });
      setIsEditing(false);
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error deleting problem tree",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  // Cancel button handler
  const handleCancel = () => {
    form.reset();
    setIsEditing(false);
    if (onSuccess) {
      onSuccess();
    }
  };

  // Delete button handler
  const handleDelete = () => {
    deleteMutation.mutate();
  };

  // Function to handle array fields (subProblems, rootCauses, etc.)
  const handleArrayField = (field: "subProblems" | "rootCauses" | "potentialSolutions" | "nextActions", action: "add" | "remove", index?: number) => {
    const currentValues = form.getValues(field);
    
    if (action === "add") {
      form.setValue(field, [...currentValues, ""], { shouldValidate: true });
    } else if (action === "remove" && typeof index === "number") {
      if (currentValues.length > 1) {
        const newValues = [...currentValues];
        newValues.splice(index, 1);
        form.setValue(field, newValues, { shouldValidate: true });
      }
    }
  };

  return (
    <div className={`bg-white ${!isDialog ? 'rounded-lg shadow-md p-6 border border-gray-200 sticky top-6' : ''}`}>
      {!isDialog && (
        <>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {isEditing ? "Edit Problem Tree" : "Create New Problem Tree"}
          </h2>
          <p className="text-gray-600 mb-6">
            Break down complex problems into root causes and potential solutions.
          </p>
        </>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Title field */}
          <TextField
            form={form}
            name="title"
            label="Title"
            placeholder="Enter a concise title for your problem tree"
          />

          {/* Main Problem field */}
          <TextAreaField
            form={form}
            name="mainProblem"
            label="Main Problem"
            placeholder="Describe the central problem you're trying to solve"
            rows={3}
          />

          {/* Sub-Problems fields */}
          <FormField
            control={form.control}
            name="subProblems"
            render={() => (
              <FormItem>
                <FormLabel>Sub-Problems</FormLabel>
                <div className="space-y-2">
                  {form.getValues("subProblems").map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name={`subProblems.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Enter a sub-problem" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleArrayField("subProblems", "remove", index)}
                        disabled={form.getValues("subProblems").length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayField("subProblems", "add")}
                  className="mt-2"
                >
                  Add Sub-Problem
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Root Causes fields */}
          <FormField
            control={form.control}
            name="rootCauses"
            render={() => (
              <FormItem>
                <FormLabel>Root Causes</FormLabel>
                <div className="space-y-2">
                  {form.getValues("rootCauses").map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name={`rootCauses.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Enter a root cause" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleArrayField("rootCauses", "remove", index)}
                        disabled={form.getValues("rootCauses").length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayField("rootCauses", "add")}
                  className="mt-2"
                >
                  Add Root Cause
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Potential Solutions fields */}
          <FormField
            control={form.control}
            name="potentialSolutions"
            render={() => (
              <FormItem>
                <FormLabel>Potential Solutions</FormLabel>
                <div className="space-y-2">
                  {form.getValues("potentialSolutions").map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name={`potentialSolutions.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Enter a potential solution" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleArrayField("potentialSolutions", "remove", index)}
                        disabled={form.getValues("potentialSolutions").length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayField("potentialSolutions", "add")}
                  className="mt-2"
                >
                  Add Solution
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Next Actions fields */}
          <FormField
            control={form.control}
            name="nextActions"
            render={() => (
              <FormItem>
                <FormLabel>Next Actions (Optional)</FormLabel>
                <div className="space-y-2">
                  {form.getValues("nextActions").map((_, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <FormField
                        control={form.control}
                        name={`nextActions.${index}`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input 
                                placeholder="Enter a next action" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleArrayField("nextActions", "remove", index)}
                        disabled={form.getValues("nextActions").length <= 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleArrayField("nextActions", "add")}
                  className="mt-2"
                >
                  Add Action
                </Button>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Form buttons */}
          <div className="flex justify-between pt-4">
            <div>
              {isEditing && (
                <Button 
                  type="button" 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={mutation.isPending || deleteMutation.isPending}
                >
                  Delete
                </Button>
              )}
            </div>
            <div className="flex space-x-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleCancel}
                disabled={mutation.isPending || deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                variant="thinkingDesk"
                disabled={mutation.isPending || deleteMutation.isPending}
              >
                {mutation.isPending 
                  ? isEditing ? "Updating..." : "Creating..." 
                  : isEditing ? "Update" : "Create"
                }
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default ProblemTreeForm;