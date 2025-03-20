/**
 * Optimized Problem Trees Component
 * 
 * Refactored to use our shared hooks and components to eliminate redundancy.
 * Demonstrates how to create a clean, maintainable component structure.
 */

import { useState, useCallback, memo } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { PlusIcon, XIcon, Trash2Icon } from "lucide-react";
import { LoadingState, EmptyState, ErrorState } from "@/components/ui/state-handlers";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { DeleteConfirmationContent } from "@/components/ui/state-handlers";
import { VirtualizedGrid } from "@/components/shared/virtualized-list";
import { FormBuilder } from "@/components/shared/form-builder";
import { useProblemTrees } from "@/components/hooks/use-problem-trees";
import { z } from "zod";

// Form schema for problem tree creation
const problemTreeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string(),
  rootProblem: z.string().min(5, "Root problem must be at least 5 characters"),
});

type ProblemTreeFormValues = z.infer<typeof problemTreeSchema>;

/**
 * Array Field Component for causes and consequences
 */
const ArrayField = memo(({ 
  items, 
  onAdd, 
  onRemove, 
  label, 
  placeholder 
}: { 
  items: string[]; 
  onAdd: (item: string) => boolean; 
  onRemove: (index: number) => void; 
  label: string;
  placeholder: string;
}) => {
  const [value, setValue] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAdd(value)) {
      setValue("");
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      <div className="flex flex-wrap gap-2 mb-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {item}
              <XIcon 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => onRemove(index)} 
              />
            </Badge>
          ))
        ) : (
          <div className="text-sm text-muted-foreground italic">
            No {label.toLowerCase()} added yet
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1"
        />
        <Button type="submit" variant="outline" size="sm">
          <PlusIcon className="h-4 w-4 mr-1" /> Add
        </Button>
      </form>
    </div>
  );
});

ArrayField.displayName = "ArrayField";

/**
 * Individual Problem Tree Card
 */
