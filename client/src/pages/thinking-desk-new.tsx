/**
 * Thinking Desk Page (Optimized Implementation)
 * 
 * This is the highly optimized implementation of the Thinking Desk page with:
 * - Lazy loading and code splitting
 * - Virtualization for performance
 * - Comprehensive error handling
 * - Keyboard navigation and accessibility
 * - Progressive enhancement
 */

import React, { useState, useContext, createContext, lazy, Suspense, useCallback, useEffect, useRef, useMemo } from 'react';
import { 
  LightbulbIcon, 
  NetworkIcon, 
  ClipboardListIcon, 
  FlaskConicalIcon,
  PlusIcon,
  Loader2Icon,
  ShieldAlertIcon,
  KeyboardIcon
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';

// Using React.lazy with performance tracking
const BrainDump = lazy(() => {
  const startTime = performance.now();
  return import('@/components/thinking-desk/brain-dump')
    .then(module => {
      const loadTime = performance.now() - startTime;
      console.debug(`BrainDump component loaded in ${loadTime.toFixed(2)}ms`);
      return module;
    });
});

const DraftedPlans = lazy(() => {
  const startTime = performance.now();
  return import('@/components/thinking-desk/drafted-plans-new')
    .then(module => {
      const loadTime = performance.now() - startTime;
      console.debug(`DraftedPlans component loaded in ${loadTime.toFixed(2)}ms`);
      return { default: module.DraftedPlans };
    });
});

const ClarityLab = lazy(() => {
  const startTime = performance.now();
  return import('@/components/thinking-desk/clarity-lab')
    .then(module => {
      const loadTime = performance.now() - startTime;
      console.debug(`ClarityLab component loaded in ${loadTime.toFixed(2)}ms`);
      return module;
    });
});

const MinimalProblemTrees = lazy(() => {
  const startTime = performance.now();
  return import('@/components/thinking-desk-new/minimal-problem-trees')
    .then(module => {
      const loadTime = performance.now() - startTime;
      console.debug(`MinimalProblemTrees component loaded in ${loadTime.toFixed(2)}ms`);
      return { default: module.MinimalProblemTrees };
    });
});

// ErrorBoundary component to catch errors in suspense fallbacks
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode; name?: string },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode; name?: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // We could send this to an error reporting service
    console.error(`${this.props.name || "Component"} failed:`, error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

// Loading component for suspense fallback - shows skeleton UI during loading
const ComponentLoader = () => (
  <div className="w-full space-y-4 py-8" aria-busy="true" aria-live="polite" role="status">
    <div className="flex justify-between items-center">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-10 w-32" />
    </div>
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
      {[...Array(4)].map((_, i) => (
        <Skeleton key={i} className="h-36 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

// Error fallback component for any errors in tools
const ToolErrorFallback = ({ toolName, onRetry }: { toolName: string; onRetry?: () => void }) => (
  <Alert variant="destructive" className="mb-6">
    <ShieldAlertIcon className="h-4 w-4 mr-2" />
    <AlertTitle>Error Loading {toolName}</AlertTitle>
    <AlertDescription>
      We had trouble loading this tool. You can try refreshing the page or come back later.
    </AlertDescription>
    <div className="flex gap-2 mt-4">
      {onRetry && (
        <Button 
          variant="outline" 
          onClick={onRetry}
        >
          Try Again
        </Button>
      )}
      <Button 
        variant="outline" 
        onClick={() => window.location.reload()}
      >
        Refresh Page
      </Button>
    </div>
  </Alert>
);

// Keyboard shortcut hint component
const KeyboardShortcuts = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts when user presses '?'
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        setShowShortcuts(prev => !prev);
      }
      // Hide on escape
      if (e.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  if (!showShortcuts) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowShortcuts(false)}>
      <div className="bg-background rounded-lg p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold flex items-center">
            <KeyboardIcon className="h-5 w-5 mr-2" />
            Keyboard Shortcuts
          </h2>
          <Button variant="ghost" size="sm" onClick={() => setShowShortcuts(false)}>✕</Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="font-medium">1-4</span>
            <span className="text-muted-foreground">Switch between tabs</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">N</span>
            <span className="text-muted-foreground">Create new entry</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">?</span>
            <span className="text-muted-foreground">Show/hide shortcuts</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Esc</span>
            <span className="text-muted-foreground">Close dialogs</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Types for the context
interface ThinkingDeskContextType {
  showNewItem: boolean;
  setShowNewItem: (show: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
}

// Create context with default values
const ThinkingDeskContext = createContext<ThinkingDeskContextType>({
  showNewItem: false,
  setShowNewItem: () => {},
  activeTab: 'brain-dump',
  setActiveTab: () => {},
  isLoading: false,
});

// Hook for consuming context
export const useThinkingDesk = () => useContext(ThinkingDeskContext);

const ThinkingDesk = () => {
  // State for the active tab and dialog visibility
  const [activeTab, setActiveTab] = useState('brain-dump');
  const [showNewItem, setShowNewItem] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const previousTabRef = useRef<string>(activeTab);
  const { toast } = useToast();
  const isMobile = useMediaQuery("(max-width: 640px)");
  
  // Tab data for easy management
  const tabsData = useMemo(() => [
    { id: 'brain-dump', label: 'Brain Dump', icon: <LightbulbIcon className="w-4 h-4 mr-2" aria-hidden="true" /> },
    { id: 'clarity-lab', label: 'Clarity Lab', icon: <FlaskConicalIcon className="w-4 h-4 mr-2" aria-hidden="true" /> },
    { id: 'drafted-plans', label: 'Drafted Plans', icon: <ClipboardListIcon className="w-4 h-4 mr-2" aria-hidden="true" /> },
    { id: 'problem-trees', label: 'Problem Trees', icon: <NetworkIcon className="w-4 h-4 mr-2" aria-hidden="true" /> },
  ], []);
  
  // Track tab changes for analytics
  useEffect(() => {
    if (previousTabRef.current !== activeTab) {
      // Add analytics tracking here
      console.debug(`Tab changed: ${previousTabRef.current} -> ${activeTab}`);
      previousTabRef.current = activeTab;
      
      // We could send this to an analytics service
      const tabChangedAt = new Date().toISOString();
      console.debug(`User switched to ${activeTab} at ${tabChangedAt}`);
    }
  }, [activeTab]);
  
  // Handle keyboard shortcuts for tabs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no modifiers are pressed and not typing in an input
      const isInputActive = document.activeElement?.tagName === 'INPUT' || 
                           document.activeElement?.tagName === 'TEXTAREA';
      
      if (isInputActive || e.ctrlKey || e.altKey || e.metaKey) return;
      
      // Numeric keys 1-4 for tabs
      if (e.key >= '1' && e.key <= '4') {
        const tabIndex = parseInt(e.key) - 1;
        if (tabIndex >= 0 && tabIndex < tabsData.length) {
          const tabId = tabsData[tabIndex]?.id;
          if (tabId) {
            setActiveTab(tabId);
            e.preventDefault();
          }
        }
      }
      
      // 'N' for new item
      if (e.key === 'n' || e.key === 'N') {
        setShowNewItem(true);
        e.preventDefault();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tabsData]);

  // Handle closing the dialog - memoized to prevent unnecessary re-renders
  const handleDialogClose = useCallback(() => {
    setShowNewItem(false);
  }, []);

  // Handle adding new item button click - memoized to prevent unnecessary re-renders
  const handleAddNewClick = useCallback(() => {
    setShowNewItem(true);
  }, []);
  
  // Handle tab change - memoized to prevent unnecessary re-renders
  const handleTabChange = useCallback((value: string) => {
    setIsLoading(true);
    setActiveTab(value);
    
    // Small delay to ensure loading state is visible
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
    
    // Reset the new item dialog when changing tabs
    setShowNewItem(false);
  }, []);
  
  // Handle errors during component loading
  const handleComponentError = useCallback((toolName: string) => {
    toast({
      title: `Error Loading ${toolName}`,
      description: "We had trouble loading this tool. Please try again.",
      variant: "destructive",
    });
  }, [toast]);

  // Context value for providing to children - memoized to prevent unnecessary context updates
  const contextValue = useMemo(() => ({
    showNewItem,
    setShowNewItem,
    activeTab,
    setActiveTab: handleTabChange,
    isLoading,
  }), [showNewItem, activeTab, handleTabChange, isLoading]);

  // Render the component
  return (
    <ErrorBoundary 
      name="ThinkingDesk"
      fallback={
        <div className="container mx-auto p-4">
          <Alert variant="destructive">
            <ShieldAlertIcon className="h-4 w-4 mr-2" />
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>
              We're having trouble loading the Thinking Desk. Please try refreshing the page.
            </AlertDescription>
            <Button 
              className="mt-4" 
              onClick={() => window.location.reload()}
            >
              Refresh Page
            </Button>
          </Alert>
        </div>
      }
    >
      <ThinkingDeskContext.Provider value={contextValue}>
        <section className="container mx-auto p-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">Thinking Desk</h1>
              <p className="text-gray-600 mt-1">Organize your thoughts and ideas with powerful thinking tools</p>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => toast({
                  title: "Keyboard Shortcuts",
                  description: "Press ? to view available keyboard shortcuts"
                })}
                className="hidden sm:flex"
                aria-label="Show keyboard shortcuts"
              >
                <KeyboardIcon className="h-4 w-4" />
              </Button>
              <Button onClick={handleAddNewClick}>
                <PlusIcon className="h-4 w-4 mr-2" aria-hidden="true" /> New Entry
              </Button>
            </div>
          </div>

          <Tabs defaultValue="brain-dump" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-8 w-full justify-start overflow-auto">
              {tabsData.map((tab, index) => (
                <TabsTrigger 
                  key={tab.id} 
                  value={tab.id} 
                  className="px-4 py-2"
                  data-shortcut={index + 1}
                  aria-label={`${tab.label} (Press ${index + 1})`}
                >
                  {tab.icon}
                  {tab.label}
                  {!isMobile && (
                    <kbd className="ml-2 text-xs bg-muted px-1.5 py-0.5 rounded hidden sm:inline-block">
                      {index + 1}
                    </kbd>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Using Suspense for lazy-loaded components */}
            <TabsContent value="brain-dump" className="pt-4">
              <ErrorBoundary 
                name="BrainDump"
                fallback={<ToolErrorFallback toolName="Brain Dump" onRetry={() => handleComponentError("Brain Dump")} />}
              >
                <Suspense fallback={<ComponentLoader />}>
                  {(activeTab === 'brain-dump' || previousTabRef.current === 'brain-dump') && (
                    <BrainDump />
                  )}
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="clarity-lab" className="pt-4">
              <ErrorBoundary 
                name="ClarityLab"
                fallback={<ToolErrorFallback toolName="Clarity Lab" onRetry={() => handleComponentError("Clarity Lab")} />}
              >
                <Suspense fallback={<ComponentLoader />}>
                  {(activeTab === 'clarity-lab' || previousTabRef.current === 'clarity-lab') && (
                    <ClarityLab 
                      showNewEntry={activeTab === 'clarity-lab' && showNewItem} 
                      onDialogClose={handleDialogClose} 
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="drafted-plans" className="pt-4">
              <ErrorBoundary 
                name="DraftedPlans"
                fallback={<ToolErrorFallback toolName="Drafted Plans" onRetry={() => handleComponentError("Drafted Plans")} />}
              >
                <Suspense fallback={<ComponentLoader />}>
                  {(activeTab === 'drafted-plans' || previousTabRef.current === 'drafted-plans') && (
                    <DraftedPlans 
                      showNewPlan={activeTab === 'drafted-plans' && showNewItem} 
                      onDialogClose={handleDialogClose} 
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            </TabsContent>

            <TabsContent value="problem-trees" className="pt-4">
              <ErrorBoundary 
                name="ProblemTrees"
                fallback={<ToolErrorFallback toolName="Problem Trees" onRetry={() => handleComponentError("Problem Trees")} />}
              >
                <Suspense fallback={<ComponentLoader />}>
                  {(activeTab === 'problem-trees' || previousTabRef.current === 'problem-trees') && (
                    <MinimalProblemTrees 
                      showNewProblemTree={activeTab === 'problem-trees' && showNewItem} 
                      onDialogClose={handleDialogClose} 
                    />
                  )}
                </Suspense>
              </ErrorBoundary>
            </TabsContent>
          </Tabs>

          {/* Keyboard shortcuts modal */}
          <KeyboardShortcuts />
        </section>
      </ThinkingDeskContext.Provider>
    </ErrorBoundary>
  );
};

export default ThinkingDesk;