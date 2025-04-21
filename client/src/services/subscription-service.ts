/**
 * Simplified subscription service that provides access to all features
 * without authentication or payment requirements
 */

/**
 * Available subscription plans - only FREE is available
 */
export enum Plan {
  FREE = 'Free'
}

/**
 * Features available on the free plan - all features are unlimited
 */
export const PLAN_FEATURES = {
  [Plan.FREE]: {
    price: 0,
    offerLimit: -1, // Unlimited
    problemTreeLimit: -1, // Unlimited
    draftedPlanLimit: -1, // Unlimited
    includesExport: true,
    includesTemplates: true,
    includesCollaboration: true,
    includesAPI: true,
    storageLimit: 'Unlimited',
  }
};

/**
 * Resource types
 */
export type ResourceType = 'offers' | 'problemTrees' | 'draftedPlans';

/**
 * Interface for resource usage information
 */
export interface ResourceUsage {
  offerCount: number;
  problemTreeCount: number;
  draftedPlanCount: number;
}

/**
 * Simplified subscription service that grants access to all features
 */
class SubscriptionService {
  /**
   * Get the current plan (always FREE)
   */
  async getCurrentPlan(): Promise<Plan> {
    return Plan.FREE;
  }
  
  /**
   * Always allow access to all features
   */
  async canAccessFeature(feature: keyof typeof PLAN_FEATURES[Plan]): Promise<boolean> {
    return true;
  }
  
  /**
   * Get current resource usage counts
   */
  async getResourceUsage(): Promise<ResourceUsage> {
    try {
      const offers = await fetch('/api/offers').then(res => res.json());
      const problemTrees = await fetch('/api/problem-trees').then(res => res.json());
      const draftedPlans = await fetch('/api/drafted-plans').then(res => res.json());
      
      return {
        offerCount: offers.length,
        problemTreeCount: problemTrees.length,
        draftedPlanCount: draftedPlans.length
      };
    } catch (error) {
      console.error('Error getting resource usage:', error);
      return {
        offerCount: 0,
        problemTreeCount: 0,
        draftedPlanCount: 0
      };
    }
  }
  
  /**
   * Always allow unlimited usage
   */
  async checkUsageLimit(): Promise<boolean> {
    return true;
  }
  
  /**
   * Always allow creating resources
   */
  async canCreateResource(resourceType: ResourceType): Promise<boolean> {
    return true;
  }
  
  /**
   * Get features (all are enabled)
   */
  getPlanFeatures(plan: Plan) {
    return PLAN_FEATURES[plan];
  }
  
  /**
   * Get available plans (only FREE)
   */
  getAvailablePlans() {
    return Object.entries(PLAN_FEATURES).map(([planName, features]) => ({
      name: planName,
      ...features
    }));
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService(); 