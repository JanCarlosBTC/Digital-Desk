/**
 * Animation Presets
 * Ready-to-use animation components with predefined configurations
 */
import React, { ReactNode, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MicroInteraction } from './micro-interactions';
import { IntersectionAnimation } from './intersection-observer';
import { PageTransition } from './simple-page-transition';
import { AnimatedCard } from '../ui/animated-card';
import { AnimatedButton } from '../ui/animated-button';
import { createCustomVariant } from './animation-config';

/**
 * FadeIn - Simple fade-in animation with optional delay
 */
interface FadeInProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export const FadeIn = memo<FadeInProps>(({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}) => (
  <MicroInteraction
    type="fade"
    delay={delay}
    duration={duration}
    className={className}
  >
    {children}
  </MicroInteraction>
));

FadeIn.displayName = 'FadeIn';

/**
 * SlideInFromLeft - Slide in from left with fade
 */
export const SlideInFromLeft = memo<FadeInProps>(({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}) => (
  <MicroInteraction
    type="slide-right"
    delay={delay}
    duration={duration}
    className={className}
  >
    {children}
  </MicroInteraction>
));

SlideInFromLeft.displayName = 'SlideInFromLeft';

/**
 * SlideInFromRight - Slide in from right with fade
 */
export const SlideInFromRight = memo<FadeInProps>(({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}) => (
  <MicroInteraction
    type="slide-left"
    delay={delay}
    duration={duration}
    className={className}
  >
    {children}
  </MicroInteraction>
));

SlideInFromRight.displayName = 'SlideInFromRight';

/**
 * SlideInFromBottom - Slide in from bottom with fade
 */
export const SlideInFromBottom = memo<FadeInProps>(({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}) => (
  <MicroInteraction
    type="slide-up"
    delay={delay}
    duration={duration}
    className={className}
  >
    {children}
  </MicroInteraction>
));

SlideInFromBottom.displayName = 'SlideInFromBottom';

/**
 * ScaleIn - Scale and fade in animation
 */
export const ScaleIn = memo<FadeInProps>(({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}) => (
  <MicroInteraction
    type="scale"
    delay={delay}
    duration={duration}
    className={className}
  >
    {children}
  </MicroInteraction>
));

ScaleIn.displayName = 'ScaleIn';

/**
 * PopIn - Pop in animation with more dramatic scale
 */
export const PopIn = memo<FadeInProps>(({
  children,
  delay = 0,
  duration = 0.5,
  className = ''
}) => (
  <MicroInteraction
    type="pop"
    delay={delay}
    duration={duration}
    className={className}
  >
    {children}
  </MicroInteraction>
));

PopIn.displayName = 'PopIn';

/**
 * ScrollReveal - Reveals content when scrolled into view
 */
interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  threshold?: number;
  triggerOnce?: boolean;
  className?: string;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'pop';
}

export const ScrollReveal = memo<ScrollRevealProps>(({
  children,
  delay = 0,
  threshold = 0.1,
  triggerOnce = true,
  className = '',
  animation = 'fade'
}) => (
  <IntersectionAnimation
    type={animation}
    delay={delay}
    threshold={threshold}
    triggerOnce={triggerOnce}
    className={className}
  >
    {children}
  </IntersectionAnimation>
));

ScrollReveal.displayName = 'ScrollReveal';

/**
 * StaggeredItems - Container for staggered animation of children
 */
interface StaggeredItemsProps {
  children: ReactNode[];
  staggerDelay?: number;
  initialDelay?: number;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'pop';
  className?: string;
  itemClassName?: string;
}

export const StaggeredItems = memo<StaggeredItemsProps>(({
  children,
  staggerDelay = 0.1,
  initialDelay = 0,
  animation = 'fade',
  className = '',
  itemClassName = ''
}) => {
  // Create array of children with staggered delays
  const staggeredChildren = React.Children.map(children, (child, index) => {
    const delay = initialDelay + (index * staggerDelay);
    
    return (
      <MicroInteraction
        type={animation}
        delay={delay}
        className={itemClassName}
      >
        {child}
      </MicroInteraction>
    );
  });
  
  return (
    <div className={className}>
      {staggeredChildren}
    </div>
  );
});

StaggeredItems.displayName = 'StaggeredItems';

/**
 * AnimatedTransition - Page transition with various animation types
 */
interface AnimatedTransitionProps {
  children: ReactNode;
  type?: 'fade' | 'slide-horizontal' | 'slide-vertical' | 'scale' | 'flip' | 'none';
  delay?: number;
  duration?: number;
}

