/**
 * Problem Trees Hook
 * 
 * A domain-specific hook that composes our shared utilities for Problem Trees functionality.
 * This pattern extracts business logic from components and provides a consistent API.
 */

import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import useApiResource from '@/hooks/use-api-resource';

// Type definitions
export interface ProblemTree {
  id: string;
  title: string;
  description: string;
  rootProblem: string;
  causes: string[];
  consequences: string[];
  createdAt: string;
  updatedAt: string;
}

// Form input type
export interface ProblemTreeInput {
  title: string;
  description: string;
  rootProblem: string;
  causes: string[];
  consequences: string[];
}

// API path
const PROBLEM_TREES_API_PATH = '/api/problem-trees';

/**
 * Custom hook for problem trees management
 */
export function useProblemTrees() {
  const [causes, setCauses] = useState<string[]>([]);
  const [consequences, setConsequences] = useState<string[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Hook for fetching and creating problem trees
  const { 
    query: { 
      data: problemTrees = [], 
      isLoading, 
      networkError, 
      refetch,
      clearNetworkError,
      isError 
    },
    mutation: {
      mutate: createTreeMutation,
      isLoading: isCreating,
      error: createError,
      resetError: resetCreateError
    }
  } = useApiResource<ProblemTree[], ProblemTreeInput>(
    PROBLEM_TREES_API_PATH,
    ['problemTrees'],
    {
      optimisticUpdate: (client, variables) => {
        // Create an optimistic version of the new problem tree
        const optimisticTree: ProblemTree = {
          id: `temp-${Date.now()}`,
          ...variables,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        // Add it to the cache
        client.setQueryData<ProblemTree[]>(['problemTrees'], old => 
          [optimisticTree, ...(old || [])]
        );
      }
    }
  );
  
  // Hook for deleting problem trees
  const { 
    mutation: {
      mutateAsync: deleteTreeMutation,
      isLoading: isDeleting
    }
  } = useApiResource<void, string>(
    `${PROBLEM_TREES_API_PATH}/:id`,
    ['problemTrees'],
    {
      fetchOptions: {
        method: 'DELETE'
      },
      optimisticUpdate: (client, id) => {
        // Optimistically remove from cache
        client.setQueryData<ProblemTree[]>(['problemTrees'], old => 
          (old || []).filter(tree => tree.id !== id)
        );
      }
    }
  );
  
  // Create problem tree
  const createProblemTree = useCallback(async (data: ProblemTreeInput, onSuccess?: () => void) => {
    try {
      await createTreeMutation(data);
      
      // Reset form state
      setCauses([]);
      setConsequences([]);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Problem tree created successfully",
        variant: "default"
      });
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      console.error('Error creating problem tree:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to create problem tree. Please try again.",
        variant: "destructive"
      });
      
      return false;
    }
  }, [createTreeMutation, toast]);
  
  // Validate problem tree input
  const validateProblemTree = useCallback((data: Omit<ProblemTreeInput, 'causes' | 'consequences'>) => {
    const errors: Record<string, string> = {};
    
    if (!data.title?.trim()) {
      errors.title = 'Title is required';
    } else if (data.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!data.rootProblem?.trim()) {
      errors.rootProblem = 'Root problem is required';
    } else if (data.rootProblem.length < 5) {
      errors.rootProblem = 'Root problem must be at least 5 characters';
    }
    
    if (causes.length === 0) {
      errors.causes = 'At least one cause is required';
    }
    
    if (consequences.length === 0) {
      errors.consequences = 'At least one consequence is required';
    }
    
    return { isValid: Object.keys(errors).length === 0, errors };
  }, [causes, consequences]);
  
  // Handle full form submission
  const handleSubmit = useCallback(async (data: Omit<ProblemTreeInput, 'causes' | 'consequences'>, onSuccess?: () => void) => {
    const { isValid, errors } = validateProblemTree(data);
    
    if (!isValid) {
      // Show the first error
      const firstError = Object.values(errors)[0];
      toast({
        title: "Validation Error",
        description: firstError,
        variant: "destructive"
      });
      return false;
    }
    
    return await createProblemTree({
      ...data,
      causes,
      consequences
    }, onSuccess);
  }, [causes, consequences, createProblemTree, validateProblemTree, toast]);
  
  // Delete problem tree
  const deleteProblemTree = useCallback(async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTreeMutation(id);
      
      // Show success toast
      toast({
        title: "Success",
        description: "Problem tree deleted successfully",
        variant: "default"
      });
    } catch (error) {
      console.error('Error deleting problem tree:', error);
      
      // Show error toast
      toast({
        title: "Error",
        description: "Failed to delete problem tree. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingId(null);
    }
  }, [deleteTreeMutation, toast]);
  
  // Add cause
  const addCause = useCallback((cause: string) => {
    if (!cause.trim()) {
      toast({
        title: "Invalid input",
        description: "Cause cannot be empty",
        variant: "destructive"
      });
      return false;
    }
    
    if (causes.includes(cause.trim())) {
      toast({
        title: "Duplicate",
        description: "This cause already exists",
        variant: "destructive"
      });
      return false;
    }
    
    setCauses(prev => [...prev, cause.trim()]);
    return true;
  }, [causes, toast]);
  
  // Remove cause
  const removeCause = useCallback((indexToRemove: number) => {
    setCauses(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);
  
  // Add consequence
  const addConsequence = useCallback((consequence: string) => {
    if (!consequence.trim()) {
      toast({
        title: "Invalid input",
        description: "Consequence cannot be empty",
        variant: "destructive"
      });
      return false;
    }
    
    if (consequences.includes(consequence.trim())) {
      toast({
        title: "Duplicate",
        description: "This consequence already exists",
        variant: "destructive"
      });
      return false;
    }
    
    setConsequences(prev => [...prev, consequence.trim()]);
    return true;
  }, [consequences, toast]);
  
  // Remove consequence
  const removeConsequence = useCallback((indexToRemove: number) => {
    setConsequences(prev => prev.filter((_, index) => index !== indexToRemove));
  }, []);
  
  // Reset form
  const resetForm = useCallback(() => {
    setCauses([]);
    setConsequences([]);
    resetCreateError();
  }, [resetCreateError]);
  
  return {
    // State
    problemTrees,
    causes,
    consequences,
    deletingId,
    
    // Status
    isLoading,
    isCreating,
    isDeleting,
    isError,
    networkError,
    createError,
    
    // Actions
    createProblemTree,
    deleteProblemTree,
    addCause,
    removeCause,
    addConsequence,
    removeConsequence,
    handleSubmit,
    resetForm,
    refetch,
    clearNetworkError
  };
}

export default useProblemTrees; 