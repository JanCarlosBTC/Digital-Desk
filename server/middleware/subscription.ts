import { Request, Response, NextFunction } from 'express';
import { storage } from '../storage.js';

// Custom interface to include userId property
interface RequestWithUser extends Request {
  userId?: number;
}

// Plan feature limits for validation
const PLAN_LIMITS = {
  'Free': {
    offerLimit: 3,
    problemTreeLimit: 5,
    draftedPlanLimit: 3
  },
  'Basic': {
    offerLimit: 10,
    problemTreeLimit: 20,
    draftedPlanLimit: 10
  },
  'Premium': {
    offerLimit: 50,
    problemTreeLimit: 100,
    draftedPlanLimit: 50
  },
  'Enterprise': {
    offerLimit: -1, // unlimited
    problemTreeLimit: -1, // unlimited
    draftedPlanLimit: -1 // unlimited
  }
};

/**
 * Middleware to check if a user has reached their subscription limits
 * for a specific resource type before creating new resources
 */
export const checkSubscriptionLimits = (resourceType: 'offers' | 'problemTrees' | 'draftedPlans') => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    try {
      // Skip check for non-create operations
      if (req.method !== 'POST') {
        return next();
      }
      
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      // Get user's current plan
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(401).json({ message: 'User not found' });
      }
      
      const userPlan = user.plan || 'Free';
      const planLimits = PLAN_LIMITS[userPlan as keyof typeof PLAN_LIMITS];
      
      // If plan doesn't exist or no limits defined, use free plan limits
      if (!planLimits) {
        return res.status(403).json({ 
          message: 'Invalid subscription plan',
          upgrade: true
        });
      }
      
      // Check appropriate resource limit
      let currentCount = 0;
      let limitName = '';
      
      switch (resourceType) {
        case 'offers':
          const offers = await storage.getOffers(userId);
          currentCount = offers.length;
          limitName = 'offerLimit';
          break;
          
        case 'problemTrees':
          const problemTrees = await storage.getProblemTrees(userId);
          currentCount = problemTrees.length;
          limitName = 'problemTreeLimit';
          break;
          
        case 'draftedPlans':
          const draftedPlans = await storage.getDraftedPlans(userId);
          currentCount = draftedPlans.length;
          limitName = 'draftedPlanLimit';
          break;
      }
      
      const limit = planLimits[limitName as keyof typeof planLimits];
      
      // -1 indicates unlimited
      if (limit !== -1 && currentCount >= limit) {
        return res.status(403).json({
          message: `You have reached the ${resourceType} limit for your subscription plan.`,
          limit,
          current: currentCount,
          upgrade: true
        });
      }
      
      next();
    } catch (error) {
      console.error('Error in subscription limit check:', error);
      next(); // Continue even if there's an error checking limits
    }
  };
}; 