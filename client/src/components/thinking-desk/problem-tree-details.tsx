import React from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  NetworkIcon, 
  ArrowRightIcon, 
  TargetIcon, 
  FilesIcon,
  CalendarIcon,
  ClockIcon,
  EditIcon
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Interface for Problem Tree
interface ProblemTree {
  id: number;
  userId: number;
  title: string;
  mainProblem: string;
  subProblems: string[];
  rootCauses: string[];
  potentialSolutions: string[];
  nextActions: string[];
  createdAt: string | Date;
  updatedAt: string | Date;
}

interface ProblemTreeDetailsProps {
  tree: ProblemTree;
  onEdit: () => void;
  onBack: () => void;
}

const ProblemTreeDetails = ({ tree, onEdit, onBack }: ProblemTreeDetailsProps) => {
  // Format date for display
  const formatDate = (dateString: Date | string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = dateString instanceof Date ? dateString : new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <Card className="shadow-lg border">
      <CardHeader className="border-b bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center mb-2">
              <NetworkIcon className="h-5 w-5 text-primary mr-2" />
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                Problem Tree
              </Badge>
            </div>
            <CardTitle className="text-2xl font-bold">{tree.title}</CardTitle>
            <CardDescription className="mt-1 text-base">
              {tree.mainProblem}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={onBack}>
              Back
            </Button>
            <Button variant="thinkingDesk" size="sm" onClick={onEdit}>
              <EditIcon className="h-4 w-4 mr-2" /> Edit
            </Button>
          </div>
        </div>
        <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
          <div className="flex items-center">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>Created: {formatDate(tree.createdAt)}</span>
          </div>
          <div className="flex items-center">
            <ClockIcon className="h-4 w-4 mr-1" />
            <span>Updated: {formatDate(tree.updatedAt)}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        {/* Problem Tree visualization */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Root Causes */}
          <div className="border rounded-lg p-4 bg-blue-50">
            <h3 className="font-semibold text-lg mb-3 text-blue-800">Root Causes</h3>
            <ul className="space-y-2">
              {tree.rootCauses.map((cause, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-medium text-blue-700">{index + 1}</span>
                  </div>
                  <span className="text-blue-700">{cause}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Sub-Problems */}
          <div className="border rounded-lg p-4 bg-purple-50">
            <h3 className="font-semibold text-lg mb-3 text-purple-800">Sub-Problems</h3>
            <ul className="space-y-2">
              {tree.subProblems.map((problem, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-purple-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-medium text-purple-700">{index + 1}</span>
                  </div>
                  <span className="text-purple-700">{problem}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Potential Solutions */}
          <div className="border rounded-lg p-4 bg-green-50">
            <h3 className="font-semibold text-lg mb-3 text-green-800">Potential Solutions</h3>
            <ul className="space-y-2">
              {tree.potentialSolutions.map((solution, index) => (
                <li key={index} className="flex items-start">
                  <div className="h-5 w-5 rounded-full bg-green-200 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">
                    <span className="text-xs font-medium text-green-700">{index + 1}</span>
                  </div>
                  <span className="text-green-700">{solution}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Next Actions */}
        {tree.nextActions && tree.nextActions.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center mb-3">
              <TargetIcon className="h-5 w-5 text-primary mr-2" />
              <h3 className="font-semibold text-lg">Next Actions</h3>
            </div>
            <div className="border rounded-lg p-4 bg-amber-50">
              <ul className="space-y-2">
                {tree.nextActions.map((action, index) => (
                  <li key={index} className="flex items-start">
                    <ArrowRightIcon className="h-5 w-5 text-amber-600 mr-2 flex-shrink-0" />
                    <span className="text-amber-700">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between border-t pt-4 text-sm text-gray-500">
        <span>Problem ID: {tree.id}</span>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <EditIcon className="mr-2 h-4 w-4" /> Edit Problem Tree
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProblemTreeDetails;