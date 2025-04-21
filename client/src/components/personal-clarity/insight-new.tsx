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
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from "@/components/ui/card";

interface Insight {
  id: number;
  title: string;
  description: string;
  source: string;
  tags: string[];
  impact: 'High' | 'Medium' | 'Low';
  status: 'New' | 'Applied' | 'Archived';
  appliedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface InsightItemProps {
  insight: Insight;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onStatusChange: (id: number) => void;
}

const InsightItem = memo(function InsightItem({ 
  insight, 
  onEdit, 
  onDelete,
  onStatusChange 
}: InsightItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(insight.id);
  }, [onEdit, insight.id]);

  const handleDelete = useCallback(() => {
    onDelete(insight.id);
  }, [onDelete, insight.id]);

  const handleStatusChange = useCallback(() => {
    onStatusChange(insight.id);
  }, [onStatusChange, insight.id]);

  const getStatusColor = (status: Insight['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-green-100 text-green-800';
      case 'Archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getImpactColor = (impact: Insight['impact']) => {
    switch (impact) {
      case 'High':
        return 'bg-red-100 text-red-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatus = (status: Insight['status']) => {
    switch (status) {
      case 'New':
        return 'Mark Applied';
      case 'Applied':
        return 'Archive';
      default:
        return 'Mark New';
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{insight.title}</h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${getStatusColor(insight.status)}`}
            >
              {insight.status}
            </span>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${getImpactColor(insight.impact)}`}
            >
              {insight.impact} Impact
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-2">{insight.description}</p>

          <div className="mt-3">
            <span className="text-sm font-medium text-gray-700">Source:</span>
            <span className="text-sm text-gray-600 ml-2">{insight.source}</span>
          </div>

          {insight.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {insight.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-3">
            {insight.appliedOn && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Applied:</span>
                <span className="text-sm text-gray-600">
                  {dateUtils.format(insight.appliedOn)}
                </span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Last updated: {dateUtils.format(insight.updatedAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleStatusChange}
          >
            {getNextStatus(insight.status)}
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

interface InsightComponentProps {
  showNewInsight?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const InsightComponent = memo(function InsightComponent({ 
  showNewInsight = false, 
  onDialogClose, 
  onEdit 
}: InsightComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof Insight>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: insights = [], isLoading } = useQuery({
    queryKey: getQueryKey('brainDump'),
    ...defaultQueryConfig,
  } as UseQueryOptions<Insight[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/insights/delete',
    'DELETE',
    {
      invalidateQueries: [queryKeys.brainDump[0]],
    }
  );

  const statusMutation = useApiMutation<void, { id: number }>(
    '/api/insights/update-status',
    'PUT',
    {
      invalidateQueries: [queryKeys.brainDump[0]],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Insight deleted successfully",
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
        description: "Insight status updated successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [statusMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof Insight) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedInsights = useMemo(() => {
    return [...insights].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      if (sortField === 'tags') {
        // For tags array, sort by length
        aValue = a[sortField].length;
        bValue = b[sortField].length;
      } else if (sortField === 'impact') {
        // Custom sorting for impact levels
        const impactOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
        aValue = impactOrder[a.impact];
        bValue = impactOrder[b.impact];
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
  }, [insights, sortField, sortDirection]);

  if (isLoading) {
    return <LoadingState variant="skeleton" count={3} />;
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
          onClick={() => handleSort('impact')}
        >
          Sort by Impact
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
          onClick={() => handleSort('tags')}
        >
          Sort by Tags Count
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
        {sortedInsights.map(insight => (
          <InsightItem
            key={insight.id}
            insight={insight}
            onEdit={onEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  );
}); 