import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
// Define a simple interface for ClarityLab
interface ClarityLab {
  id: number;
  userId: number;
  title: string;
  description: string;
  category: string;
  createdAt: string | Date;
  updatedAt: string | Date;
}
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, FilterIcon, CheckCircleIcon, FlaskConicalIcon, LightbulbIcon, CalendarIcon, AlertTriangleIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeatureCard, StatusBadge } from "@/components/ui/feature-card";

// Enhanced form schema with better validation messages
const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  description: z.string().min(5, "Please provide a more detailed description (at least 5 characters)"),
  category: z.string().min(1, "Please select a category for your entry"),
});

type FormValues = z.infer<typeof formSchema>;

interface ClarityLabProps {
  showNewEntry?: boolean;
  onDialogClose?: () => void;
}

// Define category options for consistency
const CATEGORY_OPTIONS = [
  { value: "Lesson", label: "Lesson Learned" },
  { value: "Workflow", label: "Workflow" },
  { value: "Solution", label: "Solution" }
];

const ClarityLabComponent = ({ showNewEntry = false, onDialogClose }: ClarityLabProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
    },
  });
  
  // Listen for showNewEntry prop changes
  useEffect(() => {
    if (showNewEntry) {
      setIsOpen(true);
    }
  }, [showNewEntry]);
  
  // Handle dialog close
  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setFormError(null);
      if (onDialogClose) {
        onDialogClose();
      }
    }
  };

  // Fetch clarity lab entries with error handling
  const { 
    data: clarityLabs = [], 
    isLoading,
    error: queryError,
    refetch 
  } = useQuery<ClarityLab[]>({
    queryKey: ['/api/clarity-labs', activeCategory && { category: activeCategory }],
    retry: 2
  });
  
  // Handle errors from the query
  React.useEffect(() => {
    if (queryError) {
      toast({
        title: "Error loading entries",
        description: queryError instanceof Error ? queryError.message : "Failed to load clarity lab entries",
        variant: "destructive",
      });
    }
  }, [queryError, toast]);

  // Create clarity lab entry with improved error handling
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      setIsSubmitting(true);
      setFormError(null);
      try {
        return await apiRequest('POST', '/api/clarity-labs', data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
        setFormError(errorMessage);
        throw error;
      } finally {
        setIsSubmitting(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clarity-labs'] });
      toast({
        title: "Entry created",
        description: "Your clarity lab entry has been created successfully.",
      });
      setIsOpen(false);
      form.reset();
      refetch();
    },
    onError: (error) => {
      // Error is already handled in mutationFn
      console.error("Error creating entry:", error);
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handleNewEntry = () => {
    form.reset({
      title: "",
      description: "",
      category: "",
    });
    setFormError(null);
    setIsOpen(true);
  };

  const formatDate = (dateString: string | Date) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  const getBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lesson':
        return 'bg-green-100 text-green-800';
      case 'workflow':
        return 'bg-blue-100 text-blue-800';
      case 'solution':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Function to get icon for entry cards
  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'lesson':
        return <LightbulbIcon className="h-4 w-4" />;
      case 'workflow':
        return <CheckCircleIcon className="h-4 w-4" />;
      case 'solution':
        return <FlaskConicalIcon className="h-4 w-4" />;
      default:
        return <CalendarIcon className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Clarity Lab</h2>
        <div>
          <Button
            variant="outline"
            className="mr-2"
            onClick={() => {
              // Toggle category filtering UI
              setActiveCategory(activeCategory ? null : 'Lesson');
            }}
          >
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button
            onClick={handleNewEntry}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Entry
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 mb-6">Document lessons learned, workflows, and solutions to recurring problems.</p>
      
      {/* Category Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <button 
              className={`inline-block p-3 border-b-2 rounded-t-lg ${
                activeCategory === null 
                  ? 'border-primary text-primary' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveCategory(null)}
            >
              All Entries
            </button>
          </li>
          {CATEGORY_OPTIONS.map(option => (
            <li key={option.value} className="mr-2">
              <button 
                className={`inline-block p-3 border-b-2 rounded-t-lg ${
                  activeCategory === option.value 
                    ? 'border-primary text-primary' 
                    : 'border-transparent hover:text-gray-600 hover:border-gray-300'
                }`}
                onClick={() => setActiveCategory(option.value)}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : queryError ? (
        <div className="text-center py-10 border border-dashed border-red-300 rounded-lg bg-red-50">
          <AlertTriangleIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <h3 className="text-lg font-medium text-red-700 mb-2">Failed to Load Entries</h3>
          <p className="text-red-600 mb-4">There was a problem loading your clarity lab entries.</p>
          <Button
            onClick={() => refetch()}
            variant="outline"
          >
            Try Again
          </Button>
        </div>
      ) : clarityLabs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
          {clarityLabs.map((entry) => (
            <FeatureCard
              key={entry.id}
              title={entry.title}
              description={entry.description}
              status={entry.category}
              date={new Date(entry.createdAt)}
              icon={getCategoryIcon(entry.category)}
              actions={[
                {
                  label: "View Details",
                  onClick: () => {},
                  variant: "ghost"
                }
              ]}
              className="h-full hover:shadow-md transition-shadow"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Clarity Lab Entries Yet</h3>
          <p className="text-gray-500 mb-4">
            {activeCategory 
              ? `No entries found in the "${activeCategory}" category.` 
              : "Start documenting your lessons, workflows, and solutions."}
          </p>
          <Button
            onClick={handleNewEntry}
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Entry
          </Button>
        </div>
      )}

      {/* New Entry Dialog */}
      <DialogForm
        title="Create New Entry"
        description="Document a new lesson, workflow, or solution for your clarity lab."
        open={isOpen}
        onOpenChange={handleDialogClose}
        size="md"
        submitLabel="Save Entry"
        submitDisabled={isSubmitting}
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <Form {...form}>
          <div className="space-y-4">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                {formError}
              </div>
            )}
            
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your entry" {...field} />
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
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {CATEGORY_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                      placeholder="Describe your lesson, workflow, or solution"
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {isSubmitting && (
              <div className="text-sm text-primary animate-pulse mt-2">
                Saving your entry...
              </div>
            )}
          </div>
        </Form>
      </DialogForm>
    </div>
  );
};

export default ClarityLabComponent;
