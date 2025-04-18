import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig, getQueryKey } from "@/lib/query-keys";
import { memo, useCallback, useState, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { dateUtils } from "@/lib/date-utils";
import { useNavigate } from "wouter";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface ClarityLab {
  id: number;
  title: string;
  description: string;
  category: string[];
  status: 'Draft' | 'InProgress' | 'Completed';
  completedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ClarityLabItemProps {
  lab: ClarityLab;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number) => void;
}

const ClarityLabItem = memo(function ClarityLabItem({ 
  lab, 
  onEdit, 
  onDelete,
  onStatusChange 
}: ClarityLabItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(lab.id);
  }, [onEdit, lab.id]);

  const handleDelete = useCallback(() => {
    onDelete(lab.id);
  }, [onDelete, lab.id]);

  const handleStatusChange = useCallback(() => {
    onStatusChange(lab.id);
  }, [onStatusChange, lab.id]);

  const getStatusColor = (status: ClarityLab['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'InProgress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{lab.title}</h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(lab.status)}`}
            >
              {lab.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mt-2">{lab.description}</p>

          {lab.category.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {lab.category.map((cat, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
            {lab.completedOn && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Completed:</span>
                <span className="text-sm text-gray-600">
                  {dateUtils.format(lab.completedOn)}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Last updated: {dateUtils.format(lab.updatedAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusChange}
          >
            {lab.status === 'Completed' ? 'Mark In Progress' : 'Mark Complete'}
          </Button>
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
      </div>
    </div>
  );
});

interface ClarityLabComponentProps {
  showNewLab?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const ClarityLabComponent = memo(function ClarityLabComponent({ 
  showNewLab = false, 
  onDialogClose, 
  onEdit 
}: ClarityLabComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof ClarityLab>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: labs = [], isLoading } = useQuery({
    queryKey: getQueryKey('clarityLabs'),
    ...defaultQueryConfig,
  } as UseQueryOptions<ClarityLab[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/clarity-labs/delete',
    'DELETE',
    {
      invalidateQueries: ['clarityLabs'],
    }
  );

  const statusMutation = useApiMutation<void, { id: number }>(
    '/api/clarity-labs/toggle-status',
    'PUT',
    {
      invalidateQueries: ['clarityLabs'],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Lab deleted successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError, toast]);

  const handleStatusChange = useCallback(async (id: number) => {
    try {
      await statusMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Lab status updated successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [statusMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof ClarityLab) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedLabs = useMemo(() => {
    return [...labs].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'category') {
        // For category array, sort by first category or empty string if none
        aValue = a.category[0] || '';
        bValue = b.category[0] || '';
      } else {
        aValue = a[sortField];
        bValue = b[sortField];
      }

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
  }, [labs, sortField, sortDirection]);

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
          onClick={() => handleSort('status')}
        >
          Sort by Status
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('category')}
        >
          Sort by Category
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('updatedAt')}
        >
          Sort by Last Updated
        </Button>
      </div>
      <div className="space-y-6">
        {sortedLabs.map(lab => (
          <ClarityLabItem
            key={lab.id}
            lab={lab}
            onEdit={onEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
});