import { useState, useEffect } from 'react';
import { useUser } from '@/context/user-context';
import { subscriptionService, Plan, PLAN_FEATURES } from '@/services/subscription-service';
import { useToast } from '@/hooks/use-toast';

// Type for feature names
type FeatureName = keyof typeof PLAN_FEATURES[Plan.FREE];

/**
 * Hook to check if a subscription feature is available based on the user's plan
 */
export function useSubscriptionFeature(
  feature: FeatureName, 
  redirectOnFailure = false
): { canAccess: boolean; isLoading: boolean; message: string } {
  const { user } = useUser();
  const { toast } = useToast();
  const [canAccess, setCanAccess] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      
      try {
        // If user is not logged in, they can't access subscription features
        if (!user) {
          setCanAccess(false);
          setMessage('Please log in to access this feature.');
          return;
        }
        
        // Check if the feature is available on the user's plan
        const hasAccess = await subscriptionService.canAccessFeature(feature);
        setCanAccess(hasAccess);
        
        if (!hasAccess) {
          const userPlan = await subscriptionService.getCurrentPlan();
          setMessage(`This feature is not available on your ${userPlan} plan. Please upgrade to access it.`);
          
          if (redirectOnFailure) {
            toast({
              title: 'Subscription Required',
              description: message,
              variant: 'destructive'
            });
            // Could add navigation to subscription plans page here
          }
        }
      } catch (error) {
        console.error('Error checking subscription feature access:', error);
        setCanAccess(false);
        setMessage('There was an error checking your access to this feature.');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAccess();
  }, [user, feature, redirectOnFailure, toast, message]);
  
  return { canAccess, isLoading, message };
} 