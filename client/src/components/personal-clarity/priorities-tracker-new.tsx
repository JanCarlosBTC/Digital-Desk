import React, { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Edit as EditIcon, X } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Priority } from "@shared/schema";
import "@/components/ui/clipboard.css";
import { motion, AnimatePresence } from "framer-motion";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      priority1: "",
      priority2: "",
      priority3: "",
    },
  });

  // Fetch priorities with optimized cache behavior
  const { data: priorities, isLoading } = useQuery<Priority[]>({
    queryKey: ['/api/priorities'],
    staleTime: 30000, // 30 seconds before refetching
  });

  // Create priority with optimized mutation
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

  // Delete priority with optimistic updates
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/priorities/${id}`);
    },
    onMutate: async (deletedId) => {
      // Cancel outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['/api/priorities'] });
      
      // Save previous value
      const previousPriorities = queryClient.getQueryData<Priority[]>(['/api/priorities']);
      
      // Optimistically update the cache
      if (previousPriorities) {
        queryClient.setQueryData<Priority[]>(['/api/priorities'], 
          previousPriorities.filter(p => p.id !== deletedId)
        );
      }
      
      return { previousPriorities };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/priorities'] });
      toast({
        title: "Priority deleted",
        description: "Your priority has been deleted successfully.",
      });
    },
    onError: (error, _, context) => {
      // Roll back to the previous value if mutation fails
      if (context?.previousPriorities) {
        queryClient.setQueryData(['/api/priorities'], context.previousPriorities);
      }
      
      toast({
        title: "Error deleting priority",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update all priorities with batched operations
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
          return apiRequest('POST', '/api/priorities', { 
            priority, 
            order: index + 1 
          });
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

  // Set form values when priorities are loaded - memoized for performance
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

  // Memoized handlers for better performance
  const handleAddPriority = useCallback(() => {
    if (!newPriority.trim()) return;
    setIsSubmitting(true);
    createMutation.mutate(newPriority, {
      onSuccess: () => {
        setNewPriority('');
        setIsSubmitting(false);
      },
      onError: (error) => {
        console.error("Error adding priority:", error);
        setIsSubmitting(false);
      }
    });
  }, [newPriority, createMutation]);

  const handleDeletePriority = useCallback((id: number) => {
    deleteMutation.mutate(id);
  }, [deleteMutation]);

  const onSubmit = useCallback((data: FormValues) => {
    updateAllMutation.mutate(data);
  }, [updateAllMutation]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 sticky top-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">What Matters Most</h2>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button 
            variant="outline"
            onClick={() => setIsOpen(true)}
            className="flex items-center"
          >
            <EditIcon className="mr-2 h-4 w-4" /> Edit
          </Button>
        </motion.div>
      </div>
      
      <p className="text-gray-600 mb-4">Maintain focus by tracking your top 3 priorities.</p>
      
      {isLoading ? (
        <Skeleton className="h-48 w-full mb-6" />
      ) : priorities && priorities.length > 0 ? (
        <ul className="space-y-3 mb-6">
          <AnimatePresence initial={false}>
            {priorities.sort((a, b) => a.order - b.order).map((priority) => (
              <motion.li 
                key={priority.id} 
                className="flex justify-between items-center p-3 bg-gray-50 border border-gray-100 rounded-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                layout
              >
                <span className="font-medium text-gray-800">{priority.priority}</span>
                <motion.button 
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => handleDeletePriority(priority.id)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <motion.div 
          className="text-center py-4 bg-gray-50 rounded-md mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-600">No priorities set yet.</p>
          <p className="text-sm text-gray-500">Add your first priority below!</p>
        </motion.div>
      )}

      {/* Quote */}
      <motion.div 
        className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6"
        initial={{ opacity: 0.8, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <blockquote className="italic text-gray-600">
          "The key is not to prioritize what's on your schedule, but to schedule your priorities."
        </blockquote>
        <p className="text-right text-sm text-gray-500 mt-2">— Stephen Covey</p>
      </motion.div>

      {/* Quick Add Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <h3 className="font-medium text-gray-800 mb-3">Add a Priority</h3>
        <div className="flex">
          <Input 
            className="flex-1 border border-gray-300 rounded-l-lg p-2 focus:outline-none focus:ring-2 focus:border-transparent"
            placeholder="Enter a new priority..."
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddPriority();
              }
            }}
          />
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              className="rounded-r-lg"
              variant="default"
              onClick={handleAddPriority}
              disabled={isSubmitting || !newPriority.trim()} 
            >
              {isSubmitting ? "Adding..." : "Add"}
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Edit Priorities Dialog */}
      <DialogForm
        title="Edit Top Priorities"
        open={isOpen}
        onOpenChange={setIsOpen}
        size="md"
        submitLabel="Save Changes"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit(onSubmit)(e);
        }}
      >
        <Form {...form}>
          <div className="space-y-4">
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
          </div>
        </Form>
      </DialogForm>
    </div>
  );
};

export default React.memo(PrioritiesTracker);