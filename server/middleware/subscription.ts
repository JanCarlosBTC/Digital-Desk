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
 * 
 * NOTE: Subscription plans have been removed. This middleware now simply passes through.
 */
export const checkSubscriptionLimits = (resourceType: 'offers' | 'problemTrees' | 'draftedPlans') => {
  return async (req: RequestWithUser, res: Response, next: NextFunction) => {
    // Simply continue - all limits have been removed
    next();
  };
}; 