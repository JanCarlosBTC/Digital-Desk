import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@ui/molecules/card.js';
import { Button } from '@ui/atoms/button.js';
import { ArchiveIcon, EditIcon, TrashIcon } from 'lucide-react';

interface OfferDetails {
  id: number;
  title: string;
  company: string;
  salary: string;
  location: string;
  description: string;
  status: 'active' | 'archived' | 'declined';
  date: string;
}

interface OfferCardProps {
  offer: OfferDetails;
  onEdit: (id: number) => void;
  onArchive: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Offer Card component for displaying job offer details
 * 
 * @example
 * ```tsx
 * <OfferCard 
 *   offer={offerData} 
 *   onEdit={handleEdit} 
 *   onArchive={handleArchive} 
 *   onDelete={handleDelete} 
 * />
 * ```
 */
export function OfferCard({ offer, onEdit, onArchive, onDelete }: OfferCardProps) {
  const isArchived = offer.status === 'archived';
  
  return (
    <Card 
      domain="offer-vault"
      variant={isArchived ? 'ghost' : 'default'}
      className={isArchived ? 'opacity-60' : ''}
    >
      <CardHeader className="pb-2">
        <CardTitle>{offer.title}</CardTitle>
        <CardDescription>
          {offer.company} • {offer.location}
        </CardDescription>
        <div className="flex items-center text-sm text-muted-foreground">
          <span className="mr-4">{offer.salary}</span>
          <span>Added on {offer.date}</span>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-4">{offer.description}</p>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            leadingIcon={<EditIcon size={16} />}
            onClick={() => onEdit(offer.id)}
          >
            Edit
          </Button>
          
          <Button 
            variant={isArchived ? "outline" : "ghost"} 
            size="sm"
            leadingIcon={<ArchiveIcon size={16} />}
            onClick={() => onArchive(offer.id)}
          >
            {isArchived ? 'Unarchive' : 'Archive'}
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm"
            leadingIcon={<TrashIcon size={16} />}
            onClick={() => onDelete(offer.id)}
            className="text-destructive hover:text-destructive"
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}