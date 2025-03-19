import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TreeNodeProps {
  title: string;
  content: string;
  className?: string;
  color?: string;
  borderColor?: string;
  titleColor?: string;
}

/**
 * Single node in the problem tree visualization
 */
const TreeNode: React.FC<TreeNodeProps> = ({ 
  title, 
  content, 
  className, 
  color = "bg-white", 
  borderColor = "border-gray-300",
  titleColor = "text-gray-800"
}) => (
  <Card className={`shadow-lg border-2 ${color} ${borderColor} rounded-lg hover:shadow-xl transition-shadow ${className || ''}`}>
    <CardContent className="p-4">
      <h4 className={`font-bold mb-2 ${titleColor}`}>{title}</h4>
      <p className="text-gray-700">{content}</p>
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
      ${direction === 'vertical' ? 'w-1 h-6 mx-auto' : 'h-1 w-6 my-auto'} 
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
    <div className="p-6 overflow-auto max-h-[75vh] bg-gray-50 rounded-lg">
      <div className="flex flex-col items-center space-y-8">
        
        {/* Main Problem Node (Top) */}
        <div className="text-center max-w-xl w-full">
          <TreeNode 
            title="Main Problem" 
            content={mainProblem || 'No problem defined'}
            color="bg-white" 
            borderColor="border-red-400"
            titleColor="text-red-700"
            className="w-full transform hover:scale-[1.02] transition-transform duration-200"
          />
        </div>
        
        <div className="relative">
          <Connector direction="vertical" className="h-8" />
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center -mt-3">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Sub Problems Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center bg-orange-50 px-4 py-2 rounded-full shadow-sm">
            <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
            Sub Problems
          </h3>
          {filteredSubProblems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {filteredSubProblems.map((problem, index) => (
                <TreeNode 
                  key={`sub-${index}`}
                  title={`Sub Problem ${index + 1}`}
                  content={problem}
                  color="bg-white"
                  borderColor="border-orange-300"
                  titleColor="text-orange-700"
                  className="transform hover:scale-[1.02] transition-transform duration-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              No sub-problems defined
            </div>
          )}
        </div>
        
        <div className="relative">
          <Connector direction="vertical" className="h-8" />
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center -mt-3">
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Root Causes Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center bg-yellow-50 px-4 py-2 rounded-full shadow-sm">
            <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
            Root Causes
          </h3>
          {filteredRootCauses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {filteredRootCauses.map((cause, index) => (
                <TreeNode 
                  key={`cause-${index}`}
                  title={`Root Cause ${index + 1}`}
                  content={cause}
                  color="bg-white"
                  borderColor="border-yellow-300"
                  titleColor="text-yellow-800"
                  className="transform hover:scale-[1.02] transition-transform duration-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              No root causes defined
            </div>
          )}
        </div>
        
        <div className="relative">
          <Connector direction="vertical" className="h-8" />
          <div className="absolute -left-3 top-1/2 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center -mt-3">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          </div>
        </div>
        
        {/* Solutions Section */}
        <div className="flex flex-col items-center w-full">
          <h3 className="font-medium text-gray-800 mb-4 flex items-center bg-green-50 px-4 py-2 rounded-full shadow-sm">
            <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
            Potential Solutions
          </h3>
          {filteredSolutions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
              {filteredSolutions.map((solution, index) => (
                <TreeNode 
                  key={`solution-${index}`}
                  title={`Solution ${index + 1}`}
                  content={solution}
                  color="bg-white"
                  borderColor="border-green-300"
                  titleColor="text-green-700"
                  className="transform hover:scale-[1.02] transition-transform duration-200"
                />
              ))}
            </div>
          ) : (
            <div className="text-gray-500 italic p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
              No solutions defined
            </div>
          )}
        </div>
        
        {/* Next Actions (if any) */}
        {filteredActions.length > 0 && (
          <>
            <div className="relative">
              <Connector direction="vertical" className="h-8" />
              <div className="absolute -left-3 top-1/2 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center -mt-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              </div>
            </div>
            
            <div className="flex flex-col items-center w-full">
              <h3 className="font-medium text-gray-800 mb-4 flex items-center bg-blue-50 px-4 py-2 rounded-full shadow-sm">
                <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
                Next Actions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                {filteredActions.map((action, index) => (
                  <TreeNode 
                    key={`action-${index}`}
                    title={`Action ${index + 1}`}
                    content={action}
                    color="bg-white"
                    borderColor="border-blue-300"
                    titleColor="text-blue-700"
                    className="transform hover:scale-[1.02] transition-transform duration-200"
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