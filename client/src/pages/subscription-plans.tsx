import React from 'react';
import { toast } from '@/hooks/use-toast';
import { useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * Simple component that redirects to home page
 * Subscription plans have been removed from the application
 */
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
        <h1 className="text-3xl font-bold mb-2">Redirecting...</h1>
        <p className="text-gray-600 mb-6">All features are now available for free</p>
      </div>
    </div>
  );
} 