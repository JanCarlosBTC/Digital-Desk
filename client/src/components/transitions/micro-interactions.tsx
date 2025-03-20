import React, { ReactNode } from 'react';
import { motion, MotionProps, Variant } from 'framer-motion';

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

interface MicroInteractionProps extends MotionProps {
  children: ReactNode;
  type?: MicroInteractionType;
  delay?: number;
  duration?: number;
  className?: string;
  hover?: boolean;
  whileInView?: boolean;
}

// Collection of animation variants for different micro-interactions
const variants: Record<MicroInteractionType, { 
  initial: Variant, 
  animate: Variant, 
  exit?: Variant,
  whileHover?: Variant
}> = {
  'fade': {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  },
  'slide-up': {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  },
  'slide-down': {
    initial: { opacity: 0, y: -20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
  },
  'slide-left': {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  },
  'slide-right': {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  },
  'scale': {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
    whileHover: { scale: 1.05 }
  },
  'pop': {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 500 } },
    exit: { opacity: 0, scale: 0.5 },
    whileHover: { scale: 1.1, transition: { type: 'spring', stiffness: 400 } }
  },
  'none': {
    initial: {},
    animate: {}
  }
};

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
  hover = false,
  whileInView = false,
  ...props
}) => {
  // Get the selected animation variant
  const selectedVariant = variants[type];
  
  // Default transition configuration
  const transition = {
    duration,
    delay,
    ease: 'easeOut'
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={selectedVariant}
      transition={transition}
      className={className}
      whileHover={hover ? selectedVariant.whileHover : undefined}
      viewport={whileInView ? { once: true, amount: 0.3 } : undefined}
      {...props}
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