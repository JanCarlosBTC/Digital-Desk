import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

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
}

/**
 * MicroInteraction component adds subtle animations to UI elements
 * Supports different animation types, delays, and durations
 */
export const MicroInteraction: React.FC<MicroInteractionProps> = ({
  children,
  type = 'fade',
  delay = 0,
  duration = 0.3,
  className = '',
}) => {
  // Define animation properties based on type
  let initial = {};
  let animate = {};
  let exit = {};
  
  // Set animation properties based on the animation type
  switch (type) {
    case 'fade':
      initial = { opacity: 0 };
      animate = { opacity: 1 };
      exit = { opacity: 0 };
      break;
    case 'slide-up':
      initial = { opacity: 0, y: 20 };
      animate = { opacity: 1, y: 0 };
      exit = { opacity: 0, y: -20 };
      break;
    case 'slide-down':
      initial = { opacity: 0, y: -20 };
      animate = { opacity: 1, y: 0 };
      exit = { opacity: 0, y: 20 };
      break;
    case 'slide-left':
      initial = { opacity: 0, x: 20 };
      animate = { opacity: 1, x: 0 };
      exit = { opacity: 0, x: -20 };
      break;
    case 'slide-right':
      initial = { opacity: 0, x: -20 };
      animate = { opacity: 1, x: 0 };
      exit = { opacity: 0, x: 20 };
      break;
    case 'scale':
      initial = { opacity: 0, scale: 0.8 };
      animate = { opacity: 1, scale: 1 };
      exit = { opacity: 0, scale: 0.8 };
      break;
    case 'pop':
      initial = { opacity: 0, scale: 0.5 };
      animate = { opacity: 1, scale: 1 };
      exit = { opacity: 0, scale: 0.5 };
      break;
    default:
      // No animation for 'none' type
      break;
  }
  
  // Default transition configuration
  const transition = {
    duration,
    delay,
    ease: 'easeOut'
  };

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// Element-specific micro-interactions for common UI elements
export const FadeIn: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="fade" {...props} />
);

export const SlideUp: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="slide-up" {...props} />
);

export const SlideDown: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="slide-down" {...props} />
);

export const SlideLeft: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="slide-left" {...props} />
);

export const SlideRight: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="slide-right" {...props} />
);

export const ScaleIn: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="scale" {...props} />
);

export const PopIn: React.FC<Omit<MicroInteractionProps, 'type'>> = (props) => (
  <MicroInteraction type="pop" {...props} />
);

/**
 * Staggered animation for lists of items
 * Each child will animate with a slight delay after the previous one
 */
interface StaggerProps {
  children: ReactNode[];
  staggerDelay?: number;
  type?: MicroInteractionType;
  duration?: number;
  className?: string;
  itemClassName?: string;
}

export const StaggeredList: React.FC<StaggerProps> = ({
  children,
  staggerDelay = 0.1,
  type = 'fade',
  duration = 0.3,
  className = '',
  itemClassName = ''
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <MicroInteraction
          type={type}
          delay={index * staggerDelay}
          duration={duration}
          className={itemClassName}
          key={index}
        >
          {child}
        </MicroInteraction>
      ))}
    </div>
  );
};