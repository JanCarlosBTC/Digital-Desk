/**
 * AnimatedButton Component
 * 
 * An enhanced button component with sophisticated animation effects
 * Includes accessibility features and optimized performance
 */
import React, { forwardRef, memo, ComponentPropsWithRef, ElementType } from 'react';
import { motion, useReducedMotion, MotionProps } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { buttonAnimations, easingFunctions, transitions } from '@/components/transitions/animation-config';
import { Slot, SlotProps } from '@radix-ui/react-slot';
import { useOptimizedAnimation, PERFORMANCE_CONSTANTS } from '@/components/transitions/performance-optimizer';

// Define animation presets for buttons
export const BUTTON_ANIMATION_PRESETS = {
  DEFAULT: 'default',
  SCALE: 'scale',
  PULSE: 'pulse',
  BOUNCE: 'bounce',
  SLIDE: 'slide',
  NONE: 'none'
} as const;

export type ButtonAnimationPreset = typeof BUTTON_ANIMATION_PRESETS[keyof typeof BUTTON_ANIMATION_PRESETS];

// Type for props specific to the AnimatedButton component
interface AnimatedButtonProps {
  animationPreset?: ButtonAnimationPreset;
  animationDelay?: number;
  animationDuration?: number;
  animationIntensity?: 'subtle' | 'medium' | 'strong';
  asChild?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' |
    'thinkingDesk' | 'thinkingDeskOutline' |
    'personalClarity' | 'personalClarityOutline' |
    'decisionLog' | 'decisionLogOutline' |
    'offerVault' | 'offerVaultOutline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  loadingText?: string;
  priority?: number;
  disableOptimization?: boolean;
}

// Combine the AnimatedButton props with HTML button props
export type CombinedButtonProps = AnimatedButtonProps & 
  Omit<ComponentPropsWithRef<'button'>, keyof AnimatedButtonProps>;

// Motion configuration for each animation preset
const ANIMATION_CONFIGS = {
  [BUTTON_ANIMATION_PRESETS.DEFAULT]: {
    initial: {},
    animate: {},
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 }
  },
  [BUTTON_ANIMATION_PRESETS.SCALE]: {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { scale: 1.1 },
    whileTap: { scale: 0.9 }
  },
  [BUTTON_ANIMATION_PRESETS.PULSE]: {
    initial: { scale: 1 },
    animate: { scale: 1 },
    whileHover: { 
      scale: [1, 1.05, 1], 
      transition: { 
        repeat: Infinity, 
        repeatType: 'reverse', 
        duration: 1 
      } 
    },
    whileTap: { scale: 0.95 }
  },
  [BUTTON_ANIMATION_PRESETS.BOUNCE]: {
    initial: { y: 0 },
    animate: { y: 0 },
    whileHover: { 
      y: [0, -5, 0], 
      transition: { 
        repeat: Infinity, 
        repeatType: 'reverse', 
        duration: 0.8, 
        ease: easingFunctions.gentleBounce 
      } 
    },
    whileTap: { y: 5, scale: 0.95 }
  },
  [BUTTON_ANIMATION_PRESETS.SLIDE]: {
    initial: { x: 0 },
    animate: { x: 0 },
    whileHover: { x: 5 },
    whileTap: { x: -2 }
  },
  [BUTTON_ANIMATION_PRESETS.NONE]: {
    initial: {},
    animate: {},
    whileHover: {},
    whileTap: {}
  }
} as const;

// Intensity modifiers for animation effects
const INTENSITY_MODIFIERS = {
  subtle: 0.7,
  medium: 1,
  strong: 1.5
} as const;

