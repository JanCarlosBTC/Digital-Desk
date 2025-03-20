import React, { ReactNode, useMemo, memo, useId, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { 
  getAnimationVariant, 
  transitions,
  staggeredListAnimations
} from './animation-config';
import { 
  useOptimizedAnimation, 
  PERFORMANCE_CONSTANTS
} from './performance-optimizer';

// Types of micro-interactions available
export type MicroInteractionType = 
  | 'fade' 
  | 'slide-up' 
  | 'slide-down' 
  | 'slide-left' 
  | 'slide-right'
  | 'scale' 
  | 'pop'
  | 'none';

// Props for the MicroInteraction component
interface MicroInteractionProps {
  children: ReactNode;
  type?: MicroInteractionType;
  delay?: number;
  duration?: number; 
  className?: string;
  exit?: boolean;
  hover?: boolean;
  layoutId?: string;
  priority?: number;
  id?: string;
  disableOptimization?: boolean;
}

/**
 * MicroInteraction component adds subtle animations to UI elements
 * Supports different animation types, delays, and durations
 * Enhanced with performance optimization and accessibility features
 */
export const MicroInteraction = memo<MicroInteractionProps>(({
  children,
  type = 'fade',
  delay = 0,
  duration = 0.3,
  className = '',
  exit = false,
  hover = false,
  layoutId,
  priority = PERFORMANCE_CONSTANTS.PRIORITY.MEDIUM,
  id: externalId,
  disableOptimization = false
}) => {
  // Generate unique ID for this animation
  const generatedId = useId();
  const animationId = externalId || `micro-interaction-${type}-${generatedId}`;
  
  // Get optimized animation properties based on performance
  const { 
    shouldAnimate, 
    optimizedDuration,
    simplifyAnimation 
  } = useOptimizedAnimation(animationId, priority);
  
  // Apply reduced motion settings for accessibility
  const shouldReduceMotion = useReducedMotion();
  
  // Skip animation if performance optimization indicates or reduced motion is preferred
  const skipAnimation = !shouldAnimate && !disableOptimization;
  
  // Get appropriate animation variant based on type with fallbacks for reduced motion
  const effectiveType = useMemo(() => {
    if (shouldReduceMotion) return 'fade';
    if (simplifyAnimation && type !== 'none') return 'fade';
    return type;
  }, [type, shouldReduceMotion, simplifyAnimation]);
  
  // Get animation variant
  const animationVariant = useMemo(() => 
    getAnimationVariant(skipAnimation ? 'none' : effectiveType), 
    [effectiveType, skipAnimation]
  );
  
  // Apply performance optimizations to duration
  const effectiveDuration = useMemo(() => 
    skipAnimation ? 0 : duration * optimizedDuration,
    [duration, optimizedDuration, skipAnimation]
  );
  
  // Configure transition properties
  const transition = useMemo(() => ({
    ...transitions.default,
    duration: effectiveDuration,
    delay
  }), [effectiveDuration, delay]);

  // Determine if hover animation should be used
  const hoverProps = useMemo(() => {
    if (!hover || !animationVariant.whileHover || skipAnimation) return {};
    return { whileHover: animationVariant.whileHover };
  }, [hover, animationVariant, skipAnimation]);

  // Create debounced layout ID for better performance
  const debouncedLayoutId = useCallback(() => layoutId, [layoutId]);

  // If animations are completely disabled, render without motion
  if (skipAnimation && !exit && !hover && !layoutId) {
    return <div className={className}>{children}</div>;
  }

  // Wrap with AnimatePresence if exit animations are enabled
  const content = (
    <motion.div
      initial={skipAnimation ? undefined : animationVariant.initial}
      animate={skipAnimation ? undefined : animationVariant.animate}
      exit={exit && !skipAnimation ? animationVariant.exit : undefined}
      transition={transition}
      className={className}
      layoutId={debouncedLayoutId()}
      {...hoverProps}
    >
      {children}
    </motion.div>
  );

  return exit ? (
    <AnimatePresence mode="wait">
      {content}
    </AnimatePresence>
  ) : content;
});

MicroInteraction.displayName = 'MicroInteraction';

// Element-specific micro-interactions for common UI elements - memoized for performance
export const FadeIn = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="fade" {...props} />
));
FadeIn.displayName = 'FadeIn';