export const AnimatedTransition = memo<AnimatedTransitionProps>(({
  children,
  type = 'fade',
  delay = 0,
  duration = 0.3
}) => (
  <PageTransition
    type={type}
    delay={delay}
    duration={duration}
  >
    {children}
  </PageTransition>
));

AnimatedTransition.displayName = 'AnimatedTransition';

/**
 * AnimatedList - Animated list component with item animations
 */
interface AnimatedListProps {
  items: any[];
  renderItem: (item: any, index: number) => ReactNode;
  keyExtractor: (item: any, index: number) => string | number;
  animation?: 'fade' | 'slide-up' | 'slide-left' | 'slide-right' | 'scale' | 'pop';
  staggerDelay?: number;
  className?: string;
  itemClassName?: string;
  loading?: boolean;
  loadingFallback?: ReactNode;
  emptyMessage?: string;
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
}

export const AnimatedList = memo<AnimatedListProps>(({
  items,
  renderItem,
  keyExtractor,
  animation = 'fade',
  staggerDelay = 0.05,
  className = '',
  itemClassName = '',
  loading = false,
  loadingFallback,
  emptyMessage = 'No items to display',
  onScroll
}) => {
  // Show loading state if required
  if (loading) {
    return loadingFallback || (
      <div className="flex items-center justify-center p-8">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }
  
  // Show empty state message if no items
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }
  
  // Render items with staggered animation
  return (
    <div className={className} onScroll={onScroll}>
      <AnimatePresence>
        {items.map((item, index) => (
          <MicroInteraction
            key={keyExtractor(item, index)}
            type={animation}
            delay={index * staggerDelay}
            className={itemClassName}
          >
            {renderItem(item, index)}
          </MicroInteraction>
        ))}
      </AnimatePresence>
    </div>
  );
});

AnimatedList.displayName = 'AnimatedList';

/**
 * FadeInOut - Fades content in and out when the show prop changes
 */
interface FadeInOutProps {
  children: ReactNode;
  show: boolean;
  duration?: number;
  className?: string;
}

export const FadeInOut = memo<FadeInOutProps>(({
  children,
  show,
  duration = 0.3,
  className = ''
}) => (
  <AnimatePresence mode="wait">
    {show && (
      <motion.div
        key="content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration }}
        className={className}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
));

FadeInOut.displayName = 'FadeInOut';

/**
 * AnimatedCardPreset - Pre-configured animated card with common options
 */
interface AnimatedCardPresetProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
  animateOnScroll?: boolean;
  animateOnHover?: boolean;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost';
  delay?: number;
}

export const AnimatedCardPreset = memo<AnimatedCardPresetProps>(({
  title,
  description,
  children,
  footer,
  className,
  onClick,
  animateOnScroll = false,
  animateOnHover = true,
  variant = 'default',
  delay = 0
}) => (
  <AnimatedCard
    title={title}
    description={description}
    footer={footer}
    className={className}
    onClick={onClick}
    trigger={animateOnScroll ? 'scroll' : (animateOnHover ? 'hover' : 'auto')}
    variant={variant}
    delay={delay}
  >
    {children}
  </AnimatedCard>
));

AnimatedCardPreset.displayName = 'AnimatedCardPreset';

/**
 * AnimatedButtonPreset - Pre-configured animated button with common options
 */
interface AnimatedButtonPresetProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  disabled?: boolean;
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  animationPreset?: 'default' | 'scale' | 'pulse' | 'bounce' | 'slide' | 'none';
}

export const AnimatedButtonPreset = memo<AnimatedButtonPresetProps>(({
  children,
  onClick,
  variant = 'default',
  size = 'default',
  disabled = false,
  isLoading = false,
  loadingText,
  icon,
  iconPosition = 'left',
  className,
  animationPreset = 'default'
}) => (
  <AnimatedButton
    onClick={onClick}
    variant={variant}
    size={size}
    disabled={disabled}
    isLoading={isLoading}
    loadingText={loadingText}
    icon={icon}
    iconPosition={iconPosition}
    className={className}
    animationPreset={animationPreset}
  >
    {children}
  </AnimatedButton>
));

AnimatedButtonPreset.displayName = 'AnimatedButtonPreset';

/**
 * ExpandCollapse - Animated expand/collapse component
 */
interface ExpandCollapseProps {
  children: ReactNode;
  isExpanded: boolean;
  className?: string;
  duration?: number;
}

export const ExpandCollapse = memo<ExpandCollapseProps>(({
  children,
  isExpanded,
  className = '',
  duration = 0.3
}) => (
  <AnimatePresence initial={false}>
    {isExpanded && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration }}
        className={cn('overflow-hidden', className)}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
));

ExpandCollapse.displayName = 'ExpandCollapse';

/**
 * Helper function to combine className strings
 */
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}