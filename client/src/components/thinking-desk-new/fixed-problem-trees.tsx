import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlusIcon, NetworkIcon, TrashIcon, EditIcon, TreePine } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LoadingState } from '@/components/ui/loading-state';
import { ProblemTreeVisualization } from './visual-problem-tree';

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
  
  // Fetch problem trees
  const { 
    data: problemTrees = [], 
    isLoading,
    error: fetchError,
    refetch 
  } = useQuery<ProblemTree[]>({
    queryKey: ['/api/problem-trees'],
    refetchOnWindowFocus: false
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

  // Create mutation with proper type safety
  const createMutation = useMutation<ProblemTree, Error, ProblemTreeFormData>({
    mutationFn: async (data: ProblemTreeFormData) => {
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
      setError(error.message || 'An error occurred');
    }
  });
  
  // Update mutation with proper type safety
  interface UpdateProblemTreeParams {
    id: number;
    data: ProblemTreeFormData;
  }
  
  const updateMutation = useMutation<ProblemTree, Error, UpdateProblemTreeParams>({
    mutationFn: async ({ id, data }: UpdateProblemTreeParams) => {
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
    }
  });
  
  // Delete mutation with proper type safety
  const deleteMutation = useMutation<number, Error, number>({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/problem-trees/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok && response.status !== 204) {
        throw new Error('Failed to delete problem tree');
      }
      
      return id;
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
  
  // Type-safe form validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Required field validations
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!mainProblem.trim()) {
      newErrors.mainProblem = 'Main problem is required';
    }
    
    // Array field validations - require at least one non-empty item
    if (!subProblems.some(sp => sp.trim() !== '')) {
      newErrors.subProblems = 'At least one sub-problem is required';
    }
    
    if (!rootCauses.some(rc => rc.trim() !== '')) {
      newErrors.rootCauses = 'At least one root cause is required';
    }
    
    if (!potentialSolutions.some(ps => ps.trim() !== '')) {
      newErrors.potentialSolutions = 'At least one potential solution is required';
    }
    
    // If there are errors, set the first one to display and return false
    if (Object.keys(newErrors).length > 0) {
      const errorValues = Object.values(newErrors);
      const firstError = errorValues.length > 0 ? errorValues[0] : "Validation error";
      setError(firstError);
      return false;
    }
    
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
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-8 border border-dashed border-gray-300 rounded-lg">
      <NetworkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">No Problem Trees Yet</h3>
      <p className="text-gray-500 mb-4">Start breaking down complex problems into manageable parts.</p>
      <Button onClick={() => setFormOpen(true)}>
        <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Problem Tree
      </Button>
    </div>
  );
  
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Problem Trees</h2>
            <p className="text-gray-600">Break down complex problems to find effective solutions</p>
          </div>
          <Button variant="default" onClick={() => {
            resetForm();
            setFormOpen(true);
          }}>
            <PlusIcon className="mr-2 h-4 w-4" /> New Problem Tree
          </Button>
        </div>
        
        {/* Main content */}
        {isLoading ? (
          <LoadingState variant="skeleton" count={3} />
        ) : fetchError ? (
          <div className="bg-red-50 p-4 rounded-md text-red-700">
            <h3 className="font-medium">Error loading problem trees</h3>
            <p className="text-sm">Please try again</p>
          </div>
        ) : problemTrees.length === 0 ? (
          renderEmptyState()
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemTrees.map((tree) => (
              <Card key={tree.id} className="overflow-hidden border-2 border-gray-200 hover:border-gray-300 transition-all">
                <CardHeader className="pb-3 bg-gradient-to-r from-gray-50 to-white">
                  <div className="flex items-center gap-2">
                    <TreePine className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <CardTitle className="truncate text-lg">{tree.title}</CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 mt-1">{tree.mainProblem}</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Mini-visualization preview */}
                  <div className="mb-3 bg-gray-50 p-2 rounded-md text-xs text-gray-600 flex flex-col items-center">
                    <div className="bg-red-50 border border-red-100 rounded px-2 py-1 mb-1 w-4/5 text-center">Problem</div>
                    <div className="h-3 w-px bg-gray-300"></div>
                    <div className="flex gap-1 mb-1">
                      <div className="bg-yellow-50 border border-yellow-100 rounded px-2 py-1">Causes</div>
                      <div className="bg-green-50 border border-green-100 rounded px-2 py-1">Solutions</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <div>Updated: {formatDate(tree.updatedAt)}</div>
                    <div className="flex gap-1">
                      <span className="px-2 py-1 bg-orange-50 border border-orange-100 rounded-full text-xs">
                        {tree.subProblems.length} sub-problems
                      </span>
                      <span className="px-2 py-1 bg-green-50 border border-green-100 rounded-full text-xs">
                        {tree.potentialSolutions.length} solutions
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-3">
                    <Button
                      size="sm"
                      variant="default"
                      className="flex-1"
                      onClick={() => viewTree(tree)}
                    >
                      View Tree
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => editTree(tree)}
                    >
                      <EditIcon className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteTree(tree.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Create/Edit Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => {
        setFormOpen(open);
        if (!open) {
          resetForm();
          if (onDialogClose) onDialogClose();
        }
      }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Edit Problem Tree' : 'Create New Problem Tree'}</DialogTitle>
            <DialogDescription>
              Break down complex problems into root causes and potential solutions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                {error}
              </div>
            )}
            
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
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending 
                ? (isEditing ? 'Updating...' : 'Creating...') 
                : (isEditing ? 'Update Problem Tree' : 'Create Problem Tree')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={(open) => {
        setViewDialogOpen(open);
        if (!open) {
          // Small delay to prevent UI glitches when closing
          setTimeout(() => {
            setSelectedTree(null);
          }, 300);
        }
      }}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-auto flex flex-col bg-white z-50 border-2 border-gray-300 shadow-2xl">
          {selectedTree && (
            <>
              <DialogHeader className="flex-shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <TreePine className="h-5 w-5 text-gray-600" />
                  {selectedTree.title}
                </DialogTitle>
                <DialogDescription>
                  Created: {formatDate(selectedTree.createdAt)} | 
                  Last updated: {formatDate(selectedTree.updatedAt)}
                </DialogDescription>
              </DialogHeader>
              
              {/* Visual Problem Tree View */}
              <div className="border-2 border-gray-200 rounded-xl shadow-inner bg-white flex-grow overflow-auto">
                <ProblemTreeVisualization 
                  mainProblem={selectedTree.mainProblem}
                  subProblems={selectedTree.subProblems || []}
                  rootCauses={selectedTree.rootCauses || []}
                  potentialSolutions={selectedTree.potentialSolutions || []}
                  nextActions={selectedTree.nextActions || []}
                />
              </div>
              
              <DialogFooter className="space-x-2 flex-shrink-0 mt-4">
                <Button 
                  variant="destructive" 
                  onClick={() => deleteTree(selectedTree.id)}
                  disabled={deleteMutation.isPending}
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setViewDialogOpen(false);
                    // Small delay to ensure dialog is closed before opening the edit dialog
                    setTimeout(() => {
                      editTree(selectedTree);
                    }, 100);
                  }}
                >
                  <EditIcon className="h-4 w-4 mr-1" /> Edit
                </Button>
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}