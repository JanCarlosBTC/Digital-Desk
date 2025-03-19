import React from 'react';

/**
 * Type definitions for the Problem Tree visualization component
 */
interface ProblemTreeVisualizationProps {
  mainProblem: string;
  subProblems: string[];
  rootCauses: string[];
  potentialSolutions: string[];
  nextActions: string[];
}

/**
 * A TypeScript-friendly, accessible problem tree visualization component
 * Presents a hierarchical view of problems, causes, solutions, and actions
 */
export const ProblemTreeVisualization: React.FC<ProblemTreeVisualizationProps> = ({
  mainProblem,
  subProblems = [],
  rootCauses = [],
  potentialSolutions = [],
  nextActions = []
}) => {
  // Filter out empty entries to avoid displaying empty items
  const filteredSubProblems = subProblems.filter(p => p && p.trim() !== '');
  const filteredRootCauses = rootCauses.filter(c => c && c.trim() !== '');
  const filteredSolutions = potentialSolutions.filter(s => s && s.trim() !== '');
  const filteredActions = nextActions.filter(a => a && a.trim() !== '');

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg">
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

      <div className="tree mx-auto overflow-auto max-h-[500px] p-4">
        <ul>
          <li>
            <div className="problem-node">
              <div className="node-title problem-title">Main Problem</div>
              <div className="node-content">{mainProblem || 'No problem defined'}</div>
            </div>
            
            <ul>
              {/* Sub-problems */}
              {filteredSubProblems.length > 0 && (
                <li>
                  <div className="subproblem-node">
                    <div className="node-title subproblem-title">Sub-Problems</div>
                    <div className="node-content">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredSubProblems.map((problem, idx) => (
                          <li key={`subp-${idx}`} className="text-left">{problem}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )}
              
              {/* Root Causes */}
              {filteredRootCauses.length > 0 && (
                <li>
                  <div className="cause-node">
                    <div className="node-title cause-title">Root Causes</div>
                    <div className="node-content">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredRootCauses.map((cause, idx) => (
                          <li key={`cause-${idx}`} className="text-left">{cause}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <ul>
                    {/* Solutions */}
                    {filteredSolutions.length > 0 && (
                      <li>
                        <div className="solution-node">
                          <div className="node-title solution-title">Solutions</div>
                          <div className="node-content">
                            <ul className="list-disc pl-4 space-y-1">
                              {filteredSolutions.map((solution, idx) => (
                                <li key={`sol-${idx}`} className="text-left">{solution}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        {filteredActions.length > 0 && (
                          <ul>
                            <li>
                              <div className="action-node">
                                <div className="node-title action-title">Next Actions</div>
                                <div className="node-content">
                                  <ul className="list-disc pl-4 space-y-1">
                                    {filteredActions.map((action, idx) => (
                                      <li key={`act-${idx}`} className="text-left">{action}</li>
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
                      <li>
                        <div className="action-node">
                          <div className="node-title action-title">Next Actions</div>
                          <div className="node-content">
                            <ul className="list-disc pl-4 space-y-1">
                              {filteredActions.map((action, idx) => (
                                <li key={`act-${idx}`} className="text-left">{action}</li>
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
                <li>
                  <div className="solution-node">
                    <div className="node-title solution-title">Solutions</div>
                    <div className="node-content">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredSolutions.map((solution, idx) => (
                          <li key={`sol-${idx}`} className="text-left">{solution}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  {filteredActions.length > 0 && (
                    <ul>
                      <li>
                        <div className="action-node">
                          <div className="node-title action-title">Next Actions</div>
                          <div className="node-content">
                            <ul className="list-disc pl-4 space-y-1">
                              {filteredActions.map((action, idx) => (
                                <li key={`act-${idx}`} className="text-left">{action}</li>
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
                <li>
                  <div className="action-node">
                    <div className="node-title action-title">Next Actions</div>
                    <div className="node-content">
                      <ul className="list-disc pl-4 space-y-1">
                        {filteredActions.map((action, idx) => (
                          <li key={`act-${idx}`} className="text-left">{action}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </li>
              )}
              
              {/* Empty state */}
              {filteredSubProblems.length === 0 && filteredRootCauses.length === 0 && 
               filteredSolutions.length === 0 && filteredActions.length === 0 && (
                <li>
                  <div className="border border-gray-300 bg-gray-50 text-gray-500 italic">
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
};