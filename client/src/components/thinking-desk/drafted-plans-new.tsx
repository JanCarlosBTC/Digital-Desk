import React, { useState, useEffect, memo, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ArrowRightIcon, 
  ChevronDownIcon, 
  EditIcon, 
  MessageSquareIcon, 
  PaperclipIcon, 
  PlusIcon 
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingState } from "@/components/ui/loading-state";
import { useErrorHandler } from "@/lib/error-utils";

// Define the DraftedPlan interface
interface DraftedPlan {
  id: number;
  userId: number;
  title: string;
  description: string;
  components: string[];
  resourcesNeeded: string[];
  expectedOutcomes: string[];
  status: string;
  comments: number;
  attachments: number;
  createdAt: string | Date;
  updatedAt: string | Date;
}

// Define the form schema for validation
const formSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  components: z.array(z.string()),
  resourcesNeeded: z.array(z.string()),
  expectedOutcomes: z.array(z.string()),
  status: z.enum(["Draft", "In Progress", "Completed"]),
});

type FormValues = z.infer<typeof formSchema>;

interface DraftedPlanItemProps {
  plan: DraftedPlan;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

// Component for a single Drafted Plan item
const DraftedPlanItem = memo(function DraftedPlanItem({ 
  plan, 
  onEdit, 
  onDelete 
}: DraftedPlanItemProps) {
  const handleEdit = useCallback(() => {
    onEdit(plan.id);
  }, [onEdit, plan.id]);

  const handleDelete = useCallback(() => {
    onDelete(plan.id);
  }, [onDelete, plan.id]);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold">{plan.title}</h3>
          <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
          <p className="text-xs text-gray-500 mt-2">
            Last updated: {new Date(plan.updatedAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex space-x-2">
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

interface DraftedPlansProps {
  showNewPlan?: boolean;
  onDialogClose?: () => void;
  onEdit: (id: number) => void;
}

// Main DraftedPlans component
export const DraftedPlans = memo(function DraftedPlans({ 
  showNewPlan = false, 
  onDialogClose, 
  onEdit 
}: DraftedPlansProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});
  const [sortField, setSortField] = useState<keyof DraftedPlan>('updatedAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const handleError = useErrorHandler();

  // Initialize form with default values
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Draft",
      components: [],
      resourcesNeeded: [],
      expectedOutcomes: [],
    },
  });

  // Listen for showNewPlan prop changes
  useEffect(() => {
    if (showNewPlan) {
      handleNewPlan();
    }
  }, [showNewPlan]);

  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };

  // Fetch drafted plans
  const { data: plansData, isLoading, error } = useQuery({
    queryKey: ['/api/drafted-plans']
  });
  
  // Safely cast the data as DraftedPlan[]
  const plans = Array.isArray(plansData) ? plansData as DraftedPlan[] : [];

  // Mutation for deleting a plan
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/drafted-plans/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to delete plan');
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafted-plans'] });
      toast({
        title: "Success",
        description: "Plan deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting plan",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle deletion of a plan
  const handleDelete = useCallback(async (id: number) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      handleError(error);
    }
  }, [deleteMutation, handleError]);

  // Handle sorting of plans
  const handleSort = useCallback((field: keyof DraftedPlan) => {
    setSortField(current => {
      if (current === field) {
        setSortDirection(dir => dir === 'asc' ? 'desc' : 'asc');
        return field;
      }
      setSortDirection('asc');
      return field;
    });
  }, []);

  // Sort plans based on selected field and direction
  const sortedPlans = useMemo(() => {
    if (!plans.length) return [];
    
    return [...plans].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const modifier = sortDirection === 'asc' ? 1 : -1;

      if (aValue < bValue) return -1 * modifier;
      if (aValue > bValue) return 1 * modifier;
      return 0;
    });
  }, [plans, sortField, sortDirection]);

  // Mutation for creating a drafted plan
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Transform data for API
      const formattedData = {
        title: data.title,
        description: data.description,
        status: data.status,
        components: data.components,
        resourcesNeeded: data.resourcesNeeded,
        expectedOutcomes: data.expectedOutcomes,
        comments: 0,
        attachments: 0,
      };

      const response = await fetch('/api/drafted-plans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formattedData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to create plan');
      }
      
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/drafted-plans'] });
      toast({
        title: "Plan created",
        description: "Your drafted plan has been created successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating plan",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  // Open the "New Plan" dialog
  const handleNewPlan = () => {
    form.reset({
      title: "",
      description: "",
      status: "Draft",
      components: [],
      resourcesNeeded: [],
      expectedOutcomes: [],
    });
    setIsOpen(true);
  };

  // Toggle plan expansion
  const togglePlanExpansion = (id: number) => {
    setExpandedPlans(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  // Show loading state while fetching data
  if (isLoading) {
    return <LoadingState type="list" count={3} />;
  }

  // Show error state if there was an error fetching data
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-lg">
        <h3 className="font-medium">Error Loading Drafted Plans</h3>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : "An unknown error occurred. Please try again."}
        </p>
      </div>
    );
  }

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Drafted Plans
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">
              Develop initiatives and projects before they're ready for execution
            </CardDescription>
          </div>
          <Button
            onClick={handleNewPlan}
            variant="thinkingDesk"
            size="sm"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Plan
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-end space-x-2 mb-4">
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
            onClick={() => handleSort('updatedAt')}
          >
            Sort by Date
          </Button>
        </div>
        
        {sortedPlans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No drafted plans found. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedPlans.map(plan => (
              <DraftedPlanItem
                key={plan.id}
                plan={plan}
                onEdit={onEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* New Plan Dialog */}
        <DialogForm
          title="New Plan"
          description="Develop initiatives and projects before they're ready for execution"
          open={isOpen}
          onOpenChange={setIsOpen}
          size="full"
          submitLabel="Save Plan"
          cancelLabel="Cancel"
          isSubmitting={createMutation.isPending}
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <Form {...form}>
            <div className="space-y-5">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Plan Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="E.g., Q3 Content Marketing Strategy" 
                        className="bg-white"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the overall plan and its purpose" 
                        className="min-h-24 bg-white"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Status</FormLabel>
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
                        <SelectItem value="Draft">Draft</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Ready">Ready</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="components"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Key Components (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g.,
SEO blog content (6 articles/month)
Lead magnet development
Email nurture sequence optimization" 
                        rows={4} 
                        className="bg-white"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="resourcesNeeded"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Resources Needed (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g.,
Content writer ($2,500/mo)
SEO specialist (internal)
Designer for lead magnets" 
                        rows={4} 
                        className="bg-white"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedOutcomes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-medium">Expected Outcomes (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="E.g.,
+30% organic traffic
100 new email subscribers/month
15 SQL from content channels" 
                        rows={4} 
                        className="bg-white"
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </Form>
        </DialogForm>
      </CardContent>
    </Card>
  );
});