import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit as EditIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Priority } from "@shared/schema";
import { X } from "lucide-react";
import "@/components/ui/clipboard.css"; // Added import for clipboard styles

const formSchema = z.object({
  priority1: z.string().min(3, "Priority must be at least 3 characters"),
  priority2: z.string().min(3, "Priority must be at least 3 characters"),
  priority3: z.string().min(3, "Priority must be at least 3 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const PrioritiesTracker = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [newPriority, setNewPriority] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority1: "",
      priority2: "",
      priority3: "",
    },
  });

  // Fetch priorities
  const { data: priorities, isLoading } = useQuery<Priority[]>({
    queryKey: ['/api/priorities'],
  });

  // Create priority
  const createMutation = useMutation({
    mutationFn: async (priority: string) => {
      const newOrder = priorities ? priorities.length + 1 : 1;
      return apiRequest('POST', '/api/priorities', { priority, order: newOrder });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/priorities'] });
      toast({
        title: "Priority added",
        description: "Your priority has been added successfully.",
      });
      setNewPriority("");
    },
    onError: (error) => {
      toast({
        title: "Error adding priority",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete priority
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/priorities/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/priorities'] });
      toast({
        title: "Priority deleted",
        description: "Your priority has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting priority",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update all priorities
  const updateAllMutation = useMutation({
    mutationFn: async (priorityValues: FormValues) => {
      const updates = Object.values(priorityValues).map((priority, index) => {
        const existingPriority = priorities && priorities[index];
        if (existingPriority) {
          return apiRequest('PUT', `/api/priorities/${existingPriority.id}`, { 
            priority, 
            order: index + 1 
          });
        } else {
          return createMutation.mutationFn(priority);
        }
      });

      return Promise.all(updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/priorities'] });
      toast({
        title: "Priorities updated",
        description: "Your priorities have been updated successfully.",
      });
      setIsOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error updating priorities",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Set form values when priorities are loaded
  useEffect(() => {
    if (priorities) {
      const values: Partial<FormValues> = {};

      priorities.slice(0, 3).forEach((priority, index) => {
        const fieldName = `priority${index + 1}` as keyof FormValues;
        values[fieldName] = priority.priority;
      });

      form.reset(values as FormValues);
    }
  }, [priorities, form]);

  const handleAddPriority = () => {
    if (newPriority.trim()) {
      createMutation.mutate(newPriority.trim());
    }
  };

  const handleDeletePriority = (id: number) => {
    deleteMutation.mutate(id);
  };

  const handleEditPriorities = () => {
    setIsOpen(true);
  };

  const onSubmit = (data: FormValues) => {
    updateAllMutation.mutate(data);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">What Matters Most?</h2>
      <p className="text-gray-600 mb-6">Keep your top priorities visible and top-of-mind.</p>

      {/* Priorities List */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-medium text-gray-800">Current Priorities</h3>
          <Button 
            className="bg-violet-100 text-black hover:bg-violet-200 hover:text-black text-sm font-medium"
            onClick={handleEditPriorities}
          >
            <EditIcon className="inline-block mr-1 h-4 w-4 text-black" /> Edit
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : priorities && priorities.length > 0 ? (
          <ul className="space-y-3">
            {priorities.map((priority, index) => (
              <li key={priority.id} className="flex items-center p-3 bg-violet-50 border border-violet-100 rounded-md">
                <div className="h-6 w-6 bg-secondary text-white rounded-full flex items-center justify-center mr-3">
                  {index + 1}
                </div>
                <span className="font-medium text-gray-800 flex-1">{priority.priority}</span>
                <button 
                  className="text-gray-400 hover:text-gray-600 clarity-button"
                  onClick={() => handleDeletePriority(priority.id)}
                >
                  <X className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4 bg-violet-50 rounded-md">
            <p className="text-gray-600">No priorities set yet.</p>
            <p className="text-sm text-gray-500">Add your first priority below!</p>
          </div>
        )}
      </div>

      {/* Quote */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
        <blockquote className="italic text-gray-600">
          "The key is not to prioritize what's on your schedule, but to schedule your priorities."
        </blockquote>
        <p className="text-right text-sm text-gray-500 mt-2">— Stephen Covey</p>
      </div>

      {/* Quick Add Form */}
      <div>
        <h3 className="font-medium text-gray-800 mb-3">Add a Priority</h3>
        <div className="flex">
          <Input 
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
            placeholder="Enter a new priority..."
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddPriority();
              }
            }}
          />
          <Button 
            variant="default"
            className="bg-secondary text-white rounded-r-lg hover:bg-violet-600 transition-colors font-medium shadow-sm clarity-button"
            onClick={handleAddPriority}
            disabled={createMutation.isPending || !newPriority.trim()}
          >
            {createMutation.isPending ? "Adding..." : "Add"}
          </Button>
        </div>
      </div>

      {/* Edit Priorities Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Top Priorities</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="priority1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority #1</FormLabel>
                    <FormControl>
                      <Input placeholder="Your top priority" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority #2</FormLabel>
                    <FormControl>
                      <Input placeholder="Your second priority" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority3"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority #3</FormLabel>
                    <FormControl>
                      <Input placeholder="Your third priority" {...field} />
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
                  variant="default"
                  className="bg-secondary text-white hover:bg-violet-600 font-medium shadow-sm clarity-button"
                  disabled={updateAllMutation.isPending}
                >
                  {updateAllMutation.isPending ? "Saving..." : "Save Priorities"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PrioritiesTracker;