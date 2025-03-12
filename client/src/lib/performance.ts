import { useCallback, useEffect, useRef } from 'react';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

interface PerformanceThreshold {
  warning: number;
  error: number;
  unit: 'ms' | 'count' | 'percentage';
}

interface PerformanceListener {
  onWarning?: (metric: PerformanceMetric) => void;
  onError?: (metric: PerformanceMetric) => void;
  onMetric?: (metric: PerformanceMetric) => void;
}

const PERFORMANCE_THRESHOLDS: Record<string, PerformanceThreshold> = {
  apiRequest: {
    warning: 1000,
    error: 3000,
    unit: 'ms',
  },
  renderTime: {
    warning: 16,
    error: 100,
    unit: 'ms',
  },
  animation: {
    warning: 16,
    error: 32,
    unit: 'ms',
  },
  dataProcessing: {
    warning: 100,
    error: 500,
    unit: 'ms',
  },
  memoryUsage: {
    warning: 50,
    error: 80,
    unit: 'percentage',
  },
};

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private listeners: Set<PerformanceListener> = new Set();
  private readonly maxMetrics = 1000;

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  addListener(listener: PerformanceListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  trackMetric(name: string, value: number, metadata?: Record<string, unknown>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    const threshold = PERFORMANCE_THRESHOLDS[name];
    if (threshold) {
      if (value >= threshold.error) {
        this.notifyListeners('onError', metric);
      } else if (value >= threshold.warning) {
        this.notifyListeners('onWarning', metric);
      }
    }

    this.notifyListeners('onMetric', metric);
  }

  getMetrics(name?: string): PerformanceMetric[] {
    return name
      ? this.metrics.filter((metric) => metric.name === name)
      : this.metrics;
  }

  getAverage(name: string, timeWindow: number = 60000): number {
    const now = Date.now();
    const recentMetrics = this.metrics.filter(
      (metric) =>
        metric.name === name && metric.timestamp > now - timeWindow
    );

    if (recentMetrics.length === 0) return 0;

    const sum = recentMetrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / recentMetrics.length;
  }

  clearMetrics(name?: string): void {
    if (name) {
      this.metrics = this.metrics.filter((metric) => metric.name !== name);
    } else {
      this.metrics = [];
    }
  }

  private notifyListeners(
    event: keyof PerformanceListener,
    metric: PerformanceMetric
  ): void {
    this.listeners.forEach((listener) => {
      const callback = listener[event];
      if (callback) {
        callback(metric);
      }
    });
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

export const usePerformanceMonitoring = (listener?: PerformanceListener) => {
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (listener) {
      cleanupRef.current = performanceMonitor.addListener(listener);
    }
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, [listener]);

  const trackPerformance = useCallback(
    async <T>(
      name: string,
      fn: () => Promise<T>,
      metadata?: Record<string, unknown>
    ): Promise<T> => {
      const start = performance.now();
      try {
        const result = await fn();
        const duration = performance.now() - start;
        performanceMonitor.trackMetric(name, duration, metadata);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        performanceMonitor.trackMetric(name, duration, {
          ...metadata,
          error: error instanceof Error ? error.message : String(error),
        });
        throw error;
      }
    },
    []
  );

  return {
    trackPerformance,
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getAverage: performanceMonitor.getAverage.bind(performanceMonitor),
    clearMetrics: performanceMonitor.clearMetrics.bind(performanceMonitor),
  };
}; 