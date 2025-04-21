import React, { ReactNode } from 'react';
import { PLAN_FEATURES, Plan } from '@/services/subscription-service';

interface PlanGuardProps {
  /** The feature to check access for */
  feature: keyof typeof PLAN_FEATURES[Plan];
  
  /** What to show if the user has access */
  children: ReactNode;
  
  /** Optional custom message to show when access is denied */
  upgradeMessage?: string;
  
  /** Optional custom component to render when access is denied */
  fallback?: ReactNode;
  
  /** Required plan level */
  requiredPlan?: Plan;
}

/**
 * Simplified PlanGuard component that always shows children
 * All features are accessible without restrictions
 */
export function PlanGuard({
  children,
  fallback,
}: PlanGuardProps) {
  // Always show children, ignoring plan restrictions
  return <>{children}</>;
} 