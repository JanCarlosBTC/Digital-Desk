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
import { TextField, TextAreaField } from "@/components/ui/form-elements";
import { Tag } from "lucide-react";

// Define validation schema - simpler to avoid validation issues
const problemTreeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mainProblem: z.string().min(1, "Main problem is required"),
  subProblems: z.string().optional(),
  rootCauses: z.string().optional(),
  potentialSolutions: z.string().optional(),
  nextActions: z.string().optional()
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
      subProblems: selectedProblemTree.subProblems.join('\n'),
      rootCauses: selectedProblemTree.rootCauses.join('\n'),
      potentialSolutions: selectedProblemTree.potentialSolutions.join('\n'),
      nextActions: selectedProblemTree.nextActions.join('\n') || "",
    } : {
      title: "",
      mainProblem: "",
      subProblems: "",
      rootCauses: "",
      potentialSolutions: "",
      nextActions: ""
    }
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Process form data (convert string inputs to arrays)
      const formattedData = {
        title: data.title,
        mainProblem: data.mainProblem,
        subProblems: data.subProblems ? data.subProblems.split('\n').filter(line => line.trim() !== '') : [],
        rootCauses: data.rootCauses ? data.rootCauses.split('\n').filter(line => line.trim() !== '') : [],
        potentialSolutions: data.potentialSolutions ? data.potentialSolutions.split('\n').filter(line => line.trim() !== '') : [],
        nextActions: data.nextActions ? data.nextActions.split('\n').filter(line => line.trim() !== '') : []
      };
      
      // Make API request
      if (isEditing && selectedProblemTree) {
        const response = await fetch(`/api/problem-trees/${selectedProblemTree.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update problem tree');
        }
        
        return response.json();
      } else {
        const response = await fetch('/api/problem-trees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formattedData)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create problem tree');
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
      form.reset();
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
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
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok && response.status !== 204) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete problem tree');
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
      setIsEditing(false);
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
    deleteMutation.mutate();
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
          
          <FormField
            control={form.control}
            name="subProblems"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Problems (one per line)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List the sub-problems (one per line)" 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="rootCauses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Root Causes (one per line)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List the root causes (one per line)" 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="potentialSolutions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Potential Solutions (one per line)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List potential solutions (one per line)" 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nextActions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Next Actions (one per line)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="List next actions (one per line)" 
                    className="min-h-20"
                    {...field} 
                  />
                </FormControl>
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