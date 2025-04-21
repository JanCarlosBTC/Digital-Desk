import React from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig, getQueryKey } from "@/lib/query-keys";
import { memo, useCallback, useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { dateUtils } from "@/lib/date-utils";
import { ChevronUpIcon, ChevronDownIcon } from "@radix-ui/react-icons";

interface Priority {
  id: number;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'Archived';
  order: number;
  targetDate: Date | null;
  completedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface PriorityItemProps {
  priority: Priority;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onMoveUp: (id: number) => void;
  onMoveDown: (id: number) => void;
  isFirst: boolean;
  isLast: boolean;
}

const PriorityItem = memo(function PriorityItem({ 
  priority, 
  onEdit, 
  onDelete,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}: PriorityItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(priority.id);
  }, [onEdit, priority.id]);

  const handleDelete = useCallback(() => {
    onDelete(priority.id);
  }, [onDelete, priority.id]);

  const handleMoveUp = useCallback(() => {
    onMoveUp(priority.id);
  }, [onMoveUp, priority.id]);

  const handleMoveDown = useCallback(() => {
    onMoveDown(priority.id);
  }, [onMoveDown, priority.id]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{priority.title}</h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${
                priority.status === 'Completed' 
                  ? 'bg-green-100 text-green-800'
                  : priority.status === 'Active'
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {priority.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">{priority.description}</p>

          <div className="mt-3 space-y-1">
            {priority.targetDate && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Target Date:</span>
                <span className="text-sm text-gray-600">
                  {dateUtils.format(priority.targetDate)}
                </span>
              </div>
            )}
            {priority.completedOn && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Completed On:</span>
                <span className="text-sm text-gray-600">
                  {dateUtils.format(priority.completedOn)}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Last updated: {dateUtils.format(priority.updatedAt)}
          </p>
        </div>

        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveUp}
              disabled={isFirst}
            >
              <ChevronUpIcon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMoveDown}
              disabled={isLast}
            >
              <ChevronDownIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

interface PriorityComponentProps {
  showNewPriority?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const PriorityComponent = memo(function PriorityComponent({ 
  showNewPriority = false, 
  onDialogClose, 
  onEdit 
}: PriorityComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof Priority>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const handleError = useErrorHandler();

  const { data: priorities = [], isLoading } = useQuery({
    queryKey: getQueryKey('priorities'),
    ...defaultQueryConfig,
  } as UseQueryOptions<Priority[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/priorities/delete',
    'DELETE',
    {
      invalidateQueries: ['priorities'],
    }
  );

  const reorderMutation = useApiMutation<void, { id: number; direction: 'up' | 'down' }>(
    '/api/priorities/reorder',
    'PUT',
    {
      invalidateQueries: ['priorities'],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Priority deleted successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError, toast]);

  const handleMoveUp = useCallback(async (id: number) => {
    try {
      await reorderMutation.mutateAsync({ id, direction: 'up' });
      toast({
        title: "Success",
        description: "Priority moved up successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [reorderMutation, handleError, toast]);

  const handleMoveDown = useCallback(async (id: number) => {
    try {
      await reorderMutation.mutateAsync({ id, direction: 'down' });
      toast({
        title: "Success",
        description: "Priority moved down successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [reorderMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof Priority) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedPriorities = useMemo(() => {
    return [...priorities].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;
      
      // Handle null values
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1 * modifier;
      if (bValue === null) return -1 * modifier;
      
      // Compare non-null values
      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });
  }, [priorities, sortField, sortDirection]);

  if (isLoading) {
    return <LoadingState variant="skeleton" count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('order')}
        >
          Sort by Order
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('status')}
        >
          Sort by Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('targetDate')}
        >
          Sort by Target Date
        </Button>
      </div>
      <div className="space-y-6">
        {sortedPriorities.map((priority, index) => (
          <PriorityItem
            key={priority.id}
            priority={priority}
            onEdit={onEdit}
            onDelete={handleDelete}
            onMoveUp={handleMoveUp}
            onMoveDown={handleMoveDown}
            isFirst={index === 0}
            isLast={index === sortedPriorities.length - 1}
          />
        ))}
      </div>
    </div>
  );
}); 