import React from 'react';

interface ItemProps {
  id: string;
  title: string;
  content: string;
  type: 'problem' | 'subproblem' | 'cause' | 'solution' | 'action';
}

/**
 * A completely redesigned problem tree visualization using a modern, clean approach
 */
export const ProblemTreeVisualization: React.FC<{
  mainProblem: string;
  subProblems: string[];
  rootCauses: string[];
  potentialSolutions: string[];
  nextActions: string[];
}> = ({
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

  // Generate items for visualization
  const items: ItemProps[] = [
    { id: 'main', title: 'Main Problem', content: mainProblem || 'No problem defined', type: 'problem' },
    ...filteredSubProblems.map((content, i) => ({ 
      id: `sub-${i}`, 
      title: `Sub-Problem ${i + 1}`, 
      content, 
      type: 'subproblem' 
    })),
    ...filteredRootCauses.map((content, i) => ({ 
      id: `cause-${i}`, 
      title: `Root Cause ${i + 1}`, 
      content, 
      type: 'cause' 
    })),
    ...filteredSolutions.map((content, i) => ({ 
      id: `solution-${i}`, 
      title: `Solution ${i + 1}`, 
      content, 
      type: 'solution' 
    })),
    ...filteredActions.map((content, i) => ({ 
      id: `action-${i}`, 
      title: `Action ${i + 1}`, 
      content, 
      type: 'action' 
    })),
  ];

  // Type-based styling
  const getTypeStyles = (type: ItemProps['type']) => {
    switch(type) {
      case 'problem': 
        return {
          container: 'bg-red-50 border-red-400 shadow-red-200',
          title: 'text-red-800 bg-red-100',
          icon: 'bg-red-500'
        };
      case 'subproblem': 
        return {
          container: 'bg-orange-50 border-orange-400 shadow-orange-200',
          title: 'text-orange-800 bg-orange-100',
          icon: 'bg-orange-500'
        };
      case 'cause': 
        return {
          container: 'bg-yellow-50 border-yellow-400 shadow-yellow-200',
          title: 'text-yellow-800 bg-yellow-100',
          icon: 'bg-yellow-500'
        };
      case 'solution': 
        return {
          container: 'bg-green-50 border-green-400 shadow-green-200',
          title: 'text-green-800 bg-green-100',
          icon: 'bg-green-500'
        };
      case 'action': 
        return {
          container: 'bg-blue-50 border-blue-400 shadow-blue-200',
          title: 'text-blue-800 bg-blue-100',
          icon: 'bg-blue-500'
        };
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg min-h-[500px]">
      {/* Header with problem tree summary */}
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Problem Tree</h2>
        <div className="flex justify-center gap-2 flex-wrap">
          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
            1 Problem
          </span>
          {filteredSubProblems.length > 0 && (
            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
              {filteredSubProblems.length} Sub-Problems
            </span>
          )}
          {filteredRootCauses.length > 0 && (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              {filteredRootCauses.length} Root Causes
            </span>
          )}
          {filteredSolutions.length > 0 && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              {filteredSolutions.length} Solutions
            </span>
          )}
          {filteredActions.length > 0 && (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              {filteredActions.length} Actions
            </span>
          )}
        </div>
      </div>

      {/* Main problem tree visualization */}
      <div className="relative">
        {/* Main problem (centered at the top) */}
        <div className="flex justify-center mb-12">
          <ProblemCard 
            title="Main Problem" 
            content={mainProblem} 
            type="problem"
            className="w-full max-w-lg z-10"
          />
        </div>

        {/* The four quadrants */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          {/* Branching lines */}
          <div className="absolute top-0 left-1/2 w-px h-full bg-gray-300 -translate-x-1/2 -mt-12"></div>
          <div className="absolute top-1/2 left-0 w-full h-px bg-gray-300 -translate-y-1/2"></div>
          
          {/* Top left: Sub-Problems */}
          <div className="p-4 relative">
            <div className="absolute top-0 right-0 w-1/2 h-px bg-orange-300"></div>
            <div className="absolute top-0 right-0 w-px h-1/2 bg-orange-300"></div>
            
            <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-orange-500 mr-2"></span>
              Sub-Problems
            </h3>
            
            <div className="space-y-4">
              {filteredSubProblems.length > 0 ? (
                filteredSubProblems.map((content, index) => (
                  <ProblemCard
                    key={`sub-${index}`}
                    title={`Sub-Problem ${index + 1}`}
                    content={content}
                    type="subproblem"
                  />
                ))
              ) : (
                <div className="text-gray-500 italic p-3 bg-orange-50 rounded-lg border border-orange-200">
                  No sub-problems defined
                </div>
              )}
            </div>
          </div>
          
          {/* Top right: Root Causes */}
          <div className="p-4 relative">
            <div className="absolute top-0 left-0 w-1/2 h-px bg-yellow-300"></div>
            <div className="absolute top-0 left-0 w-px h-1/2 bg-yellow-300"></div>
            
            <h3 className="text-lg font-semibold text-yellow-800 mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
              Root Causes
            </h3>
            
            <div className="space-y-4">
              {filteredRootCauses.length > 0 ? (
                filteredRootCauses.map((content, index) => (
                  <ProblemCard
                    key={`cause-${index}`}
                    title={`Root Cause ${index + 1}`}
                    content={content}
                    type="cause"
                  />
                ))
              ) : (
                <div className="text-gray-500 italic p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  No root causes defined
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom left: Solutions */}
          <div className="p-4 relative">
            <div className="absolute bottom-0 right-0 w-1/2 h-px bg-green-300"></div>
            <div className="absolute bottom-0 right-0 w-px h-1/2 bg-green-300"></div>
            
            <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
              Potential Solutions
            </h3>
            
            <div className="space-y-4">
              {filteredSolutions.length > 0 ? (
                filteredSolutions.map((content, index) => (
                  <ProblemCard
                    key={`solution-${index}`}
                    title={`Solution ${index + 1}`}
                    content={content}
                    type="solution"
                  />
                ))
              ) : (
                <div className="text-gray-500 italic p-3 bg-green-50 rounded-lg border border-green-200">
                  No solutions defined
                </div>
              )}
            </div>
          </div>
          
          {/* Bottom right: Actions */}
          <div className="p-4 relative">
            <div className="absolute bottom-0 left-0 w-1/2 h-px bg-blue-300"></div>
            <div className="absolute bottom-0 left-0 w-px h-1/2 bg-blue-300"></div>
            
            <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <span className="h-3 w-3 rounded-full bg-blue-500 mr-2"></span>
              Next Actions
            </h3>
            
            <div className="space-y-4">
              {filteredActions.length > 0 ? (
                filteredActions.map((content, index) => (
                  <ProblemCard
                    key={`action-${index}`}
                    title={`Action ${index + 1}`}
                    content={content}
                    type="action"
                  />
                ))
              ) : (
                <div className="text-gray-500 italic p-3 bg-blue-50 rounded-lg border border-blue-200">
                  No actions defined
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual card component for problem tree items
const ProblemCard: React.FC<{
  title: string;
  content: string;
  type: 'problem' | 'subproblem' | 'cause' | 'solution' | 'action';
  className?: string;
}> = ({ title, content, type, className = '' }) => {
  // Get styles based on item type
  const styles = (() => {
    switch(type) {
      case 'problem': 
        return {
          container: 'border-red-400 bg-white shadow-red-100/50',
          header: 'bg-red-100 text-red-800',
          icon: 'bg-red-500'
        };
      case 'subproblem': 
        return {
          container: 'border-orange-400 bg-white shadow-orange-100/50',
          header: 'bg-orange-100 text-orange-800',
          icon: 'bg-orange-500'
        };
      case 'cause': 
        return {
          container: 'border-yellow-400 bg-white shadow-yellow-100/50',
          header: 'bg-yellow-100 text-yellow-800',
          icon: 'bg-yellow-500'
        };
      case 'solution': 
        return {
          container: 'border-green-400 bg-white shadow-green-100/50',
          header: 'bg-green-100 text-green-800',
          icon: 'bg-green-500'
        };
      case 'action': 
        return {
          container: 'border-blue-400 bg-white shadow-blue-100/50',
          header: 'bg-blue-100 text-blue-800',
          icon: 'bg-blue-500'
        };
    }
  })();

  return (
    <div className={`rounded-lg border-2 shadow-lg overflow-hidden transform transition-all hover:shadow-xl hover:-translate-y-1 ${styles.container} ${className}`}>
      <div className={`px-3 py-2 font-medium flex items-center ${styles.header}`}>
        <span className={`h-3 w-3 rounded-full ${styles.icon} mr-2`}></span>
        {title}
      </div>
      <div className="p-4 text-gray-700">
        {content || 'Not specified'}
      </div>
    </div>
  );
};