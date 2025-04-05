/**
 * Error Boundary Component
 * 
 * A React error boundary that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the component tree.
 * 
 * For detailed documentation on error handling strategies, categories, and best practices,
 * refer to the ERROR-HANDLING.md file in the root directory.
 */

import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  showResetButton?: boolean;
  showHomeButton?: boolean;
  showBackButton?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  recoveryAttempts: number;
  errorId: string | null;
}

type ErrorCategory = 'api' | 'render' | 'state' | 'validation' | 'resource' | 'auth' | 'network' | 'unknown';

export class ErrorBoundary extends React.Component<Props, State> {
  private static readonly MAX_RECOVERY_ATTEMPTS = 3;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      recoveryAttempts: 0,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  // Reset the error boundary when props change, if resetOnPropsChange is true
  override componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      this.props.children !== prevProps.children
    ) {
      this.resetErrorBoundary();
    }
  }

  private getErrorCategory(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    if (message.includes('network') || message.includes('offline') || message.includes('connection') || message.includes('timeout')) {
      return 'network';
    }
    
    if (message.includes('api') || message.includes('request failed') || message.includes('fetch') || message.includes('response') || error.name === 'ApiError') {
      return 'api';
    }
    
    if (message.includes('render') || message.includes('maximum update depth') || message.includes('invalid hook call')) {
      return 'render';
    }
    
    if (message.includes('state') || message.includes('cannot update') || message.includes('context')) {
      return 'state';
    }
    
    if (message.includes('validation') || message.includes('invalid') || message.includes('schema') || message.includes('form')) {
      return 'validation';
    }
    
    if (message.includes('not found') || message.includes('404') || message.includes('resource') || message.includes('file')) {
      return 'resource';
    }
    
    if (message.includes('auth') || message.includes('permission') || message.includes('unauthorized') || message.includes('forbidden') || message.includes('access')) {
      return 'auth';
    }
    
    return 'unknown';
  }

  private generateErrorId(): string {
    return `err_${Math.random().toString(36).substring(2, 9)}_${Date.now().toString(36)}`;
  }

  private getUserFriendlyErrorMessage(error: Error, category: ErrorCategory): string {
    // Provide more user-friendly error messages based on category
    switch (category) {
      case 'network':
        return 'Network connection issue. Please check your internet connection and try again.';
      case 'api':
        return 'Unable to communicate with our servers. Please try again later.';
      case 'auth':
        return 'Authentication error. You may need to log in again.';
      case 'resource':
        return 'The requested content could not be found.';
      case 'validation':
        return 'Invalid data provided. Please check your input and try again.';
      case 'render':
      case 'state':
        return 'The application encountered an unexpected error. We\'re working to fix it.';
      default:
        // For unknown errors, show a simplified message or the actual error message
        return error.message || 'An unexpected error occurred';
    }
  }

  private async attemptRecovery(category: ErrorCategory) {
    const { recoveryAttempts } = this.state;
    
    if (recoveryAttempts >= ErrorBoundary.MAX_RECOVERY_ATTEMPTS) {
      return false;
    }

    try {
      switch (category) {
        case 'network':
        case 'api':
          // Wait a bit and retry for network/API issues
          await new Promise(resolve => setTimeout(resolve, 1500));
          break;
        case 'auth':
          // Redirect to login if available
          if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
            sessionStorage.setItem('returnTo', window.location.pathname);
            // Don't reset yet, let the redirection happen
            return true;
          }
          break;
        case 'resource':
          // Maybe navigate back or to home
          break;
        case 'render':
        case 'state':
          // Force a clean re-render
          break;
        case 'validation':
          // Clear invalid form data
          break;
      }

      this.setState(prev => ({ recoveryAttempts: prev.recoveryAttempts + 1 }));
      
      // Reset the error state to allow a retry
      this.resetErrorBoundary();
      return true;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      return false;
    }
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const category = this.getErrorCategory(error);
    const errorId = this.generateErrorId();
    
    // Log with structured data
    console.error(`Error caught by boundary [${errorId}] (${category}):`, {
      error,
      errorInfo,
      componentStack: errorInfo.componentStack,
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      timestamp: new Date().toISOString()
    });
    
    this.setState({ 
      errorInfo,
      errorId
    });

    // Attempt recovery based on error category
    this.attemptRecovery(category).then(success => {
      if (!success && this.props.onError) {
        this.props.onError(error, errorInfo);
      }
    });

    // Here you could also send the error to a reporting service
    // Example: sendToErrorReportingService(error, errorInfo, errorId, category);
  }

  resetErrorBoundary = () => {
    this.setState({ 
      hasError: false, 
      error: null, 
      errorInfo: null 
    });
  };

  override render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error } = this.state;
      const category = error ? this.getErrorCategory(error) : 'unknown';
      const errorMessage = error ? this.getUserFriendlyErrorMessage(error, category) : 'An unexpected error occurred';
      
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage}
              </p>
              {this.state.errorId && (
                <p className="text-xs text-gray-500 mb-4">
                  Error reference: {this.state.errorId}
                </p>
              )}
              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <Button 
                  onClick={() => window.location.reload()}
                  className="gap-2 flex-1"
                >
                  <RefreshCw className="h-4 w-4" />
                  Reload Page
                </Button>

                {this.props.showResetButton !== false && (
                  <Button 
                    onClick={this.resetErrorBoundary}
                    variant="outline"
                    className="gap-2 flex-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Try Again
                  </Button>
                )}
                
                {this.props.showHomeButton && (
                  <Button asChild variant="outline" className="gap-2 flex-1">
                    <Link href="/">
                      <Home className="h-4 w-4" />
                      Go Home
                    </Link>
                  </Button>
                )}
                
                {this.props.showBackButton && (
                  <Button
                    onClick={() => window.history.back()}
                    variant="outline"
                    className="gap-2 flex-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Go Back
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryHook {
  handleError: (error: Error) => void;
  captureException: (error: Error, metadata?: Record<string, any>) => void;
  logEvent: (message: string, metadata?: Record<string, any>) => void;
}

export const useErrorBoundary = (): ErrorBoundaryHook => {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    console.error('Error caught by hook:', error);
    
    // Show error toast
    toast({
      title: 'Error',
      description: error.message || 'An unexpected error occurred',
      variant: 'destructive',
    });

    // Here you would also log the error to your monitoring service
  };

  const captureException = (error: Error, metadata?: Record<string, any>) => {
    const errorWithContext = {
      error,
      metadata,
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'unknown'
    };
    
    console.error('Exception captured:', errorWithContext);
    
    // Here you would send this to your error monitoring service
    // errorMonitoringService.captureException(error, metadata);
  };

  const logEvent = (message: string, metadata?: Record<string, any>) => {
    const event = {
      message,
      metadata,
      timestamp: new Date().toISOString(),
    };
    
    console.info('Event logged:', event);
    
    // Here you would log this event
    // analyticsService.logEvent(message, metadata);
  };

  return { 
    handleError,
    captureException,
    logEvent
  };
}; 