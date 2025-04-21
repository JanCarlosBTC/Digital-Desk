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
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // Track error messages

  // Get current date for the week reflection
  const getCurrentWeekDate = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 1 = Monday, etc.

    // Calculate the date of Monday of the current week
    const monday = new Date(now);
    monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));

    return monday;
  };
  
  // For testing purposes - get a different week date 
  // This allows creating multiple weekly reflections
  const getTestWeekDate = () => {
    // Generate a random week in the past (up to 10 weeks ago)
    const randomWeeksAgo = Math.floor(Math.random() * 10) + 1;
    const date = new Date();
    date.setDate(date.getDate() - (randomWeeksAgo * 7));
    
    const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Calculate the date of Monday of that week
    date.setDate(date.getDate() - day + (day === 0 ? -6 : 1));
    
    return date;
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
      setErrorMessage(null); // Clear any previous error messages

      try {
        if (id) {
          return apiRequest('PUT', `/api/weekly-reflections/${id}`, payload);
        } else {
          return apiRequest('POST', '/api/weekly-reflections', payload);
        }
      } catch (error) {
        const errorMsg = (error as Error).message || "An unexpected error occurred.";
        setErrorMessage(errorMsg);
        toast({
          title: "Error saving reflection",
          description: errorMsg,
          variant: "destructive",
        });
        throw error; // Re-throw the error to be caught by the onError handler
      } finally {
        setIsSubmitting(false); // Set submitting state to false after the request completes
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/weekly-reflections'] });
      setErrorMessage(null); // Clear any error messages on success
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
      // Extract the error message
      let errorMsg = "There was a problem saving your reflection. Please try again.";
      
      if (error?.data?.message && typeof error.data.message === 'string') {
        errorMsg = error.data.message;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.data?.errors && Array.isArray(error.data.errors)) {
        // Handle structured validation errors
        errorMsg = error.data.errors.map((e: any) => e.message).join(', ');
      }
      
      setErrorMessage(errorMsg);
      toast({
        title: "Error saving reflection",
        description: errorMsg,
        variant: "destructive"
      });
    }
  });

  // Check if there's a reflection for the current week and load it
  useEffect(() => {
    if (!weeklyReflections || weeklyReflections.length === 0) {
      // If no reflections exist, just keep the form clear for a new entry
      return;
    }

    // Only auto-load the reflection when the component first loads or when the data refreshes
    // and no form edits have been made
    const currentWeekDate = getCurrentWeekDate();
    
    console.log("Looking for current week reflection", {
      currentWeekDate: currentWeekDate.toISOString(),
      availableReflections: weeklyReflections.map(r => ({ 
        id: r.id, 
        date: new Date(r.weekDate).toISOString(), 
        isDraft: r.isDraft 
      }))
    });

    // Find reflection for current week, prioritizing draft over completed
    const currentWeekReflections = weeklyReflections.filter(reflection => {
      const reflectionDate = new Date(reflection.weekDate);
      
      // Instead of checking exact date match, check for the same week
      // Get Monday of reflection week
      const reflectionMonday = new Date(reflectionDate);
      const reflectionDay = reflectionDate.getDay();
      reflectionMonday.setDate(reflectionDate.getDate() - reflectionDay + (reflectionDay === 0 ? -6 : 1));
      
      // Compare Monday dates for week equality
      return reflectionMonday.getFullYear() === currentWeekDate.getFullYear() 
        && reflectionMonday.getMonth() === currentWeekDate.getMonth() 
        && reflectionMonday.getDate() === currentWeekDate.getDate();
    });

    console.log(`Found ${currentWeekReflections.length} reflections for current week`);
    
    // If we found any reflections for the current week
    if (currentWeekReflections.length > 0) {
      // Prioritize drafts over completed reflections
      const draftReflection = currentWeekReflections.find(r => r.isDraft);
      const reflectionToShow = draftReflection || currentWeekReflections[0];
      
      // Make sure reflectionToShow exists (TypeScript safety)
      if (reflectionToShow) {
        console.log("Loading reflection:", {
          id: reflectionToShow.id,
          isDraft: reflectionToShow.isDraft,
          date: new Date(reflectionToShow.weekDate).toISOString()
        });
        
        // Set the form data
        setWentWell(reflectionToShow.wentWell || "");
        setChallenges(reflectionToShow.challenges || "");
        setLearnings(reflectionToShow.learnings || "");
        setNextWeekFocus(reflectionToShow.nextWeekFocus || "");
        setIsDraft(reflectionToShow.isDraft);
        setCurrentReflectionId(reflectionToShow.id);
      } else {
        console.log("No reflection found to show despite having reflections for the current week");
      }
    }
  }, [weeklyReflections]);

  const handleSave = (asDraft: boolean) => {
    // If we're creating a new reflection, use a random past week date
    // This ensures we can create multiple weekly reflections for testing
    const weekDate = currentReflectionId === null ? getTestWeekDate() : getCurrentWeekDate();
    
    // Important: when creating a new reflection, make sure id is undefined, not null
    // This ensures the POST endpoint is called instead of the PUT endpoint
    const idParam = currentReflectionId === null ? undefined : currentReflectionId;
    
    console.log("About to save reflection:", {
      isNewReflection: currentReflectionId === null,
      idBeingSent: idParam,
      weekDate: weekDate.toISOString(),
      endpoint: currentReflectionId === null ? "POST /api/weekly-reflections" : `PUT /api/weekly-reflections/${currentReflectionId}`
    });
    
    // Format weekDate as ISO string for proper serialization
    mutation.mutate({
      id: idParam,
      weekDate: weekDate.toISOString(),
      wentWell,
      challenges,
      learnings,
      nextWeekFocus,
      isDraft: asDraft
    });

    setIsDraft(asDraft);
  };

  const handleNewReflection = () => {
    // Clear form fields
    setWentWell("");
    setChallenges("");
    setLearnings("");
    setNextWeekFocus("");
    setIsDraft(true);
    setCurrentReflectionId(null); // Important: Reset ID to create a new reflection
    
    console.log("Started new reflection - reset form and ID to null");

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
          variant="default"
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
                disabled={mutation.isPending || isSubmitting}
              >
                Save Draft
              </Button>
              <Button 
                variant="default"
                onClick={() => handleSave(false)}
                disabled={mutation.isPending || isSubmitting}
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