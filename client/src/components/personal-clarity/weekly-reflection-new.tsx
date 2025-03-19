import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig, getQueryKey } from "@/lib/query-keys";
import { memo, useCallback, useState, useMemo } from "react";
import { useToast } from "@/components/ui/use-toast";
import { dateUtils } from "@/lib/date-utils";

interface WeeklyReflection {
  id: number;
  weekNumber: number;
  year: number;
  wins: string[];
  challenges: string[];
  learnings: string[];
  nextWeekPriorities: string[];
  energyLevel: number | null;
  productivityLevel: number | null;
  completedOn: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

interface WeeklyReflectionItemProps {
  reflection: WeeklyReflection;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const WeeklyReflectionItem = memo(function WeeklyReflectionItem({ 
  reflection, 
  onEdit, 
  onDelete 
}: WeeklyReflectionItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(reflection.id);
  }, [onEdit, reflection.id]);

  const handleDelete = useCallback(() => {
    onDelete(reflection.id);
  }, [onDelete, reflection.id]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">
              Week {reflection.weekNumber}, {reflection.year}
            </h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${
                reflection.completedOn 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {reflection.completedOn ? 'Completed' : 'In Progress'}
            </span>
          </div>
          
          <div className="mt-4 space-y-4">
            {reflection.wins.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Wins</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {reflection.wins.map((win, index) => (
                    <li key={index}>{win}</li>
                  ))}
                </ul>
              </div>
            )}

            {reflection.challenges.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Challenges</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {reflection.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
            )}

            {reflection.learnings.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Learnings</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {reflection.learnings.map((learning, index) => (
                    <li key={index}>{learning}</li>
                  ))}
                </ul>
              </div>
            )}

            {reflection.nextWeekPriorities.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-gray-700">Next Week's Priorities</h4>
                <ul className="list-disc list-inside text-sm text-gray-600">
                  {reflection.nextWeekPriorities.map((priority, index) => (
                    <li key={index}>{priority}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="mt-3">
            {reflection.energyLevel && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Energy Level:</span>
                <span className="text-sm text-gray-600">{reflection.energyLevel}/10</span>
              </div>
            )}
            {reflection.productivityLevel && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Productivity Level:</span>
                <span className="text-sm text-gray-600">{reflection.productivityLevel}/10</span>
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Last updated: {dateUtils.format(reflection.updatedAt)}
          </p>
        </div>

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
      </div>
    </div>
  );
});

interface WeeklyReflectionComponentProps {
  showNewReflection?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const WeeklyReflectionComponent = memo(function WeeklyReflectionComponent({ 
  showNewReflection = false, 
  onDialogClose, 
  onEdit 
}: WeeklyReflectionComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof WeeklyReflection>('year');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: reflections = [], isLoading } = useQuery({
    queryKey: getQueryKey('weeklyReflections'),
    ...defaultQueryConfig,
  } as UseQueryOptions<WeeklyReflection[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/weekly-reflections/delete',
    'DELETE',
    {
      invalidateQueries: ['weeklyReflections'],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Reflection deleted successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof WeeklyReflection) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedReflections = useMemo(() => {
    return [...reflections].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Special handling for date sorting
      if (sortField === 'year') {
        // Create a comparable number in format YYYYWW
        aValue = a.year * 100 + a.weekNumber;
        bValue = b.year * 100 + b.weekNumber;
      } else if (sortField === 'energyLevel' || sortField === 'productivityLevel') {
        // Handle numeric fields that might be null
        aValue = a[sortField] ?? -1;
        bValue = b[sortField] ?? -1;
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
  }, [reflections, sortField, sortDirection]);

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
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('energyLevel')}
        >
          Sort by Energy Level
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleSort('productivityLevel')}
        >
          Sort by Productivity
        </Button>
      </div>
      <div className="space-y-6">
        {sortedReflections.map(reflection => (
          <WeeklyReflectionItem
            key={reflection.id}
            reflection={reflection}
            onEdit={onEdit}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}); 