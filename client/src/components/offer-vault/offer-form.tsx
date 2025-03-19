import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingSpinner } from '@/components/ui/loading-state';

// Comprehensive offer schema with strong validation
const offerSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(1, 'Category is required'),
  status: z.enum(['active', 'sold', 'archived']).default('active'),
  images: z.array(z.string()).optional().default([]),
  notes: z.string().optional(),
});

type OfferFormData = z.infer<typeof offerSchema>;

// Full Offer interface based on the shared schema
export interface Offer {
  id: number;
  userId: number;
  title: string;
  description: string;
  price: number;
  status: 'active' | 'sold' | 'archived';
  category: string;
  images: string[];
  notes?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface OfferFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOffer?: Offer | null;
  onSuccess?: () => void;
}

const OfferForm: React.FC<OfferFormProps> = ({ 
  open, 
  onOpenChange, 
  selectedOffer = null, 
  onSuccess 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  // Initialize form with react-hook-form and zod resolver
  const form = useForm<OfferFormData>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      category: '',
      status: 'active',
      images: [],
      notes: '',
    },
  });

  // Reset form when selected offer changes
  useEffect(() => {
    if (selectedOffer) {
      setIsEditing(true);
      form.reset({
        title: selectedOffer.title,
        description: selectedOffer.description,
        price: selectedOffer.price,
        category: selectedOffer.category,
        status: selectedOffer.status,
        images: selectedOffer.images || [],
        notes: selectedOffer.notes || '',
      });
    } else {
      setIsEditing(false);
      form.reset({
        title: '',
        description: '',
        price: 0,
        category: '',
        status: 'active',
        images: [],
        notes: '',
      });
    }
  }, [selectedOffer, form]);

  // Type definition for API response
  type OfferResponse = {
    id: number;
    title: string;
    status: string;
    [key: string]: any;
  };
  
  // Create/update mutation with improved types
  const mutation = useMutation<OfferResponse, Error, OfferFormData>({
    mutationFn: async (data: OfferFormData) => {
      console.log('Submitting offer:', data);
      
      if (selectedOffer) {
        // Update existing offer
        return apiRequest<OfferResponse>(
          'PUT', 
          `/api/offers/${selectedOffer.id}`, 
          data
        );
      } else {
        // Create new offer
        return apiRequest<OfferResponse>(
          'POST', 
          '/api/offers', 
          data
        );
      }
    },
    onSuccess: (data) => {
      // Log for debugging
      console.log('Offer saved successfully:', data);
      
      // Update the cache
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      
      // Show success notification
      toast({
        title: selectedOffer ? 'Offer updated' : 'Offer created',
        description: selectedOffer 
          ? 'Your offer has been updated successfully.'
          : 'Your new offer has been created successfully.',
        variant: 'success',
      });
      
      // Reset form and close dialog
      form.reset();
      onOpenChange(false);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error: Error) => {
      console.error('Error saving offer:', error);
      
      // Show error notification
      toast({
        title: 'Error',
        description: error.message || 'Failed to save your offer. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: OfferFormData) => {
    mutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Offer' : 'Create New Offer'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Update your offer details below.'
              : 'Fill out the form below to create a new offer.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter offer title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="Enter price" 
                        {...field}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(val === '' ? '' : Number(val));
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="clothing">Clothing</SelectItem>
                        <SelectItem value="books">Books</SelectItem>
                        <SelectItem value="services">Services</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your offer" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isEditing && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Additional notes or information"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={mutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                variant="offerVault" 
                disabled={mutation.isPending}
              >
                {mutation.isPending && <LoadingSpinner />}
                {mutation.isPending ? 'Saving...' : isEditing ? 'Update Offer' : 'Create Offer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default OfferForm;