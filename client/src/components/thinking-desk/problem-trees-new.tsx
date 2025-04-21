import React, { memo, useCallback, useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PlusIcon } from "lucide-react";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

/**
 * Problem Trees Component (New Implementation)
 * 
 * DEPRECATED: This implementation is transitional and will be replaced.
 * 
 * This component was an attempt to refactor the original Problem Trees component,
 * but has been superseded by the components in the thinking-desk-new directory.
 * The current active implementation is FixedProblemTrees in thinking-desk-new/fixed-problem-trees.tsx.
 * 
 * This file is kept for reference and backward compatibility, but will be removed in a future update.
 */

// Define the form schema for validating problem tree creation/editing
const problemTreeFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  mainProblem: z.string().min(1, "Main problem is required"),
  subProblems: z.string().optional(),
  rootCauses: z.string().optional(),
  potentialSolutions: z.string().optional(),
  nextActions: z.string().optional(),
});

// Define the form values type
type ProblemTreeFormValues = z.infer<typeof problemTreeFormSchema>;

// Define the ProblemTree interface
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

interface ProblemTreesProps {
  showNewProblemTree?: boolean;
  onDialogClose?: () => void;
  onEdit: (tree: ProblemTree) => void;
}

/**
 * Single Problem Tree Item Component
 * Displays an individual problem tree with a simplified, clean UI
 */
const ProblemTreeItem = memo(function ProblemTreeItem({ 
  tree, 
  onEdit,
  onDelete 
}: { 
  tree: ProblemTree; 
  onEdit: (tree: ProblemTree) => void;
  onDelete: (id: number) => void;
}) {
  const handleEdit = useCallback(() => {
    onEdit(tree);
  }, [tree, onEdit]);

  const handleDelete = useCallback(() => {
    onDelete(tree.id);
  }, [tree.id, onDelete]);

  // Render a list of items with consistent styling
  const renderList = (items: string[], title: string, colorClass: string) => {
    if (!items || items.length === 0) return null;
    
    return (
      <div className="mt-3">
        <h4 className={`font-semibold ${colorClass} text-sm mb-2`}>{title}</h4>
        <ul className="list-disc pl-5 space-y-1">
          {items.map((item, index) => (
            <li key={index} className="text-sm text-gray-700">{item}</li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow border border-gray-100">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-primary">{tree.title}</h3>
          <div className="mt-1 text-sm text-gray-500">
            {new Date(tree.updatedAt).toLocaleDateString()} • Problem Tree
          </div>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
      
      {/* Simple Problem Tree Visualization */}
      <div className="mt-4">
        <div className="p-4 bg-primary/10 rounded-lg mb-4">
          <h4 className="font-medium text-primary mb-2">Main Problem</h4>
          <p className="text-gray-800">{tree.mainProblem}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {renderList(tree.subProblems, "Sub Problems", "text-blue-600")}
            {renderList(tree.rootCauses, "Root Causes", "text-amber-600")}
          </div>
          <div>
            {renderList(tree.potentialSolutions, "Potential Solutions", "text-emerald-600")}
            {renderList(tree.nextActions, "Next Actions", "text-purple-600")}
          </div>
        </div>
      </div>
    </div>
  );
});

/**
 * Main Problem Trees Component
 * Manages the display of all problem trees and handles CRUD operations
 */
export const ProblemTrees = memo(function ProblemTrees({ 
  showNewProblemTree = false, 
  onDialogClose, 
  onEdit 
}: ProblemTreesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [sortField, setSortField] = useState<keyof ProblemTree>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();
  
  // Initialize form with default values
  const form = useForm<ProblemTreeFormValues>({
    resolver: zodResolver(problemTreeFormSchema),
    defaultValues: {
      title: "",
      mainProblem: "",
      subProblems: "",
      rootCauses: "",
      potentialSolutions: "",
      nextActions: ""
    }
  });
  
  // Listen for showNewProblemTree prop changes
  useEffect(() => {
    if (showNewProblemTree) {
      setIsDialogOpen(true);
    }
  }, [showNewProblemTree]);
  
  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };
  
  // Mutation for creating a new problem tree
  const createMutation = useMutation({
    mutationFn: async (data: ProblemTreeFormValues) => {
      // Process form data (convert string inputs to arrays)
      const formattedData = {
        title: data.title,
        mainProblem: data.mainProblem,
        subProblems: data.subProblems ? data.subProblems.split('\n').filter(line => line.trim() !== '') : [],
        rootCauses: data.rootCauses ? data.rootCauses.split('\n').filter(line => line.trim() !== '') : [],
        potentialSolutions: data.potentialSolutions ? data.potentialSolutions.split('\n').filter(line => line.trim() !== '') : [],
        nextActions: data.nextActions ? data.nextActions.split('\n').filter(line => line.trim() !== '') : []
      };
      
      // Make the API request to create a problem tree
      const response = await fetch('/api/problem-trees', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      // Handle response errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create problem tree');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Success",
        description: "Problem tree created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating problem tree",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Handle form submission
  const onSubmit = (data: ProblemTreeFormValues) => {
    createMutation.mutate(data);
  };
  
  // Open the dialog for creating a new problem tree
  const handleNewProblemTree = () => {
    form.reset({
      title: "",
      mainProblem: "",
      subProblems: "",
      rootCauses: "",
      potentialSolutions: "",
      nextActions: ""
    });
    setIsDialogOpen(true);
  };

  // Query to fetch problem trees data
  const { data: problemTreesData, isLoading, error } = useQuery({
    queryKey: ['/api/problem-trees']
  });
  
  // Safely cast the data as ProblemTree[]
  const trees = Array.isArray(problemTreesData) ? problemTreesData as ProblemTree[] : [];

  // Mutation for deleting a problem tree
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/problem-trees/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete problem tree');
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Success",
        description: "Problem tree deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting problem tree",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle deletion of a problem tree
  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError]);

  // Handle sorting of problem trees
  const handleSort = useCallback((field: keyof ProblemTree) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  // Sort problem trees based on selected field and direction
  const sortedTrees = useMemo(() => {
    if (!trees.length) return [];
    
    return [...trees].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });
  }, [trees, sortField, sortDirection]);

  // Show loading state while fetching data
  if (isLoading) {
    return <LoadingState variant="skeleton" count={3} />;
  }

  // Show error state if there was an error fetching data
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <h3 className="font-medium">Error Loading Problem Trees</h3>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : "An unknown error occurred. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <>
      <Card className="shadow-lg border-0">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                Problem Trees
              </CardTitle>
              <CardDescription className="text-gray-600 text-sm mt-1">
                Analyze complex issues by breaking them down into components
              </CardDescription>
            </div>
            <Button
              onClick={handleNewProblemTree}
              variant="default"
              size="sm"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> New Problem Tree
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex justify-end space-x-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('title')}
            >
              Sort by Title
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSort('updatedAt')}
            >
              Sort by Date
            </Button>
          </div>
          
          {sortedTrees.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No problem trees found. Create your first one!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {sortedTrees.map(tree => (
                <ProblemTreeItem
                  key={tree.id}
                  tree={tree}
                  onEdit={onEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog for creating a new problem tree */}
      <DialogForm
        title="Create New Problem Tree"
        description="Analyze complex issues by breaking them down into components"
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={form.handleSubmit(onSubmit)}
        submitLabel="Create Problem Tree"
        isSubmitting={createMutation.isPending}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Give your problem tree a title" {...field} />
                  </FormControl>
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
                      placeholder="List next actions or steps (one per line)" 
                      className="min-h-20"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </DialogForm>
    </>
  );
}); 