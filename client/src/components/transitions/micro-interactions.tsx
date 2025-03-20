import React, { ReactNode, useMemo, memo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { 
  getAnimationVariant, 
  transitions,
  staggeredListAnimations
} from './animation-config';

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
}

/**
 * MicroInteraction component adds subtle animations to UI elements
 * Supports different animation types, delays, and durations
 * Now with enhanced performance and accessibility features
 */
export const MicroInteraction = memo<MicroInteractionProps>(({
  children,
  type = 'fade',
  delay = 0,
  duration = 0.3,
  className = '',
  exit = false,
  hover = false,
  layoutId
}) => {
  // Apply reduced motion settings for accessibility
  const shouldReduceMotion = useReducedMotion();
  
  // Get appropriate animation variant based on type
  const animationVariant = useMemo(() => 
    getAnimationVariant(shouldReduceMotion ? 'fade' : type), 
    [type, shouldReduceMotion]
  );
  
  // Configure transition properties
  const transition = useMemo(() => ({
    ...transitions.default,
    duration,
    delay
  }), [duration, delay]);

  // Determine if hover animation should be used
  const hoverProps = useMemo(() => {
    if (!hover || !animationVariant.whileHover) return {};
    return { whileHover: animationVariant.whileHover };
  }, [hover, animationVariant]);

  // Wrap with AnimatePresence if exit animations are enabled
  const content = (
    <motion.div
      initial={animationVariant.initial}
      animate={animationVariant.animate}
      exit={exit ? animationVariant.exit : undefined}
      transition={transition}
      className={className}
      layoutId={layoutId}
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
 */
interface StaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  type?: MicroInteractionType;
  duration?: number;
  className?: string;
  itemClassName?: string;
  exit?: boolean;
}

export const StaggeredList = memo<StaggerProps>(({
  children,
  staggerDelay = 0.1,
  type = 'fade',
  duration = 0.3,
  className = '',
  itemClassName = '',
  exit = false
}) => {
  const shouldReduceMotion = useReducedMotion();
  
  // Configure stagger transition
  const staggerTransition = useMemo(() => ({
    ...transitions.default,
    duration,
    staggerChildren: shouldReduceMotion ? 0 : staggerDelay
  }), [duration, staggerDelay, shouldReduceMotion]);

  return (
    <motion.div 
      className={className}
      initial="initial"
      animate="animate"
      exit={exit ? "exit" : undefined}
      variants={staggeredListAnimations.container}
      transition={staggerTransition}
    >
      <AnimatePresence mode="wait">
        {React.Children.map(children, (child, index) => (
          <motion.div
            key={index}
            variants={staggeredListAnimations.item}
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