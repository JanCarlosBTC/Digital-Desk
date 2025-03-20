import React, { useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/user-context';
import { subscriptionService, Plan, PLAN_FEATURES } from '@/services/subscription-service';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

// Define type for plan features with optional savingsPercentage
type PlanFeatureType = typeof PLAN_FEATURES[Plan] & {
  savingsPercentage?: number;
};

export default function SubscriptionPlans() {
  const { user } = useUser();
  const [loading, setLoading] = useState<Plan | null>(null);
  
  const currentPlan = user?.plan as Plan || Plan.TRIAL;
  
  // Display price with proper formatting
  const getPrice = (plan: Plan) => {
    const features = PLAN_FEATURES[plan] as PlanFeatureType;
    
    if (plan === Plan.TRIAL) {
      return (
        <div className="flex flex-col items-center">
          <span className="text-2xl font-bold">Free</span>
          <span className="text-sm text-muted-foreground">{features.trialDays}-day trial</span>
        </div>
      );
    }
    
    if (plan === Plan.ANNUAL) {
      // The Annual plan has savingsPercentage in the PLAN_FEATURES
      const annualFeatures = PLAN_FEATURES[Plan.ANNUAL] as any;
      const savingsPercent = annualFeatures.savingsPercentage;
      
      return (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold">${(features.price / 12).toFixed(2)}</span>
            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
              Save {savingsPercent}%
            </Badge>
          </div>
          <span className="text-sm text-muted-foreground">per month, billed annually</span>
          <span className="text-sm text-muted-foreground">${features.price.toFixed(2)} total</span>
        </div>
      );
    }
    
    return (
      <div className="flex flex-col items-center">
        <span className="text-2xl font-bold">${features.price.toFixed(2)}</span>
        <span className="text-sm text-muted-foreground">per month</span>
      </div>
    );
  };
  
  const handleUpgrade = async (plan: Plan) => {
    if (plan === currentPlan) {
      toast({
        title: 'Current Plan',
        description: `You are already on the ${plan} plan.`,
      });
      return;
    }
    
    setLoading(plan);
    
    try {
      // This will be replaced with actual payment processing
      await subscriptionService.upgradePlan(plan);
      
      toast({
        title: 'Success!',
        description: `Your plan has been updated to ${plan}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(null);
    }
  };
  
  return (
    <div className="container py-12 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 mb-6">Select the plan that best fits your needs</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.keys(PLAN_FEATURES).map((planName) => {
          const plan = planName as Plan;
          const features = PLAN_FEATURES[plan];
          const isCurrent = plan === currentPlan;
          const isPremium = plan !== Plan.TRIAL;
          
          return (
            <Card 
              key={planName} 
              className={`border-2 relative ${isCurrent ? 'border-primary shadow-lg' : isPremium ? 'border-gray-200 hover:border-primary/50 transition-colors' : 'border-gray-200'}`}
            >
              {plan === Plan.ANNUAL && (
                <div className="absolute -top-3 left-0 right-0 flex justify-center">
                  <Badge className="bg-primary text-white font-medium">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> BEST VALUE
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  {planName}
                  {isCurrent && (
                    <Badge variant="outline" className="border-primary text-primary">Current</Badge>
                  )}
                </CardTitle>
                <CardDescription className="mt-2 flex justify-center">
                  {getPrice(plan)}
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80 overflow-y-auto">
                <ul className="space-y-2">
                  <PlanFeature
                    name="Offers"
                    value={features.offerLimit === -1 ? 'Unlimited' : `${features.offerLimit}`}
                  />
                  <PlanFeature
                    name="Problem Trees"
                    value={features.problemTreeLimit === -1 ? 'Unlimited' : `${features.problemTreeLimit}`}
                  />
                  <PlanFeature
                    name="Drafted Plans"
                    value={features.draftedPlanLimit === -1 ? 'Unlimited' : `${features.draftedPlanLimit}`}
                  />
                  <PlanFeature
                    name="Export"
                    available={features.includesExport}
                  />
                  <PlanFeature
                    name="Templates"
                    available={features.includesTemplates}
                  />
                  <PlanFeature
                    name="Collaboration"
                    available={features.includesCollaboration}
                  />
                  <PlanFeature
                    name="API Access"
                    available={features.includesAPI}
                  />
                  <PlanFeature
                    name="Storage"
                    value={features.storageLimit}
                  />
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full"
                  variant={isCurrent ? 'outline' : 'default'}
                  disabled={isCurrent || loading === plan}
                  onClick={() => handleUpgrade(plan)}
                >
                  {loading === plan ? 'Processing...' : isCurrent ? 'Current Plan' : 'Upgrade'}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// Helper component for plan features
function PlanFeature({ 
  name, 
  value, 
  available 
}: { 
  name: string; 
  value?: string; 
  available?: boolean;
}) {
  // If value is provided, show it, otherwise show check/X based on available
  const hasFeature = value !== undefined || available === true;
  
  return (
    <li className="flex items-start gap-2">
      {hasFeature ? (
        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
      ) : (
        <X className="h-5 w-5 text-gray-300 mt-0.5 flex-shrink-0" />
      )}
      <span>
        <span className="font-medium">{name}</span>
        {value && <span className="ml-1">({value})</span>}
      </span>
    </li>
  );
} 