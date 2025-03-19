import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { PlusIcon, NetworkIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Define the Problem Tree type
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

interface MinimalProblemTreesProps {
  showNewProblemTree?: boolean;
  onDialogClose?: () => void;
}

export function MinimalProblemTrees({ 
  showNewProblemTree = false, 
  onDialogClose 
}: MinimalProblemTreesProps) {
  // State
  const [title, setTitle] = useState('');
  const [mainProblem, setMainProblem] = useState('');
  const [subProblems, setSubProblems] = useState(['']);
  const [rootCauses, setRootCauses] = useState(['']);
  const [potentialSolutions, setPotentialSolutions] = useState(['']);
  const [nextActions, setNextActions] = useState(['']);
  
  const [formOpen, setFormOpen] = useState(showNewProblemTree);
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
    setError(null);
  };
  
  // Fetch problem trees
  const { 
    data = [], 
    isLoading,
    refetch 
  } = useQuery<ProblemTree[]>({
    queryKey: ['/api/problem-trees'],
    refetchOnWindowFocus: false
  });
  
  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (formData: any) => {
      console.log('Creating with data:', formData);
      const response = await fetch('/api/problem-trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create problem tree');
      }
      
      return response.json();
    },
    onSuccess: () => {
      console.log('Success! Created problem tree');
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
    onError: (error) => {
      console.error('Error creating problem tree:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create problem tree',
        variant: 'destructive'
      });
      setError(error instanceof Error ? error.message : 'An error occurred');
    }
  });
  
  // Add or remove array items
  const addArrayItem = (type: 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions') => {
    switch (type) {
      case 'subProblems':
        setSubProblems([...subProblems, '']);
        break;
      case 'rootCauses':
        setRootCauses([...rootCauses, '']);
        break;
      case 'potentialSolutions':
        setPotentialSolutions([...potentialSolutions, '']);
        break;
      case 'nextActions':
        setNextActions([...nextActions, '']);
        break;
    }
  };
  
  const updateArrayItem = (type: 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions', index: number, value: string) => {
    switch (type) {
      case 'subProblems':
        const newSubProblems = [...subProblems];
        newSubProblems[index] = value;
        setSubProblems(newSubProblems);
        break;
      case 'rootCauses':
        const newRootCauses = [...rootCauses];
        newRootCauses[index] = value;
        setRootCauses(newRootCauses);
        break;
      case 'potentialSolutions':
        const newSolutions = [...potentialSolutions];
        newSolutions[index] = value;
        setPotentialSolutions(newSolutions);
        break;
      case 'nextActions':
        const newActions = [...nextActions];
        newActions[index] = value;
        setNextActions(newActions);
        break;
    }
  };
  
  const removeArrayItem = (type: 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions', index: number) => {
    switch (type) {
      case 'subProblems':
        if (subProblems.length > 1) {
          setSubProblems(subProblems.filter((_, i) => i !== index));
        }
        break;
      case 'rootCauses':
        if (rootCauses.length > 1) {
          setRootCauses(rootCauses.filter((_, i) => i !== index));
        }
        break;
      case 'potentialSolutions':
        if (potentialSolutions.length > 1) {
          setPotentialSolutions(potentialSolutions.filter((_, i) => i !== index));
        }
        break;
      case 'nextActions':
        if (nextActions.length > 1) {
          setNextActions(nextActions.filter((_, i) => i !== index));
        }
        break;
    }
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!mainProblem.trim()) {
      setError('Main problem is required');
      return;
    }
    
    // Filter out empty fields
    const filteredSubProblems = subProblems.filter(item => item.trim());
    if (filteredSubProblems.length === 0) {
      setError('At least one sub-problem is required');
      return;
    }
    
    const filteredRootCauses = rootCauses.filter(item => item.trim());
    if (filteredRootCauses.length === 0) {
      setError('At least one root cause is required');
      return;
    }
    
    const filteredSolutions = potentialSolutions.filter(item => item.trim());
    if (filteredSolutions.length === 0) {
      setError('At least one potential solution is required');
      return;
    }
    
    // Create data object
    const formData = {
      title,
      mainProblem,
      subProblems: filteredSubProblems,
      rootCauses: filteredRootCauses,
      potentialSolutions: filteredSolutions,
      nextActions: nextActions.filter(item => item.trim())
    };
    
    console.log('Submitting data:', formData);
    
    // Submit data
    createMutation.mutate(formData);
  };
  
  // Format date for display
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString();
  };
  
  const problemTrees = data as ProblemTree[];
  
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
        ) : problemTrees.length === 0 ? (
          <div className="text-center py-8">
            <NetworkIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Problem Trees Yet</h3>
            <p className="text-gray-500 mb-4">Start breaking down complex problems into manageable parts.</p>
            <Button onClick={() => setFormOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Problem Tree
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {problemTrees.map((tree) => (
              <Card key={tree.id} className="overflow-hidden h-full">
                <CardHeader>
                  <CardTitle>{tree.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{tree.mainProblem}</p>
                  <div className="text-sm text-gray-500">
                    <p>Updated: {formatDate(tree.updatedAt)}</p>
                    <p>{tree.subProblems.length} sub-problems, {tree.potentialSolutions.length} solutions</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
    </>
  );
}