// Use a normal function component to fix type issues with forwardRef and memo
function AnimatedButtonBase({
  animationPreset = BUTTON_ANIMATION_PRESETS.DEFAULT,
  animationDelay = 0,
  animationDuration = 0.3,
  animationIntensity = 'medium',
  className,
  children,
  variant = 'default',
  size = 'default',
  asChild = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  isLoading = false,
  loadingText,
  priority = PERFORMANCE_CONSTANTS.PRIORITY.HIGH, // Buttons are high priority
  disableOptimization = false,
  ...props
}: CombinedButtonProps, 
  ref: React.ForwardedRef<HTMLButtonElement>
) {
  // Get optimized animation properties based on performance
  const { 
    shouldAnimate, 
    optimizedDuration,
    simplifyAnimation 
  } = useOptimizedAnimation('animated-button', priority);
  
  // Check user's motion preferences
  const shouldReduceMotion = useReducedMotion();
  
  // Select appropriate animation configuration
  // Skip animations based on various conditions
  const skipAnimation = (!shouldAnimate && !disableOptimization) || 
                        shouldReduceMotion || 
                        disabled || 
                        isLoading;
                        
  // Use NONE preset if animations should be skipped                     
  const effectivePreset = skipAnimation
    ? BUTTON_ANIMATION_PRESETS.NONE 
    : (simplifyAnimation && animationPreset !== BUTTON_ANIMATION_PRESETS.NONE
        ? BUTTON_ANIMATION_PRESETS.DEFAULT // Use simpler animations when needed
        : animationPreset);
  
  // Get the animation config for the selected preset
  const animationConfig = ANIMATION_CONFIGS[effectivePreset];
  
  // Apply intensity modifiers to the animation values
  const intensityModifier = INTENSITY_MODIFIERS[animationIntensity];
  
  // Create modified animation config with intensity adjustments
  const getModifiedValue = (value: any): any => {
    if (typeof value === 'number') {
      // For number values (like scale, x, y), modify by intensity
      const baseValue = value > 1 ? value - 1 : value < 1 ? value : 0;
      return value === 0 ? 0 : (baseValue * intensityModifier) + (value >= 1 ? 1 : 0);
    } else if (Array.isArray(value) && value.every(v => typeof v === 'number')) {
      // For arrays of numbers (like animation sequences)
      return value.map(v => getModifiedValue(v));
    } else if (typeof value === 'object' && value !== null) {
      // For nested objects (like transition configs)
      const newObj: Record<string, any> = {};
      Object.entries(value).forEach(([k, v]) => {
        newObj[k] = getModifiedValue(v);
      });
      return newObj;
    }
    // For other values (like strings), return as is
    return value;
  };
  
  // Create intensity-adjusted animation config
  const intensityAdjustedConfig = {
    whileHover: Object.entries(animationConfig.whileHover || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: getModifiedValue(value)
      }),
      {} as Record<string, any>
    ),
    whileTap: Object.entries(animationConfig.whileTap || {}).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: getModifiedValue(value)
      }),
      {} as Record<string, any>
    )
  };
  
  // Apply performance optimizations to duration
  const effectiveDuration = skipAnimation ? 0 : animationDuration * optimizedDuration;
  
  // Base transition configuration
  const transitionConfig = {
    ...transitions.default,
    duration: effectiveDuration,
    delay: animationDelay
  };
  
  // Create loading spinner/text content
  const renderContent = () => {
    if (isLoading) {
      return (
        <>
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {loadingText || children}
        </>
      );
    }
    
    if (icon && iconPosition === 'left') {
      return (
        <>
          <span className="mr-2">{icon}</span>
          {children}
        </>
      );
    }
    
    if (icon && iconPosition === 'right') {
      return (
        <>
          {children}
          <span className="ml-2">{icon}</span>
        </>
      );
    }
    
    return children;
  };
  
  // If animations should be skipped completely, render without motion
  if (skipAnimation) {
    return (
      <Button
        ref={ref}
        className={className}
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        {...props}
      >
        <span className="flex items-center justify-center">
          {renderContent()}
        </span>
      </Button>
    );
  }
  
  // Create motion props when animations should be used
  const motionProps: MotionProps = {
    initial: animationConfig.initial,
    animate: animationConfig.animate,
    whileHover: intensityAdjustedConfig.whileHover,
    whileTap: intensityAdjustedConfig.whileTap,
    transition: transitionConfig
  };
  
  // When using asChild with Slot, we need to use a different approach
  if (asChild) {
    return (
      <motion.div 
        {...motionProps}
        className={cn(className)}
      >
        <Button
          ref={ref}
          variant={variant}
          size={size}
          disabled={disabled || isLoading}
          className="w-full h-full"
          {...props}
        >
          <span className="flex items-center justify-center">
            {renderContent()}
          </span>
        </Button>
      </motion.div>
    );
  }

  // Standard implementation
  return (
    <Button
      ref={ref}
      className={cn(className)}
      variant={variant}
      size={size}
      disabled={disabled || isLoading}
      asChild
      {...props}
    >
      <motion.span
        {...motionProps}
        className="flex items-center justify-center w-full h-full"
      >
        {renderContent()}
      </motion.span>
    </Button>
  );
}

/**
 * An enhanced animated Button component
 * Features sophisticated animations and accessibility considerations
 * Includes performance optimizations
 */
export const AnimatedButton = memo(forwardRef<HTMLButtonElement, CombinedButtonProps>(AnimatedButtonBase));

AnimatedButton.displayName = 'AnimatedButton';