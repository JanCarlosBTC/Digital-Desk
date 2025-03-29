import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClarityLab } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, FilterIcon, CheckCircleIcon, FlaskConicalIcon, LightbulbIcon, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FeatureCard, StatusBadge } from "@/components/ui/feature-card";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface ClarityLabProps {
  showNewEntry?: boolean;
  onDialogClose?: () => void;
}

const ClarityLabComponent = ({ showNewEntry = false, onDialogClose }: ClarityLabProps) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  
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
    if (!open && onDialogClose) {
      onDialogClose();
    }
  };

  // Fetch clarity lab entries
  const { data: clarityLabs, isLoading } = useQuery<ClarityLab[]>({
    queryKey: ['/api/clarity-labs', activeCategory && { category: activeCategory }],
  });

  // Create clarity lab entry
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      return apiRequest('POST', '/api/clarity-labs', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clarity-labs'] });
      toast({
        title: "Entry created",
        description: "Your clarity lab entry has been created successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating entry",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
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
          <li className="mr-2">
            <button 
              className={`inline-block p-3 border-b-2 rounded-t-lg ${
                activeCategory === 'Lesson' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveCategory('Lesson')}
            >
              Lessons Learned
            </button>
          </li>
          <li className="mr-2">
            <button 
              className={`inline-block p-3 border-b-2 rounded-t-lg ${
                activeCategory === 'Workflow' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveCategory('Workflow')}
            >
              Workflows
            </button>
          </li>
          <li>
            <button 
              className={`inline-block p-3 border-b-2 rounded-t-lg ${
                activeCategory === 'Solution' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent hover:text-gray-600 hover:border-gray-300'
              }`}
              onClick={() => setActiveCategory('Solution')}
            >
              Solutions
            </button>
          </li>
        </ul>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : clarityLabs && clarityLabs.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
          {clarityLabs.map((entry) => (
            <FeatureCard
              key={entry.id}
              title={entry.title}
              description={entry.description}
              status={entry.category}
              date={new Date(entry.createdAt)}
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
          <p className="text-gray-500 mb-4">Start documenting your lessons, workflows, and solutions.</p>
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
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Client Onboarding Improvements" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Lesson">Lesson Learned</SelectItem>
                      <SelectItem value="Workflow">Workflow</SelectItem>
                      <SelectItem value="Solution">Solution</SelectItem>
                    </SelectContent>
                  </Select>
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
                      placeholder="E.g., Adding a welcome video reduced onboarding questions by 40% and improved client satisfaction."
                      rows={4} 
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </Form>
      </DialogForm>
    </div>
  );
};

export default ClarityLabComponent;
