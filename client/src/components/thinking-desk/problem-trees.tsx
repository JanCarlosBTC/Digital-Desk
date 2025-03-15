import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { 
  PlusIcon, 
  EditIcon, 
  TrashIcon, 
  EyeIcon, 
  ChevronDown, 
  ArrowDown,
  Lightbulb,
  ListTodo,
  Calendar,
  SearchIcon,
  FilterIcon,
  SortAscIcon,
  TagIcon,
  LayoutGridIcon,
  LayoutListIcon
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ProblemTree } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  mainProblem: z.string().min(5, "Main problem must be at least 5 characters"),
  subProblems: z.string().min(5, "Sub problems must be at least 5 characters"),
  rootCauses: z.string().min(5, "Root causes must be at least 5 characters"),
  potentialSolutions: z.string().min(5, "Solutions must be at least 5 characters"),
  nextActions: z.string().min(5, "Next actions must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const ProblemTrees = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProblemTree, setSelectedProblemTree] = useState<ProblemTree | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOption, setSortOption] = useState<"newest" | "oldest" | "alphabetical">("newest");
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      mainProblem: "",
      subProblems: "",
      rootCauses: "",
      potentialSolutions: "",
      nextActions: "",
    },
  });

  // Fetch problem trees
  const { data: problemTrees, isLoading } = useQuery<ProblemTree[]>({
    queryKey: ['/api/problem-trees'],
  });

  // Create problem tree
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert line-separated strings to arrays
      const formattedData = {
        title: data.title,
        mainProblem: data.mainProblem,
        subProblems: data.subProblems.split('\n').filter(Boolean),
        rootCauses: data.rootCauses.split('\n').filter(Boolean),
        potentialSolutions: data.potentialSolutions.split('\n').filter(Boolean),
        nextActions: data.nextActions.split('\n').filter(Boolean),
      };
      
      return apiRequest('POST', '/api/problem-trees', formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Problem tree created",
        description: "Your problem tree has been created successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating problem tree",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Delete problem tree
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest('DELETE', `/api/problem-trees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Problem tree deleted",
        description: "Your problem tree has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting problem tree",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update problem tree mutation
  const updateMutation = useMutation({
    mutationFn: async (data: { id: number; problemTree: FormValues }) => {
      return apiRequest('PUT', `/api/problem-trees/${data.id}`, data.problemTree);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/problem-trees'] });
      toast({
        title: "Problem tree updated",
        description: "Your problem tree has been updated successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error updating problem tree",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    if (selectedProblemTree) {
      // Format data for update
      const formattedData = {
        ...data,
        subProblems: data.subProblems.split('\n').filter(Boolean),
        rootCauses: data.rootCauses.split('\n').filter(Boolean),
        potentialSolutions: data.potentialSolutions.split('\n').filter(Boolean),
        nextActions: data.nextActions.split('\n').filter(Boolean),
      };
      updateMutation.mutate({ id: selectedProblemTree.id, problemTree: formattedData });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleNewProblemTree = () => {
    if (problemTrees && problemTrees.length >= 3) {
      toast({
        title: "Maximum limit reached",
        description: "You can only create up to 3 problem trees.",
        variant: "destructive"
      });
      return;
    }
    setSelectedProblemTree(null);
    form.reset({
      title: "",
      mainProblem: "",
      subProblems: "",
      rootCauses: "",
      potentialSolutions: "",
      nextActions: "",
    });
    setIsOpen(true);
  };

  const handleEditProblemTree = (tree: ProblemTree) => {
    setSelectedProblemTree(tree);
    form.reset({
      title: tree.title,
      mainProblem: tree.mainProblem,
      subProblems: tree.subProblems.join('\n'),
      rootCauses: tree.rootCauses.join('\n'),
      potentialSolutions: tree.potentialSolutions.join('\n'),
      nextActions: tree.nextActions.join('\n'),
    });
    setIsOpen(true);
  };

  const handleDeleteProblemTree = (id: number) => {
    if (confirm("Are you sure you want to delete this problem tree?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Problem Trees
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm mt-1">
              Break down complex problems into root causes and actionable solutions
            </CardDescription>
          </div>
          <Button
            onClick={handleNewProblemTree}
            className="bg-primary/90 text-white hover:bg-primary transition-all"
            size="sm"
          >
            <PlusIcon className="mr-2 h-4 w-4" /> New Problem Tree
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : problemTrees && problemTrees.length > 0 ? (
          <>
            {/* Featured Problem Tree */}
            <Card className="bg-gradient-to-b from-white to-gray-50 shadow-sm border">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 mr-2">
                      Active
                    </Badge>
                    <CardTitle className="text-lg font-semibold">
                      {problemTrees[0].title}
                    </CardTitle>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-primary hover:bg-primary/10"
                      onClick={() => handleEditProblemTree(problemTrees[0])}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteProblemTree(problemTrees[0].id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription className="text-sm text-gray-500 italic mt-1">
                  Last updated: {new Date(problemTrees[0].updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="pb-2 pt-0">
                {/* Problem Tree Visualization */}
                <div className="bg-white rounded-lg p-6 shadow-inner border border-gray-100 mb-6">
                  <div className="flex flex-col items-center">
                    {/* Main Problem */}
                    <div className="relative bg-gradient-to-r from-red-50 to-red-100 shadow-sm border border-red-200 rounded-lg p-4 w-full sm:w-4/5 lg:w-3/5 text-center mb-4">
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold py-1 px-2 rounded-full">PROBLEM</div>
                      <p className="font-medium text-gray-800 mt-1">{problemTrees[0].mainProblem}</p>
                    </div>
                    
                    {/* Arrow down */}
                    <div className="flex items-center justify-center w-full mb-2">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    {/* Sub Problems (Level 1) */}
                    <div className="grid grid-cols-1 gap-3 w-full max-w-3xl mx-auto mb-4">
                      {problemTrees[0].subProblems.slice(0, 3).map((subProblem, index) => (
                        <div key={index} className="bg-gradient-to-r from-orange-50 to-orange-100 shadow-sm border border-orange-200 rounded-lg p-3 text-center flex flex-col items-center">
                          <Badge variant="outline" className="bg-orange-100 border-orange-300 text-orange-700 mb-1">Sub-problem {index + 1}</Badge>
                          <p className="text-gray-800">{subProblem}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* Arrow down */}
                    <div className="flex items-center justify-center w-full mb-2">
                      <ArrowDown className="h-6 w-6 text-gray-400" />
                    </div>
                    
                    {/* Root Causes (Level 2) */}
                    <div className="grid grid-cols-1 gap-3 w-full max-w-2xl mx-auto mb-1">
                      {problemTrees[0].rootCauses.slice(0, 2).map((rootCause, index) => (
                        <div key={index} className="bg-gradient-to-r from-yellow-50 to-yellow-100 shadow-sm border border-yellow-200 rounded-lg p-3 text-center flex flex-col items-center">
                          <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-700 mb-1">Root Cause {index + 1}</Badge>
                          <p className="text-gray-800">{rootCause}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="shadow-sm border bg-blue-50/50">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-sm font-medium flex items-center text-blue-700">
                        <Lightbulb className="h-4 w-4 mr-2" /> 
                        Potential Solutions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {problemTrees[0].potentialSolutions.map((solution, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">{index + 1}</div>
                            <span className="text-sm text-gray-700">{solution}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                  
                  <Card className="shadow-sm border bg-green-50/50">
                    <CardHeader className="pb-2 pt-3">
                      <CardTitle className="text-sm font-medium flex items-center text-green-700">
                        <ListTodo className="h-4 w-4 mr-2" /> 
                        Next Actions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ul className="space-y-2">
                        {problemTrees[0].nextActions.map((action, index) => (
                          <li key={index} className="flex items-start">
                            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center mr-2 mt-0.5 text-xs font-bold">{index + 1}</div>
                            <span className="text-sm text-gray-700">{action}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
            
            {/* Problem Tree List */}
            {problemTrees.length > 1 && (
              <div className="mt-6">
                <div className="flex items-center mb-3">
                  <h3 className="font-medium text-gray-700">Your Other Problem Trees</h3>
                  <Badge variant="outline" className="ml-2 bg-gray-100 text-gray-700">
                    {problemTrees.length - 1}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {problemTrees.slice(1).map((tree) => (
                    <Card 
                      key={tree.id}
                      className="bg-white hover:bg-gray-50 cursor-pointer transition-colors border shadow-sm"
                    >
                      <CardContent className="p-4 flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <ChevronDown className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{tree.title}</p>
                            <p className="text-gray-500 text-xs">
                              {new Date(tree.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-primary/10"
                          onClick={() => {
                            // Find current featured tree index
                            const currentIndex = problemTrees.findIndex(t => t.id === tree.id);
                            // Create new array with selected tree first
                            const reorderedTrees = [
                              tree,
                              ...problemTrees.slice(0, currentIndex),
                              ...problemTrees.slice(currentIndex + 1)
                            ];
                            // Update query data
                            queryClient.setQueryData(['/api/problem-trees'], reorderedTrees);
                          }}
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 border border-dashed border-gray-200 rounded-lg bg-gray-50/50">
            <div className="bg-primary/10 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChevronDown className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-medium text-gray-800 mb-2">No Problem Trees Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Create your first problem tree to break down complex challenges into actionable steps.
            </p>
            <Button
              onClick={handleNewProblemTree}
              className="bg-primary/90 text-white hover:bg-primary"
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Create Problem Tree
            </Button>
          </div>
        )}
      </CardContent>

      {/* New Problem Tree Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              {selectedProblemTree ? 'Edit Problem Tree' : 'Create New Problem Tree'}
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Break down complex problems into manageable parts to identify root causes and solutions.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-2">
                <h3 className="text-sm font-semibold text-blue-700 mb-2 flex items-center">
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Problem Structure
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Title</FormLabel>
                        <FormDescription className="text-xs text-gray-500">
                          What would you like to call this problem analysis?
                        </FormDescription>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Customer Acquisition Challenges" 
                            className="bg-white"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="mainProblem"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-medium">Main Problem</FormLabel>
                        <FormDescription className="text-xs text-gray-500">
                          The core issue you're trying to solve
                        </FormDescription>
                        <FormControl>
                          <Input 
                            placeholder="E.g., Declining Customer Sign-ups" 
                            className="bg-white"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subProblems"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="font-medium flex items-center">
                            <Badge className="mr-2 bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-100">Step 1</Badge>
                            Sub Problems
                          </FormLabel>
                        </div>
                        <FormDescription className="text-xs text-gray-500">
                          Identify the components of the main problem (one per line)
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g.,
High CAC
Low Conversion Rate
Poor Retention" 
                            rows={4}
                            className="bg-white resize-none"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="rootCauses"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="font-medium flex items-center">
                            <Badge className="mr-2 bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-100">Step 2</Badge>
                            Root Causes
                          </FormLabel>
                        </div>
                        <FormDescription className="text-xs text-gray-500">
                          Identify underlying causes of the sub-problems (one per line)
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g.,
Unclear Messaging
Competing Platforms
Limited Marketing Budget" 
                            rows={4}
                            className="bg-white resize-none"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="potentialSolutions"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="font-medium flex items-center">
                            <Badge className="mr-2 bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">Step 3</Badge>
                            Potential Solutions
                          </FormLabel>
                        </div>
                        <FormDescription className="text-xs text-gray-500">
                          Brainstorm solutions based on root causes (one per line)
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g.,
Revise copywriting on landing page
A/B test different value propositions
Enhance onboarding experience
Optimize ad spend based on channel performance" 
                            rows={4}
                            className="bg-white resize-none"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nextActions"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center mb-1">
                          <FormLabel className="font-medium flex items-center">
                            <Badge className="mr-2 bg-green-100 text-green-700 border-green-200 hover:bg-green-100">Step 4</Badge>
                            Next Actions
                          </FormLabel>
                        </div>
                        <FormDescription className="text-xs text-gray-500">
                          Define immediate next steps to implement solutions (one per line)
                        </FormDescription>
                        <FormControl>
                          <Textarea 
                            placeholder="E.g.,
Schedule copywriter review by Friday
Analyze competitor features by next Tuesday
Set up user interviews for feedback
Create A/B test plan for homepage" 
                            rows={4}
                            className="bg-white resize-none"
                            {...field} 
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-primary/90 text-white hover:bg-primary"
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving...
                    </>
                  ) : "Save Problem Tree"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ProblemTrees;
