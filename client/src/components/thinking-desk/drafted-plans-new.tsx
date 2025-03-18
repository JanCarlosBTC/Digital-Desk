import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
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
import { DraftedPlan } from "@shared/schema";
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

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(5, "Description must be at least 5 characters"),
  status: z.string(),
  components: z.string().min(5, "Components must be at least 5 characters"),
  resourcesNeeded: z.string().min(5, "Resources needed must be at least 5 characters"),
  expectedOutcomes: z.string().min(5, "Expected outcomes must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface DraftedPlansProps {
  showNewPlan?: boolean;
  onDialogClose?: () => void;
}

export default function DraftedPlans({ showNewPlan = false, onDialogClose }: DraftedPlansProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [expandedPlans, setExpandedPlans] = useState<Record<number, boolean>>({});
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "Draft",
      components: "",
      resourcesNeeded: "",
      expectedOutcomes: "",
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
  const { data: draftedPlans, isLoading } = useQuery<DraftedPlan[]>({
    queryKey: ['/api/drafted-plans'],
  });

  // Create drafted plan
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert line-separated strings to arrays
      const formattedData = {
        title: data.title,
        description: data.description,
        status: data.status,
        components: data.components.split('\n').filter(Boolean),
        resourcesNeeded: data.resourcesNeeded.split('\n').filter(Boolean),
        expectedOutcomes: data.expectedOutcomes.split('\n').filter(Boolean),
        comments: 0,
        attachments: 0,
      };
      
      return apiRequest('POST', '/api/drafted-plans', formattedData);
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
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handleNewPlan = () => {
    form.reset({
      title: "",
      description: "",
      status: "Draft",
      components: "",
      resourcesNeeded: "",
      expectedOutcomes: "",
    });
    setIsOpen(true);
  };

  const togglePlanExpansion = (id: number) => {
    setExpandedPlans({ ...expandedPlans, [id]: !expandedPlans[id] });
  };

  const formatDate = (dateString: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

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
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : draftedPlans && draftedPlans.length > 0 ? (
          <div className="space-y-4">
            {draftedPlans.map((plan) => (
              <div key={plan.id} className="border border-gray-200 rounded-lg p-5">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-medium text-lg">{plan.title}</h3>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(plan.createdAt)} • 
                      Updated: {
                        new Date(plan.updatedAt).toDateString() === new Date().toDateString() 
                          ? 'Today' 
                          : formatDate(plan.updatedAt)
                      }
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${
                    plan.status === 'In Progress' 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {plan.status}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-4">{plan.description}</p>
                
                {expandedPlans[plan.id] && (
                  <>
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">Key Components</h4>
                      <ul className="list-disc list-inside text-gray-600 space-y-1">
                        {plan.components.map((component: string, idx: number) => (
                          <li key={idx} className="ml-6 flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">{idx + 1}</div>
                            <div className="flex-1">{component}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Resources Needed</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {plan.resourcesNeeded.map((resource: string, idx: number) => (
                            <li key={idx} className="ml-6 flex items-start">
                              <div className="h-2 w-2 rounded-full bg-amber-300 mr-2 mt-1.5"></div>
                              <div className="flex-1">{resource}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Expected Outcomes</h4>
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                          {plan.expectedOutcomes.map((outcome: string, idx: number) => (
                            <li key={idx} className="ml-6 flex items-start">
                              <div className="h-2 w-2 rounded-full bg-emerald-500 mr-2 mt-1.5"></div>
                              <div className="flex-1">{outcome}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </>
                )}
                
                <div className={`flex justify-between ${expandedPlans[plan.id] ? "border-t border-gray-200 pt-3" : ""}`}>
                  <div>
                    <button className="text-gray-500 hover:text-gray-700 mr-3">
                      <MessageSquareIcon className="inline-block mr-1 h-4 w-4" /> {plan.comments} Comments
                    </button>
                    <button className="text-gray-500 hover:text-gray-700">
                      <PaperclipIcon className="inline-block mr-1 h-4 w-4" /> {plan.attachments} Attachments
                    </button>
                  </div>
                  <div>
                    {expandedPlans[plan.id] && (
                      <>
                        <Button variant="thinkingDeskOutline" className="mr-2">
                          <EditIcon className="mr-1 h-4 w-4" /> Edit
                        </Button>
                        <Button variant="thinkingDesk">
                          Move to Projects <ArrowRightIcon className="ml-1 h-4 w-4" />
                        </Button>
                      </>
                    )}
                    <button 
                      className="text-primary font-medium hover:text-primary/80 ml-3"
                      onClick={() => togglePlanExpansion(plan.id)}
                    >
                      {expandedPlans[plan.id] ? (
                        <span>Hide Details <ChevronDownIcon className="inline-block ml-1 h-4 w-4 rotate-180" /></span>
                      ) : (
                        <span>Show Details <ChevronDownIcon className="inline-block ml-1 h-4 w-4" /></span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg">
            <h3 className="text-lg font-medium text-gray-700 mb-2">No Drafted Plans Yet</h3>
            <p className="text-gray-500 mb-4">Start planning your next big initiative by creating a plan.</p>
            <div className="text-center mt-4">
              <Button
                onClick={handleNewPlan}
                variant="thinkingDesk"
                className="flex items-center mx-auto"
              >
                <PlusIcon className="h-4 w-4 mr-2" /> Create Your First Plan
              </Button>
            </div>
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
}