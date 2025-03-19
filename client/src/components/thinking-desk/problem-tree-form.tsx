import React, { useState } from "react";
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

// Define validation schema that matches our API requirements
const problemTreeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mainProblem: z.string().min(1, "Main problem is required"),
  subProblems: z.array(z.string()).min(1, "Add at least one sub-problem"),
  rootCauses: z.array(z.string()).min(1, "Add at least one root cause"),
  potentialSolutions: z.array(z.string()).min(1, "Add at least one potential solution"),
  nextActions: z.array(z.string()).optional().default([])
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
  const [isEditing] = useState(!!selectedProblemTree);
  
  // Initialize form with default values or selected problem tree
  const form = useForm<FormValues>({
    resolver: zodResolver(problemTreeSchema),
    defaultValues: selectedProblemTree ? {
      title: selectedProblemTree.title,
      mainProblem: selectedProblemTree.mainProblem,
      subProblems: selectedProblemTree.subProblems,
      rootCauses: selectedProblemTree.rootCauses,
      potentialSolutions: selectedProblemTree.potentialSolutions,
      nextActions: selectedProblemTree.nextActions,
    } : {
      title: "",
      mainProblem: "",
      subProblems: [""],
      rootCauses: [""],
      potentialSolutions: [""],
      nextActions: [""]
    }
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Filter out any empty strings from arrays
      const cleanData = {
        ...data,
        subProblems: data.subProblems.filter(item => item.trim() !== ''),
        rootCauses: data.rootCauses.filter(item => item.trim() !== ''),
        potentialSolutions: data.potentialSolutions.filter(item => item.trim() !== ''),
        nextActions: data.nextActions ? data.nextActions.filter(item => item.trim() !== '') : []
      };

      if (isEditing && selectedProblemTree) {
        const response = await fetch(`/api/problem-trees/${selectedProblemTree.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Failed to update problem tree');
        }
        
        return response.json();
      } else {
        const response = await fetch('/api/problem-trees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanData)
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          throw new Error(errorData?.message || 'Failed to create problem tree');
        }
        
        return response.json();
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
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProblemTree) return null;
      
      const response = await fetch(`/api/problem-trees/${selectedProblemTree.id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete problem tree');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Problem tree deleted",
        description: "The problem tree has been deleted successfully.",
        variant: "success",
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast({
        title: "Error deleting problem tree",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Function to handle array fields
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

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    mutation.mutate(data);
  };

  // Cancel button handler
  const handleCancel = () => {
    form.reset();
    if (onSuccess) {
      onSuccess();
    }
  };

  // Delete button handler
  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this problem tree?')) {
      deleteMutation.mutate();
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Give your problem tree a title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="mainProblem"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Main Problem</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe the main problem you're analyzing" 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          {/* Sub-Problems fields */}
          <FormField
            control={form.control}
            name="subProblems"
            render={() => (
              <FormItem>
                <FormLabel>Sub-Problems</FormLabel>
                <div className="space-y-2">
                  {form.watch("subProblems").map((_, index) => (
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
                        disabled={form.watch("subProblems").length <= 1}
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
                {form.formState.errors.subProblems?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.subProblems.message.toString()}</p>
                )}
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
                  {form.watch("rootCauses").map((_, index) => (
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
                        disabled={form.watch("rootCauses").length <= 1}
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
                {form.formState.errors.rootCauses?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.rootCauses.message.toString()}</p>
                )}
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
                  {form.watch("potentialSolutions").map((_, index) => (
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
                        disabled={form.watch("potentialSolutions").length <= 1}
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
                {form.formState.errors.potentialSolutions?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.potentialSolutions.message.toString()}</p>
                )}
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
                  {form.watch("nextActions").map((_, index) => (
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
                        disabled={form.watch("nextActions").length <= 1}
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
                {form.formState.errors.nextActions?.message && (
                  <p className="text-sm font-medium text-destructive">{form.formState.errors.nextActions.message.toString()}</p>
                )}
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