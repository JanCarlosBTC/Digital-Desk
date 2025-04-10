import React, { useState } from 'react';
import { Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useUser } from '@/context/user-context';
import { subscriptionService, Plan, PLAN_FEATURES } from '@/services/subscription-service';
import { toast } from '@/hooks/use-toast';

import { useEffect } from 'react';
import { useLocation } from 'wouter';

export default function SubscriptionPlans() {
  const [_, setLocation] = useLocation();
  
  // Redirect to home page since subscriptions have been removed
  useEffect(() => {
    toast({
      title: 'Subscription Plans Removed',
      description: 'All features are now available to all users for free.',
    });
    
    // Redirect after showing toast
    setTimeout(() => {
      setLocation('/');
    }, 1500);
  }, []);
  
  return (
    <div className="container py-12 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 mb-6">Select the plan that best fits your needs</p>
        
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
            Annual <span className="text-green-600 text-xs font-medium">Save 20%</span>
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Object.entries(PLAN_FEATURES).map(([planName, features]) => {
          const plan = planName as Plan;
          const isCurrent = plan === currentPlan;
          
          return (
            <Card 
              key={planName} 
              className={`border-2 ${isCurrent ? 'border-blue-500' : 'border-gray-200'}`}
            >
              <CardHeader>
                <CardTitle>{planName}</CardTitle>
                <CardDescription>
                  <div className="mt-2 text-2xl font-bold">
                    {getPrice(features.price)}
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