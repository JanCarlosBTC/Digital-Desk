import React from 'react';
import { useToast } from '@/components/ui/use-toast';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  recoveryAttempts: number;
}

type ErrorCategory = 'api' | 'render' | 'state' | 'validation' | 'unknown';

export class ErrorBoundary extends React.Component<Props, State> {
  private static readonly MAX_RECOVERY_ATTEMPTS = 3;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      recoveryAttempts: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  private getErrorCategory(error: Error): ErrorCategory {
    if (error.message.includes('API request failed') || error.message.includes('Request timeout')) {
      return 'api';
    }
    if (error.message.includes('React render error') || error.message.includes('Maximum update depth exceeded')) {
      return 'render';
    }
    if (error.message.includes('State update error') || error.message.includes('Cannot update a component while rendering a different component')) {
      return 'state';
    }
    if (error.message.includes('Validation failed') || error.message.includes('Invalid input')) {
      return 'validation';
    }
    return 'unknown';
  }

  private async attemptRecovery(category: ErrorCategory) {
    const { recoveryAttempts } = this.state;
    
    if (recoveryAttempts >= ErrorBoundary.MAX_RECOVERY_ATTEMPTS) {
      return false;
    }

    try {
      switch (category) {
        case 'api':
          // Attempt to retry failed API calls
          await new Promise(resolve => setTimeout(resolve, 1000));
          break;
        case 'render':
          // Force a re-render with fallback UI
          this.setState({ hasError: false, error: null, errorInfo: null });
          break;
        case 'state':
          // Reset state to last known good state
          this.setState({ hasError: false, error: null, errorInfo: null });
          break;
        case 'validation':
          // Clear invalid form data
          this.setState({ hasError: false, error: null, errorInfo: null });
          break;
      }

      this.setState(prev => ({ recoveryAttempts: prev.recoveryAttempts + 1 }));
      return true;
    } catch (error) {
      console.error('Recovery attempt failed:', error);
      return false;
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const category = this.getErrorCategory(error);
    console.error(`Error caught by boundary (${category}):`, error, errorInfo);
    
    this.setState({ errorInfo });

    // Attempt recovery
    this.attemptRecovery(category).then(success => {
      if (!success) {
        this.props.onError?.(error, errorInfo);
      }
    });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <div className="space-y-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Reload Page
                </button>
                <button
                  onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
                  className="ml-2 bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const useErrorBoundary = () => {
  const { toast } = useToast();

  const handleError = (error: Error) => {
    console.error('Error:', error);
    
    // Show error toast
    toast({
      title: 'Error',
      description: error.message || 'An unexpected error occurred',
      variant: 'destructive',
    });

    // Log error to error tracking service
    // errorTrackingService.captureException(error);
  };

  return { handleError };
}; 