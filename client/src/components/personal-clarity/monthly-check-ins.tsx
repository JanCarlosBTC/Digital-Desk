import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { PlusIcon, EyeIcon, CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DialogForm } from "@/components/ui/dialog-form";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { MonthlyCheckIn } from "@shared/schema";
import "@/components/ui/clipboard.css";
import { format } from "date-fns";

const formSchema = z.object({
  achievements: z.string().min(5, "Achievements must be at least 5 characters"),
  challenges: z.string().min(5, "Challenges must be at least 5 characters"),
  nextMonthPriorities: z.string().min(5, "Next month priorities must be at least 5 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const MonthlyCheckIns = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCheckIn, setSelectedCheckIn] = useState<MonthlyCheckIn | null>(null);

  const handleViewCheckIn = (checkIn: MonthlyCheckIn) => {
    setSelectedCheckIn(checkIn);
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      achievements: "",
      challenges: "",
      nextMonthPriorities: "",
    },
  });

  // Get current month and year for defaults
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
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
        ], 
        nextMonthPriorities: data.nextMonthPriorities.split('\n').filter(Boolean),
      };

      return apiRequest('POST', '/api/monthly-check-ins', formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/monthly-check-ins'] });
      toast({
        title: "Check-in completed",
        description: "Your monthly check-in has been completed successfully.",
        variant: "success" // Added variant for success message
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

  const formatCompletedOn = (date: Date | null): string => {
    if (!date) return 'Not completed';
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Monthly Check-ins</h2>
        <Button 
          onClick={handleNewCheckIn}
          variant="personalClarity"
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
                  (checkIn: MonthlyCheckIn) => checkIn.month === month && 
                  checkIn.year === currentYear && 
                  checkIn.completedOn
                );

                return (
                  <div 
                    key={month}
                    className={`h-16 rounded flex items-center justify-center font-medium ${
                      hasCompletedCheckIn 
                        ? 'bg-primary text-white' 
                        : isCurrentMonth 
                          ? 'border-2 border-dashed border-primary text-primary' 
                          : isPastMonth 
                            ? 'bg-gray-100 text-gray-500' 
                            : 'bg-gray-50 text-gray-400'
                    }`}
                  >
                    {month}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-primary rounded-full mr-2"></div>
                <span className="text-gray-600">Completed</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 border-2 border-dashed border-primary rounded-full mr-2"></div>
                <span className="text-gray-600">Current Month</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-gray-100 rounded-full mr-2"></div>
                <span className="text-gray-600">Past Months</span>
              </div>
            </div>
          </div>

          {/* Check-in History */}
          {monthlyCheckIns && monthlyCheckIns.length > 0 && (
            <>
              <h3 className="font-medium text-gray-800 mb-3">Check-in History</h3>
              <ul className="space-y-3">
                {monthlyCheckIns
                  .sort((a, b) => {
                    // Sort by year (descending) and then by month (descending)
                    if (a.year !== b.year) return b.year - a.year;
                    return b.month - a.month;
                  })
                  .map((checkIn: MonthlyCheckIn) => (
                    <li 
                      key={`${checkIn.year}-${checkIn.month}`}
                      className="border border-gray-200 rounded-lg p-3 bg-white"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-800">
                          {getMonthName(checkIn.month)} {checkIn.year}
                        </span>
                        <div className="flex items-center space-x-3">
                          <span className="text-xs text-gray-500">
                            Completed on {formatCompletedOn(checkIn.completedOn)}
                          </span>
                          <Button
                            variant="personalClarityOutline"
                            size="sm"
                            onClick={() => setSelectedCheckIn(checkIn)}
                            className="h-8 px-2"
                          > 
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
              </ul>
            </>
          )}

          {/* View Check-in Dialog */}
          <DialogForm
            title={selectedCheckIn ? `${getMonthName(selectedCheckIn.month)} ${selectedCheckIn.year} Check-in` : ''}
            open={!!selectedCheckIn}
            onOpenChange={(open) => !open && setSelectedCheckIn(null)}
            size="md"
            submitLabel="" // No submit button needed for view-only
          >
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Achievements</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {selectedCheckIn?.achievements.map((achievement: string, i: number) => (
                    <li key={i} className="text-gray-700">{achievement}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Challenges</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {selectedCheckIn?.challenges.map((challenge: string, i: number) => (
                    <li key={i} className="text-gray-700">{challenge}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">Next Month Priorities</h4>
                <ul className="list-disc pl-4 space-y-1">
                  {selectedCheckIn?.nextMonthPriorities.map((priority: string, i: number) => (
                    <li key={i} className="text-gray-700">{priority}</li>
                  ))}
                </ul>
              </div>
            </div>
          </DialogForm>
        </>
      )}

      {/* New Check-in Dialog */}
      <DialogForm
        title={`${getMonthName(currentMonth)} ${currentYear} Check-in`}
        description="Record your monthly progress and plan for the future"
        open={isOpen}
        onOpenChange={setIsOpen}
        size="xl"
        submitLabel="Save Check-in"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Form {...form}>
          <div className="space-y-4">
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
          </div>
        </Form>
      </DialogForm>
    </div>
  );
};

export default MonthlyCheckIns;