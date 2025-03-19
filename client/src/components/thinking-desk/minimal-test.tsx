import React, { useState } from 'react';
import { Button } from "@/components/ui/button";

export default function MinimalTest() {
  const [result, setResult] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // This is a bare-bones function to test the API directly
  const testApiDirectly = async () => {
    setIsSubmitting(true);
    setResult('Sending test request...');
    
    try {
      // Create a minimal problem tree
      const testData = {
        title: "Test Problem Tree",
        mainProblem: "Test Main Problem",
        subProblems: ["Test Sub Problem"],
        rootCauses: ["Test Root Cause"],
        potentialSolutions: ["Test Solution"],
        nextActions: ["Test Action"]
      };
      
      // Call the API using the lowest-level fetch API
      const response = await fetch('/api/problem-trees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
      }
      
      // Try to parse the response 
      const responseData = await response.json();
      
      // Show success
      setResult(
        `SUCCESS! API responded with status ${response.status}.\n\n` +
        `Created problem tree with ID: ${responseData.id}\n\n` +
        JSON.stringify(responseData, null, 2)
      );
      
    } catch (error) {
      // Show error
      setResult(
        `ERROR: ${error instanceof Error ? error.message : String(error)}\n\n` +
        `Stack: ${error instanceof Error ? error.stack : 'No stack trace available'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // This is a second test function that uses a slightly different approach
  const testApiWithXHR = () => {
    setIsSubmitting(true);
    setResult('Sending test request using XMLHttpRequest...');
    
    // Use old-school XHR
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/problem-trees', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const responseData = JSON.parse(xhr.responseText);
            setResult(
              `SUCCESS! API responded with status ${xhr.status}.\n\n` +
              `Created problem tree with ID: ${responseData.id}\n\n` +
              JSON.stringify(responseData, null, 2)
            );
          } catch (e) {
            setResult(`SUCCESS with status ${xhr.status}, but couldn't parse response: ${xhr.responseText}`);
          }
        } else {
          setResult(`ERROR: API responded with status ${xhr.status}. Response: ${xhr.responseText}`);
        }
        setIsSubmitting(false);
      }
    };
    
    xhr.onerror = function() {
      setResult('Network error occurred');
      setIsSubmitting(false);
    };
    
    // Create a minimal problem tree
    const testData = {
      title: "XHR Test Problem Tree",
      mainProblem: "XHR Test Main Problem",
      subProblems: ["XHR Test Sub Problem"],
      rootCauses: ["XHR Test Root Cause"],
      potentialSolutions: ["XHR Test Solution"],
      nextActions: ["XHR Test Action"]
    };
    
    // Send the request
    xhr.send(JSON.stringify(testData));
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 space-y-6">
      <h2 className="text-xl font-semibold text-gray-800">API Test Component</h2>
      <p className="text-gray-600">
        This is a minimal test component to verify the API is working correctly.
      </p>
      
      <div className="flex space-x-4">
        <Button 
          variant="default" 
          onClick={testApiDirectly}
          disabled={isSubmitting}
        >
          Test API (fetch)
        </Button>
        
        <Button 
          variant="outline" 
          onClick={testApiWithXHR}
          disabled={isSubmitting}
        >
          Test API (XHR)
        </Button>
      </div>
      
      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      )}
    </div>
  );
}