import React, { useEffect, useState } from 'react';
import { useUser } from '@/context/user-context';
import { useLocation } from 'wouter';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export default function SubscriptionSuccess() {
  const { user, refreshUser } = useUser();
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(true);

  // Get session_id from URL query parameters
  const params = new URLSearchParams(window.location.search);
  const sessionId = params.get('session_id');

  useEffect(() => {
    // If no session_id, redirect to subscription plans
    if (!sessionId) {
      navigate('/subscription-plans');
      return;
    }

    // Refresh user data to get updated subscription info
    const updateUserData = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };

    updateUserData();
  }, [sessionId, refreshUser, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="container py-12 mx-auto max-w-lg">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold">Subscription Successful!</CardTitle>
          <CardDescription>
            Thank you for upgrading to the {user?.plan} plan.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-center mb-6">
            Your subscription has been activated successfully. You now have access to all the features included in your plan.
          </p>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <h3 className="font-medium mb-2">What's next?</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Explore the new features available to you</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Set up your workspace with the expanded limits</span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span>Check out the documentation for advanced features</span>
              </li>
            </ul>
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => navigate('/')}
            className="px-8"
          >
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
} 