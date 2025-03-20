/**
 * Intersection Observer Component
 * 
 * This component provides animation effects triggered by intersection with the viewport
 * Ideal for scroll-triggered animations and performance optimization
 */
import React, { ReactNode, useRef, useEffect, useState, memo } from 'react';
import { motion, useAnimation, AnimationControls } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { getAnimationVariant, transitions } from './animation-config';
import { MicroInteractionType } from './micro-interactions';

// Define the threshold options for intersection observer
type ThresholdValue = number | number[];

// Props for the IntersectionObserver component
interface IntersectionAnimationProps {
  children: ReactNode;
  type?: MicroInteractionType;
  threshold?: ThresholdValue;
  rootMargin?: string;
  triggerOnce?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
  id?: string;
  skipAnimation?: boolean;
}

/**
 * IntersectionAnimation component that triggers animations when element enters viewport
 * Includes performance optimizations and accessibility support
 */
export const IntersectionAnimation = memo<IntersectionAnimationProps>(({
  children,
  type = 'fade',
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = false,
  delay = 0,
  duration = 0.5,
  className = '',
  id,
  skipAnimation = false
}) => {
  // Create refs and animation controls
  const controls = useAnimation();
  const ref = useRef<HTMLDivElement>(null);
  const [hasTriggered, setHasTriggered] = useState(false);
  const shouldReduceMotion = useReducedMotion();
  
  // Get the appropriate animation variant
  const animationVariant = getAnimationVariant(shouldReduceMotion || skipAnimation ? 'none' : type);
  
  // Configure animation transition settings
  const transitionConfig = {
    ...transitions.default,
    duration,
    delay
  };

  useEffect(() => {
    // Skip setting up observer if animation should be skipped
    if (skipAnimation || shouldReduceMotion) {
      controls.start(animationVariant.animate);
      return;
    }

    // If element has already been triggered and triggerOnce is true, skip
    if (hasTriggered && triggerOnce) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            controls.start(animationVariant.animate);
            setHasTriggered(true);
            
            // Unobserve if triggerOnce is true
            if (triggerOnce && ref.current) {
              observer.unobserve(ref.current);
            }
          } else if (!triggerOnce) {
            controls.start(animationVariant.initial);
          }
        });
      },
      { threshold, rootMargin }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [
    controls, 
    hasTriggered, 
    triggerOnce, 
    threshold, 
    rootMargin, 
    animationVariant, 
    skipAnimation,
    shouldReduceMotion
  ]);

  return (
    <motion.div
      ref={ref}
      initial={animationVariant.initial}
      animate={controls}
      transition={transitionConfig}
      className={className}
      id={id}
    >
      {children}
    </motion.div>
  );
});

IntersectionAnimation.displayName = 'IntersectionAnimation';

/**
 * Staggered animation with intersection observer for lists of items
 * Each child will animate with a delay after entering the viewport
 */
interface IntersectionStaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  type?: MicroInteractionType;
  duration?: number;
  threshold?: ThresholdValue;
  rootMargin?: string;
  triggerOnce?: boolean;
  className?: string;
  itemClassName?: string;
}

export const IntersectionStagger = memo<IntersectionStaggerProps>(({
  children,
  staggerDelay = 0.1,
  type = 'fade',
  duration = 0.3,
  threshold = 0.1,
  rootMargin = '0px',
  triggerOnce = true,
  className = '',
  itemClassName = ''
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <IntersectionAnimation
          key={index}
          type={type}
          delay={index * staggerDelay}
          duration={duration}
          threshold={threshold}
          rootMargin={rootMargin}
          triggerOnce={triggerOnce}
          className={itemClassName}
        >
          {child}
        </IntersectionAnimation>
      ))}
    </div>
  );
});

IntersectionStagger.displayName = 'IntersectionStagger';