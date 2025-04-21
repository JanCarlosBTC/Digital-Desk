import React, { ReactNode, useState, useEffect } from 'react';
import { subscriptionService, Plan, PLAN_FEATURES } from '@/services/subscription-service';
import { AlertCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/user-context';
import { useLocation } from 'wouter';

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
 * Component that restricts access to features based on subscription plan
 * Shows children only if the user has access, otherwise shows an upgrade prompt
 */
export function PlanGuard({
  feature,
  children,
  upgradeMessage,
  fallback,
  requiredPlan = Plan.FREE
}: PlanGuardProps) {
  const { user } = useUser();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [_, navigate] = useLocation();
  
  useEffect(() => {
    async function checkAccess() {
      try {
        const canAccess = await subscriptionService.canAccessFeature(feature);
        setHasAccess(canAccess);
      } catch (error) {
        console.error('Error checking feature access:', error);
        setHasAccess(false);
      } finally {
        setLoading(false);
      }
    }
    
    checkAccess();
  }, [feature, user?.id]);
  
  if (loading) {
    return (
      <div className="w-full h-40 flex items-center justify-center">
        <div className="animate-pulse">
          <div className="h-12 w-32 bg-gray-200 rounded-md mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }
  
  if (hasAccess) {
    return <>{children}</>;
  }
  
  // If a custom fallback is provided, use it
  if (fallback) {
    return <>{fallback}</>;
  }
  
  // Default upgrade prompt
  return (
    <Card className="max-w-md mx-auto border-amber-100 bg-amber-50 shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          <Lock className="h-5 w-5 text-amber-500 mt-1" />
          <div>
            <CardTitle className="text-lg">Premium Feature</CardTitle>
            <CardDescription className="text-amber-700">
              {upgradeMessage || `This feature requires the ${requiredPlan} plan`}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2 text-sm text-amber-700">
        <p>Upgrade your subscription to unlock this feature and many others.</p>
      </CardContent>
      <CardFooter>
        <Button 
          variant="default"
          className="w-full bg-amber-600 hover:bg-amber-700"
          onClick={() => navigate('/subscription-plans')}
        >
          View Plans
        </Button>
      </CardFooter>
    </Card>
  );
} 