import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { toast } from '@/hooks/use-toast';

/**
 * Simple component that redirects to home page
 * Subscription functionality has been removed from the application
 */
export default function SubscriptionSuccess() {
  const [, navigate] = useLocation();

  useEffect(() => {
    // Display a toast notification
    toast({
      title: 'Subscription Plans Removed',
      description: 'All features are now available to all users for free.',
    });
    
    // Redirect to home after a short delay
    setTimeout(() => {
      navigate('/');
    }, 1500);
  }, [navigate]);

  return (
    <div className="container py-12 mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">Redirecting...</h1>
        <p className="text-gray-600 mb-6">All features are now available for free</p>
      </div>
    </div>
  );
} 