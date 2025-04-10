import { authService } from './auth-service';
import { subscriptionApi } from './api-service';

/**
 * Available subscription plans - now only a single plan is available
 */
export enum Plan {
  FREE = 'Free'
}

/**
 * Plan features and limits - all features are unlimited
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
 * Resource types that have usage limits
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
 * Subscription service for handling plans, features, and payments
 */
class SubscriptionService {
  /**
   * Get the current user's plan
   */
  async getCurrentPlan(): Promise<Plan> {
    // Always return FREE plan since subscription plans have been removed
    return Plan.FREE;
  }
  
  /**
   * Check if the user can access a feature based on their plan
   */
  async canAccessFeature(feature: keyof typeof PLAN_FEATURES[Plan]): Promise<boolean> {
    const plan = await this.getCurrentPlan();
    const planFeatures = PLAN_FEATURES[plan];
    
    if (!planFeatures) {
      return false;
    }
    
    // For numeric limits, -1 means unlimited
    if (typeof planFeatures[feature] === 'number') {
      return (planFeatures[feature] as number) === -1 || (planFeatures[feature] as number) > 0;
    }
    
    // For boolean features
    if (typeof planFeatures[feature] === 'boolean') {
      return planFeatures[feature] as boolean;
    }
    
    return false;
  }
  
  /**
   * Get current resource usage counts
   */
  async getResourceUsage(): Promise<ResourceUsage> {
    try {
      // We could implement an API endpoint to get all counts at once
      // For now, we'll use separate calls
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
   * Check if the user is within their usage limits
   */
  async checkUsageLimit(
    type: 'offerLimit' | 'problemTreeLimit' | 'draftedPlanLimit', 
    currentCount: number
  ): Promise<boolean> {
    const plan = await this.getCurrentPlan();
    const limit = PLAN_FEATURES[plan][type] as number;
    
    // -1 indicates unlimited
    return limit === -1 || currentCount < limit;
  }
  
  /**
   * Check if user can create more of a specific resource type
   */
  async canCreateResource(resourceType: ResourceType): Promise<boolean> {
    const usage = await this.getResourceUsage();
    const plan = await this.getCurrentPlan();
    
    switch (resourceType) {
      case 'offers':
        const offerLimit = PLAN_FEATURES[plan].offerLimit as number;
        return offerLimit === -1 || usage.offerCount < offerLimit;
      
      case 'problemTrees':
        const problemTreeLimit = PLAN_FEATURES[plan].problemTreeLimit as number;
        return problemTreeLimit === -1 || usage.problemTreeCount < problemTreeLimit;
      
      case 'draftedPlans':
        const draftedPlanLimit = PLAN_FEATURES[plan].draftedPlanLimit as number;
        return draftedPlanLimit === -1 || usage.draftedPlanCount < draftedPlanLimit;
      
      default:
        return false;
    }
  }
  
  /**
   * Get the features available on a specific plan
   */
  getPlanFeatures(plan: Plan) {
    return PLAN_FEATURES[plan];
  }
  
  /**
   * Get all available plans for display
   */
  getAvailablePlans() {
    return Object.entries(PLAN_FEATURES).map(([planName, features]) => ({
      name: planName,
      ...features
    }));
  }
  
  /**
   * Upgrade a plan using Stripe
   */
  async upgradePlan(newPlan: Plan): Promise<boolean> {
    try {
      const response = await subscriptionApi.createCheckoutSession(newPlan);
      
      if (response.url) {
        // Redirect to Stripe checkout
        window.location.href = response.url;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const subscriptionService = new SubscriptionService(); 