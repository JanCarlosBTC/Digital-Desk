import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertBrainDumpSchema, insertProblemTreeSchema, insertDraftedPlanSchema, 
  insertClarityLabSchema, insertWeeklyReflectionSchema, insertMonthlyCheckInSchema, 
  insertPrioritySchema, insertDecisionSchema, insertOfferSchema, insertOfferNoteSchema 
} from "../shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { cacheMiddleware, clearCacheMiddleware } from "./middleware/cache.js";
import { authenticate } from "./middleware/auth.js";
import { checkSubscriptionLimits } from "./middleware/subscription.js";
import { handleWebhook } from "./controllers/subscription.controller.js";
import { getProfile } from "./controllers/auth.controller.js";

/**
 * Helper function to safely parse an ID from request parameters
 * 
 * @param id The ID string to parse
 * @param res The response object to return errors through
 * @returns The parsed ID if valid, or undefined if an error was sent
 */
function parseAndValidateId(id: string | undefined, res: Response): number | undefined {
  if (id === undefined) {
    res.status(400).json({ message: "ID parameter is required" });
    return undefined;
  }
  
  // Ensure id is a string before parsing
  const idStr = String(id);
  const parsedId = parseInt(idStr);
  
  if (isNaN(parsedId)) {
    res.status(400).json({ message: "Invalid ID format" });
    return undefined;
  }
  
  return parsedId;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  // See ERROR-HANDLING.md for comprehensive error handling strategies
  const handleZodError = (error: unknown, res: Response): Response => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: validationError.message,
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: "An unexpected error occurred" });
  };

  // Base routes without auth
  app.get('/api/brain-dump', async (req, res) => {
    try {
      const brainDump = await storage.getBrainDumpByUserId(1); // Default user
      res.json(brainDump || { content: "" });
    } catch (error) {
      res.status(500).json({ message: "Error fetching brain dump" });
    }
  });
  
  // Stripe webhook handler - needs raw body, but no rate limiting as it's from Stripe
  app.post('/api/webhooks/stripe', 
    express.raw({ type: 'application/json' }),
    handleWebhook
  );

  // Current user endpoint (using authenticated middleware)
  app.get('/api/user', authenticate, getProfile);

  // Brain Dump endpoints
  app.get('/api/brain-dump', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      let brainDump = await storage.getBrainDumpByUserId(userId);
      
      // If no brain dump exists, create an empty one
      if (!brainDump) {
        brainDump = await storage.createBrainDump({
          userId,
          content: ""
        });
      }
      
      res.json(brainDump);
    } catch (error) {
      res.status(500).json({ message: "Error fetching brain dump" });
    }
  });

  app.put('/api/brain-dump/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      // Parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      // Validate content
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const updatedBrainDump = await storage.updateBrainDump(parsedId, content);
      if (!updatedBrainDump) {
        return res.status(404).json({ message: "Brain dump not found" });
      }
      
      return res.json(updatedBrainDump);
    } catch (error) {
      return res.status(500).json({ message: "Error updating brain dump" });
    }
  });

  // Problem Tree endpoints
  app.get('/api/problem-trees', authenticate, cacheMiddleware('problem-trees', 300), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const problemTrees = await storage.getProblemTrees(userId);
      return res.json(problemTrees);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching problem trees" });
    }
  });

  app.get('/api/problem-trees/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const problemTree = await storage.getProblemTree(parsedId);
      
      if (!problemTree) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      // Authorization check - only allow access to own data
      if (problemTree.userId !== userId) {
        return res.status(403).json({ message: "Unauthorized access to resource" });
      }
      
      return res.json(problemTree);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching problem tree" });
    }
  });

  app.post('/api/problem-trees', authenticate, checkSubscriptionLimits('problemTrees'), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertProblemTreeSchema.parse(data);
      const problemTree = await storage.createProblemTree(validatedData);
      
      return res.status(201).json(problemTree);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/problem-trees/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const updatedProblemTree = await storage.updateProblemTree(parsedId, data);
      if (!updatedProblemTree) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      return res.json(updatedProblemTree);
    } catch (error) {
      return res.status(500).json({ message: "Error updating problem tree" });
    }
  });

  app.delete('/api/problem-trees/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const deleted = await storage.deleteProblemTree(parsedId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting problem tree" });
    }
  });

  // Drafted Plans endpoints
  app.get('/api/drafted-plans', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const draftedPlans = await storage.getDraftedPlans(userId);
      res.json(draftedPlans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching drafted plans" });
    }
  });

  app.get('/api/drafted-plans/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const draftedPlan = await storage.getDraftedPlan(parsedId);
      
      if (!draftedPlan) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      
      return res.json(draftedPlan);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching drafted plan" });
    }
  });

  app.post('/api/drafted-plans', authenticate, checkSubscriptionLimits('draftedPlans'), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertDraftedPlanSchema.parse(data);
      const draftedPlan = await storage.createDraftedPlan(validatedData);
      
      res.status(201).json(draftedPlan);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/drafted-plans/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const updatedDraftedPlan = await storage.updateDraftedPlan(parsedId, data);
      if (!updatedDraftedPlan) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      
      return res.json(updatedDraftedPlan);
    } catch (error) {
      return res.status(500).json({ message: "Error updating drafted plan" });
    }
  });

  app.delete('/api/drafted-plans/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const deleted = await storage.deleteDraftedPlan(parsedId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting drafted plan" });
    }
  });

  // Clarity Lab endpoints
  app.get('/api/clarity-labs', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const category = req.query.category as string | undefined;
      const clarityLabs = await storage.getClarityLabs(userId, category);
      res.json(clarityLabs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clarity labs" });
    }
  });

  app.get('/api/clarity-labs/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const clarityLab = await storage.getClarityLab(parsedId);
      
      if (!clarityLab) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      
      return res.json(clarityLab);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching clarity lab entry" });
    }
  });

  app.post('/api/clarity-labs', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertClarityLabSchema.parse(data);
      const clarityLab = await storage.createClarityLab(validatedData);
      
      res.status(201).json(clarityLab);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/clarity-labs/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const updatedClarityLab = await storage.updateClarityLab(parsedId, data);
      if (!updatedClarityLab) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      
      return res.json(updatedClarityLab);
    } catch (error) {
      return res.status(500).json({ message: "Error updating clarity lab entry" });
    }
  });

  app.delete('/api/clarity-labs/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const deleted = await storage.deleteClarityLab(parsedId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting clarity lab entry" });
    }
  });

  // Weekly Reflections endpoints
  app.get('/api/weekly-reflections', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const weeklyReflections = await storage.getWeeklyReflections(userId);
      return res.json(weeklyReflections);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching weekly reflections" });
    }
  });

  app.get('/api/weekly-reflections/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const weeklyReflection = await storage.getWeeklyReflection(parsedId);
      
      if (!weeklyReflection) {
        return res.status(404).json({ message: "Weekly reflection not found" });
      }
      
      return res.json(weeklyReflection);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching weekly reflection" });
    }
  });

  app.post('/api/weekly-reflections', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      console.log("Received weekly reflection data:", data);
      
      try {
        const validatedData = insertWeeklyReflectionSchema.parse(data);
        const weeklyReflection = await storage.createWeeklyReflection(validatedData);
        return res.status(201).json(weeklyReflection);
      } catch (zodError) {
        console.error("Weekly reflection validation error:", zodError);
        return handleZodError(zodError, res);
      }
    } catch (error) {
      console.error("Unexpected error in weekly reflection creation:", error);
      return res.status(500).json({ message: "Error creating weekly reflection" });
    }
  });

  app.put('/api/weekly-reflections/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const updatedWeeklyReflection = await storage.updateWeeklyReflection(parsedId, data);
      if (!updatedWeeklyReflection) {
        return res.status(404).json({ message: "Weekly reflection not found" });
      }
      
      return res.json(updatedWeeklyReflection);
    } catch (error) {
      return res.status(500).json({ message: "Error updating weekly reflection" });
    }
  });

  // Monthly Check-ins endpoints
  app.get('/api/monthly-check-ins', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const monthlyCheckIns = await storage.getMonthlyCheckIns(userId);
      return res.json(monthlyCheckIns);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching monthly check-ins" });
    }
  });

  app.get('/api/monthly-check-ins/:month/:year', authenticate, async (req: Request, res: Response) => {
    try {
      const { month, year } = req.params;
      
      // Validate month and year
      const parsedMonth = parseInt(String(month));
      const parsedYear = parseInt(String(year));
      
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: "Invalid month format. Month must be between 1 and 12." });
      }
      
      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ message: "Invalid year format. Year must be between 2000 and 2100." });
      }
      
      const userId = (req as any).userId;
      const monthlyCheckIn = await storage.getMonthlyCheckInByMonthYear(
        userId, 
        parsedMonth, 
        parsedYear
      );
      
      if (!monthlyCheckIn) {
        return res.status(404).json({ message: "Monthly check-in not found" });
      }
      
      return res.json(monthlyCheckIn);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching monthly check-in" });
    }
  });

  app.post('/api/monthly-check-ins', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertMonthlyCheckInSchema.parse(data);
      const monthlyCheckIn = await storage.createMonthlyCheckIn(validatedData);
      
      return res.status(201).json(monthlyCheckIn);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/monthly-check-ins/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const updatedMonthlyCheckIn = await storage.updateMonthlyCheckIn(parsedId, data);
      if (!updatedMonthlyCheckIn) {
        return res.status(404).json({ message: "Monthly check-in not found" });
      }
      
      return res.json(updatedMonthlyCheckIn);
    } catch (error) {
      return res.status(500).json({ message: "Error updating monthly check-in" });
    }
  });

  // Priorities endpoints
  app.get('/api/priorities', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const priorities = await storage.getPriorities(userId);
      return res.json(priorities);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching priorities" });
    }
  });

  app.post('/api/priorities', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertPrioritySchema.parse(data);
      const priority = await storage.createPriority(validatedData);
      
      return res.status(201).json(priority);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/priorities/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const updatedPriority = await storage.updatePriority(parsedId, data);
      if (!updatedPriority) {
        return res.status(404).json({ message: "Priority not found" });
      }
      
      return res.json(updatedPriority);
    } catch (error) {
      return res.status(500).json({ message: "Error updating priority" });
    }
  });

  app.delete('/api/priorities/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const deleted = await storage.deletePriority(parsedId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Priority not found" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting priority" });
    }
  });

  // Decision Log endpoints
  app.get('/api/decisions', authenticate, cacheMiddleware('decisions', 300), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const decisions = await storage.getDecisions(userId);
      return res.json(decisions);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching decisions" });
    }
  });

  app.get('/api/decisions/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const decision = await storage.getDecision(parsedId);
      
      if (!decision) {
        return res.status(404).json({ message: "Decision not found" });
      }
      
      return res.json(decision);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching decision" });
    }
  });

  app.post('/api/decisions', authenticate, clearCacheMiddleware('decisions'), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertDecisionSchema.parse(data);
      const decision = await storage.createDecision(validatedData);
      
      return res.status(201).json(decision);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/decisions/:id', authenticate, clearCacheMiddleware('decisions'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      // Get existing decision to detect status changes
      const userId = (req as any).userId;
      const existingDecision = await storage.getDecision(parsedId);
      if (!existingDecision) {
        return res.status(404).json({ message: "Decision not found" });
      }
      
      const updatedDecision = await storage.updateDecision(parsedId, data);
      if (!updatedDecision) {
        return res.status(404).json({ message: "Decision not found after update" });
      }
      
      return res.json(updatedDecision);
    } catch (error) {
      return res.status(500).json({ message: "Error updating decision" });
    }
  });

  app.delete('/api/decisions/:id', authenticate, clearCacheMiddleware('decisions'), async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      // Get the decision before deleting for validation
      const userId = (req as any).userId;
      const decision = await storage.getDecision(parsedId);
      if (!decision) {
        return res.status(404).json({ message: "Decision not found" });
      }
      
      const deleted = await storage.deleteDecision(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Decision not found after delete attempt" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting decision" });
    }
  });

  // Offer Vault endpoints
  app.get('/api/offers', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const offers = await storage.getOffers(userId);
      return res.json(offers);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offers" });
    }
  });

  app.get('/api/offers/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      const userId = (req as any).userId;
      const offer = await storage.getOffer(parsedId);
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      return res.json(offer);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offer" });
    }
  });

  app.post('/api/offers', authenticate, checkSubscriptionLimits('offers'), async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const data = {
        ...req.body,
        userId
      };
      
      const validatedData = insertOfferSchema.parse(data);
      const offer = await storage.createOffer(validatedData);
      
      return res.status(201).json(offer);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/offers/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      // Get existing offer to detect status changes
      const userId = (req as any).userId;
      const existingOffer = await storage.getOffer(parsedId);
      if (!existingOffer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      const updatedOffer = await storage.updateOffer(parsedId, data);
      if (!updatedOffer) {
        return res.status(404).json({ message: "Offer not found after update" });
      }
      
      return res.json(updatedOffer);
    } catch (error) {
      return res.status(500).json({ message: "Error updating offer" });
    }
  });

  app.delete('/api/offers/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      // Get the offer before deleting for validation
      const userId = (req as any).userId;
      const offer = await storage.getOffer(parsedId);
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      const deleted = await storage.deleteOffer(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Offer not found after delete attempt" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting offer" });
    }
  });

  // Offer Notes endpoints
  app.get('/api/offer-notes', authenticate, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      let offerNotes = await storage.getOfferNotesByUserId(userId);
      
      // If no notes exist or the array is empty, create empty notes
      if (!offerNotes || offerNotes.length === 0) {
        const newNote = await storage.createOfferNote({
          userId,
          content: ""
        });
        offerNotes = [newNote];
      }
      
      return res.json(offerNotes);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offer notes" });
    }
  });

  app.put('/api/offer-notes/:id', authenticate, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      // Use helper function to parse and validate ID
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; // Error response already sent by the helper function
      }
      
      // Validate content
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const userId = (req as any).userId;
      const updatedOfferNote = await storage.updateOfferNote(parsedId, content);
      if (!updatedOfferNote) {
        return res.status(404).json({ message: "Offer notes not found" });
      }
      
      return res.json(updatedOfferNote);
    } catch (error) {
      return res.status(500).json({ message: "Error updating offer notes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
