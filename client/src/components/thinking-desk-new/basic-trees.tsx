import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { PlusIcon, NetworkIcon, EditIcon, TrashIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

interface BasicTreesProps {
  showNewProblemTree?: boolean;
  onDialogClose?: () => void;
}

// Main component export
export function BasicTrees({ showNewProblemTree = false, onDialogClose }: BasicTreesProps) {
  // State
  const [title, setTitle] = useState('');
  const [mainProblem, setMainProblem] = useState('');
  const [subProblems, setSubProblems] = useState(['']);
  const [rootCauses, setRootCauses] = useState(['']);
  const [potentialSolutions, setPotentialSolutions] = useState(['']);
  const [nextActions, setNextActions] = useState(['']);
  
  const [formOpen, setFormOpen] = useState(showNewProblemTree);
  const [selectedTree, setSelectedTree] = useState<ProblemTree | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hooks
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Update dialog visibility when prop changes
  useEffect(() => {
    setFormOpen(showNewProblemTree);
  }, [showNewProblemTree]);
  
  // Reset form
  const resetForm = () => {
    setTitle('');
    setMainProblem('');
    setSubProblems(['']);
    setRootCauses(['']);
    setPotentialSolutions(['']);
    setNextActions(['']);
    setSelectedTree(null);
    setError(null);
  };
  
  // Fetch problem trees
  const { data: problemTrees = [], isLoading, refetch } = useQuery<ProblemTree[]>({
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
      resetForm();
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
        description: 'Problem tree deleted',
        variant: 'success'
      });
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
  
  // Remove an item from an array
  const removeArrayItem = (type: ArrayFieldType, index: number): void => {
    const currentArray = getArrayState(type);
    
    if (currentArray.length > 1 && index >= 0 && index < currentArray.length) {
      const newArray = currentArray.filter((_, i) => i !== index);
      setArrayState(type, newArray);
    }
  };
  
  // Update an item in an array
  const updateArrayItem = (type: ArrayFieldType, index: number, value: string): void => {
    const currentArray = getArrayState(type);
    
    if (index >= 0 && index < currentArray.length) {
      const newArray = [...currentArray];
      newArray[index] = value;
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
    const filteredSubProblems = subProblems.filter(item => item.trim());
    if (filteredSubProblems.length === 0) {
      newErrors.subProblems = 'At least one sub-problem is required';
    }
    
    const filteredRootCauses = rootCauses.filter(item => item.trim());
    if (filteredRootCauses.length === 0) {
      newErrors.rootCauses = 'At least one root cause is required';
    }
    
    const filteredSolutions = potentialSolutions.filter(item => item.trim());
    if (filteredSolutions.length === 0) {
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
  const handleSubmit = (): void => {
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Create data object with filtered values
    const data: ProblemTreeFormData = {
      title,
      mainProblem,
      subProblems: subProblems.filter(item => item.trim()),
      rootCauses: rootCauses.filter(item => item.trim()),
      potentialSolutions: potentialSolutions.filter(item => item.trim()),
      nextActions: nextActions.filter(item => item.trim())
    };
    
    console.log('Submitting data:', data);
    
    // Submit data
    createMutation.mutate(data);
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  };
  
  // View a problem tree
  const viewTree = (tree: ProblemTree) => {
    setSelectedTree(tree);
    setViewOpen(true);
  };
  
  // Delete a problem tree
  const deleteTree = (id: number) => {
    if (confirm('Are you sure you want to delete this problem tree?')) {
      deleteMutation.mutate(id);
    }
  };
  
  // Render empty state
  const renderEmptyState = () => (
    <div className="text-center py-8">
      <NetworkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-gray-700 mb-2">No Problem Trees Yet</h3>
      <p className="text-gray-500 mb-4">Start breaking down complex problems into manageable parts.</p>
      <Button
        variant="default"
        onClick={() => setFormOpen(true)}
      >
        <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Problem Tree
      </Button>
    </div>
  );
  
  // Render problem tree list
  const renderProblemTrees = () => {
    if (problemTrees.length === 0) {
      return renderEmptyState();
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {problemTrees.map((tree: ProblemTree) => (
          <Card key={tree.id} className="overflow-hidden h-full">
            <CardHeader>
              <CardTitle>{tree.title}</CardTitle>
              <CardDescription className="line-clamp-2">{tree.mainProblem}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-500 mb-4">
                <p>Updated: {formatDate(tree.updatedAt)}</p>
                <p>{tree.subProblems.length} sub-problems, {tree.potentialSolutions.length} solutions</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" onClick={() => viewTree(tree)}>View</Button>
                <Button size="sm" variant="destructive" onClick={() => deleteTree(tree.id)}>
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Main render
  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">Problem Trees</h2>
            <p className="text-gray-600">Break down complex problems to find effective solutions</p>
          </div>
          <Button onClick={() => setFormOpen(true)}>
            <PlusIcon className="mr-2 h-4 w-4" /> New Problem Tree
          </Button>
        </div>
        
        {isLoading ? (
          <div>Loading problem trees...</div>
        ) : (
          renderProblemTrees()
        )}
      </div>
      
      {/* Create Form Dialog */}
      <Dialog open={formOpen} onOpenChange={(open) => {
        setFormOpen(open);
        if (!open) {
          resetForm();
          if (onDialogClose) onDialogClose();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Problem Tree</DialogTitle>
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
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? 'Creating...' : 'Create Problem Tree'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* View Dialog */}
      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent>
          {selectedTree && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedTree.title}</DialogTitle>
                <DialogDescription>
                  Created: {formatDate(selectedTree.createdAt)} | 
                  Last updated: {formatDate(selectedTree.updatedAt)}
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-2">Main Problem</h3>
                  <p className="bg-gray-50 p-3 rounded-md">{selectedTree.mainProblem}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Sub Problems</h3>
                  <ul className="space-y-2">
                    {selectedTree.subProblems.map((problem, index) => (
                      <li key={`view-sub-${index}`} className="bg-gray-50 p-3 rounded-md">
                        {problem}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Root Causes</h3>
                  <ul className="space-y-2">
                    {selectedTree.rootCauses.map((cause, index) => (
                      <li key={`view-cause-${index}`} className="bg-gray-50 p-3 rounded-md">
                        {cause}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Potential Solutions</h3>
                  <ul className="space-y-2">
                    {selectedTree.potentialSolutions.map((solution, index) => (
                      <li key={`view-solution-${index}`} className="bg-gray-50 p-3 rounded-md">
                        {solution}
                      </li>
                    ))}
                  </ul>
                </div>
                
                {selectedTree.nextActions && selectedTree.nextActions.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Next Actions</h3>
                    <ul className="space-y-2">
                      {selectedTree.nextActions.map((action, index) => (
                        <li key={`view-action-${index}`} className="bg-gray-50 p-3 rounded-md">
                          {action}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <DialogFooter>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setViewOpen(false);
                    deleteTree(selectedTree.id);
                  }}
                >
                  Delete
                </Button>
                <Button variant="outline" onClick={() => setViewOpen(false)}>
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