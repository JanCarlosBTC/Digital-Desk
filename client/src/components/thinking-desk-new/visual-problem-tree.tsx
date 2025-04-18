import React, { useMemo } from 'react';

/**
 * Type definitions for the Problem Tree visualization component
 * Strong typing with detailed properties for better tooling support and accessibility
 */
export interface ProblemTreeVisualizationProps {
  /** Main problem text to display at the top of the tree */
  mainProblem: string;
  
  /** List of sub-problems related to the main problem */
  subProblems: string[];
  
  /** List of identified root causes for the problems */
  rootCauses: string[];
  
  /** List of potential solutions addressing the problems/causes */
  potentialSolutions: string[];
  
  /** List of actionable next steps to implement solutions */
  nextActions: string[];
  
  /** Optional CSS class name for custom styling */
  className?: string;
  
  /** Optional test ID for automated testing and selection in tests */
  testId?: string;
}

/**
 * Validates and filters out empty entries from an array of strings
 * Safely handles null/undefined arrays by returning an empty array
 * 
 * @param items Array of strings to filter
 * @returns Filtered array with only non-empty strings
 */
function filterEmptyStrings(items: string[] | null | undefined): string[] {
  if (!items || !Array.isArray(items)) return [];
  return items.filter(item => item && typeof item === 'string' && item.trim() !== '');
}

/**
 * A TypeScript-friendly, accessible problem tree visualization component
 * Presents a hierarchical view of problems, causes, solutions, and actions
 * Optimized with memoization for better performance
 * 
 * @param props Component props with problem tree data
 * @returns Rendered problem tree visualization
 */
