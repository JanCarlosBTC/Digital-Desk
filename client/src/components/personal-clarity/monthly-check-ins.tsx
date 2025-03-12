import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MonthlyCheckIn } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { EyeIcon, CalendarIcon } from "lucide-react";

const formSchema = z.object({
  achievements: z.string().min(5, "Achievements must be at least 5 characters"),
  challenges: z.string().min(5, "Challenges must be at least 5 characters"),
  nextMonthPriorities: z.string().min(5, "Next month priorities must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const MonthlyCheckIns = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      achievements: "",
      challenges: "",
      nextMonthPriorities: "",
    },
  });

  // Get current month and year
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // getMonth() is 0-indexed
  const currentYear = currentDate.getFullYear();

  // Fetch monthly check-ins
  const { data: monthlyCheckIns, isLoading } = useQuery<MonthlyCheckIn[]>({
    queryKey: ['/api/monthly-check-ins'],
  });

  // Create monthly check-in
  const createMutation = useMutation({
    mutationFn: async (data: FormValues) => {
      // Convert line-separated strings to arrays
      const formattedData = {
        month: currentMonth,
        year: currentYear,
        completedOn: new Date(),
        achievements: data.achievements.split('\n').filter(Boolean),
        challenges: data.challenges.split('\n').filter(Boolean),
        goalProgress: [
          { goal: "Increase client retention", progress: 75 },
          { goal: "Launch new product", progress: 30 },
          { goal: "Hire team member", progress: 100 }
        ], // Default progress for demo
        nextMonthPriorities: data.nextMonthPriorities.split('\n').filter(Boolean),
      };

      return apiRequest('POST', '/api/monthly-check-ins', formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monthly-check-ins'] });
      toast({
        title: "Check-in completed",
        description: "Your monthly check-in has been completed successfully.",
      });
      setIsOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error creating check-in",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data: FormValues) => {
    createMutation.mutate(data);
  };

  const handleNewCheckIn = () => {
    form.reset({
      achievements: "",
      challenges: "",
      nextMonthPriorities: "",
    });
    setIsOpen(true);
  };

  const getMonthName = (month: number) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[month - 1];
  };

  const formatCompletedOn = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Monthly Check-ins</h2>
        <Button 
          onClick={handleNewCheckIn}
          variant="default"
          className="clarity-button bg-purple-500 hover:bg-purple-600 text-white" // Modified line
        >
          <CalendarIcon className="mr-2 h-4 w-4" /> {getMonthName(currentMonth)} Check-in
        </Button>
      </div>

      <p className="text-gray-600 mb-4">Monthly reviews to revisit priorities and track your progress.</p>

      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <>
          {/* Monthly Progress Visualization */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">{currentYear} Progress</h3>

            <div className="grid grid-cols-12 gap-2 mb-4">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => {
                const isCurrentMonth = month === currentMonth;
                const isPastMonth = month < currentMonth;

                // Check if this month has a completed check-in
                const hasCompletedCheckIn = monthlyCheckIns?.some(
                  checkIn => checkIn.month === month && 
                  checkIn.year === currentYear && 
                  checkIn.completedOn
                );

                return (
                  <div 
                    key={month}
                    className={`h-16 rounded flex items-center justify-center font-medium ${
                      hasCompletedCheckIn 
                        ? 'bg-secondary text-white' 
                        : isCurrentMonth 
                          ? 'border-2 border-dashed border-secondary text-secondary' 
                          : isPastMonth 
                            ? 'bg-gray-200 text-gray-500' 
                            : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    {getMonthName(month).slice(0, 3)}
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-gray-600">
              <span className="font-medium">
                {monthlyCheckIns?.filter(checkIn => checkIn.year === currentYear && checkIn.completedOn).length || 0} out of 12
              </span> monthly check-ins completed this year
            </p>
          </div>

          {/* Previous Check-ins */}
          {monthlyCheckIns && monthlyCheckIns.length > 0 && (
            <>
              <h3 className="font-medium text-gray-800 mb-3">Previous Check-ins</h3>
              <ul className="space-y-2">
                {monthlyCheckIns
                  .filter(checkIn => checkIn.completedOn) // Only show completed check-ins
                  .slice(0, 5) // Limit to 5 most recent check-ins
                  .map((checkIn) => (
                    <li 
                      key={checkIn.id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <div>
                        <span className="font-medium">{getMonthName(checkIn.month)} {checkIn.year}</span>
                        <span className="text-sm text-gray-500 ml-2">
                          Completed on {checkIn.completedOn ? formatCompletedOn(checkIn.completedOn) : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <button className="bg-purple-500 hover:bg-purple-600 text-white p-1"> {/* Modified line */}
                          <EyeIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            </>
          )}
        </>
      )}

      {/* New Check-in Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{getMonthName(currentMonth)} {currentYear} Check-in</DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="achievements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Achievements (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="List your key achievements this month..."
                        rows={4} 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="challenges"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Challenges Faced (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What obstacles did you encounter this month?"
                        rows={4} 
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextMonthPriorities"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priorities for Next Month (one per line)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What will you focus on next month?"
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
                  variant="default"
                  className="clarity-button bg-violet-500 hover:bg-violet-600 text-white" // Modified line
                  disabled={createMutation.isPending}
                >
                  {createMutation.isPending ? "Saving..." : "Complete Check-in"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonthlyCheckIns;