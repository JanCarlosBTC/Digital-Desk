import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from '@tanstack/react-query';

interface ProblemTreeProps {
  onSuccess?: () => void;
}

export const ProblemTreeSimple = ({ onSuccess }: ProblemTreeProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Form state
  const [title, setTitle] = useState('');
  const [mainProblem, setMainProblem] = useState('');
  const [subProblems, setSubProblems] = useState(['']);
  const [rootCauses, setRootCauses] = useState(['']);
  const [potentialSolutions, setPotentialSolutions] = useState(['']);
  const [nextActions, setNextActions] = useState(['']);
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  // Add field handlers
  const addField = (field: 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions') => {
    switch(field) {
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
  
  // Remove field handlers
  const removeField = (field: 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions', index: number) => {
    if (field === 'subProblems' && subProblems.length > 1) {
      setSubProblems(subProblems.filter((_, i) => i !== index));
    } else if (field === 'rootCauses' && rootCauses.length > 1) {
      setRootCauses(rootCauses.filter((_, i) => i !== index));
    } else if (field === 'potentialSolutions' && potentialSolutions.length > 1) {
      setPotentialSolutions(potentialSolutions.filter((_, i) => i !== index));
    } else if (field === 'nextActions' && nextActions.length > 1) {
      setNextActions(nextActions.filter((_, i) => i !== index));
    }
  };
  
  // Update field handlers
  const updateField = (field: 'subProblems' | 'rootCauses' | 'potentialSolutions' | 'nextActions', index: number, value: string) => {
    if (field === 'subProblems') {
      const newSubProblems = [...subProblems];
      newSubProblems[index] = value;
      setSubProblems(newSubProblems);
    } else if (field === 'rootCauses') {
      const newRootCauses = [...rootCauses];
      newRootCauses[index] = value;
      setRootCauses(newRootCauses);
    } else if (field === 'potentialSolutions') {
      const newPotentialSolutions = [...potentialSolutions];
      newPotentialSolutions[index] = value;
      setPotentialSolutions(newPotentialSolutions);
    } else if (field === 'nextActions') {
      const newNextActions = [...nextActions];
      newNextActions[index] = value;
      setNextActions(newNextActions);
    }
  };
  
  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (!mainProblem.trim()) {
      newErrors.mainProblem = 'Main problem is required';
    }
    
    if (!subProblems.some(sp => sp.trim() !== '')) {
      newErrors.subProblems = 'At least one sub-problem is required';
    }
    
    if (!rootCauses.some(rc => rc.trim() !== '')) {
      newErrors.rootCauses = 'At least one root cause is required';
    }
    
    if (!potentialSolutions.some(ps => ps.trim() !== '')) {
      newErrors.potentialSolutions = 'At least one potential solution is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    // Filter out empty fields
    const filteredSubProblems = subProblems.filter(sp => sp.trim() !== '');
    const filteredRootCauses = rootCauses.filter(rc => rc.trim() !== '');
    const filteredPotentialSolutions = potentialSolutions.filter(ps => ps.trim() !== '');
    const filteredNextActions = nextActions.filter(na => na.trim() !== '');
    
    // Prepare data
    const data = {
      title,
      mainProblem,
      subProblems: filteredSubProblems,
      rootCauses: filteredRootCauses,
      potentialSolutions: filteredPotentialSolutions,
      nextActions: filteredNextActions
    };
    
    try {
      // Create new problem tree
      const response = await fetch('/api/problem-trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save problem tree');
      }
      
      // Success
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: 'Problem tree created',
        description: 'Your new problem tree has been created.',
        variant: 'success'
      });
      
      // Reset form
      setTitle('');
      setMainProblem('');
      setSubProblems(['']);
      setRootCauses(['']);
      setPotentialSolutions(['']);
      setNextActions(['']);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Create New Problem Tree
      </h2>
      <p className="text-gray-600 mb-6">
        Break down complex problems into root causes and potential solutions.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title field */}
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            placeholder="Give your problem tree a title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={errors.title ? 'border-destructive' : ''}
          />
          {errors.title && (
            <p className="text-sm font-medium text-destructive">{errors.title}</p>
          )}
        </div>
        
        {/* Main Problem field */}
        <div className="space-y-2">
          <label htmlFor="mainProblem" className="block text-sm font-medium">
            Main Problem
          </label>
          <Textarea
            id="mainProblem"
            placeholder="Describe the main problem you're analyzing"
            value={mainProblem}
            onChange={(e) => setMainProblem(e.target.value)}
            className={`min-h-20 ${errors.mainProblem ? 'border-destructive' : ''}`}
          />
          {errors.mainProblem && (
            <p className="text-sm font-medium text-destructive">{errors.mainProblem}</p>
          )}
        </div>
        
        {/* Sub Problems fields */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Sub Problems
          </label>
          {subProblems.map((subProblem, index) => (
            <div key={`sub-${index}`} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a sub-problem"
                value={subProblem}
                onChange={(e) => updateField('subProblems', index, e.target.value)}
                className={errors.subProblems ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeField('subProblems', index)}
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
            onClick={() => addField('subProblems')}
            className="mt-2"
          >
            Add Sub-Problem
          </Button>
          {errors.subProblems && (
            <p className="text-sm font-medium text-destructive">{errors.subProblems}</p>
          )}
        </div>
        
        {/* Root Causes fields */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Root Causes
          </label>
          {rootCauses.map((rootCause, index) => (
            <div key={`cause-${index}`} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a root cause"
                value={rootCause}
                onChange={(e) => updateField('rootCauses', index, e.target.value)}
                className={errors.rootCauses ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeField('rootCauses', index)}
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
            onClick={() => addField('rootCauses')}
            className="mt-2"
          >
            Add Root Cause
          </Button>
          {errors.rootCauses && (
            <p className="text-sm font-medium text-destructive">{errors.rootCauses}</p>
          )}
        </div>
        
        {/* Potential Solutions fields */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Potential Solutions
          </label>
          {potentialSolutions.map((solution, index) => (
            <div key={`solution-${index}`} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a potential solution"
                value={solution}
                onChange={(e) => updateField('potentialSolutions', index, e.target.value)}
                className={errors.potentialSolutions ? 'border-destructive' : ''}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeField('potentialSolutions', index)}
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
            onClick={() => addField('potentialSolutions')}
            className="mt-2"
          >
            Add Solution
          </Button>
          {errors.potentialSolutions && (
            <p className="text-sm font-medium text-destructive">{errors.potentialSolutions}</p>
          )}
        </div>
        
        {/* Next Actions fields */}
        <div className="space-y-2">
          <label className="block text-sm font-medium">
            Next Actions (Optional)
          </label>
          {nextActions.map((action, index) => (
            <div key={`action-${index}`} className="flex items-center space-x-2">
              <Input
                placeholder="Enter a next action"
                value={action}
                onChange={(e) => updateField('nextActions', index, e.target.value)}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeField('nextActions', index)}
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
            onClick={() => addField('nextActions')}
            className="mt-2"
          >
            Add Action
          </Button>
        </div>
        
        {/* Form buttons */}
        <div className="flex justify-end pt-4">
          <Button 
            type="submit"
            variant="thinkingDesk"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Problem Tree"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProblemTreeSimple;