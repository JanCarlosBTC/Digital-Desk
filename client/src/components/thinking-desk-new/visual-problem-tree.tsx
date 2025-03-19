import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TreeNodeProps {
  title: string;
  content: string;
  className?: string;
  color?: string;
}

/**
 * Single node in the problem tree visualization
 */
const TreeNode: React.FC<TreeNodeProps> = ({ title, content, className, color = "bg-gray-100" }) => (
  <Card className={`shadow-md border-2 ${color} ${className}`}>
    <CardContent className="p-3">
      <h4 className="font-bold mb-1 text-sm">{title}</h4>
      <p className="text-sm">{content}</p>
    </CardContent>
  </Card>
);

/**
 * Connector lines between nodes
 */
const Connector: React.FC<{ direction: 'vertical' | 'horizontal', className?: string }> = ({ 
  direction, 
  className 
}) => (
  <div 
    className={`
      ${direction === 'vertical' ? 'w-0.5 h-4 mx-auto' : 'h-0.5 w-4 my-auto'} 
      bg-gray-400 
      ${className}
    `} 
  />
);

interface ProblemTreeVisualizationProps {
  mainProblem: string;
  subProblems: string[];
  rootCauses: string[];
  potentialSolutions: string[];
  nextActions: string[];
}

/**
 * Main component for visualizing a problem tree
 */
export const ProblemTreeVisualization: React.FC<ProblemTreeVisualizationProps> = ({
  mainProblem,
  subProblems,
  rootCauses,
  potentialSolutions,
  nextActions
}) => {
  return (
    <div className="p-4 overflow-auto max-h-[70vh]">
      <div className="flex flex-col items-center space-y-4">
        
        {/* Main Problem Node (Top) */}
        <TreeNode 
          title="Main Problem" 
          content={mainProblem}
          color="bg-red-50 border-red-300"
          className="max-w-md"
        />
        
        <Connector direction="vertical" />
        
        {/* Sub Problems Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-700 mb-2">Sub Problems</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {subProblems.map((problem, index) => (
              <TreeNode 
                key={`sub-${index}`}
                title={`Sub Problem ${index + 1}`}
                content={problem}
                color="bg-orange-50 border-orange-200"
              />
            ))}
          </div>
        </div>
        
        <Connector direction="vertical" />
        
        {/* Root Causes Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-700 mb-2">Root Causes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {rootCauses.map((cause, index) => (
              <TreeNode 
                key={`cause-${index}`}
                title={`Root Cause ${index + 1}`}
                content={cause}
                color="bg-yellow-50 border-yellow-200"
              />
            ))}
          </div>
        </div>
        
        <Connector direction="vertical" />
        
        {/* Solutions Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-700 mb-2">Potential Solutions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
            {potentialSolutions.map((solution, index) => (
              <TreeNode 
                key={`solution-${index}`}
                title={`Solution ${index + 1}`}
                content={solution}
                color="bg-green-50 border-green-200"
              />
            ))}
          </div>
        </div>
        
        {/* Next Actions (if any) */}
        {nextActions.length > 0 && (
          <>
            <Connector direction="vertical" />
            <div className="flex flex-col items-center w-full">
              <h3 className="font-medium text-gray-700 mb-2">Next Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl">
                {nextActions.map((action, index) => (
                  <TreeNode 
                    key={`action-${index}`}
                    title={`Action ${index + 1}`}
                    content={action}
                    color="bg-blue-50 border-blue-200"
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};