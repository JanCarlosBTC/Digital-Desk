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
import { login, getProfile } from "./controllers/auth.controller.js";
import { withAuth, withAuthAndUser, withDevAuth } from "./middleware/auth-wrapper.js";

// Extend the Express Request type to include userId property
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

/**
 * Helper function to safely parse an ID from request parameters
 */
function parseAndValidateId(id: string | undefined, res: Response): number | undefined {
  if (id === undefined) {
    res.status(400).json({ message: "ID parameter is required" });
    return undefined;
  }
  const idStr = String(id);
  const parsedId = parseInt(idStr);
  if (isNaN(parsedId)) {
    res.status(400).json({ message: "Invalid ID format" });
    return undefined;
  }
  return parsedId;
}

export async function registerRoutes(app: Express): Promise<Server> {
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

  // Brain Dump endpoints - protected with auth wrapper
  app.get('/api/brain-dump', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      // User ID comes from auth middleware - will always have a value due to withAuthAndUser
      const userId = req.userId as number;
      
      const brainDump = await storage.getBrainDumpByUserId(userId);
      
      // Only return data if found
      if (!brainDump) {
        return res.status(404).json({ message: "Brain dump not found" });
      }
      
      return res.json(brainDump || {content: ""});
    } catch (error) {
      return res.status(500).json({ message: "Error fetching brain dump" });
    }
  }));

  app.post('/api/brain-dump', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = {
        userId: req.userId as number, // User ID comes from auth middleware
        content: req.body.content
      };
      const validatedData = insertBrainDumpSchema.parse(data);
      const brainDump = await storage.createBrainDump(validatedData);
      return res.status(201).json(brainDump);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));

  app.put('/api/brain-dump/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return; 
      }
      
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // Validate user owns this brain dump (in production)
      if (process.env.NODE_ENV === 'production') {
        // Use getBrainDumpByUserId which is available in the storage interface
        const existingBrainDump = await storage.getBrainDumpByUserId(req.userId as number);
        if (!existingBrainDump || existingBrainDump.id !== parsedId) {
          return res.status(403).json({ message: "Not authorized to update this brain dump" });
        }
      }
      
      const updatedBrainDump = await storage.updateBrainDump(parsedId, content);
      if (!updatedBrainDump) {
        return res.status(404).json({ message: "Brain dump not found" });
      }
      
      return res.json(updatedBrainDump);
    } catch (error) {
      return res.status(500).json({ message: "Error updating brain dump" });
    }
  }));


  // Problem Tree endpoints
  app.get('/api/problem-trees', cacheMiddleware('problem-trees', 300), async (req: Request, res: Response) => {
    try {
      const problemTrees = await storage.getProblemTrees(1);
      return res.json(problemTrees);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching problem trees" });
    }
  });

  app.post('/api/problem-trees', clearCacheMiddleware('problem-trees'), async (req: Request, res: Response) => {
    try {
      const data = {
        userId: 1,
        ...req.body
      };
      const validatedData = insertProblemTreeSchema.parse(data);
      const problemTree = await storage.createProblemTree(validatedData);
      return res.status(201).json(problemTree);
    } catch (error) {
      return handleZodError(error, res);
    }
  });

  app.put('/api/problem-trees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedProblemTree = await storage.updateProblemTree(parsedId, data);
      if (!updatedProblemTree) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      return res.json(updatedProblemTree);
    } catch (error) {
      return res.status(500).json({ message: "Error updating problem tree" });
    }
  });

  app.delete('/api/problem-trees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const deleted = await storage.deleteProblemTree(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting problem tree" });
    }
  });

  // Drafted Plans endpoints - Simplified
  app.get('/api/drafted-plans', async (req: Request, res: Response) => {
    try {
      const draftedPlans = await storage.getDraftedPlans(1);
      return res.json(draftedPlans);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching drafted plans" });
    }
  });
  app.post('/api/drafted-plans', async (req: Request, res: Response) => {
    try {
      const data = { userId: 1, ...req.body };
      const validatedData = insertDraftedPlanSchema.parse(data);
      const draftedPlan = await storage.createDraftedPlan(validatedData);
      return res.status(201).json(draftedPlan);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  app.put('/api/drafted-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedDraftedPlan = await storage.updateDraftedPlan(parsedId, data);
      if (!updatedDraftedPlan) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      return res.json(updatedDraftedPlan);
    } catch (error) {
      return res.status(500).json({ message: "Error updating drafted plan" });
    }
  });
  app.delete('/api/drafted-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const deleted = await storage.deleteDraftedPlan(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting drafted plan" });
    }
  });

  // Clarity Lab endpoints - Simplified
  app.get('/api/clarity-labs', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const clarityLabs = await storage.getClarityLabs(1, category);
      return res.json(clarityLabs);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching clarity labs" });
    }
  });
  app.post('/api/clarity-labs', async (req: Request, res: Response) => {
    try {
      const data = { userId: 1, ...req.body };
      const validatedData = insertClarityLabSchema.parse(data);
      const clarityLab = await storage.createClarityLab(validatedData);
      return res.status(201).json(clarityLab);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  app.put('/api/clarity-labs/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedClarityLab = await storage.updateClarityLab(parsedId, data);
      if (!updatedClarityLab) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      return res.json(updatedClarityLab);
    } catch (error) {
      return res.status(500).json({ message: "Error updating clarity lab entry" });
    }
  });
  app.delete('/api/clarity-labs/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const deleted = await storage.deleteClarityLab(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting clarity lab entry" });
    }
  });

  // Weekly Reflections endpoints - Simplified
  app.get('/api/weekly-reflections', async (req: Request, res: Response) => {
    try {
      const weeklyReflections = await storage.getWeeklyReflections(1);
      return res.json(weeklyReflections);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching weekly reflections" });
    }
  });
  app.post('/api/weekly-reflections', async (req: Request, res: Response) => {
    try {
      const data = { userId: 1, ...req.body };
      const validatedData = insertWeeklyReflectionSchema.parse(data);
      const weeklyReflection = await storage.createWeeklyReflection(validatedData);
      return res.status(201).json(weeklyReflection);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  app.put('/api/weekly-reflections/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedWeeklyReflection = await storage.updateWeeklyReflection(parsedId, data);
      if (!updatedWeeklyReflection) {
        return res.status(404).json({ message: "Weekly reflection not found" });
      }
      return res.json(updatedWeeklyReflection);
    } catch (error) {
      return res.status(500).json({ message: "Error updating weekly reflection" });
    }
  });
  app.delete('/api/weekly-reflections/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      const reflectionExists = await storage.getWeeklyReflection(parsedId);
      if (!reflectionExists) {
        return res.status(404).json({ message: "Weekly reflection not found" });
      }
      
      // Now try to delete it
      const deleted = await storage.deleteWeeklyReflection(parsedId);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete weekly reflection" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting weekly reflection" });
    }
  });

  // Monthly Check-ins endpoints - Simplified
  app.get('/api/monthly-check-ins', async (req: Request, res: Response) => {
    try {
      const monthlyCheckIns = await storage.getMonthlyCheckIns(1);
      return res.json(monthlyCheckIns);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching monthly check-ins" });
    }
  });
  app.post('/api/monthly-check-ins', async (req: Request, res: Response) => {
    try {
      const data = { userId: 1, ...req.body };
      const validatedData = insertMonthlyCheckInSchema.parse(data);
      const monthlyCheckIn = await storage.createMonthlyCheckIn(validatedData);
      return res.status(201).json(monthlyCheckIn);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  app.get('/api/monthly-check-ins/:month/:year', async (req: Request, res: Response) => {
    try {
      const { month, year } = req.params;
      
      const parsedMonth = parseInt(String(month));
      const parsedYear = parseInt(String(year));
      
      if (isNaN(parsedMonth) || parsedMonth < 1 || parsedMonth > 12) {
        return res.status(400).json({ message: "Invalid month format. Month must be between 1 and 12." });
      }
      
      if (isNaN(parsedYear) || parsedYear < 2000 || parsedYear > 2100) {
        return res.status(400).json({ message: "Invalid year format. Year must be between 2000 and 2100." });
      }
      
      const monthlyCheckIn = await storage.getMonthlyCheckInByMonthYear(
        1, 
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
  app.put('/api/monthly-check-ins/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedMonthlyCheckIn = await storage.updateMonthlyCheckIn(parsedId, data);
      if (!updatedMonthlyCheckIn) {
        return res.status(404).json({ message: "Monthly check-in not found" });
      }
      return res.json(updatedMonthlyCheckIn);
    } catch (error) {
      return res.status(500).json({ message: "Error updating monthly check-in" });
    }
  });

  // Priorities endpoints - Simplified
  app.get('/api/priorities', async (req: Request, res: Response) => {
    try {
      const priorities = await storage.getPriorities(1);
      return res.json(priorities);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching priorities" });
    }
  });
  app.post('/api/priorities', async (req: Request, res: Response) => {
    try {
      const data = { userId: 1, ...req.body };
      const validatedData = insertPrioritySchema.parse(data);
      const priority = await storage.createPriority(validatedData);
      return res.status(201).json(priority);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  app.put('/api/priorities/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedPriority = await storage.updatePriority(parsedId, data);
      if (!updatedPriority) {
        return res.status(404).json({ message: "Priority not found" });
      }
      return res.json(updatedPriority);
    } catch (error) {
      return res.status(500).json({ message: "Error updating priority" });
    }
  });
  app.delete('/api/priorities/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const deleted = await storage.deletePriority(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Priority not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting priority" });
    }
  });

  // Decision Log endpoints - Protected with auth wrapper
  app.get('/api/decisions', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const decisions = await storage.getDecisions(req.userId as number);
      return res.json(decisions);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching decisions" });
    }
  }));
  
  app.post('/api/decisions', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = { 
        userId: req.userId as number, 
        ...req.body 
      };
      const validatedData = insertDecisionSchema.parse(data);
      const decision = await storage.createDecision(validatedData);
      // Clear cache after creating new decision
      clearCacheMiddleware('decisions')(req, res, () => {});
      return res.status(201).json(decision);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));
  app.put('/api/decisions/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // Clear cache before updating
      clearCacheMiddleware('decisions')(req, res, () => {});
      
      // In production, verify user owns this decision
      if (process.env.NODE_ENV === 'production') {
        const decision = await storage.getDecision(parsedId);
        if (!decision || decision.userId !== req.userId) {
          return res.status(403).json({ message: "Not authorized to update this decision" });
        }
      }

      const updatedDecision = await storage.updateDecision(parsedId, data);
      if (!updatedDecision) {
        return res.status(404).json({ message: "Decision not found after update" });
      }
      return res.json(updatedDecision);
    } catch (error) {
      return res.status(500).json({ message: "Error updating decision" });
    }
  }));
  
  app.delete('/api/decisions/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // Clear cache before deleting
      clearCacheMiddleware('decisions')(req, res, () => {});
      
      // In production, verify user owns this decision
      if (process.env.NODE_ENV === 'production') {
        const decision = await storage.getDecision(parsedId);
        if (!decision || decision.userId !== req.userId) {
          return res.status(403).json({ message: "Not authorized to delete this decision" });
        }
      }

      const deleted = await storage.deleteDecision(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Decision not found after delete attempt" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting decision" });
    }
  }));

  // Offer Vault endpoints - Simplified
  app.get('/api/offers', async (req: Request, res: Response) => {
    try {
      const offers = await storage.getOffers(1);
      return res.json(offers);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offers" });
    }
  });
  app.post('/api/offers', async (req: Request, res: Response) => {
    try {
      const data = { userId: 1, ...req.body };
      const validatedData = insertOfferSchema.parse(data);
      const offer = await storage.createOffer(validatedData);
      return res.status(201).json(offer);
    } catch (error) {
      return handleZodError(error, res);
    }
  });
  app.put('/api/offers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const updatedOffer = await storage.updateOffer(parsedId, data);
      if (!updatedOffer) {
        return res.status(404).json({ message: "Offer not found after update" });
      }
      return res.json(updatedOffer);
    } catch (error) {
      return res.status(500).json({ message: "Error updating offer" });
    }
  });
  app.delete('/api/offers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;

      const deleted = await storage.deleteOffer(parsedId);
      if (!deleted) {
        return res.status(404).json({ message: "Offer not found after delete attempt" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting offer" });
    }
  });

  // Offer Notes endpoints - Simplified
  app.get('/api/offer-notes', async (req: Request, res: Response) => {
    try {
      let offerNotes = await storage.getOfferNotesByUserId(1);
      if (!offerNotes || offerNotes.length === 0) {
        const newNote = await storage.createOfferNote({ userId: 1, content: "" });
        offerNotes = [newNote];
      }
      return res.json(offerNotes);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offer notes" });
    }
  });
  app.put('/api/offer-notes/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "Content is required" });
      }
      const updatedOfferNote = await storage.updateOfferNote(parsedId, content);
      if (!updatedOfferNote) {
        return res.status(404).json({ message: "Offer notes not found" });
      }
      return res.json(updatedOfferNote);
    } catch (error) {
      return res.status(500).json({ message: "Error updating offer notes" });
    }
  });

  // =========== Authentication Endpoints ===========
  
  // Standard auth routes
  app.post('/api/auth/login', login);
  app.get('/api/auth/profile', authenticate, getProfile);
  
  // Development-only routes with proper security checks
  app.post('/api/auth/dev-login', async (req, res) => {
    // SECURITY CHECK: Only allow this endpoint in development
    if (process.env.NODE_ENV === 'production') {
      console.error('Attempt to access dev-login in production environment!');
      return res.status(404).json({ message: 'Endpoint not found' });
    }
    
    // Log dev login attempt for security tracking
    console.warn(`[SECURITY] Dev login endpoint accessed from ${req.ip}`);
    
    try {
      // Import dynamically to prevent availability in production builds
      const devAuthModule = await import('./controllers/dev-auth.controller.js');
      
      // Call the devLogin handler
      return devAuthModule.devLogin(req, res);
    } catch (error) {
      console.error('Failed to load dev auth controller:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}