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
  <Card className={`shadow-md border-2 ${color} ${className || ''}`}>
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
      ${className || ''}
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
  subProblems = [],
  rootCauses = [],
  potentialSolutions = [],
  nextActions = []
}) => {
  // Filter out empty entries
  const filteredSubProblems = subProblems.filter(p => p && p.trim() !== '');
  const filteredRootCauses = rootCauses.filter(c => c && c.trim() !== '');
  const filteredSolutions = potentialSolutions.filter(s => s && s.trim() !== '');
  const filteredActions = nextActions.filter(a => a && a.trim() !== '');

  return (
    <div className="p-4 overflow-auto max-h-[65vh]">
      <div className="flex flex-col items-center space-y-6">
        
        {/* Main Problem Node (Top) */}
        <div className="text-center max-w-md">
          <TreeNode 
            title="Main Problem" 
            content={mainProblem || 'No problem defined'}
            color="bg-red-50 border-red-300"
            className="w-full"
          />
        </div>
        
        <Connector direction="vertical" className="h-6" />
        
        {/* Sub Problems Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <span className="h-2 w-2 rounded-full bg-orange-400 mr-2"></span>
            Sub Problems
          </h3>
          {filteredSubProblems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {filteredSubProblems.map((problem, index) => (
                <TreeNode 
                  key={`sub-${index}`}
                  title={`Sub Problem ${index + 1}`}
                  content={problem}
                  color="bg-orange-50 border-orange-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 italic text-sm">No sub-problems defined</div>
          )}
        </div>
        
        <Connector direction="vertical" className="h-6" />
        
        {/* Root Causes Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <span className="h-2 w-2 rounded-full bg-yellow-400 mr-2"></span>
            Root Causes
          </h3>
          {filteredRootCauses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {filteredRootCauses.map((cause, index) => (
                <TreeNode 
                  key={`cause-${index}`}
                  title={`Root Cause ${index + 1}`}
                  content={cause}
                  color="bg-yellow-50 border-yellow-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 italic text-sm">No root causes defined</div>
          )}
        </div>
        
        <Connector direction="vertical" className="h-6" />
        
        {/* Solutions Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-700 mb-3 flex items-center">
            <span className="h-2 w-2 rounded-full bg-green-400 mr-2"></span>
            Potential Solutions
          </h3>
          {filteredSolutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
              {filteredSolutions.map((solution, index) => (
                <TreeNode 
                  key={`solution-${index}`}
                  title={`Solution ${index + 1}`}
                  content={solution}
                  color="bg-green-50 border-green-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-400 italic text-sm">No solutions defined</div>
          )}
        </div>
        
        {/* Next Actions (if any) */}
        {filteredActions.length > 0 && (
          <>
            <Connector direction="vertical" className="h-6" />
            <div className="flex flex-col items-center w-full">
              <h3 className="font-medium text-gray-700 mb-3 flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-400 mr-2"></span>
                Next Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl">
                {filteredActions.map((action, index) => (
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