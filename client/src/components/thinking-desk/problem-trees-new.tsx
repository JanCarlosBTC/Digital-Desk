import React, { memo, useCallback, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Define the ProblemTree interface locally
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
};

interface ProblemTreesProps {
  showNewProblemTree?: boolean;
  onDialogClose?: () => void;
  onEdit: (tree: ProblemTree) => void;
}

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

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{tree.title}</h3>
          <p className="text-sm text-gray-600 mt-2">{tree.mainProblem}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="outline" size="sm" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
      
      <div className="mt-4 space-y-4">
        <div>
          <h4 className="text-sm font-medium text-gray-700">Sub Problems</h4>
          <ul className="mt-1 space-y-1">
            {tree.subProblems.map((problem, index) => (
              <li key={index} className="text-sm text-gray-600">{problem}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700">Root Causes</h4>
          <ul className="mt-1 space-y-1">
            {tree.rootCauses.map((cause, index) => (
              <li key={index} className="text-sm text-gray-600">{cause}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700">Potential Solutions</h4>
          <ul className="mt-1 space-y-1">
            {tree.potentialSolutions.map((solution, index) => (
              <li key={index} className="text-sm text-gray-600">{solution}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700">Next Actions</h4>
          <ul className="mt-1 space-y-1">
            {tree.nextActions.map((action, index) => (
              <li key={index} className="text-sm text-gray-600">{action}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
});

export const ProblemTrees = memo(function ProblemTrees({ 
  showNewProblemTree = false, 
  onDialogClose, 
  onEdit 
}: ProblemTreesProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [sortField, setSortField] = useState<keyof ProblemTree>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: problemTreesData, isLoading } = useQuery({
    queryKey: ['/api/problem-trees']
  });
  
  // Safely cast the data as ProblemTree[] with a fallback to empty array
  const trees = (problemTreesData ? problemTreesData as ProblemTree[] : []);

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/problem-trees/${id}`);
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

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError]);

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

  const sortedTrees = useMemo(() => {
    return [...trees].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });
  }, [trees, sortField, sortDirection]);

  if (isLoading) {
    return <LoadingState type="list" count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
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
    </div>
  );
}); 