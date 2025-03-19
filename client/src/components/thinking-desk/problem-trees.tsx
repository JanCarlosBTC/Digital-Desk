import React, { useState, useEffect, useCallback } from 'react';
import { useThinkingDesk } from '@/pages/thinking-desk';
import ProblemTreeList from './problem-tree-list';
import ProblemTreeForm from './problem-tree-form';
import ProblemTreeDetails from './problem-tree-details';
import { DialogForm } from '@/components/ui/dialog-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Interface for Problem Tree
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
}

export const ProblemTrees = ({ 
  showNewProblemTree = false, 
  onDialogClose 
}: ProblemTreesProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedProblemTree, setSelectedProblemTree] = useState<ProblemTree | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingProblemTree, setViewingProblemTree] = useState<ProblemTree | null>(null);
  
  // Listen for showNewProblemTree prop changes
  useEffect(() => {
    if (showNewProblemTree) {
      setDialogOpen(true);
    }
  }, [showNewProblemTree]);

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };

  // Handle view details click
  const handleViewDetailsClick = (tree: ProblemTree) => {
    setViewingProblemTree(tree);
    setViewDialogOpen(true);
  };

  // Handle edit problem tree
  const handleEdit = useCallback((tree: ProblemTree) => {
    setViewDialogOpen(false);
    setSelectedProblemTree(tree);
  }, []);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/problem-trees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Problem tree deleted",
        description: "The problem tree has been deleted successfully.",
        variant: "success",
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

  // Handle delete problem tree
  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error("Failed to delete problem tree:", error);
    }
  }, [deleteMutation]);

  // Handle new problem tree button click
  const handleNewProblemTreeClick = () => {
    setSelectedProblemTree(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Problem Tree List - Takes full width when no form is shown */}
        <div className={selectedProblemTree ? "lg:col-span-8" : "lg:col-span-12"}>
          <ProblemTreeList
            onViewDetailsClick={handleViewDetailsClick}
            setSelectedProblemTree={setSelectedProblemTree}
            onNewProblemTreeClick={handleNewProblemTreeClick}
            onDeleteProblemTree={handleDelete}
          />
        </div>
        
        {/* Problem Tree Form - Only shown when a problem tree is selected */}
        {selectedProblemTree && (
          <div className="lg:col-span-4">
            <ProblemTreeForm
              selectedProblemTree={selectedProblemTree}
              onSuccess={() => setSelectedProblemTree(null)}
              isDialog={false}
            />
          </div>
        )}
      </div>

      {/* New Problem Tree Form Dialog */}
      <DialogForm
        title="Create New Problem Tree"
        description="Break down complex problems into components to find effective solutions"
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        size="lg"
        // Remove onSubmit to prevent double submission handling
      >
        <ProblemTreeForm
          onSuccess={() => setDialogOpen(false)}
          isDialog={true}
        />
      </DialogForm>

      {/* View Problem Tree Details Dialog */}
      <DialogForm
        title="Problem Tree Details"
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        size="xl"
        // Remove unnecessary onSubmit
        submitLabel=""
        cancelLabel="Close"
      >
        {viewingProblemTree && (
          <ProblemTreeDetails
            tree={viewingProblemTree}
            onEdit={() => handleEdit(viewingProblemTree)}
            onBack={() => setViewDialogOpen(false)}
          />
        )}
      </DialogForm>
    </div>
  );
};

export default ProblemTrees;