const ProblemTreeVisualization = React.memo(function ProblemTreeVisualization(
  props: ProblemTreeVisualizationProps
) {
  const {
    mainProblem,
    subProblems = [],
    rootCauses = [],
    potentialSolutions = [],
    nextActions = [],
    className = '',
    testId = 'problem-tree-visualization'
  } = props;
  
  // Memoize the filtered arrays to prevent unnecessary re-filtering on re-renders
  const filteredSubProblems = useMemo(() => 
    filterEmptyStrings(subProblems), [subProblems]);
    
  const filteredRootCauses = useMemo(() => 
    filterEmptyStrings(rootCauses), [rootCauses]);
    
  const filteredSolutions = useMemo(() => 
    filterEmptyStrings(potentialSolutions), [potentialSolutions]);
    
  const filteredActions = useMemo(() => 
    filterEmptyStrings(nextActions), [nextActions]);

  // Memoize the content flag for better rendering performance
  const hasContent = useMemo(() => 
    !!mainProblem || 
    filteredSubProblems.length > 0 || 
    filteredRootCauses.length > 0 || 
    filteredSolutions.length > 0 || 
    filteredActions.length > 0, 
    [mainProblem, filteredSubProblems, filteredRootCauses, filteredSolutions, filteredActions]
  );
  
  // Handle keyboard navigation for improved accessibility
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Get all focusable tree items
    const treeItems = document.querySelectorAll('[role="treeitem"] > div[tabindex="0"]');
    const currentIndex = Array.from(treeItems).findIndex(item => item === document.activeElement);
    
    switch (event.key) {
      case 'ArrowDown':
        // Move focus to the next tree item
        if (currentIndex < treeItems.length - 1) {
          event.preventDefault();
          (treeItems[currentIndex + 1] as HTMLElement).focus();
        }
        break;
      case 'ArrowUp':
        // Move focus to the previous tree item
        if (currentIndex > 0) {
          event.preventDefault();
          (treeItems[currentIndex - 1] as HTMLElement).focus();
        }
        break;
      case 'Home':
        // Move focus to the first tree item
        if (treeItems.length > 0) {
          event.preventDefault();
          (treeItems[0] as HTMLElement).focus();
        }
        break;
      case 'End':
        // Move focus to the last tree item
        if (treeItems.length > 0) {
          event.preventDefault();
          (treeItems[treeItems.length - 1] as HTMLElement).focus();
        }
        break;
      default:
        break;
    }
  };

  return (
    <div 
      className={`bg-white p-4 rounded-lg shadow-lg ${className}`}
      data-testid={testId}
      role="region"
      aria-label="Problem Tree Visualization"
      aria-busy={!hasContent}
    >
      {/* CSS is defined inline with type-safe dangerouslySetInnerHTML */}
      <style dangerouslySetInnerHTML={{ __html: `
        .tree {
          --line-color: #ccc;
          --problem-color: #f56565;
          --subproblem-color: #ed8936;
          --cause-color: #ecc94b;
          --solution-color: #48bb78;
          --action-color: #4299e1;
        }
        
        .tree ul {
          padding-top: 20px;
          position: relative;
          transition: all 0.5s;
        }
        
        .tree li {
          float: left;
          text-align: center;
          list-style-type: none;
          position: relative;
          padding: 20px 5px 0 5px;
          transition: all 0.5s;
        }
        
        .tree li::before,
        .tree li::after {
          content: '';
          position: absolute;
          top: 0;
          right: 50%;
          border-top: 1px solid var(--line-color);
          width: 50%;
          height: 20px;
        }
        
        .tree li::after {
          right: auto;
          left: 50%;
          border-left: 1px solid var(--line-color);
        }
        
        .tree li:only-child::after,
        .tree li:only-child::before {
          display: none;
        }
        
        .tree li:only-child {
          padding-top: 0;
        }
        
        .tree li:first-child::before,
        .tree li:last-child::after {
          border: 0 none;
        }
        
        .tree li:last-child::before {
          border-right: 1px solid var(--line-color);
          border-radius: 0 5px 0 0;
        }
        
        .tree li:first-child::after {
          border-radius: 5px 0 0 0;
        }
        
        .tree ul ul::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          border-left: 1px solid var(--line-color);
          width: 0;
          height: 20px;
        }
        
        .tree li div {
          border: 1px solid #ccc;
          padding: 10px;
          text-decoration: none;
          color: #333;
          display: inline-block;
          min-width: 160px;
          min-height: 40px;
          border-radius: 5px;
          transition: all 0.5s;
          background-color: white;
          font-size: 0.9rem;
          word-break: break-word;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }
        
        .tree li div:hover,
        .tree li div:hover+ul li div {
          background: #f8f9fa;
          box-shadow: 0 4px 8px rgba(0,0,0,0.2);
          transform: translateY(-3px);
        }
        
        .tree li div:hover+ul li::after,
        .tree li div:hover+ul li::before,
        .tree li div:hover+ul::before,
        .tree li div:hover+ul ul::before {
          border-color: #94a3b8;
        }
        
        .problem-node {
          border-color: var(--problem-color) !important;
          box-shadow: 0 1px 3px var(--problem-color) !important;
        }
        
        .subproblem-node {
          border-color: var(--subproblem-color) !important;
          box-shadow: 0 1px 3px var(--subproblem-color) !important;
        }
        
        .cause-node {
          border-color: var(--cause-color) !important;
          box-shadow: 0 1px 3px var(--cause-color) !important;
        }
        
        .solution-node {
          border-color: var(--solution-color) !important;
          box-shadow: 0 1px 3px var(--solution-color) !important;
        }
        
        .action-node {
          border-color: var(--action-color) !important;
          box-shadow: 0 1px 3px var(--action-color) !important;
        }
        
        .node-title {
          font-weight: bold;
          padding-bottom: 4px;
          margin-bottom: 4px;
          border-bottom: 1px solid #eee;
          font-size: 0.85rem;
          text-transform: uppercase;
        }
        
        .problem-title {
          color: var(--problem-color);
        }
        
        .subproblem-title {
          color: var(--subproblem-color);
        }
        
        .cause-title {
          color: var(--cause-color);
        }
        
        .solution-title {
          color: var(--solution-color);
        }
        
        .action-title {
          color: var(--action-color);
        }
        
        .node-content {
          font-size: 0.85rem;
          text-align: left;
        }
      `}} />

      {!hasContent && (
        <div className="py-4 text-center text-gray-500" aria-live="polite">
          Loading problem tree data...
        </div>
      )}
      
      <div 
        className="tree mx-auto overflow-auto max-h-[500px] p-4"
        aria-hidden={!hasContent}
        tabIndex={hasContent ? 0 : -1}
        onKeyDown={handleKeyDown}
        role="application"
        aria-roledescription="problem tree visualization"
      >
        <ul role="tree">
          <li role="treeitem">
            <div className="problem-node" tabIndex={0}>
              <div className="node-title problem-title" id="main-problem-title">Main Problem</div>
              <div className="node-content" aria-labelledby="main-problem-title">{mainProblem || 'No problem defined'}</div>
            </div>
            
            <ul>
              {/* Sub-problems */}
              {filteredSubProblems.length > 0 && (
                <li role="treeitem">
                  <div className="subproblem-node" tabIndex={0}>
                    <div className="node-title subproblem-title" id="subproblems-title">Sub-Problems</div>
                    <div className="node-content" aria-labelledby="subproblems-title">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredSubProblems.map((problem, idx) => (
                          <li key={`subp-${idx}`} className="text-left">
                            {problem}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )}
              
              {/* Root Causes */}
              {filteredRootCauses.length > 0 && (
                <li role="treeitem">
                  <div className="cause-node" tabIndex={0}>
                    <div className="node-title cause-title" id="root-causes-title">Root Causes</div>
                    <div className="node-content" aria-labelledby="root-causes-title">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredRootCauses.map((cause, idx) => (
                          <li key={`cause-${idx}`} className="text-left">
                            {cause}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <ul>
                    {/* Solutions */}
                    {filteredSolutions.length > 0 && (
                      <li role="treeitem">
                        <div className="solution-node" tabIndex={0}>
                          <div className="node-title solution-title" id="solutions-title">Solutions</div>
                          <div className="node-content" aria-labelledby="solutions-title">
                            <ul className="list-disc pl-4 space-y-1">
                              {filteredSolutions.map((solution, idx) => (
                                <li key={`sol-${idx}`} className="text-left">
                                  {solution}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {filteredActions.length > 0 && (
                          <ul role="group">
                            <li role="treeitem">
                              <div className="action-node" tabIndex={0}>
                                <div className="node-title action-title" id="next-actions-title">Next Actions</div>
                                <div className="node-content" aria-labelledby="next-actions-title">
                                  <ul className="list-disc pl-4 space-y-1">
                                    {filteredActions.map((action, idx) => (
                                      <li key={`act-${idx}`} className="text-left">
                                        {action}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </li>
                          </ul>
                        )}
                      </li>
                    )}
                    
                    {/* If there are actions but no solutions */}
                    {filteredSolutions.length === 0 && filteredActions.length > 0 && (
                      <li role="treeitem">
                        <div className="action-node" tabIndex={0}>
                          <div className="node-title action-title" id="next-actions-alt-title">Next Actions</div>
                          <div className="node-content" aria-labelledby="next-actions-alt-title">
                            <ul className="list-disc pl-4 space-y-1">
                              {filteredActions.map((action, idx) => (
                                <li key={`act-${idx}`} className="text-left">
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </li>
              )}
              
              {/* If there are solutions but no root causes */}
              {filteredRootCauses.length === 0 && filteredSolutions.length > 0 && (
                <li role="treeitem">
                  <div className="solution-node" tabIndex={0}>
                    <div className="node-title solution-title" id="solutions-no-causes-title">Solutions</div>
                    <div className="node-content" aria-labelledby="solutions-no-causes-title">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredSolutions.map((solution, idx) => (
                          <li key={`sol-${idx}`} className="text-left">
                            {solution}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {filteredActions.length > 0 && (
                    <ul role="group">
                      <li role="treeitem">
                        <div className="action-node" tabIndex={0}>
                          <div className="node-title action-title" id="solo-actions-title">Next Actions</div>
                          <div className="node-content" aria-labelledby="solo-actions-title">
                            <ul className="list-disc pl-4 space-y-1">
                              {filteredActions.map((action, idx) => (
                                <li key={`act-${idx}`} className="text-left">
                                  {action}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </li>
                    </ul>
                  )}
                </li>
              )}
              
              {/* If there are only actions, but no root causes or solutions */}
              {filteredRootCauses.length === 0 && filteredSolutions.length === 0 && filteredActions.length > 0 && (
                <li role="treeitem">
                  <div className="action-node" tabIndex={0}>
                    <div className="node-title action-title" id="direct-actions-title">Next Actions</div>
                    <div className="node-content" aria-labelledby="direct-actions-title">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredActions.map((action, idx) => (
                          <li key={`act-${idx}`} className="text-left">
                            {action}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )}
              
              {/* Empty state */}
              {filteredSubProblems.length === 0 && filteredRootCauses.length === 0 && 
               filteredSolutions.length === 0 && filteredActions.length === 0 && (
                <li role="treeitem">
                  <div 
                    className="border border-gray-300 bg-gray-50 text-gray-500 italic"
                    aria-label="No tree details available"
                  >
                    No details defined yet
                  </div>
                </li>
              )}
            </ul>
          </li>
        </ul>
      </div>
    </div>
  );
});

export { ProblemTreeVisualization };