export const SlideUp = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="slide-up" {...props} />
));
SlideUp.displayName = 'SlideUp';

export const SlideDown = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="slide-down" {...props} />
));
SlideDown.displayName = 'SlideDown';

export const SlideLeft = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="slide-left" {...props} />
));
SlideLeft.displayName = 'SlideLeft';

export const SlideRight = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="slide-right" {...props} />
));
SlideRight.displayName = 'SlideRight';

export const ScaleIn = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="scale" {...props} />
));
ScaleIn.displayName = 'ScaleIn';

export const PopIn = memo<Omit<MicroInteractionProps, 'type'>>((props) => (
  <MicroInteraction type="pop" {...props} />
));
PopIn.displayName = 'PopIn';

/**
 * Staggered animation for lists of items
 * Each child will animate with a slight delay after the previous one
 * Enhanced with AnimatePresence for smooth animations when items are added/removed
 * Now with performance optimization
 */
interface StaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  type?: MicroInteractionType;
  duration?: number;
  className?: string;
  itemClassName?: string;
  exit?: boolean;
  priority?: number;
  id?: string;
}

export const StaggeredList = memo<StaggerProps>(({
  children,
  staggerDelay = 0.1,
  type = 'fade',
  duration = 0.3,
  className = '',
  itemClassName = '',
  exit = false,
  priority = PERFORMANCE_CONSTANTS.PRIORITY.MEDIUM,
  id: externalId
}) => {
  // Generate unique ID for this animation
  const generatedId = useId();
  const animationId = externalId || `staggered-list-${generatedId}`;
  
  // Get optimized animation properties
  const { 
    shouldAnimate, 
    optimizedDuration,
    simplifyAnimation 
  } = useOptimizedAnimation(animationId, priority);
  
  const shouldReduceMotion = useReducedMotion();
  
  // Skip animation if performance optimization indicates
  const skipAnimation = !shouldAnimate;
  
  // Determine effective stagger delay based on performance
  const effectiveStaggerDelay = useMemo(() => {
    if (shouldReduceMotion || skipAnimation) return 0;
    if (simplifyAnimation) return staggerDelay / 2; // Reduce stagger delay for performance
    return staggerDelay;
  }, [staggerDelay, shouldReduceMotion, skipAnimation, simplifyAnimation]);
  
  // Apply performance optimizations to duration
  const effectiveDuration = useMemo(() => 
    skipAnimation ? 0 : duration * optimizedDuration,
    [duration, optimizedDuration, skipAnimation]
  );
  
  // Configure stagger transition
  const staggerTransition = useMemo(() => ({
    ...transitions.default,
    duration: effectiveDuration,
    staggerChildren: effectiveStaggerDelay,
    // For large lists, optimize by staggering in groups
    ...(children.length > 10 && !skipAnimation ? { 
      staggerChildren: effectiveStaggerDelay / 2,
      delayChildren: 0 
    } : {})
  }), [effectiveDuration, effectiveStaggerDelay, children.length, skipAnimation]);

  // For very large lists or when animations should be skipped, render without animation
  if (skipAnimation || children.length > 50) {
    return (
      <div className={className}>
        {React.Children.map(children, (child, index) => (
          <div key={index} className={itemClassName}>
            {child}
          </div>
        ))}
      </div>
    );
  }

  // Use optimized animations for different list sizes
  const variants = useMemo(() => {
    if (children.length > 20) {
      return staggeredListAnimations.quickContainer;
    }
    return staggeredListAnimations.container;
  }, [children.length]);

  const itemVariants = useMemo(() => {
    if (simplifyAnimation || children.length > 20) {
      return staggeredListAnimations.quickItem;
    }
    return staggeredListAnimations.item;
  }, [children.length, simplifyAnimation]);

  return (
    <motion.div 
      className={className}
      initial="initial"
      animate="animate"
      exit={exit ? "exit" : undefined}
      variants={variants}
      transition={staggerTransition}
    >
      <AnimatePresence mode="wait">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={itemVariants}
            className={itemClassName}
          >
            {child}
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
});

StaggeredList.displayName = 'StaggeredList';