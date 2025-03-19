import React from 'react';

/**
 * A true mind map style visualization for problem trees
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

  // Function to truncate text for display
  const truncate = (text: string, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <div className="relative p-6 bg-gradient-to-br from-gray-50 to-white rounded-xl shadow-inner min-h-[600px] overflow-hidden">
      {/* Beautiful background patterns */}
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-white">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100 Z" fill="none" stroke="#5b9bd5" strokeWidth="0.5"></path>
            <path d="M25,0 L25,100" stroke="#5b9bd5" strokeWidth="0.2" strokeDasharray="1,2"></path>
            <path d="M50,0 L50,100" stroke="#5b9bd5" strokeWidth="0.2" strokeDasharray="1,2"></path>
            <path d="M75,0 L75,100" stroke="#5b9bd5" strokeWidth="0.2" strokeDasharray="1,2"></path>
            <path d="M0,25 L100,25" stroke="#5b9bd5" strokeWidth="0.2" strokeDasharray="1,2"></path>
            <path d="M0,50 L100,50" stroke="#5b9bd5" strokeWidth="0.2" strokeDasharray="1,2"></path>
            <path d="M0,75 L100,75" stroke="#5b9bd5" strokeWidth="0.2" strokeDasharray="1,2"></path>
          </svg>
        </div>
      </div>

      {/* Mind map structure with main problem in center */}
      <div className="h-full flex flex-col items-center justify-center">
        {/* Main problem (center) */}
        <div className="relative z-10 mb-8">
          <div className="absolute inset-0 bg-red-500 rounded-full transform scale-125 opacity-30 animate-pulse"></div>
          <div className="relative p-1 bg-white rounded-full shadow-xl">
            <div className="bg-red-600 text-white px-6 py-4 rounded-full border-8 border-white shadow-inner flex flex-col items-center justify-center max-w-sm">
              <h3 className="text-xl font-bold mb-2 text-center">Main Problem</h3>
              <p className="text-sm opacity-90 text-center">{mainProblem || 'No problem defined'}</p>
            </div>
          </div>
        </div>

        {/* Connection lines container */}
        <div className="relative w-full max-w-5xl">
          {/* Horizontal connection from main problem */}
          <div className="absolute top-0 left-1/2 w-0.5 h-16 bg-gradient-to-b from-red-600 to-gray-400 transform -translate-x-1/2 -translate-y-16"></div>
          
          {/* The four branches */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
            {/* Left Top: Sub-problems */}
            <div className="relative p-4">
              {/* Connection lines */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-20 h-8">
                <svg className="w-full h-full" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0V8 C40 16, 0 16, 0 32" stroke="#ED8936" strokeWidth="2" />
                </svg>
              </div>
              
              <div>
                <div className="bg-orange-100 border-l-4 border-orange-500 p-4 rounded-r-lg shadow-lg mb-4">
                  <h3 className="text-orange-800 font-bold mb-2 flex items-center">
                    <span className="w-3 h-3 bg-orange-500 rounded-full mr-2"></span>
                    Sub-Problems
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    {filteredSubProblems.length > 0 ? (
                      filteredSubProblems.map((content, index) => (
                        <div 
                          key={`sub-${index}`} 
                          className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-orange-300 group"
                        >
                          <div className="absolute left-0 top-[0.7em] w-2 h-2 rounded-full bg-orange-400 group-hover:bg-orange-600 transition-colors"></div>
                          <div className="bg-white border border-orange-200 rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-orange-700 text-sm mb-1">Sub Problem {index + 1}</h4>
                            <p className="text-gray-700 text-sm">{truncate(content)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic text-sm p-2">No sub-problems defined</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Top: Root Causes */}
            <div className="relative p-4">
              {/* Connection lines */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-8 w-20 h-8">
                <svg className="w-full h-full" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0V8 C40 16, 80 16, 80 32" stroke="#ECC94B" strokeWidth="2" />
                </svg>
              </div>
              
              <div>
                <div className="bg-yellow-100 border-r-4 border-yellow-500 p-4 rounded-l-lg shadow-lg mb-4">
                  <h3 className="text-yellow-800 font-bold mb-2 flex items-center justify-end">
                    Root Causes
                    <span className="w-3 h-3 bg-yellow-500 rounded-full ml-2"></span>
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    {filteredRootCauses.length > 0 ? (
                      filteredRootCauses.map((content, index) => (
                        <div 
                          key={`cause-${index}`} 
                          className="relative pr-6 before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-yellow-300 group"
                        >
                          <div className="absolute right-0 top-[0.7em] w-2 h-2 rounded-full bg-yellow-400 group-hover:bg-yellow-600 transition-colors"></div>
                          <div className="bg-white border border-yellow-200 rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-yellow-700 text-sm mb-1">Root Cause {index + 1}</h4>
                            <p className="text-gray-700 text-sm">{truncate(content)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic text-sm p-2 text-right">No root causes defined</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Left Bottom: Solutions */}
            <div className="relative p-4">
              {/* Connection lines */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-20 h-8 rotate-180">
                <svg className="w-full h-full" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0V8 C40 16, 0 16, 0 32" stroke="#48BB78" strokeWidth="2" />
                </svg>
              </div>
              
              <div>
                <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-r-lg shadow-lg mb-4">
                  <h3 className="text-green-800 font-bold mb-2 flex items-center">
                    <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                    Potential Solutions
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    {filteredSolutions.length > 0 ? (
                      filteredSolutions.map((content, index) => (
                        <div 
                          key={`solution-${index}`} 
                          className="relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-green-300 group"
                        >
                          <div className="absolute left-0 top-[0.7em] w-2 h-2 rounded-full bg-green-400 group-hover:bg-green-600 transition-colors"></div>
                          <div className="bg-white border border-green-200 rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-green-700 text-sm mb-1">Solution {index + 1}</h4>
                            <p className="text-gray-700 text-sm">{truncate(content)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic text-sm p-2">No solutions defined</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Bottom: Actions */}
            <div className="relative p-4">
              {/* Connection lines */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-8 w-20 h-8 rotate-180">
                <svg className="w-full h-full" viewBox="0 0 80 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 0V8 C40 16, 80 16, 80 32" stroke="#4299E1" strokeWidth="2" />
                </svg>
              </div>
              
              <div>
                <div className="bg-blue-100 border-r-4 border-blue-500 p-4 rounded-l-lg shadow-lg mb-4">
                  <h3 className="text-blue-800 font-bold mb-2 flex items-center justify-end">
                    Next Actions
                    <span className="w-3 h-3 bg-blue-500 rounded-full ml-2"></span>
                  </h3>
                  
                  <div className="space-y-3 mt-4">
                    {filteredActions.length > 0 ? (
                      filteredActions.map((content, index) => (
                        <div 
                          key={`action-${index}`} 
                          className="relative pr-6 before:absolute before:right-0 before:top-0 before:bottom-0 before:w-px before:bg-blue-300 group"
                        >
                          <div className="absolute right-0 top-[0.7em] w-2 h-2 rounded-full bg-blue-400 group-hover:bg-blue-600 transition-colors"></div>
                          <div className="bg-white border border-blue-200 rounded-lg p-3 shadow-sm group-hover:shadow-md transition-shadow">
                            <h4 className="font-medium text-blue-700 text-sm mb-1">Action {index + 1}</h4>
                            <p className="text-gray-700 text-sm">{truncate(content)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-gray-500 italic text-sm p-2 text-right">No actions defined</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Center circle connector (provides depth) */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-300 shadow-lg border-4 border-white"></div>
          </div>
        </div>
      </div>
    </div>
  );
};