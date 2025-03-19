import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { MonthlyCheckIn } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig, getQueryKey } from "@/lib/query-keys";
import { memo, useCallback, useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { dateUtils } from "@/lib/date-utils";

interface MonthlyCheckInItemProps {
  checkIn: MonthlyCheckIn;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const MonthlyCheckInItem = memo(function MonthlyCheckInItem({ 
  checkIn, 
  onEdit, 
  onDelete 
}: MonthlyCheckInItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(checkIn.id);
  }, [onEdit, checkIn.id]);

  const handleDelete = useCallback(() => {
    onDelete(checkIn.id);
  }, [onDelete, checkIn.id]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">
            {dateUtils.getMonthName(checkIn.month)} {checkIn.year}
          </h3>
          <div className="mt-2 space-y-2">
            {(checkIn.achievements || []).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Key Achievements</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {(checkIn.achievements || []).map((achievement, index) => (
                    <li key={index}>{achievement}</li>
                  ))}
                </ul>
              </div>
            )}
            {(checkIn.challenges || []).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Challenges</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {(checkIn.challenges || []).map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}
            {(checkIn.nextMonthPriorities || []).length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Next Month's Priorities</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {(checkIn.nextMonthPriorities || []).map((priority, index) => (
                    <li key={index}>{priority}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <div className="mt-2">
            <span 
              className={`px-2 py-1 text-xs rounded-full ${
                checkIn.completedOn 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {checkIn.completedOn ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {dateUtils.format(checkIn.updatedAt)}
          </p>
        </div>
        <div className="space-x-2">
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

interface MonthlyCheckInComponentProps {
  showNewCheckIn?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const MonthlyCheckInComponent = memo(function MonthlyCheckInComponent({ 
  showNewCheckIn = false, 
  onDialogClose, 
  onEdit 
}: MonthlyCheckInComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof MonthlyCheckIn>('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: checkIns = [], isLoading } = useQuery({
    queryKey: getQueryKey('monthlyCheckIns'),
    ...defaultQueryConfig,
  } as UseQueryOptions<MonthlyCheckIn[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/monthly-check-ins/delete',
    'DELETE',
    {
      invalidateQueries: ['monthly-check-ins'],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Check-in deleted successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof MonthlyCheckIn) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedCheckIns = useMemo(() => {
    return [...checkIns].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Special handling for date sorting
      if (sortField === 'year') {
        // Create a comparable number in format YYYYMM
        aValue = a.year * 100 + a.month;
        bValue = b.year * 100 + b.month;
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
  }, [checkIns, sortField, sortDirection]);

  if (isLoading) {
    return <LoadingState type="list" count={3} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('year')}
        >
          Sort by Date
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('completedOn')}
        >
          Sort by Status
        </Button>
      </div>
      <div className="space-y-6">
        {sortedCheckIns.map(checkIn => (
          <MonthlyCheckInItem
            key={checkIn.id}
            checkIn={checkIn}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}); 