const ProblemTreeCard = memo(({ 
  tree, 
  onDelete, 
  isDeleting 
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const handleDelete = useCallback(() => {
    onDelete(tree.id);
    setShowDeleteDialog(false);
  }, [onDelete, tree.id]);
  
  const formattedDate = new Date(tree.createdAt).toLocaleDateString();
  
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{tree.title}</CardTitle>
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Trash2Icon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DeleteConfirmationContent
                title="Delete Problem Tree"
                description="Are you sure you want to delete this problem tree? This action cannot be undone."
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
                isDeleting={isDeleting && tree.id === tree.id}
              />
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-xs text-muted-foreground">Created on {formattedDate}</p>
      </CardHeader>
      
      <CardContent className="flex-1">
        <div className="space-y-3">
          <div>
            <h4 className="text-sm font-medium">Root Problem</h4>
            <p className="text-sm mt-1">{tree.rootProblem}</p>
          </div>
          
          {tree.description && (
            <div>
              <h4 className="text-sm font-medium">Description</h4>
              <p className="text-sm mt-1">{tree.description}</p>
            </div>
          )}
          
          <Separator />
          
          <div>
            <h4 className="text-sm font-medium">Causes</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {tree.causes.map((cause, index) => (
                <Badge key={index} variant="secondary">{cause}</Badge>
              ))}
            </div>
          </div>
          
          <div>
            <h4 className="text-sm font-medium">Consequences</h4>
            <div className="flex flex-wrap gap-1 mt-1">
              {tree.consequences.map((consequence, index) => (
                <Badge key={index} variant="secondary">{consequence}</Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

ProblemTreeCard.displayName = "ProblemTreeCard";

/**
 * Main Problem Trees Component
 */
export function OptimizedProblemTrees() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const {
    // State
    problemTrees,
    causes,
    consequences,
    deletingId,
    
    // Status
    isLoading,
    isCreating,
    isDeleting,
    networkError,
    
    // Actions
    addCause,
    removeCause,
    addConsequence,
    removeConsequence,
    deleteProblemTree,
    handleSubmit,
    resetForm,
    refetch,
    clearNetworkError
  } = useProblemTrees();
  
  // Close dialog and reset form
  const closeDialog = useCallback(() => {
    setIsCreateDialogOpen(false);
    resetForm();
  }, [resetForm]);
  
  // Handle form submission
  const onSubmit = useCallback(async (data: ProblemTreeFormValues) => {
    const success = await handleSubmit(data, () => setIsCreateDialogOpen(false));
    return success;
  }, [handleSubmit]);
  
  // Render loading state
  if (isLoading) {
    return <LoadingState className="mt-4" itemCount={6} variant="card" />;
  }
  
  // Render network error
  if (networkError) {
    return (
      <ErrorState
        title="Failed to load problem trees"
        description={networkError}
        onRetry={() => {
          clearNetworkError();
          refetch();
        }}
      />
    );
  }
  
  // Render empty state
  if (problemTrees.length === 0) {
    return (
      <EmptyState
        title="No Problem Trees"
        description="Create your first problem tree to help analyze complex problems."
        icon="tree"
        action={
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <PlusIcon className="h-4 w-4 mr-1" /> Create Problem Tree
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Problem Tree</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 py-2">
                <FormBuilder
                  schema={problemTreeSchema}
                  onSubmit={onSubmit}
                  submitText="Create Problem Tree"
                  isSubmitting={isCreating}
                  onCancel={closeDialog}
                  fields={[
                    {
                      name: "title",
                      label: "Title",
                      placeholder: "Name your problem tree",
                      type: "text"
                    },
                    {
                      name: "description",
                      label: "Description (Optional)",
                      placeholder: "Describe the context of this problem tree",
                      type: "textarea"
                    },
                    {
                      name: "rootProblem",
                      label: "Root Problem",
                      placeholder: "What is the core problem you're analyzing?",
                      type: "textarea"
                    }
                  ]}
                  extraFields={
                    <div className="space-y-4">
                      <ArrayField
                        items={causes}
                        onAdd={addCause}
                        onRemove={removeCause}
                        label="Causes"
                        placeholder="Add a cause of the problem"
                      />
                      
                      <ArrayField
                        items={consequences}
                        onAdd={addConsequence}
                        onRemove={removeConsequence}
                        label="Consequences"
                        placeholder="Add a consequence of the problem"
                      />
                    </div>
                  }
                />
              </div>
            </DialogContent>
          </Dialog>
        }
      />
    );
  }
  
  // Render problem trees
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Problem Trees</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusIcon className="h-4 w-4 mr-1" /> Create Problem Tree
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Problem Tree</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-2">
              <FormBuilder
                schema={problemTreeSchema}
                onSubmit={onSubmit}
                submitText="Create Problem Tree"
                isSubmitting={isCreating}
                onCancel={closeDialog}
                fields={[
                  {
                    name: "title",
                    label: "Title",
                    placeholder: "Name your problem tree",
                    type: "text"
                  },
                  {
                    name: "description",
                    label: "Description (Optional)",
                    placeholder: "Describe the context of this problem tree",
                    type: "textarea"
                  },
                  {
                    name: "rootProblem",
                    label: "Root Problem",
                    placeholder: "What is the core problem you're analyzing?",
                    type: "textarea"
                  }
                ]}
                extraFields={
                  <div className="space-y-4">
                    <ArrayField
                      items={causes}
                      onAdd={addCause}
                      onRemove={removeCause}
                      label="Causes"
                      placeholder="Add a cause of the problem"
                    />
                    
                    <ArrayField
                      items={consequences}
                      onAdd={addConsequence}
                      onRemove={removeConsequence}
                      label="Consequences"
                      placeholder="Add a consequence of the problem"
                    />
                  </div>
                }
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <VirtualizedGrid
        items={problemTrees}
        renderItem={(tree) => (
          <ProblemTreeCard
            key={tree.id}
            tree={tree}
            onDelete={deleteProblemTree}
            isDeleting={isDeleting && deletingId === tree.id}
          />
        )}
        estimateSize={400}
        gap={16}
        minColumnWidth={320}
      />
    </div>
  );
}

export default OptimizedProblemTrees; 