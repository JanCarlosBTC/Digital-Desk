import React, { useState } from 'react';
import { Check, X, CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/user-context';
import { subscriptionService, Plan, PLAN_FEATURES } from '@/services/subscription-service';
import { toast } from '@/hooks/use-toast';

export default function SubscriptionPlans() {
  const { user } = useUser();
  const [isAnnual, setIsAnnual] = useState(false);
  const [loading, setLoading] = useState<Plan | null>(null);
  
  // Default to trial plan
  const currentPlan = user?.plan as Plan || Plan.TRIAL;
  
  // Get appropriate price based on billing period
  const getPrice = (planName: string, basePrice: number) => {
    if (planName === Plan.TRIAL) {
      return 'Free for 7 days';
    }
    
    if (planName === Plan.ANNUAL) {
      return `$${basePrice}/year`;
    }
    
    return basePrice === 0 ? 'Free' : `$${basePrice}/month`;
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
      // This will redirect to Stripe checkout
      await subscriptionService.upgradePlan(plan);
      
      toast({
        title: 'Success!',
        description: `Redirecting to checkout for the ${plan} plan.`,
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
        <p className="text-gray-600 mb-6">Start with a 7-day trial, then choose your preferred billing</p>
        
        <div className="flex items-center justify-center mb-8">
          <span className={`mr-3 ${!isAnnual ? 'font-semibold' : ''}`}>Monthly</span>
          <button
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200"
            onClick={() => setIsAnnual(!isAnnual)}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                isAnnual ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`ml-3 ${isAnnual ? 'font-semibold' : ''}`}>
            Annual <span className="text-green-600 text-xs font-medium">Save 15%</span>
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {Object.entries(PLAN_FEATURES).map(([planName, features]) => {
          const plan = planName as Plan;
          const isCurrent = plan === currentPlan;
          
          // Skip showing annual plan if monthly is selected and vice versa
          if ((isAnnual && plan === Plan.MONTHLY) || (!isAnnual && plan === Plan.ANNUAL)) {
            return null;
          }
          
          return (
            <Card 
              key={planName} 
              className={`border-2 ${isCurrent ? 'border-blue-500' : 'border-gray-200'}`}
            >
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{planName}</CardTitle>
                  {plan === Plan.TRIAL && (
                    <div className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2 py-1 rounded">
                      <CalendarClock size={14} className="mr-1" />
                      7 days
                    </div>
                  )}
                </div>
                <CardDescription>
                  <div className="mt-2 text-2xl font-bold">
                    {getPrice(planName, features.price)}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {features.description}
                  </div>
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
                  {loading === plan ? 'Processing...' : 
                   isCurrent ? 'Current Plan' : 
                   plan === Plan.TRIAL ? 'Start Free Trial' : 'Upgrade'}
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