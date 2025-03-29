import React, { useState } from "react";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { Offer } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig, getQueryKey } from "@/lib/query-keys";
import { memo, useCallback, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";

interface OfferItemProps {
  offer: Offer;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onArchive: (id: number) => void;
}

const OfferItem = memo(function OfferItem({ 
  offer, 
  onEdit, 
  onDelete,
  onArchive 
}: OfferItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(offer.id);
  }, [onEdit, offer.id]);

  const handleDelete = useCallback(() => {
    onDelete(offer.id);
  }, [onDelete, offer.id]);

  const handleArchive = useCallback(() => {
    onArchive(offer.id);
  }, [onArchive, offer.id]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{offer.title}</h3>
            <span 
              className={`px-2 py-1 text-xs rounded-full ${
                offer.status === 'Active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {offer.status}
            </span>
          </div>
          <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700">Price</h4>
                <p className="text-sm text-gray-600">{offer.price}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-700">Category</h4>
                <p className="text-sm text-gray-600">{offer.category}</p>
              </div>
              {offer.duration && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Duration</h4>
                  <p className="text-sm text-gray-600">{offer.duration}</p>
                </div>
              )}
              {offer.format && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Format</h4>
                  <p className="text-sm text-gray-600">{offer.format}</p>
                </div>
              )}
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700">Client Count</h4>
              <p className="text-sm text-gray-600">{offer.clientCount} clients</p>
            </div>
          </div>
          <div className="mt-2 space-x-2">
            <span className="text-xs text-gray-500">
              Created: {new Date(offer.createdAt).toLocaleDateString()}
            </span>
            {offer.archivedAt && (
              <span className="text-xs text-gray-500">
                • Archived: {new Date(offer.archivedAt).toLocaleDateString()}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Last updated: {new Date(offer.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleArchive}
          >
            {offer.status === 'Active' ? 'Archive' : 'Activate'}
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

interface OfferComponentProps {
  showNewOffer?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

export const OfferComponent = memo(function OfferComponent({ 
  showNewOffer = false, 
  onDialogClose, 
  onEdit 
}: OfferComponentProps) {
  const { toast } = useToast();
  const [sortField, setSortField] = useState<keyof Offer>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  const { data: offers = [], isLoading } = useQuery({
    queryKey: getQueryKey('offers'),
    ...defaultQueryConfig,
  } as UseQueryOptions<Offer[], Error>);

  const deleteMutation = useApiMutation<void, { id: number }>(
    '/api/offers/delete',
    'DELETE',
    {
      invalidateQueries: ['offers'],
    }
  );

  const archiveMutation = useApiMutation<void, { id: number }>(
    '/api/offers/archive',
    'PUT',
    {
      invalidateQueries: ['offers'],
    }
  );

  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Offer deleted successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError, toast]);

  const handleArchive = useCallback(async (id: number) => {
    try {
      await archiveMutation.mutateAsync({ id });
      toast({
        title: "Success",
        description: "Offer archived successfully",
      });
    } catch (error) {
      handleError(error);
    }
  }, [archiveMutation, handleError, toast]);

  const handleSort = useCallback((field: keyof Offer) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  const sortedOffers = useMemo(() => {
    return [...offers].sort((a, b) => {
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
  }, [offers, sortField, sortDirection]);

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
          onClick={() => handleSort('clientCount')}
        >
          Sort by Client Count
        </Button>
      </div>
      <div className="space-y-6">
        {sortedOffers.map(offer => (
          <OfferItem
            key={offer.id}
            offer={offer}
            onEdit={onEdit}
            onDelete={handleDelete}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </div>
  );
}); 