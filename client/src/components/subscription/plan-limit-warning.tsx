import React from 'react';
import { useLocation } from 'wouter';
import { AlertTriangle } from 'lucide-react';
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface PlanLimitWarningProps {
  resourceType: string;
  currentCount: number;
  limit: number;
}

export default function PlanLimitWarning({ resourceType, currentCount, limit }: PlanLimitWarningProps) {
  const [_, navigate] = useLocation();
  
  return (
    <Alert className="mb-4 border-amber-500 bg-amber-50 text-amber-800">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Plan Limit Reached</AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          You've used {currentCount} of {limit} {resourceType} in your current plan.
        </p>
        <p className="mb-4">
          Upgrade your subscription to create more {resourceType} and unlock additional features.
        </p>
        <Button 
          variant="outline" 
          onClick={() => navigate('/subscription-plans')}
          className="text-sm"
        >
          View Subscription Plans
        </Button>
      </AlertDescription>
    </Alert>
  );
} 