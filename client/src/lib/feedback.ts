import { useCallback, useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export type FeedbackType = 'success' | 'error' | 'warning' | 'info';
export type FeedbackPriority = 'low' | 'normal' | 'high';
export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning';

interface FeedbackItem {
  id: string;
  type: FeedbackType;
  message: string;
  priority: FeedbackPriority;
  timestamp: number;
  duration?: number;
}

interface FeedbackOptions {
  duration?: number;
  priority?: FeedbackPriority;
  onDismiss?: () => void;
}

const DEFAULT_DURATION = 5000;
const PRIORITY_DURATIONS = {
  low: 3000,
  normal: 5000,
  high: 7000,
};

const PRIORITY_ORDER: Record<FeedbackPriority, number> = {
  high: 0,
  normal: 1,
  low: 2,
};

const TYPE_TO_VARIANT: Record<FeedbackType, ToastVariant> = {
  success: 'success',
  error: 'destructive',
  warning: 'warning',
  info: 'default',
};

export const useFeedback = () => {
  const { toast } = useToast();
  const [queue, setQueue] = useState<FeedbackItem[]>([]);
  const timeoutRefs = useRef<Record<string, number>>({});

  const clearTimeout = useCallback((id: string) => {
    if (timeoutRefs.current[id]) {
      window.clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
  }, []);

  const showToast = useCallback(
    (item: FeedbackItem) => {
      const duration = item.duration || PRIORITY_DURATIONS[item.priority];
      toast({
        title: item.type.charAt(0).toUpperCase() + item.type.slice(1),
        description: item.message,
        variant: TYPE_TO_VARIANT[item.type],
        duration,
      });

      if (duration > 0) {
        timeoutRefs.current[item.id] = window.setTimeout(() => {
          dismissFeedback(item.id);
        }, duration);
      }
    },
    [toast]
  );

  const dismissFeedback = useCallback(
    (id: string) => {
      clearTimeout(id);
      setQueue((prev) => prev.filter((item) => item.id !== id));
    },
    [clearTimeout]
  );

  const addFeedback = useCallback(
    (
      type: FeedbackType,
      message: string,
      { duration = DEFAULT_DURATION, priority = 'normal', onDismiss }: FeedbackOptions = {}
    ) => {
      const id = Math.random().toString(36).substr(2, 9);
      const item: FeedbackItem = {
        id,
        type,
        message,
        priority,
        timestamp: Date.now(),
        duration,
      };

      setQueue((prev) => {
        const newQueue = [...prev, item].sort(
          (a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        );
        return newQueue;
      });

      if (onDismiss) {
        const originalDismiss = onDismiss;
        onDismiss = () => {
          originalDismiss();
          dismissFeedback(id);
        };
      }

      showToast(item);
    },
    [showToast, dismissFeedback]
  );

  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach((timeout) => {
        window.clearTimeout(timeout);
      });
    };
  }, []);

  return {
    addFeedback,
    dismissFeedback,
    queue,
  };
};

// Example usage:
// const { success, error } = useFeedback();
// success({ description: 'Operation completed successfully' });
// error({ description: 'Something went wrong' }); 