import React, { useState, useEffect, useCallback, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS, useEnhancedApiMutation } from "@/lib/api-utils";
import { Button } from "@/components/ui/button";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Offer } from "@shared/schema";
import { LoadingState, CardLoadingState } from "@/components/ui/loading-state";
import { 
  PlusIcon, 
  ArrowUpDown, 
  EditIcon, 
  HistoryIcon, 
  Trash2Icon,
  TagIcon,
  DollarSignIcon,
  ClockIcon,
  UsersIcon,
  CheckCircleIcon,
  ArchiveIcon,
  CircleIcon
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeatureCard } from "@/components/ui/feature-card";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Form validation schema with proper type conversions and validation
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.enum(["Active", "Coming Soon", "Archived"]),
  price: z.string().min(1, "Price is required"),
  duration: z.string().optional(),
  format: z.string().optional(),
  clientCount: z.coerce.number().int().min(0, "Client count must be a positive number").optional(),
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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [sortBy, setSortBy] = useState<string>("status");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Form setup with improved validation
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

  // Enhanced data fetching with better error handling
  const { data: offers, isLoading, error } = useQuery<Offer[]>({
    queryKey: [API_ENDPOINTS.OFFERS],
  });

  // Create offer with improved API utilities
  const createMutation = useEnhancedApiMutation<any, FormValues>(
    'POST',
    API_ENDPOINTS.OFFERS,
    {
      onSuccess: () => {
        toast({
          title: "Offer created",
          description: "Your offer has been created successfully.",
          variant: "success",
        });
        
        setIsOpen(false);
        form.reset();
      }
    }
  );

  // Update offer with improved API utilities
  const updateMutation = useEnhancedApiMutation<any, FormValues & { id: number }>(
    'PUT',
    (variables) => API_ENDPOINTS.OFFER(variables.id),
    {
      onSuccess: () => {
        toast({
          title: "Offer updated",
          description: "Your offer has been updated successfully.",
          variant: "success",
        });
        
        setIsEditOpen(false);
        setSelectedOffer(null);
      }
    }
  );
  
  // Delete offer with improved API utilities
  const deleteMutation = useEnhancedApiMutation<any, number>(
    'DELETE',
    (id) => API_ENDPOINTS.OFFER(id),
    {
      onSuccess: () => {
        toast({
          title: "Offer deleted",
          description: "Your offer has been deleted successfully.",
          variant: "success",
        });
        
        setIsEditOpen(false);
        setSelectedOffer(null);
        setIsDeleteDialogOpen(false);
      }
    }
  );

  // Listen for showNewOffer prop changes
  useEffect(() => {
    if (showNewOffer) {
      handleNewOffer();
    }
  }, [showNewOffer]);

  // Form submission handler
  const onSubmit = (data: FormValues) => {
    if (selectedOffer) {
      updateMutation.mutate({ ...data, id: selectedOffer.id });
    } else {
      createMutation.mutate(data);
    }
  };

  // New offer handler
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
  
  // Edit offer handler
  const handleManageOffer = (offer: Offer) => {
    setSelectedOffer(offer);
    form.reset({
      title: offer.title,
      description: offer.description,
      status: offer.status as "Active" | "Coming Soon" | "Archived",
      price: offer.price,
      duration: offer.duration || "",
      format: offer.format || "",
      clientCount: offer.clientCount || 0,
    });
    setIsEditOpen(true);
  };
  
  // Delete offer handler
  const handleDeleteOffer = () => {
    if (selectedOffer) {
      deleteMutation.mutate(selectedOffer.id);
    }
  };

  // Handle dialog close with callback to parent
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };

  // Handle edit dialog close
  const handleEditDialogClose = (open: boolean) => {
    setIsEditOpen(open);
    if (!open) {
      setSelectedOffer(null);
    }
  };

  // Filter and sort offers
  const filteredAndSortedOffers = React.useMemo(() => {
    if (!offers) return [];
    
    // First apply filters
    let filtered = [...offers];
    
    // Filter by status if selected
    if (statusFilter) {
      filtered = filtered.filter(offer => offer.status === statusFilter);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(offer => 
        offer.title.toLowerCase().includes(query) || 
        offer.description.toLowerCase().includes(query) ||
        offer.price.toLowerCase().includes(query)
      );
    }
    
    // Then sort the filtered results
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case "status": {
          // Sort by status first (Active first, then Coming Soon, then Archived)
          const statusOrder = { "Active": 0, "Coming Soon": 1, "Archived": 2 };
          const statusDiff = (statusOrder[a.status as keyof typeof statusOrder] || 3) - 
                             (statusOrder[b.status as keyof typeof statusOrder] || 3);
          if (statusDiff !== 0) return statusDiff;
          // Then sort by created date (newest first)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case "price-high": {
          // Extract numeric value from price string for comparison
          const getNumericPrice = (price: string) => {
            const match = price.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getNumericPrice(b.price) - getNumericPrice(a.price);
        }
        
        case "price-low": {
          // Extract numeric value from price string for comparison
          const getNumericPriceLow = (price: string) => {
            const match = price.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          };
          return getNumericPriceLow(a.price) - getNumericPriceLow(b.price);
        }
        
        case "clients":
          return (b.clientCount || 0) - (a.clientCount || 0);
          
        default:
          return 0;
      }
    });
  }, [offers, statusFilter, searchQuery, sortBy]);

  // Get status badge component
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center">
            <CheckCircleIcon className="mr-1 h-3 w-3" /> Active
          </Badge>
        );
      case "Coming Soon":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 flex items-center">
            <CircleIcon className="mr-1 h-3 w-3" /> Coming Soon
          </Badge>
        );
      case "Archived":
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200 flex items-center">
            <ArchiveIcon className="mr-1 h-3 w-3" /> Archived
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Format date helper
  const formatDate = (date: string | Date | null) => {
    if (!date) return "N/A";
    
    // Format to month and year only
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleDateString(undefined, { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h2 className="text-2xl font-bold">Offer Vault</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-auto">
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search offers..."
              className="w-full sm:w-[200px]"
            />
          </div>
          
          <Button 
            onClick={handleNewOffer}
            className="whitespace-nowrap"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">New Offer</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>
      </div>
      
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row gap-2 justify-between">
        <div className="flex gap-2">
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent position="popper" className="z-50">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Coming Soon">Coming Soon</SelectItem>
              <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent position="popper" className="z-50">
            <SelectItem value="status">Sort by Status</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-high">Price (High to Low)</SelectItem>
            <SelectItem value="price-low">Price (Low to High)</SelectItem>
            <SelectItem value="clients">Most Clients</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Results count */}
      {!isLoading && (
        <div className="text-sm text-gray-500">
          Showing {filteredAndSortedOffers.length} {filteredAndSortedOffers.length === 1 ? 'offer' : 'offers'}
        </div>
      )}
      
      {/* Offers Grid */}
      <LoadingState 
        variant="skeleton" 
        count={4} 
        height="h-60"
        isLoading={isLoading}
      >
        {filteredAndSortedOffers.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Offers Found</h3>
            <p className="text-gray-500 mb-4">
              {offers?.length === 0 
                ? "Start adding your products and services." 
                : "Try adjusting your filters to see more results."}
            </p>
            {offers?.length === 0 && (
              <Button onClick={handleNewOffer}>
                <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Offer
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAndSortedOffers.map((offer) => (
              <Card 
                key={offer.id} 
                className="h-full hover:shadow-md transition-shadow"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="line-clamp-1 text-lg">{offer.title}</CardTitle>
                      <CardDescription className="line-clamp-2 text-sm">{offer.description}</CardDescription>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <EditIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" sideOffset={5} style={{zIndex: 1050}}>
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleManageOffer(offer)}>
                          <EditIcon className="mr-2 h-4 w-4" />
                          Edit offer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onClick={() => {
                            setSelectedOffer(offer);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2Icon className="mr-2 h-4 w-4" />
                          Delete offer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  {/* Status Badge */}
                  <div className="mb-2">
                    {getStatusBadge(offer.status)}
                  </div>
                  
                  {/* Features */}
                  <div className="space-y-1.5">
                    <div className="flex items-center text-sm">
                      <DollarSignIcon className="mr-2 h-4 w-4 text-gray-500" />
                      <span>{offer.price}</span>
                    </div>
                    
                    {offer.duration && (
                      <div className="flex items-center text-sm">
                        <ClockIcon className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{offer.duration}</span>
                      </div>
                    )}
                    
                    {offer.format && (
                      <div className="flex items-center text-sm">
                        <TagIcon className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{offer.format}</span>
                      </div>
                    )}
                    
                    {offer.clientCount && offer.clientCount > 0 && (
                      <div className="flex items-center text-sm">
                        <UsersIcon className="mr-2 h-4 w-4 text-gray-500" />
                        <span>{offer.clientCount} client{offer.clientCount !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="pt-2">
                  <div className="text-xs text-gray-500">
                    Created: {formatDate(offer.createdAt)}
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </LoadingState>

      {/* New Offer Dialog */}
      <DialogForm
        title="Create New Offer"
        description="Add a new product or service to your offerings"
        open={isOpen}
        onOpenChange={handleDialogClose}
        size="lg"
        submitLabel="Save Offer"
        isSubmitting={createMutation.isPending}
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
                  <FormMessage />
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
                  <FormMessage />
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
                    <FormDescription>
                      Active offers are visible to clients
                    </FormDescription>
                    <FormMessage />
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
                    <FormDescription>
                      Include currency and billing frequency if applicable
                    </FormDescription>
                    <FormMessage />
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
                    <FormDescription>
                      Time commitment required for this offer
                    </FormDescription>
                    <FormMessage />
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
                    <FormDescription>
                      How this offer is delivered to clients
                    </FormDescription>
                    <FormMessage />
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
                  <FormDescription>
                    Number of clients currently using this offer
                  </FormDescription>
                  <FormMessage />
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
        onOpenChange={handleEditDialogClose}
        size="lg"
        submitLabel="Save Changes"
        isSubmitting={updateMutation.isPending}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
        footerContent={
          <Button
            type="button"
            variant="destructive"
            className="mr-auto"
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2Icon className="h-4 w-4 mr-2" /> Delete Offer
          </Button>
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
                  <FormMessage />
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
                  <FormMessage />
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
                    <FormDescription>
                      Active offers are visible to clients
                    </FormDescription>
                    <FormMessage />
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
                    <FormDescription>
                      Include currency and billing frequency if applicable
                    </FormDescription>
                    <FormMessage />
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
                    <FormDescription>
                      Time commitment required for this offer
                    </FormDescription>
                    <FormMessage />
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
                    <FormDescription>
                      How this offer is delivered to clients
                    </FormDescription>
                    <FormMessage />
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
                  <FormDescription>
                    Number of clients currently using this offer
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Form>
      </DialogForm>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Offer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedOffer?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOffer}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <span className="flex items-center">
                  <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Deleting...
                </span>
              ) : (
                "Delete Offer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default memo(OfferList);