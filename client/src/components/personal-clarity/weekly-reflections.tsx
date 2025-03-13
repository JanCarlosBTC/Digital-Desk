import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { WeeklyReflection } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusIcon, EyeIcon } from "lucide-react";
import { Form } from "@/components/ui/form";
import { format } from "date-fns";
import "@/components/ui/clipboard.css"

const WeeklyReflections = () => {
  const { toast } = useToast();
  const [wentWell, setWentWell] = useState("");
  const [challenges, setChallenges] = useState("");
  const [learnings, setLearnings] = useState("");
  const [nextWeekFocus, setNextWeekFocus] = useState("");
  const [isDraft, setIsDraft] = useState(true);
  const [currentReflectionId, setCurrentReflectionId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for submitting state

  // Get current date for the week reflection
  const getCurrentWeekDate = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the date of Monday of the current week
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));

    return monday;
  };

  // Format the week date for display
  const formatWeekDate = (date: Date) => {
    return `Week of ${format(date, 'MMMM d, yyyy')}`;
  };

  // Fetch weekly reflections
  const { data: weeklyReflections, isLoading } = useQuery<WeeklyReflection[]>({
    queryKey: ['/api/weekly-reflections'],
  });

  // Create or update weekly reflection
  const mutation = useMutation({
    mutationFn: async (data: { 
      id?: number; 
      weekDate: string | Date; 
      wentWell: string; 
      challenges: string; 
      learnings: string; 
      nextWeekFocus: string; 
      isDraft: boolean;
    }) => {
      const { id, ...payload } = data;
      setIsSubmitting(true); // Set submitting state to true

      try {
        if (id) {
          return apiRequest('PUT', `/api/weekly-reflections/${id}`, payload);
        } else {
          return apiRequest('POST', '/api/weekly-reflections', payload);
        }
      } catch (error) {
        toast({
          title: "Error saving reflection",
          description: (error as Error).message || "An unexpected error occurred.",
          variant: "destructive",
        });
        throw error; // Re-throw the error to be caught by the onError handler
      } finally {
        setIsSubmitting(false); // Set submitting state to false after the request completes
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
      toast({
        title: variables.isDraft ? "Draft saved" : "Reflection completed",
        description: variables.isDraft 
          ? "Your reflection draft has been saved." 
          : "Your weekly reflection has been completed.",
        variant: "success"
      });
    },
    onError: (error: any) => {
      console.error("Error saving reflection:", error);
      toast({
        title: "Error saving reflection",
        description: error?.message || error?.data?.message || "There was a problem saving your reflection. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Check if there's a draft for the current week
  useEffect(() => {
    if (weeklyReflections && weeklyReflections.length > 0) {
      const currentWeekDate = getCurrentWeekDate();
      const currentWeekReflection = weeklyReflections.find(reflection => {
        const reflectionDate = new Date(reflection.weekDate);
        return reflectionDate.getFullYear() === currentWeekDate.getFullYear() 
          && reflectionDate.getMonth() === currentWeekDate.getMonth() 
          && reflectionDate.getDate() === currentWeekDate.getDate();
      });

      if (currentWeekReflection) {
        setWentWell(currentWeekReflection.wentWell || "");
        setChallenges(currentWeekReflection.challenges || "");
        setLearnings(currentWeekReflection.learnings || "");
        setNextWeekFocus(currentWeekReflection.nextWeekFocus || "");
        setIsDraft(currentWeekReflection.isDraft);
        setCurrentReflectionId(currentWeekReflection.id);
      }
    }
  }, [weeklyReflections]);

  const handleSave = (asDraft: boolean) => {
    const weekDate = getCurrentWeekDate();
    
    // Format weekDate as ISO string for proper serialization
    mutation.mutate({
      id: currentReflectionId || undefined,
      weekDate: weekDate.toISOString(),
      wentWell,
      challenges,
      learnings,
      nextWeekFocus,
      isDraft: asDraft
    });

    setIsDraft(asDraft);
    
    // Debug information
    console.log("Submitting weekly reflection with data:", {
      id: currentReflectionId || undefined,
      weekDate: weekDate.toISOString(),
      wentWell,
      challenges,
      learnings,
      nextWeekFocus,
      isDraft: asDraft
    });
  };

  const handleNewReflection = () => {
    setWentWell("");
    setChallenges("");
    setLearnings("");
    setNextWeekFocus("");
    setIsDraft(true);
    setCurrentReflectionId(null);

    toast({
      title: "New reflection started",
      description: "You can now fill in your weekly reflection.",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Weekly Reflections</h2>
        <Button 
          onClick={handleNewReflection}
          className="bg-purple-500 hover:bg-purple-600 text-white"
        >
          <PlusIcon className="mr-2 h-4 w-4" /> New Reflection
        </Button>
      </div>

      <p className="text-gray-600 mb-4">Record your wins, challenges, and insights from each week.</p>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <>
          {/* Current Week Form */}
          <div className="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 className="font-medium text-gray-800 mb-3">
              {formatWeekDate(getCurrentWeekDate())}
            </h3>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">What went well this week?</label>
              <Textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                rows={3}
                placeholder="List your wins and successes..."
                value={wentWell}
                onChange={(e) => setWentWell(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">What challenges did you face?</label>
              <Textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                rows={3}
                placeholder="Describe any obstacles or difficulties..."
                value={challenges}
                onChange={(e) => setChallenges(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">What did you learn?</label>
              <Textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                rows={3}
                placeholder="Note any insights or lessons..."
                value={learnings}
                onChange={(e) => setLearnings(e.target.value)}
              />
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">Focus for next week</label>
              <Textarea 
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent"
                rows={2}
                placeholder="What will you prioritize next week..."
                value={nextWeekFocus}
                onChange={(e) => setNextWeekFocus(e.target.value)}
              />
            </div>

            <div className="flex justify-end">
              <Button 
                variant="outline" 
                className="mr-2"
                onClick={() => handleSave(true)}
                disabled={mutation.isPending || isSubmitting} // Disable button while submitting
              >
                Save Draft
              </Button>
              <Button 
                variant="default" 
                className="bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => handleSave(false)}
                disabled={mutation.isPending || isSubmitting} // Disable button while submitting
              >
                {mutation.isPending || isSubmitting ? "Saving..." : "Complete Reflection"}
              </Button>
            </div>
          </div>

          {/* Previous Reflections */}
          {weeklyReflections && weeklyReflections.length > 0 && (
            <>
              <h3 className="font-medium text-gray-800 mb-3">Previous Reflections</h3>
              <ul className="space-y-2">
                {weeklyReflections
                  .filter(reflection => !reflection.isDraft) // Only show completed reflections
                  .map((reflection) => (
                    <li 
                      key={reflection.id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100"
                    >
                      <span>Week of {format(new Date(reflection.weekDate), 'MMMM d, yyyy')}</span>
                      <div>
                        <button className="text-gray-500 hover:text-gray-700 p-1">
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
    </div>
  );
};

export default WeeklyReflections;