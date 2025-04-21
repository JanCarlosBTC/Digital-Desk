import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Offer } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const OfferMetrics = () => {
  // Fetch offers for metrics
  const { data: offers, isLoading } = useQuery<Offer[]>({
    queryKey: ['/api/offers'],
  });

  // Calculate metrics
  const calculateMetrics = () => {
    if (!offers) return {
      activeOffers: 0,
      activeOffersPct: 0,
      avgRevenue: 0,
      avgRevenuePct: 0,
      conversionRate: 25, // Fixed value for demo
      conversionRatePct: 50 // This is 50% of target (50%)
    };

    // Active offers count
    const activeOffers = offers.filter(offer => offer.status === "Active").length;
    const activeOffersPct = Math.round((activeOffers / 5) * 100); // Target is 5 active offers
    
    // Average revenue calculation
    // Extract numeric values from prices and calculate average
    const getNumericPrice = (price: string) => {
      const match = price.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    };
    
    const totalPrices = offers
      .filter(offer => offer.status === "Active")
      .reduce((sum, offer) => sum + getNumericPrice(offer.price), 0);
    
    const avgRevenue = activeOffers > 0 ? Math.round(totalPrices / activeOffers) : 0;
    const avgRevenuePct = Math.round((avgRevenue / 4000) * 100); // Target is $4,000
    
    return {
      activeOffers,
      activeOffersPct,
      avgRevenue,
      avgRevenuePct,
      conversionRate: 25, // Fixed value for demo
      conversionRatePct: 50 // This is 50% of target (50%)
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Offer Metrics</h2>
      
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Total Active Offers</span>
              <span className="text-sm font-medium text-gray-900">{metrics.activeOffers}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-warning h-2 rounded-full" 
                style={{ width: `${metrics.activeOffersPct}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{metrics.activeOffers} out of target 5 offers</p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Average Revenue per Client</span>
              <span className="text-sm font-medium text-gray-900">${metrics.avgRevenue.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-success h-2 rounded-full" 
                style={{ width: `${Math.min(metrics.avgRevenuePct, 100)}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">{metrics.avgRevenuePct}% of $4,000 target</p>
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium text-gray-700">Offer Conversion Rate</span>
              <span className="text-sm font-medium text-gray-900">{metrics.conversionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${metrics.conversionRatePct}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">Current: {metrics.conversionRate}% (Target: 50%)</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfferMetrics;
