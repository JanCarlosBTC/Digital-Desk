import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../../../shared/components/molecules/card.js';
import { Button } from '../../../../shared/components/atoms/button.js';
import { CalendarIcon, EditIcon, ChevronRightIcon } from 'lucide-react';

interface GoalProgress {
  goal: string;
  progress: number;
}

interface MonthlyCheckInDetails {
  id: number;
  month: number;
  year: number;
  reflections: string;
  achievements: string[];
  challenges: string[];
  goalProgress: GoalProgress[];
  focusAreas: string[];
}

interface MonthlyCheckInCardProps {
  checkIn: MonthlyCheckInDetails;
  onEdit: (id: number) => void;
  onViewDetails: (id: number) => void;
}

/**
 * Monthly Check-In Card component for displaying monthly reflection data
 * 
 * @example
 * ```tsx
 * <MonthlyCheckInCard 
 *   checkIn={checkInData} 
 *   onEdit={handleEdit} 
 *   onViewDetails={handleViewDetails} 
 * />
 * ```
 */
export function MonthlyCheckInCard({ checkIn, onEdit, onViewDetails }: MonthlyCheckInCardProps) {
  // Format date from month and year
  const getMonthName = (month: number) => {
    const date = new Date();
    date.setMonth(month - 1);
    return date.toLocaleString('default', { month: 'long' });
  };
  
  const formattedDate = `${getMonthName(checkIn.month)} ${checkIn.year}`;

  // Render progress bar
  const renderProgressBar = (progress: number) => {
    const percentage = Math.min(Math.max(progress, 0), 100);
    
    return (
      <div className="w-full bg-personal-clarity-secondary/30 rounded-full h-2">
        <div 
          className="bg-personal-clarity-primary h-2 rounded-full" 
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  };
  
  return (
    <Card domain="personal-clarity">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{formattedDate}</span>
          <Button 
            variant="ghost" 
            size="sm"
            leadingIcon={<EditIcon size={16} />}
            onClick={() => onEdit(checkIn.id)}
          >
            Edit
          </Button>
        </CardTitle>
        <CardDescription>
          <div className="flex items-center text-sm">
            <CalendarIcon size={14} className="mr-1" />
            <span>Monthly reflection</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Achievements */}
          {checkIn.achievements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Achievements:</h4>
              <ul className="list-disc pl-5 space-y-1">
                {checkIn.achievements.slice(0, 2).map((achievement, index) => (
                  <li key={index} className="text-sm">{achievement}</li>
                ))}
                {checkIn.achievements.length > 2 && (
                  <li className="text-sm text-muted-foreground">
                    +{checkIn.achievements.length - 2} more...
                  </li>
                )}
              </ul>
            </div>
          )}
          
          {/* Goals Progress */}
          {checkIn.goalProgress.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Goals Progress:</h4>
              <div className="space-y-2">
                {checkIn.goalProgress.slice(0, 2).map((goal, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{goal.goal}</span>
                      <span>{goal.progress}%</span>
                    </div>
                    {renderProgressBar(goal.progress)}
                  </div>
                ))}
                {checkIn.goalProgress.length > 2 && (
                  <p className="text-sm text-muted-foreground">
                    +{checkIn.goalProgress.length - 2} more goals...
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Focus Areas */}
          {checkIn.focusAreas.length > 0 && (
            <div>
              <h4 className="text-sm font-medium mb-2">Focus Areas:</h4>
              <div className="flex flex-wrap gap-2">
                {checkIn.focusAreas.map((area, index) => (
                  <span 
                    key={index}
                    className="px-2 py-1 bg-personal-clarity-secondary text-personal-clarity-accent text-xs rounded-full"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-2"
            onClick={() => onViewDetails(checkIn.id)}
            trailingIcon={<ChevronRightIcon size={16} />}
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}