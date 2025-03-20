/**
 * AnimatedCard Component
 * 
 * An enhanced card component with sophisticated animation effects
 * Combines ShadCN card with Framer Motion animations
 */
import React, { forwardRef, memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { cardAnimations, transitions } from '@/components/transitions/animation-config';
import { IntersectionAnimation } from '@/components/transitions/intersection-observer';

// Animation trigger options
export type AnimationTrigger = 'hover' | 'scroll' | 'auto' | 'none';

// Card parts to animate
export type AnimatedCardPart = 'header' | 'content' | 'footer' | 'all';

// Props for the AnimatedCard component
export interface AnimatedCardProps {
  children?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  trigger?: AnimationTrigger;
  animate?: AnimatedCardPart;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  layoutId?: string;
  onClick?: () => void;
}

/**
 * AnimatedCard component built on ShadCN's Card with Framer Motion animations
 * Features scroll-triggered animations and hover effects
 */
export const AnimatedCard = memo(forwardRef<HTMLDivElement, AnimatedCardProps>(({
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
  title,
  description,
  footer,
  trigger = 'auto',
  animate = 'all',
  delay = 0,
  threshold = 0.2,
  triggerOnce = true,
  variant = 'default',
  layoutId,
  onClick
}, ref) => {
  // Check for reduced motion preference
  const shouldReduceMotion = useReducedMotion();
  
  // Determine if we should use hover animations
  const useHoverAnimation = trigger === 'hover' && !shouldReduceMotion;
  
  // Determine if we should use scroll triggered animations
  const useScrollAnimation = trigger === 'scroll' && !shouldReduceMotion;
  
  // Determine if we should use auto animations (on mount)
  const useAutoAnimation = trigger === 'auto' && !shouldReduceMotion;
  
  // Base styles for card
  const cardStyles = cn(
    {
      'cursor-pointer': !!onClick,
      'shadow-lg': variant === 'default',
      'bg-secondary': variant === 'secondary',
      'border-2': variant === 'outline',
      'bg-transparent border-0 shadow-none': variant === 'ghost'
    },
    className
  );
  
  // Transition configuration
  const transitionConfig = {
    ...transitions.default,
    delay
  };
  
  // Prepare the card with different animation strategies
  let CardComponent: any = Card;
  
  // If using scroll trigger, wrap card with IntersectionAnimation
  if (useScrollAnimation) {
    return (
      <IntersectionAnimation
        threshold={threshold}
        triggerOnce={triggerOnce}
        delay={delay}
        duration={0.5}
        className={cn('w-full', cardStyles)}
      >
        <Card
          ref={ref}
          className={cn('w-full', onClick && 'cursor-pointer')}
          onClick={onClick}
        >
          {renderCardContent()}
        </Card>
      </IntersectionAnimation>
    );
  }
  
  // If using hover or auto animations, use motion.div wrapper
  if (useHoverAnimation || useAutoAnimation) {
    CardComponent = motion(Card);
  }
  
  // Helper to render the card's inner content
  function renderCardContent() {
    return (
      <>
        {(title || description) && (
          <CardHeader className={headerClassName}>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        
        {children && (
          <CardContent className={contentClassName}>
            {children}
          </CardContent>
        )}
        
        {footer && (
          <CardFooter className={footerClassName}>
            {footer}
          </CardFooter>
        )}
      </>
    );
  }
  
  // If using hover or auto animations
  if (useHoverAnimation || useAutoAnimation) {
    // Initial animation state
    const initial = useAutoAnimation ? cardAnimations.initial : undefined;
    
    // Animation properties for different card parts
    const animateAll = useAutoAnimation 
      ? cardAnimations.animate 
      : undefined;
      
    // Hover animation effects
    const hoverAnimation = useHoverAnimation 
      ? cardAnimations.whileHover 
      : undefined;
      
    return (
      <CardComponent
        ref={ref}
        layoutId={layoutId}
        className={cardStyles}
        initial={initial}
        animate={animateAll}
        whileHover={hoverAnimation}
        transition={transitionConfig}
        onClick={onClick}
      >
        {renderCardContent()}
      </CardComponent>
    );
  }
  
  // Default rendering without animations
  return (
    <Card
      ref={ref}
      className={cardStyles}
      onClick={onClick}
    >
      {renderCardContent()}
    </Card>
  );
}));

AnimatedCard.displayName = 'AnimatedCard';