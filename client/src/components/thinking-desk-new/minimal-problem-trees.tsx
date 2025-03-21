/**
 * MinimalProblemTrees Component
 * 
 * A performance-optimized implementation of the Problem Trees tool
 * with proper TypeScript types, error handling, and accessibility.
 */

import React, { useState, useCallback, memo, useMemo, useEffect, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { format } from 'date-fns';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, NetworkIcon, Trash2Icon, RefreshCwIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface ArrayFieldEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  isRequired?: boolean;
  error?: string;
}

interface ProblemTreeCardProps {
  tree: ProblemTree;
  onDelete: (id: string) => void;
  isDeleting?: boolean;
}

interface MinimalProblemTreesProps {
  showNewProblemTree: boolean;
  onDialogClose: () => void;
}

// API paths
const PROBLEM_TREES_API_PATH = '/api/problem-trees';

// Custom debounce hook for input fields
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
}

// Memoized Problem Tree Card component for better performance
const ProblemTreeCard = memo(({ tree, onDelete, isDeleting }: ProblemTreeCardProps) => {
  const handleDelete = useCallback(() => {
    onDelete(tree.id);
  }, [tree.id, onDelete]);

  return (
    <Card className={`h-full flex flex-col transition-opacity ${isDeleting ? 'opacity-50' : 'opacity-100'}`}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold">{tree.title}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            aria-label={`Delete ${tree.title}`}
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <RefreshCwIcon className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Trash2Icon className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        <div className="text-sm text-muted-foreground">
          {format(new Date(tree.createdAt), 'PPP')}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="mb-4">
          <h4 className="font-semibold mb-1">Root Problem</h4>
          <p className="text-sm">{tree.rootProblem}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-1">Causes ({tree.causes.length})</h4>
            <div className="flex flex-wrap gap-1">
              {tree.causes.map((cause, index) => (
                <Badge key={index} variant="outline">
                  {cause}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-1">Consequences ({tree.consequences.length})</h4>
            <div className="flex flex-wrap gap-1">
              {tree.consequences.map((consequence, index) => (
                <Badge key={index} variant="outline">
                  {consequence}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <div className="w-full flex justify-between items-center">
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
            <NetworkIcon className="h-3 w-3 mr-1" />
            Problem Tree
          </Badge>
        </div>
      </CardFooter>
    </Card>
  );
});

ProblemTreeCard.displayName = 'ProblemTreeCard';

// Memoized Array Field Editor component for better performance
const ArrayFieldEditor = memo(({ 
  label, 
  items, 
  onChange, 
  placeholder = "Add item and press Enter", 
  isRequired = false,
  error
}: ArrayFieldEditorProps) => {
  const [newItem, setNewItem] = useState('');

  const handleAddItem = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newItem.trim()) {
      e.preventDefault();
      onChange([...items, newItem.trim()]);
      setNewItem('');
    }
  }, [items, newItem, onChange]);

  const handleRemoveItem = useCallback((indexToRemove: number) => {
    onChange(items.filter((_, index) => index !== indexToRemove));
  }, [items, onChange]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNewItem(e.target.value);
  }, []);

  const inputId = `${label.toLowerCase().replace(/\s+/g, '-')}-input`;
  const errorId = error ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>
        {label}{isRequired && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, index) => (
          <Badge 
            key={index} 
            variant="secondary"
            className="flex items-center gap-1"
          >
            {item}
            <button 
              type="button"
              className="ml-1 text-muted-foreground hover:text-foreground"
              onClick={() => handleRemoveItem(index)}
              aria-label={`Remove ${item}`}
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
      <Input
        id={inputId}
        value={newItem}
        onChange={handleChange}
        onKeyDown={handleAddItem}
        placeholder={placeholder}
        aria-label={`Add ${label}`}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={errorId}
      />
      {error && (
        <p id={errorId} className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
});

ArrayFieldEditor.displayName = 'ArrayFieldEditor';

// Error boundary component to handle errors in a user-friendly way
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Problem Trees component failed:", error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Main component
export const MinimalProblemTrees = memo(({ showNewProblemTree, onDialogClose }: MinimalProblemTreesProps) => {
  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rootProblem, setRootProblem] = useState('');
  const [causes, setCauses] = useState<string[]>([]);
  const [consequences, setConsequences] = useState<string[]>([]);
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const parentRef = useRef<HTMLDivElement>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  // Debounced title for optimistic validation
  const debouncedTitle = useDebounce(title, 300);
  
  // Use effect for title validation - provide immediate feedback
  useEffect(() => {
    if (debouncedTitle && debouncedTitle.length < 3) {
      setValidationErrors(prev => ({
        ...prev,
        title: 'Title must be at least 3 characters'
      }));
    } else if (validationErrors.title) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.title;
        return newErrors;
      });
    }
  }, [debouncedTitle, validationErrors.title]);
  
  // Fetch problem trees with proper TypeScript types
  const { 
    data: problemTrees = [], 
    isLoading, 
    error: fetchError,
    isError,
    refetch,
  } = useQuery<ProblemTree[], Error>({
    queryKey: ['problemTrees'],
    queryFn: async (): Promise<ProblemTree[]> => {
      try {
        setNetworkError(null);
        const response = await fetch(PROBLEM_TREES_API_PATH);
        if (!response.ok) {
          const errorText = await response.text().catch(() => null);
          throw new Error(`Failed to fetch problem trees: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
        }
        return response.json();
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to fetch problem trees';
        setNetworkError(errorMessage);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors, only on network issues or 5xx
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
  });

  // Create problem tree mutation with optimistic updates
  const createMutation = useMutation<ProblemTree, Error, Omit<ProblemTree, 'id' | 'createdAt' | 'updatedAt'>>({
    mutationFn: async (newTree) => {
      const response = await fetch(PROBLEM_TREES_API_PATH, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTree),
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        throw new Error(`Failed to create problem tree: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }
      
      return response.json();
    },
    onMutate: async (newTree) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['problemTrees'] });
      
      // Save current trees
      const previousTrees = queryClient.getQueryData<ProblemTree[]>(['problemTrees']) || [];
      
      // Create optimistic tree
      const optimisticTree: ProblemTree = {
        id: `temp-${Date.now()}`,
        ...newTree,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Update the cache with optimistic tree
      queryClient.setQueryData<ProblemTree[]>(['problemTrees'], old => [optimisticTree, ...(old || [])]);
      
      return { previousTrees };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['problemTrees'] });
      resetForm();
      onDialogClose();
      toast({
        title: "Success",
        description: "Problem tree created successfully"
      });
    },
    onError: (error: Error, _, context) => {
      // Revert to previous trees on error
      if (context?.previousTrees) {
        queryClient.setQueryData(['problemTrees'], context.previousTrees);
      }
      
      toast({
        title: "Error",
        description: `Failed to create problem tree: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  // Delete problem tree mutation with optimistic updates
  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: async (id) => {
      const response = await fetch(`${PROBLEM_TREES_API_PATH}/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorText = await response.text().catch(() => null);
        throw new Error(`Failed to delete problem tree: ${response.status} ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
      }
    },
    onMutate: async (id) => {
      // Add to deleting IDs
      setDeletingIds(prev => new Set(prev).add(id));
      
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['problemTrees'] });
      
      // Save current trees
      const previousTrees = queryClient.getQueryData<ProblemTree[]>(['problemTrees']) || [];
      
      // Optimistically remove tree
      queryClient.setQueryData<ProblemTree[]>(['problemTrees'], old => 
        (old || []).filter(tree => tree.id !== id)
      );
      
      return { previousTrees };
    },
    onSuccess: (_, id) => {
      // Remove from deleting IDs
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      queryClient.invalidateQueries({ queryKey: ['problemTrees'] });
      toast({
        title: "Success",
        description: "Problem tree deleted successfully"
      });
    },
    onError: (error: Error, id, context) => {
      // Remove from deleting IDs
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
      
      // Revert to previous trees on error
      if (context?.previousTrees) {
        queryClient.setQueryData(['problemTrees'], context.previousTrees);
      }
      
      toast({
        title: "Error",
        description: `Failed to delete problem tree: ${error.message}`,
        variant: "destructive"
      });
    },
  });

  // Reset form values and state
  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setRootProblem('');
    setCauses([]);
    setConsequences([]);
    setValidationErrors({});
    setIsSubmitting(false);
  }, []);

  // Validate form inputs
  const validateForm = useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!rootProblem.trim()) {
      errors.rootProblem = 'Root problem is required';
    } else if (rootProblem.length < 5) {
      errors.rootProblem = 'Root problem must be at least 5 characters';
    }
    
    if (causes.length === 0) {
      errors.causes = 'At least one cause is required';
    }
    
    if (consequences.length === 0) {
      errors.consequences = 'At least one consequence is required';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, rootProblem, causes, consequences]);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await createMutation.mutateAsync({
        title,
        description,
        rootProblem,
        causes,
        consequences,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [title, description, rootProblem, causes, consequences, validateForm, createMutation]);

  // Handle deleting a problem tree
  const handleDelete = useCallback(async (id: string) => {
    if (window.confirm('Are you sure you want to delete this problem tree?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting problem tree:', error);
      }
    }
  }, [deleteMutation]);

  // Virtualized list for better performance with large lists
  const virtualizer = useVirtualizer({
    count: problemTrees.length || 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320, // Estimated card height
    overscan: 5,
  });

  // Create virtualized items for rendering
  const virtualItems = virtualizer.getVirtualItems();
  
  // Handle retry for network errors
  const handleRetry = useCallback(() => {
    setNetworkError(null);
    refetch();
  }, [refetch]);
  
  // Render empty state when no problem trees
  const renderEmptyState = useCallback(() => (
    <div className="flex flex-col items-center justify-center p-10 text-center bg-muted/20 rounded-lg">
      <NetworkIcon className="h-10 w-10 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No problem trees yet</h3>
      <p className="text-muted-foreground mb-4">
        Create your first problem tree to start analyzing complex problems
      </p>
      <Button onClick={onDialogClose}>
        Create Problem Tree
      </Button>
    </div>
  ), [onDialogClose]);

  // Render network error message
  const renderNetworkError = useCallback(() => (
    <Alert variant="destructive" className="mb-6">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription>
        {networkError || (fetchError instanceof Error ? fetchError.message : 'Failed to load problem trees')}
      </AlertDescription>
      <Button 
        variant="outline" 
        size="sm" 
        className="mt-2" 
        onClick={handleRetry}
      >
        Try Again
      </Button>
    </Alert>
  ), [networkError, fetchError, handleRetry]);

  // Render loading state
  const renderLoadingState = useCallback(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="flex flex-col space-y-3">
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      ))}
    </div>
  ), []);

  return (
    <ErrorBoundary fallback={
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4 mr-2" />
        <AlertDescription>
          Something went wrong with the Problem Trees tool. Please try refreshing the page.
        </AlertDescription>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => window.location.reload()}
        >
          Refresh Page
        </Button>
      </Alert>
    }>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Problem Trees</h2>
            <p className="text-muted-foreground">
              Visualize complex problems with their causes and consequences
            </p>
          </div>
        </div>

        {/* Network error message */}
        {(networkError || isError) && renderNetworkError()}

        {/* Main content area */}
        {isLoading ? (
          renderLoadingState()
        ) : problemTrees.length === 0 ? (
          renderEmptyState()
        ) : (
          <div ref={parentRef} className="h-[800px] overflow-auto">
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 relative"
              style={{ height: `${virtualizer.getTotalSize()}px` }}
            >
              {virtualItems.map((virtualItem) => {
                const tree = problemTrees[virtualItem.index];
                if (!tree) return null; // Skip rendering if tree is undefined
                
                return (
                  <div
                    key={tree.id}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: `${virtualItem.size}px`,
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <div className="h-full p-2">
                      <ProblemTreeCard 
                        tree={tree} 
                        onDelete={handleDelete} 
                        isDeleting={deletingIds.has(tree.id)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* New problem tree dialog */}
        <Dialog open={showNewProblemTree} onOpenChange={(open) => !open && onDialogClose()}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Problem Tree</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter a title for your problem tree"
                  aria-invalid={validationErrors.title ? 'true' : 'false'}
                  aria-describedby={validationErrors.title ? 'title-error' : undefined}
                />
                {validationErrors.title && (
                  <p id="title-error" className="text-sm text-red-500">{validationErrors.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description (optional)"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rootProblem">
                  Root Problem<span className="text-red-500 ml-1">*</span>
                </Label>
                <Input
                  id="rootProblem"
                  value={rootProblem}
                  onChange={(e) => setRootProblem(e.target.value)}
                  placeholder="Enter the root problem"
                  aria-invalid={validationErrors.rootProblem ? 'true' : 'false'}
                  aria-describedby={validationErrors.rootProblem ? 'rootProblem-error' : undefined}
                />
                {validationErrors.rootProblem && (
                  <p id="rootProblem-error" className="text-sm text-red-500">{validationErrors.rootProblem}</p>
                )}
              </div>
              
              <ArrayFieldEditor
                label="Causes"
                items={causes}
                onChange={setCauses}
                placeholder="Add a cause and press Enter"
                isRequired={true}
                error={validationErrors.causes}
              />
              
              <ArrayFieldEditor
                label="Consequences"
                items={consequences}
                onChange={setConsequences}
                placeholder="Add a consequence and press Enter"
                isRequired={true}
                error={validationErrors.consequences}
              />
              
              <div className="flex justify-end space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    resetForm();
                    onDialogClose();
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  className="relative"
                >
                  {isSubmitting ? (
                    <>
                      <span className="opacity-0">Create Problem Tree</span>
                      <span className="absolute inset-0 flex items-center justify-center">
                        <RefreshCwIcon className="h-4 w-4 animate-spin" />
                      </span>
                    </>
                  ) : (
                    'Create Problem Tree'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </ErrorBoundary>
  );
});

MinimalProblemTrees.displayName = 'MinimalProblemTrees';

export default MinimalProblemTrees;