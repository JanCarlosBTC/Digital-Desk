/**
 * Animation Debug Tools
 * 
 * Components and utilities for debugging animations in development
 * Can be used to visualize and fine-tune animation performance
 */
import React, { useState, useEffect, ReactNode } from 'react';
import { usePerformanceMonitor } from './performance-optimizer';
import { transitions, easingFunctions } from './animation-config';

/**
 * Animation Performance Monitor
 * Displays performance metrics useful for debugging animations
 */
export function AnimationPerformanceMonitor() {
  const { performanceMode, fps, animationCount } = usePerformanceMonitor();
  
  // Determine color based on performance
  const fpsColor = (() => {
    if (fps >= 55) return 'text-green-500';
    if (fps >= 40) return 'text-yellow-500';
    if (fps >= 30) return 'text-orange-500';
    return 'text-red-500';
  })();
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 shadow-lg">
      <div className="flex flex-col space-y-1">
        <div className="flex justify-between">
          <span>FPS:</span>
          <span className={fpsColor}>{fps.toFixed(1)}</span>
        </div>
        <div className="flex justify-between">
          <span>Mode:</span>
          <span className="font-bold">{performanceMode}</span>
        </div>
        <div className="flex justify-between">
          <span>Animations:</span>
          <span>{animationCount}</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Animation Tester component
 * Allows testing different animation configurations
 */
interface AnimationTesterProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function AnimationTester({ children, title = 'Animation Tester', className = '' }: AnimationTesterProps) {
  const [animating, setAnimating] = useState(false);
  const [duration, setDuration] = useState(0.3);
  const [delay, setDelay] = useState(0);
  const [selectedEasing, setSelectedEasing] = useState('easeOut');
  const [iterations, setIterations] = useState(1);
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }
  
  const easingOptions = Object.keys(easingFunctions).filter(key => typeof easingFunctions[key as keyof typeof easingFunctions] !== 'function');
  
  // Selected easing function
  const easing = easingFunctions[selectedEasing as keyof typeof easingFunctions];
  
  // Create animation style for child
  const animationStyle = {
    transition: `all ${duration}s ${Array.isArray(easing) ? `cubic-bezier(${easing.join(',')})` : 'ease'} ${delay}s`,
    animation: animating ? `${iterations === Infinity ? 'infinite' : iterations} ${duration}s ${selectedEasing}` : 'none'
  };
  
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-100 p-3 border-b">
        <h3 className="font-medium text-sm">{title}</h3>
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Duration</label>
            <div className="flex items-center">
              <input 
                type="range" 
                min="0.1" 
                max="2" 
                step="0.1" 
                value={duration}
                onChange={e => setDuration(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-xs font-mono">{duration}s</span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Delay</label>
            <div className="flex items-center">
              <input 
                type="range" 
                min="0" 
                max="1" 
                step="0.1" 
                value={delay}
                onChange={e => setDelay(parseFloat(e.target.value))}
                className="w-full"
              />
              <span className="ml-2 text-xs font-mono">{delay}s</span>
            </div>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Easing</label>
            <select 
              value={selectedEasing}
              onChange={e => setSelectedEasing(e.target.value)}
              className="w-full text-xs border rounded px-2 py-1"
            >
              {easingOptions.map(ease => (
                <option key={ease} value={ease}>{ease}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Iterations</label>
            <select 
              value={iterations.toString()}
              onChange={e => setIterations(e.target.value === 'Infinity' ? Infinity : parseInt(e.target.value))}
              className="w-full text-xs border rounded px-2 py-1"
            >
              {[1, 2, 3, 5, 10, 'Infinity'].map(val => (
                <option key={val.toString()} value={val.toString()}>{val.toString()}</option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="mt-3 flex justify-between">
          <button
            onClick={() => setAnimating(!animating)}
            className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            {animating ? 'Stop' : 'Play'}
          </button>
          
          <div className="text-xs text-gray-500 font-mono">
            {`transition: all ${duration}s ${selectedEasing} ${delay}s;`}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div style={animationStyle}>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * Animation Comparison component
 * Allows comparing different animation configurations side by side
 */
interface AnimationComparisonProps {
  children: ReactNode[];
  titles?: string[];
  className?: string;
}

export function AnimationComparison({ 
  children, 
  titles = [], 
  className = '' 
}: AnimationComparisonProps) {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return <>{children}</>;
  }
  
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={`grid grid-cols-1 md:grid-cols-${Math.min(childrenArray.length, 3)} gap-4 ${className}`}>
      {childrenArray.map((child, index) => (
        <AnimationTester
          key={index}
          title={titles[index] || `Animation ${index + 1}`}
        >
          {child}
        </AnimationTester>
      ))}
    </div>
  );
}

/**
 * Animation Timeline visualizer
 * Visual representation of animation sequence and timing
 */
interface AnimationTimelineProps {
  animations: {
    name: string;
    duration: number;
    delay: number;
    easing: keyof typeof easingFunctions;
  }[];
  totalDuration?: number;
  className?: string;
}

export function AnimationTimeline({ 
  animations, 
  totalDuration, 
  className = '' 
}: AnimationTimelineProps) {
  // Calculate total duration if not provided
  const calculatedTotalDuration = totalDuration || animations.reduce(
    (max, anim) => Math.max(max, anim.delay + anim.duration), 
    0
  );
  
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="bg-gray-100 p-3 border-b">
        <h3 className="font-medium text-sm">Animation Timeline</h3>
        <div className="text-xs text-gray-500 mt-1">Total: {calculatedTotalDuration.toFixed(2)}s</div>
      </div>
      
      <div className="p-4">
        <div className="relative h-10 bg-gray-200 rounded overflow-hidden">
          {/* Time markers */}
          {Array.from({ length: Math.ceil(calculatedTotalDuration) + 1 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute top-0 h-full border-l border-gray-400 text-xs text-gray-500"
              style={{ left: `${(i / calculatedTotalDuration) * 100}%` }}
            >
              <span className="absolute top-0 left-1">{i}s</span>
            </div>
          ))}
          
          {/* Animation bars */}
          {animations.map((anim, index) => {
            const startPercent = (anim.delay / calculatedTotalDuration) * 100;
            const widthPercent = (anim.duration / calculatedTotalDuration) * 100;
            
            return (
              <div
                key={index}
                className="absolute h-6 rounded flex items-center justify-center text-xs text-white px-2 overflow-hidden whitespace-nowrap"
                style={{
                  left: `${startPercent}%`,
                  width: `${widthPercent}%`,
                  top: index * 8 + 4,
                  backgroundColor: `hsl(${(index * 60) % 360}, 70%, 50%)`,
                }}
                title={`${anim.name} (${anim.duration}s, delay: ${anim.delay}s, ${anim.easing})`}
              >
                {anim.name}
              </div>
            );
          })}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2">
          {animations.map((anim, index) => (
            <div key={index} className="text-xs flex justify-between">
              <span className="font-medium">{anim.name}:</span>
              <span className="font-mono">
                {anim.duration}s {anim.easing} (delay: {anim.delay}s)
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}