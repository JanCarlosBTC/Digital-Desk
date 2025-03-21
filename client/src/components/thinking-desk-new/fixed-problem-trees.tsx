import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlusIcon, NetworkIcon, TrashIcon, EditIcon, TreePine, AlertTriangleIcon, InfoIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingState } from '@/components/ui/loading-state';
import { ProblemTreeVisualization } from './visual-problem-tree';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// Type definitions
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

interface FixedProblemTreesProps {
  showNewProblemTree?: boolean;
  onDialogClose?: () => void;
}

export function FixedProblemTrees({ showNewProblemTree = false, onDialogClose }: FixedProblemTreesProps) {
  // State
  const [title, setTitle] = useState('');
  const [mainProblem, setMainProblem] = useState('');
  const [subProblems, setSubProblems] = useState<string[]>(['']);
  const [rootCauses, setRootCauses] = useState<string[]>(['']);
  const [potentialSolutions, setPotentialSolutions] = useState<string[]>(['']);
  const [nextActions, setNextActions] = useState<string[]>(['']);
  
  const [formOpen, setFormOpen] = useState(showNewProblemTree);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTree, setSelectedTree] = useState<ProblemTree | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Update dialog visibility when prop changes
  useEffect(() => {
    setFormOpen(showNewProblemTree);
  }, [showNewProblemTree]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!formOpen) {
      resetForm();
      if (onDialogClose) onDialogClose();
    }
  }, [formOpen, onDialogClose]);
  
  // Set form data when editing
  useEffect(() => {
    if (selectedTree && isEditing) {
      setTitle(selectedTree.title);
      setMainProblem(selectedTree.mainProblem);
      setSubProblems(selectedTree.subProblems.length > 0 ? selectedTree.subProblems : ['']);
      setRootCauses(selectedTree.rootCauses.length > 0 ? selectedTree.rootCauses : ['']);
      setPotentialSolutions(selectedTree.potentialSolutions.length > 0 ? selectedTree.potentialSolutions : ['']);
      setNextActions(selectedTree.nextActions.length > 0 ? selectedTree.nextActions : ['']);
    }
  }, [selectedTree, isEditing]);
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setMainProblem('');
    setSubProblems(['']);
    setRootCauses(['']);
    setPotentialSolutions(['']);
    setNextActions(['']);
    setError(null);
    setIsEditing(false);
    setSelectedTree(null);
  };
  
  // Improved fetch problem trees with retry and better error handling
  const { 
    data: problemTrees = [], 
    isLoading,
    error: fetchError,
    isError,
    refetch,
    isRefetching 
  } = useQuery<ProblemTree[]>({
    queryKey: ['/api/problem-trees'],
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attempt) => Math.min(attempt > 1 ? 2 ** attempt * 1000 : 1000, 30 * 1000),
    onSuccess: () => {
      // Clear any network errors on successful fetch
      setNetworkError(null);
    },
    onError: (error: Error) => {
      console.error('Error fetching problem trees:', error);
      setNetworkError(error.message || 'Failed to load problem trees');
    }
  });
  
  // Type definition for problem tree form data
  interface ProblemTreeFormData {
    title: string;
    mainProblem: string;
    subProblems: string[];
    rootCauses: string[];
    potentialSolutions: string[];
    nextActions: string[];
  }

  // Improved create mutation with proper loading states
  const createMutation = useMutation<ProblemTree, Error, ProblemTreeFormData>({
    mutationFn: async (data: ProblemTreeFormData) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        console.log('Creating tree with data:', data);
        const response = await fetch('/api/problem-trees', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to create problem tree');
        }
        
        return response.json();
      } catch (error) {
        console.error('API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
        setError(errorMessage);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      console.log('Creation successful');
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: 'Success',
        description: 'Problem tree created successfully',
        variant: 'success'
      });
      setFormOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      console.error('Creation error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to create problem tree',
        variant: 'destructive'
      });
      // Error is already set in mutationFn
    }
  });
  
  // Update mutation with proper type safety
  interface UpdateProblemTreeParams {
    id: number;
    data: ProblemTreeFormData;
  }
  
  // Improved update mutation with proper loading states
  const updateMutation = useMutation<ProblemTree, Error, UpdateProblemTreeParams>({
    mutationFn: async ({ id, data }: UpdateProblemTreeParams) => {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/problem-trees/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update problem tree');
        }
        
        return response.json();
      } catch (error) {
        console.error('API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
        setError(errorMessage);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: 'Success',
        description: 'Problem tree updated successfully',
        variant: 'success'
      });
      setFormOpen(false);
      setIsEditing(false);
      refetch();
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update problem tree',
        variant: 'destructive'
      });
      // Error is already set in mutationFn
    }
  });
  
  // Improved delete mutation with proper loading states
  const deleteMutation = useMutation<number, Error, number>({
    mutationFn: async (id: number) => {
      setIsDeleting(true);
      
      try {
        const response = await fetch(`/api/problem-trees/${id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok && response.status !== 204) {
          throw new Error('Failed to delete problem tree');
        }
        
        return id;
      } catch (error) {
        console.error('API error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive'
        });
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: 'Success',
        description: 'Problem tree deleted successfully',
        variant: 'success'
      });
      setViewDialogOpen(false);
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete problem tree',
        variant: 'destructive'
      });
    }
  });
  
  // Define a type for array field types
  type ArrayFieldType = 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions';
  
  // Generic type-safe getter for array state
  const getArrayState = (type: ArrayFieldType): string[] => {
    switch (type) {
      case 'subProblems':
        return subProblems;
      case 'rootCauses':
        return rootCauses;
      case 'potentialSolutions':
        return potentialSolutions;
      case 'nextActions':
        return nextActions;
      default:
        // This should never happen due to TypeScript's type checking
        throw new Error(`Invalid array field type: ${type}`);
    }
  };
  
  // Generic type-safe setter for array state
  const setArrayState = (type: ArrayFieldType, value: string[]): void => {
    switch (type) {
      case 'subProblems':
        setSubProblems(value);
        break;
      case 'rootCauses':
        setRootCauses(value);
        break;
      case 'potentialSolutions':
        setPotentialSolutions(value);
        break;
      case 'nextActions':
        setNextActions(value);
        break;
      default:
        // This should never happen due to TypeScript's type checking
        throw new Error(`Invalid array field type: ${type}`);
    }
  };
  
  // Add a new empty item to an array
  const addArrayItem = (type: ArrayFieldType): void => {
    const currentArray = getArrayState(type);
    setArrayState(type, [...currentArray, '']);
  };
  
  // Update an item in an array
  const updateArrayItem = (type: ArrayFieldType, index: number, value: string): void => {
    const currentArray = getArrayState(type);
    const newArray = [...currentArray];
    
    if (index >= 0 && index < newArray.length) {
      newArray[index] = value;
      setArrayState(type, newArray);
    }
  };
  
  // Remove an item from an array
  const removeArrayItem = (type: ArrayFieldType, index: number): void => {
    const currentArray = getArrayState(type);
    
    if (currentArray.length > 1 && index >= 0 && index < currentArray.length) {
      const newArray = currentArray.filter((_, i) => i !== index);
      setArrayState(type, newArray);
    }
  };
  
  // Define validation error type
  interface ValidationErrors {
    title?: string;
    mainProblem?: string;
    subProblems?: string;
    rootCauses?: string;
    potentialSolutions?: string;
    nextActions?: string;
  }
  
  // Improved validation with better user feedback
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Required field validations
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 3) {
      newErrors.title = 'Title must be at least 3 characters';
    }
    
    if (!mainProblem.trim()) {
      newErrors.mainProblem = 'Main problem statement is required';
    }
    
    // Array field validations - require at least one non-empty item
    const nonEmptySubproblems = subProblems.filter(item => item.trim());
    if (nonEmptySubproblems.length === 0) {
      newErrors.subProblems = 'At least one sub-problem is required';
    }
    
    const nonEmptyRootCauses = rootCauses.filter(item => item.trim());
    if (nonEmptyRootCauses.length === 0) {
      newErrors.rootCauses = 'At least one root cause is required';
    }
    
    const nonEmptySolutions = potentialSolutions.filter(item => item.trim());
    if (nonEmptySolutions.length === 0) {
      newErrors.potentialSolutions = 'At least one potential solution is required';
    }
    
    // If there are errors, set the first one to display and return false
    if (Object.keys(newErrors).length > 0) {
      const errorValues = Object.values(newErrors);
      const firstError = errorValues.length > 0 ? errorValues[0] : "Please fix validation errors before submitting";
      setError(firstError);
      return false;
    }
    
    setError(null);
    return true;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const data = {
      title,
      mainProblem,
      subProblems: subProblems.filter(item => item.trim() !== ''),
      rootCauses: rootCauses.filter(item => item.trim() !== ''),
      potentialSolutions: potentialSolutions.filter(item => item.trim() !== ''),
      nextActions: nextActions.filter(item => item.trim() !== '')
    };
    
    console.log('Submitting data:', data);
    
    if (isEditing && selectedTree) {
      updateMutation.mutate({ id: selectedTree.id, data });
    } else {
      createMutation.mutate(data);
    }
  };
  
  // View a tree's details
  const viewTree = (tree: ProblemTree) => {
    setSelectedTree(tree);
    setViewDialogOpen(true);
  };
  
  // Edit a tree
  const editTree = (tree: ProblemTree) => {
    if (!tree) return;
    
    setSelectedTree({...tree}); // Create a copy to avoid reference issues
    setIsEditing(true);
    setViewDialogOpen(false);
    setFormOpen(true);
  };
  
  // Delete a tree
  const deleteTree = (id: number) => {
    if (confirm('Are you sure you want to delete this problem tree?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Improved rendering for empty states and errors
  const renderEmptyState = () => (
    <div className="text-center py-12 border border-dashed border-gray-300 rounded-lg">
      <NetworkIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-700 mb-2">No Problem Trees Yet</h3>
      <p className="text-gray-500 mb-4 max-w-md mx-auto">
        Create your first problem tree to break down complex problems into actionable solutions.
      </p>
      <Button onClick={() => setFormOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Problem Tree
      </Button>
    </div>
  );
  
  // New component to show network errors with retry
  const renderNetworkError = () => (
    <div className="text-center py-10 border border-dashed border-red-200 rounded-lg bg-red-50">
      <AlertTriangleIcon className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <h3 className="text-lg font-medium text-red-700 mb-2">Connection Error</h3>
      <p className="text-red-600 mb-4 max-w-md mx-auto">
        {networkError || "We couldn't load your problem trees. There might be a connection issue."}
      </p>
      <Button 
        variant="outline" 
        onClick={() => {
          setNetworkError(null);
          refetch();
        }}
        disabled={isRefetching}
      >
        {isRefetching ? 'Retrying...' : 'Try Again'}
      </Button>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 flex items-center">
            Problem Trees
            <Tooltip>
              <TooltipTrigger asChild>
                <InfoIcon className="h-4 w-4 text-gray-500 ml-2 cursor-help" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Break down complex problems into root causes and potential solutions
              </TooltipContent>
            </Tooltip>
          </h2>
          <p className="text-gray-600 mt-1">
            Break down complex problems into root causes and potential solutions.
          </p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setFormOpen(true);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Problem Tree
        </Button>
      </div>
      
      {/* Content Display Area */}
      <div className="mt-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-36 w-full rounded-lg" />
            ))}
          </div>
        ) : networkError ? (
          renderNetworkError()
        ) : problemTrees.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemTrees.map(tree => (
              <Card 
                key={tree.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => viewTree(tree)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-primary truncate">{tree.title}</CardTitle>
                  <CardDescription className="text-xs">
                    Last updated: {formatDate(tree.updatedAt)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm font-medium mb-2">Problem: {tree.mainProblem}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    <Badge variant="outline" className="bg-blue-50">
                      {tree.subProblems.length} sub-problems
                    </Badge>
                    <Badge variant="outline" className="bg-amber-50">
                      {tree.rootCauses.length} root causes
                    </Badge>
                    <Badge variant="outline" className="bg-green-50">
                      {tree.potentialSolutions.length} solutions
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Problem Tree' : 'Create New Problem Tree'}</DialogTitle>
            <DialogDescription>
              Break down a complex problem into its components, causes and solutions.
            </DialogDescription>
          </DialogHeader>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-3 text-red-600 text-sm mb-4">
              {error}
            </div>
          )}
          
          <div className="space-y-4 py-4">
            {/* Title field */}
            <div className="space-y-2">
              <label className="font-medium">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your problem tree a title"
              />
            </div>
            
            {/* Main Problem field */}
            <div className="space-y-2">
              <label className="font-medium">Main Problem</label>
              <Textarea
                value={mainProblem}
                onChange={(e) => setMainProblem(e.target.value)}
                placeholder="Describe the main problem you're analyzing"
                className="min-h-[100px]"
              />
            </div>
            
            {/* Sub Problems */}
            <div className="space-y-2">
              <label className="font-medium">Sub Problems</label>
              {subProblems.map((problem, index) => (
                <div key={`sub-${index}`} className="flex space-x-2">
                  <Input
                    value={problem}
                    onChange={(e) => updateArrayItem('subProblems', index, e.target.value)}
                    placeholder="Enter a sub-problem"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('subProblems', index)}
                    disabled={subProblems.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('subProblems')}
              >
                Add Sub-Problem
              </Button>
            </div>
            
            {/* Root Causes */}
            <div className="space-y-2">
              <label className="font-medium">Root Causes</label>
              {rootCauses.map((cause, index) => (
                <div key={`cause-${index}`} className="flex space-x-2">
                  <Input
                    value={cause}
                    onChange={(e) => updateArrayItem('rootCauses', index, e.target.value)}
                    placeholder="Enter a root cause"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('rootCauses', index)}
                    disabled={rootCauses.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('rootCauses')}
              >
                Add Root Cause
              </Button>
            </div>
            
            {/* Potential Solutions */}
            <div className="space-y-2">
              <label className="font-medium">Potential Solutions</label>
              {potentialSolutions.map((solution, index) => (
                <div key={`solution-${index}`} className="flex space-x-2">
                  <Input
                    value={solution}
                    onChange={(e) => updateArrayItem('potentialSolutions', index, e.target.value)}
                    placeholder="Enter a potential solution"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('potentialSolutions', index)}
                    disabled={potentialSolutions.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('potentialSolutions')}
              >
                Add Solution
              </Button>
            </div>
            
            {/* Next Actions */}
            <div className="space-y-2">
              <label className="font-medium">Next Actions (Optional)</label>
              {nextActions.map((action, index) => (
                <div key={`action-${index}`} className="flex space-x-2">
                  <Input
                    value={action}
                    onChange={(e) => updateArrayItem('nextActions', index, e.target.value)}
                    placeholder="Enter a next action"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeArrayItem('nextActions', index)}
                    disabled={nextActions.length <= 1}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('nextActions')}
              >
                Add Action
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-6 flex items-center justify-between">
            <div>
              {isSubmitting && (
                <span className="text-sm text-primary animate-pulse">
                  {isEditing ? 'Updating...' : 'Creating...'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                onClick={() => setFormOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isEditing ? 'Update' : 'Create'} Problem Tree
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedTree && (
            <>
              <DialogHeader className="mb-4">
                <div className="flex justify-between items-start">
                  <DialogTitle className="text-xl font-bold text-primary">{selectedTree.title}</DialogTitle>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setViewDialogOpen(false);
                        editTree(selectedTree);
                      }}
                    >
                      <EditIcon className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => deleteTree(selectedTree.id)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <span className="animate-pulse">Deleting...</span>
                      ) : (
                        <>
                          <TrashIcon className="h-4 w-4 mr-1" /> Delete
                        </>
                      )}
                    </Button>
                  </div>
                </div>
                <DialogDescription className="text-sm text-gray-500 mt-1">
                  Created: {formatDate(selectedTree.createdAt)}
                </DialogDescription>
              </DialogHeader>
              
              <ProblemTreeVisualization tree={selectedTree} />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}