import React, { useState, useEffect, useCallback, memo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { DialogForm } from "@/components/ui/dialog-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Offer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, ArrowUpDown, EditIcon, HistoryIcon, Trash2Icon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeatureCard, StatusBadge } from "@/components/ui/feature-card";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";
import { useApiMutation } from "@/lib/api-utils";
import { queryKeys, defaultQueryConfig } from "@/lib/query-keys";
import { dateUtils } from "@/lib/date-utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.string(),
  price: z.string().min(1, "Price is required"),
  duration: z.string().optional(),
  format: z.string().optional(),
  clientCount: z.coerce.number().int().min(0).optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface OfferListProps {
  showNewOffer?: boolean;
  onDialogClose?: () => void;
}

const OfferList = ({ showNewOffer = false, onDialogClose }: OfferListProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [sortBy, setSortBy] = useState<string>("status");
  
  // Listen for showNewOffer prop changes
  useEffect(() => {
    if (showNewOffer) {
      handleNewOffer();
    }
  }, [showNewOffer]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Active",
      price: "",
      duration: "",
      format: "",
      clientCount: 0,
    },
  });

  // Fetch offers
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ['/api/offers'],
  });

  // Create offer
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest('POST', '/api/offers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: "Offer created",
        description: "Your offer has been created successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating offer",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update offer
  const updateMutation = useMutation({
    mutationFn: async (data: FormValues & { id: number }) => {
      const { id, ...rest } = data;
      return apiRequest('PUT', `/api/offers/${id}`, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: "Offer updated",
        description: "Your offer has been updated successfully.",
      });
      setIsEditOpen(false);
      setSelectedOffer(null);
    },
    onError: (error) => {
      toast({
        title: "Error updating offer",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });
  
  // Delete offer
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/offers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/offers'] });
      toast({
        title: "Offer deleted",
        description: "Your offer has been deleted successfully.",
      });
      setIsEditOpen(false);
      setSelectedOffer(null);
    },
    onError: (error) => {
      toast({
        title: "Error deleting offer",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    if (selectedOffer) {
      updateMutation.mutate({ ...data, id: selectedOffer.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewOffer = () => {
    setSelectedOffer(null);
    form.reset({
      title: "",
      description: "",
      status: "Active",
      price: "",
      duration: "",
      format: "",
      clientCount: 0,
    });
    setIsOpen(true);
  };
  
  const handleManageOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    form.reset({
      title: offer.title,
      description: offer.description,
      status: offer.status,
      price: offer.price,
      duration: offer.duration || "",
      format: offer.format || "",
      clientCount: offer.clientCount || 0,
    });
    setIsEditOpen(true);
  };
  
  // Handle delete offer
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDeleteOffer = () => {
    if (selectedOffer) {
      deleteMutation.mutate(selectedOffer.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const sortOffers = (offers: Offer[]) => {
    return [...offers].sort((a, b) => {
      switch (sortBy) {
        case "status":
          // Sort by status first (Active first, then Coming Soon, then Archived)
          const statusOrder = { "Active": 0, "Coming Soon": 1, "Archived": 2 };
          const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
                             (statusOrder[b.status as keyof typeof statusOrder] || 3);
          if (statusDiff !== 0) return statusDiff;
          // Then sort by created date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case "price-high":
          // Extract numeric value from price string for comparison
          const getNumericPrice = (price: string) => {
            const match = price.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getNumericPrice(b.price) - getNumericPrice(a.price);
        
        case "price-low":
          // Extract numeric value from price string for comparison
          const getNumericPriceLow = (price: string) => {
            const match = price.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getNumericPriceLow(a.price) - getNumericPriceLow(b.price);
        
        case "clients":
          return (b.clientCount || 0) - (a.clientCount || 0);
          
        default:
          return 0;
      }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Coming Soon":
        return "bg-blue-100 text-blue-800";
      case "Archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    
    // Format to month and year only
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Handle dialog close with callback to parent
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };

  return (
    <FeatureCard
      title="Your Offers"
      className="p-6"
      actions={[
        {
          label: "New Offer",
          onClick: handleNewOffer,
          icon: <PlusIcon className="h-4 w-4" />
        }
      ]}
    >
      <div className="flex justify-between items-center mb-6">
        <div className="flex-1"></div>
        <div>
          <Select 
            defaultValue="status" 
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px] h-9 text-sm mr-2 bg-white border border-gray-300">
              <ArrowUpDown className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="status">Sort by Status</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="price-high">Price (High to Low)</SelectItem>
              <SelectItem value="price-low">Price (Low to High)</SelectItem>
              <SelectItem value="clients">Most Clients</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full" />
          ))}
        </div>
      ) : offers && offers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sortOffers(offers).map((offer) => (
            <FeatureCard
              key={offer.id}
              title={offer.title}
              description={offer.description}
              status={offer.status}
              date={new Date(offer.createdAt)}
              metadata={[
                { label: "Price", value: offer.price },
                ...(offer.duration ? [{ label: "Duration", value: offer.duration }] : []),
                ...(offer.format ? [{ label: "Format", value: offer.format }] : []),
                ...(offer.clientCount ? [{ label: "Clients", value: offer.clientCount }] : [])
              ]}
              actions={[
                {
                  label: "Edit",
                  onClick: () => handleManageOffer(offer),
                  icon: <EditIcon className="h-4 w-4 mr-2" />
                }
              ]}
              className="h-full"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Offers Yet</h3>
          <p className="text-gray-500 mb-4">Start adding your products and services.</p>
          <Button onClick={handleNewOffer} variant="offerVault">
            <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Offer
          </Button>
        </div>
      )}

      {/* New Offer Dialog */}
      <DialogForm
        title="Create New Offer"
        description="Add a new product or service to your offerings"
        open={isOpen}
        onOpenChange={handleDialogClose}
        size="lg"
        submitLabel="Save Offer"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Executive Coaching Package" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your offer and its value proposition" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., $2,500 / month" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., 6-month commitment" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., In-person or virtual" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="clientCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Client Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </DialogForm>
      
      {/* Edit Offer Dialog */}
      <DialogForm
        title={`Edit Offer: ${selectedOffer?.title}`}
        description="Update your product or service details"
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        size="lg"
        submitLabel="Save Changes"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        footerContent={
          <AlertDialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="destructive"
                className="mr-auto"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2Icon className="h-4 w-4 mr-2" /> Delete Offer
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Offer</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to delete this offer? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteOffer}>
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        }
      >
        <Form {...form}>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Offer Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Executive Coaching Package" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your offer and its value proposition" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Coming Soon">Coming Soon</SelectItem>
                        <SelectItem value="Archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., $2,500 / month" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., 6-month commitment" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Format (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., In-person or virtual" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="clientCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Client Count</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </DialogForm>
    </FeatureCard>
  );
};

export default OfferList;