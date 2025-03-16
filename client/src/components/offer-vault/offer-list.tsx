import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Offer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, ArrowUpDown, EditIcon, HistoryIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const OfferList = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [sortBy, setSortBy] = useState<string>("status");
  
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

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Offers</h2>
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
          <Button
            onClick={handleNewOffer}
            variant="default"
            className="bg-yellow-400 text-white hover:bg-yellow-500 transition-colors font-medium shadow-sm"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Offer
          </Button>
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
            <div 
              key={offer.id} 
              className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="bg-gradient-to-r from-amber-500 to-amber-300 h-3"></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-medium text-lg">{offer.title}</h3>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${getStatusBadgeColor(offer.status)}`}>
                    {offer.status}
                  </span>
                </div>
                
                <p className="text-gray-600 text-sm mb-4">{offer.description}</p>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">Price</span>
                    <span className="text-sm text-gray-700">{offer.price}</span>
                  </div>
                  {offer.duration && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Duration</span>
                      <span className="text-sm text-gray-700">{offer.duration}</span>
                    </div>
                  )}
                  {offer.format && (
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-700">Format</span>
                      <span className="text-sm text-gray-700">{offer.format}</span>
                    </div>
                  )}
                </div>
                
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <div className="text-xs text-gray-500">
                    {offer.status === "Archived" 
                      ? `Retired: ${formatDate(offer.archivedAt ? offer.archivedAt.toString() : null)} • ${offer.clientCount} sales`
                      : `Created: ${formatDate(offer.createdAt.toString())} • ${offer.clientCount} clients`
                    }
                  </div>
                  <button 
                    className="text-amber-500 hover:text-amber-700"
                    onClick={() => offer.status === "Archived" ? null : handleManageOffer(offer)}
                  >
                    {offer.status === "Archived" 
                      ? <><HistoryIcon className="inline-block mr-1 h-4 w-4" /> View History</>
                      : <><EditIcon className="inline-block mr-1 h-4 w-4" /> Manage</>
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Offers Yet</h3>
          <p className="text-gray-500 mb-4">Start creating your product and service offerings.</p>
          <Button
            onClick={handleNewOffer}
            variant="outline"
            className="border-warning text-warning hover:bg-amber-50 font-medium shadow-sm"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Offer
          </Button>
        </div>
      )}

      {/* New Offer Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-8 py-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <DialogTitle className="text-2xl font-semibold text-gray-800">Create New Offer</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1.5">
              Add products and services to your portfolio to track sales and manage your catalog.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-8 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                
                <DialogFooter className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="default"
                    className="bg-yellow-400 text-white hover:bg-yellow-500 font-medium shadow-sm"
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? "Saving..." : "Save Offer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Offer Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto p-0 gap-0">
          <DialogHeader className="px-8 py-6 border-b border-gray-100 bg-gray-50 rounded-t-lg">
            <DialogTitle className="text-2xl font-semibold text-gray-800">Edit Offer</DialogTitle>
            <DialogDescription className="text-gray-600 mt-1.5">
              Update the details of your product or service offering.
            </DialogDescription>
          </DialogHeader>
          
          <div className="px-8 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                
                <DialogFooter className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    variant="default"
                    className="bg-yellow-400 text-white hover:bg-yellow-500 font-medium shadow-sm"
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Offer"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OfferList;