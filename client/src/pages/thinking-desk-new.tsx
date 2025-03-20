/**
 * Thinking Desk Page
 * 
 * A page that provides various tools for structured thinking and problem analysis.
 * Implements lazy loading, error boundaries, and responsive design.
 */

import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { ErrorBoundary } from "react-error-boundary";
import { useMediaQuery } from "@/hooks/use-media-query";
import { LoadingState, ErrorState } from "@/components/ui/state-handlers";
import { Separator } from "@/components/ui/separator";

// Lazy loaded components for better performance
const OptimizedProblemTrees = lazy(() => import("@/components/thinking-desk-new/optimized-problem-trees"));

/**
 * Fallback UI for when components are loading
 */
function ComponentLoader() {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="mr-2 h-8 w-8 animate-spin text-primary" />
      <span className="text-lg">Loading tool...</span>
    </div>
  );
}

/**
 * Error Fallback UI 
 */
function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <ErrorState
      title="Something went wrong"
      message={error.message || "An unexpected error occurred while loading this tool."}
      onRetry={resetErrorBoundary}
      className="m-4"
    />
  );
}

/**
 * ThinkingDeskNew Page Component
 * 
 * A refactored version of the Thinking Desk with optimized components and better error handling.
 */
export default function ThinkingDeskNew() {
  const [activeTab, setActiveTab] = useState("problem-trees");
  const [showNewProblemTree, setShowNewProblemTree] = useState(false);
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard shortcuts if not in an input, textarea, etc.
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      
      // Alt+N to create a new item in the active tool
      if (e.altKey && e.key === 'n') {
        e.preventDefault();
        handleNewItem();
      }
      
      // Alt+1-5 to switch between tabs
      if (e.altKey && e.key >= '1' && e.key <= '5') {
        e.preventDefault();
        const tabIndex = parseInt(e.key) - 1;
        const tabs = ["problem-trees", "concept-maps", "swot", "pestel", "five-whys"];
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex]);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab]);
  
  // Handle creating new items based on the active tab
  const handleNewItem = () => {
    if (activeTab === 'problem-trees') {
      setShowNewProblemTree(true);
    }
    // Add handlers for other tools as they're implemented
  };
  
  // Reset new item state when dialog is closed
  const handleDialogClose = () => {
    setShowNewProblemTree(false);
  };
  
  return (
    <div className="container mx-auto py-4 max-w-7xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Thinking Desk</h1>
          <p className="text-muted-foreground mt-1">
            Tools to help with structured thinking and problem analysis
          </p>
        </div>
        
        <Button 
          className="mt-4 sm:mt-0" 
          onClick={handleNewItem}
          aria-label={`Create new ${activeTab.replace(/-/g, ' ')}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New
        </Button>
      </div>
      
      <Separator className="mb-6" />
      
      <Tabs 
        defaultValue="problem-trees" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <div className="bg-background sticky top-0 z-10 pb-4 pt-1">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="problem-trees" title="Problem Trees (Alt+1)">
              Problem Trees
            </TabsTrigger>
            <TabsTrigger value="concept-maps" title="Concept Maps (Alt+2)">
              Concept Maps
            </TabsTrigger>
            <TabsTrigger value="swot" title="SWOT Analysis (Alt+3)">
              SWOT
            </TabsTrigger>
            <TabsTrigger value="pestel" title="PESTEL Analysis (Alt+4)">
              PESTEL
            </TabsTrigger>
            <TabsTrigger value="five-whys" title="Five Whys (Alt+5)">
              Five Whys
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="problem-trees" className="space-y-4">
          <Card className="p-6">
            <ErrorBoundary 
              FallbackComponent={ErrorFallback}
              onReset={() => setShowNewProblemTree(false)}
              resetKeys={[activeTab]}
            >
              <Suspense fallback={<ComponentLoader />}>
                <OptimizedProblemTrees 
                  showNewProblemTree={showNewProblemTree} 
                  onDialogClose={handleDialogClose}
                />
              </Suspense>
            </ErrorBoundary>
          </Card>
        </TabsContent>
        
        <TabsContent value="concept-maps">
          <Card className="p-6">
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">
                Concept Maps tool coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="swot">
          <Card className="p-6">
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">
                SWOT Analysis tool coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="pestel">
          <Card className="p-6">
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">
                PESTEL Analysis tool coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="five-whys">
          <Card className="p-6">
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">
                Five Whys tool coming soon...
              </p>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}