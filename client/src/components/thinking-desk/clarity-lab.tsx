import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClarityLab } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, FilterIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  category: z.string().min(1, "Category is required"),
});

type FormValues = z.infer<typeof formSchema>;

const ClarityLabComponent = () => {
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
            className="mr-2 border-gray-300 hover:bg-gray-100"
            onClick={() => {
              // Toggle category filtering UI
              setActiveCategory(activeCategory ? null : 'Lesson');
            }}
          >
            <FilterIcon className="mr-2 h-4 w-4" /> Filter
          </Button>
          <Button
            onClick={handleNewEntry}
            className="bg-primary text-white hover:bg-blue-600 transition-colors"
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
            <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded mb-2 inline-block ${getBadgeColor(entry.category)}`}>
                {entry.category}
              </span>
              <h3 className="font-medium text-gray-800 mb-2">{entry.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{entry.description}</p>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{formatDate(entry.createdAt)}</span>
                <button className="text-primary hover:text-blue-700">View Details</button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Clarity Lab Entries Yet</h3>
          <p className="text-gray-500 mb-4">Start documenting your lessons, workflows, and solutions.</p>
          <Button
            onClick={handleNewEntry}
            variant="outline"
            className="border-primary text-primary hover:bg-blue-50"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> Create Your First Entry
          </Button>
        </div>
      )}

      {/* New Entry Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Entry</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary text-white hover:bg-blue-600"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Save Entry"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ClarityLabComponent;
