import React, { useState } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig, getQueryKey } from "@/lib/query-keys";
import { memo, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { dateUtils } from "@/lib/date-utils";

interface Decision {
  id: number;
  title: string;
  context: string;
  options: string[];
  criteria: string[];
  decision: string;
  outcome: string | null;
  status: 'Pending' | 'Implemented' | 'Evaluated';
  implementedOn: Date | null;
  evaluatedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface DecisionItemProps {
  decision: Decision;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number) => void;
}

const DecisionItem = memo(function DecisionItem({ 
  decision, 
  onEdit, 
  onDelete,
  onStatusChange 
}: DecisionItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(decision.id);
  }, [onEdit, decision.id]);

  const handleDelete = useCallback(() => {
    onDelete(decision.id);
  }, [onDelete, decision.id]);

  const handleStatusChange = useCallback(() => {
    onStatusChange(decision.id);
  }, [onStatusChange, decision.id]);

  const getStatusColor = (status: Decision['status']) => {
    switch (status) {
      case 'Evaluated':
        return 'bg-green-100 text-green-800';
      case 'Implemented':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getNextStatus = (status: Decision['status']) => {
    switch (status) {
      case 'Pending':
        return 'Mark Implemented';
      case 'Implemented':
        return 'Mark Evaluated';
      default:
        return 'Reset to Pending';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{decision.title}</h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(decision.status)}`}
            >
              {decision.status}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">{decision.context}</p>

          <div className="mt-4 space-y-4">
            {decision.options.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Options Considered</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {decision.options.map((option, index) => (
                    <li key={index}>{option}</li>
                  ))}
                </ul>
              </div>
            )}

            {decision.criteria.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Decision Criteria</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {decision.criteria.map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium text-gray-700">Final Decision</h4>
              <p className="text-sm text-gray-600">{decision.decision}</p>
            </div>

            {decision.outcome && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Outcome</h4>
                <p className="text-sm text-gray-600">{decision.outcome}</p>
              </div>
            )}
          </div>

          <div className="mt-3 space-y-1">
            {decision.implementedOn && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Implemented:</span>
                <span className="text-sm text-gray-600">
                  {dateUtils.format(decision.implementedOn)}
                </span>
              </div>
            )}
            {decision.evaluatedOn && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Evaluated:</span>
                <span className="text-sm text-gray-600">
                  {dateUtils.format(decision.evaluatedOn)}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Last updated: {dateUtils.format(decision.updatedAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusChange}
          >
            {getNextStatus(decision.status)}
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

interface DecisionComponentProps {
  showNewDecision?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const DecisionComponent = memo(function DecisionComponent({ 
  showNewDecision = false, 
  onDialogClose, 
  onEdit 
}: DecisionComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof Decision>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: decisions = [], isLoading } = useQuery({
    queryKey: getQueryKey('decisions'),
    ...defaultQueryConfig,
  } as UseQueryOptions<Decision[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/decisions/delete',
    'DELETE',
    {
      invalidateQueries: ['decisions'],
    }
  );

  const statusMutation = useApiMutation<void, { id: number }>(
    '/api/decisions/update-status',
    'PUT',
    {
      invalidateQueries: ['decisions'],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Decision deleted successfully",
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
        description: "Decision status updated successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [statusMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof Decision) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedDecisions = useMemo(() => {
    return [...decisions].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'options' || sortField === 'criteria') {
        // For arrays, sort by length
        aValue = a[sortField].length;
        bValue = b[sortField].length;
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
  }, [decisions, sortField, sortDirection]);

  if (isLoading) {
    return <LoadingState variant="list" itemCount={3} />;
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
          onClick={() => handleSort('options')}
        >
          Sort by Options Count
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
        {sortedDecisions.map(decision => (
          <DecisionItem
            key={decision.id}
            decision={decision}
            onEdit={onEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}); 