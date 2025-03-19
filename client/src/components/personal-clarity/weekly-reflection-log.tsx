import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { WeeklyReflection } from "@shared/schema";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EyeIcon, CalendarIcon, BookOpenIcon, ArrowUpCircleIcon, ShieldQuestionIcon } from "lucide-react";
import { format } from "date-fns";

const WeeklyReflectionLog = () => {
  const [selectedReflection, setSelectedReflection] = useState<WeeklyReflection | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch weekly reflections
  const { data: weeklyReflections, isLoading } = useQuery<WeeklyReflection[]>({
    queryKey: ['/api/weekly-reflections'],
  });

  // Calculate month and year for grouping
  const getMonthYear = (date: Date) => {
    return `${format(date, 'MMMM yyyy')}`;
  };

  // Group reflections by month
  const groupedReflections = weeklyReflections?.reduce((groups: Record<string, WeeklyReflection[]>, reflection) => {
    if (!reflection.isDraft) {
      const monthYear = getMonthYear(new Date(reflection.weekDate));
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(reflection);
    }
    return groups;
  }, {});

  const handleViewReflection = (reflection: WeeklyReflection) => {
    setSelectedReflection(reflection);
    setIsDialogOpen(true);
  };

  return (
    <Card className="bg-white shadow-md p-6 border border-gray-200 mt-6">
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Weekly Reflections Log</h2>
        <p className="text-gray-600">Review your past weekly reflections and progress over time.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
      ) : weeklyReflections && weeklyReflections.filter(r => !r.isDraft).length > 0 ? (
        <div className="space-y-6">
          {groupedReflections && Object.entries(groupedReflections).map(([monthYear, reflections]) => (
            <div key={monthYear}>
              <h3 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {monthYear}
              </h3>
              <ul className="space-y-2 pl-6">
                {reflections.map((reflection) => (
                  <li 
                    key={reflection.id} 
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer"
                    onClick={() => handleViewReflection(reflection)}
                  >
                    <div className="flex items-center">
                      <BookOpenIcon className="h-4 w-4 mr-3 text-purple-500" />
                      <span>Week of {format(new Date(reflection.weekDate), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {new Date(reflection.updatedAt).toLocaleDateString()}
                      </Badge>
                      <EyeIcon className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-700 mb-1">No reflections yet</h3>
          <p className="text-gray-500">Complete your first weekly reflection to see it here.</p>
        </div>
      )}

      {/* Reflection Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedReflection && 
                `Weekly Reflection: ${format(new Date(selectedReflection.weekDate), 'MMMM d, yyyy')}`
              }
            </DialogTitle>
          </DialogHeader>

          {selectedReflection && (
            <Tabs defaultValue="summary" className="mt-4">
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="went-well">Went Well</TabsTrigger>
                <TabsTrigger value="challenges">Challenges</TabsTrigger>
                <TabsTrigger value="next-steps">Next Steps</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-purple-700 flex items-center">
                      <ArrowUpCircleIcon className="h-4 w-4 mr-2" />
                      Highlights
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedReflection.wentWell || "No highlights recorded"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-amber-700 flex items-center">
                      <ShieldQuestionIcon className="h-4 w-4 mr-2" />
                      Key Learnings
                    </h4>
                    <p className="text-gray-700 whitespace-pre-line">
                      {selectedReflection.learnings || "No learnings recorded"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <h4 className="font-medium text-gray-700">Created on</h4>
                  <p className="text-gray-600">
                    {format(new Date(selectedReflection.createdAt), 'PPP')} at {format(new Date(selectedReflection.createdAt), 'pp')}
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="went-well" className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-green-700 mb-2">What went well this week</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedReflection.wentWell || "No details recorded for what went well."}
                </p>
              </TabsContent>

              <TabsContent value="challenges" className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-red-700 mb-2">Challenges faced</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedReflection.challenges || "No challenges recorded."}
                </p>
              </TabsContent>

              <TabsContent value="next-steps" className="p-4 bg-gray-50 rounded-md">
                <h4 className="font-medium text-blue-700 mb-2">Focus for next week</h4>
                <p className="text-gray-700 whitespace-pre-line">
                  {selectedReflection.nextWeekFocus || "No next steps recorded."}
                </p>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default WeeklyReflectionLog;