import type { Express, Response, NextFunction } from "express";
import type { Request } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { 
  insertBrainDumpSchema, insertProblemTreeSchema, insertDraftedPlanSchema, 
  insertClarityLabSchema, insertWeeklyReflectionSchema, insertMonthlyCheckInSchema, 
  insertPrioritySchema, insertDecisionSchema, insertOfferSchema, insertOfferNoteSchema,
  demoUserSchema
} from "../shared/schema.js";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { cacheMiddleware, clearCacheMiddleware } from "./middleware/cache.js";
// Authentication 
import { withAuth, withAuthAndUser, withDevAuth } from "./middleware/auth-wrapper.js";
import authRoutes from "./routes-auth.js";
import workspaceRoutes from "./routes-workspace.js";
import clientRoutes from "./routes-client.js";
import adminRoutes from "./routes-admin.js";
import { setupAuth } from "./replitAuth.js";

// The Request interface is now augmented via server/types/express.d.ts

/**
 * Helper function to safely validate an ID from request parameters
 */
function parseAndValidateId(id: string | undefined, res: Response): string | undefined {
  if (id === undefined) {
    res.status(400).json({ message: "ID parameter is required" });
    return undefined;
  }
  // Just return the ID string as we're using string IDs now with Replit Auth
  return String(id);
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth
  await setupAuth(app);
  
  // Register auth routes
  app.use('/api', authRoutes);
  
  // Register client routes
  app.use('/api', clientRoutes);
  
  // Register workspace routes
  app.use('/', workspaceRoutes);
  
  // Register admin routes
  app.use('/api', adminRoutes);
  
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
      const userId = req.userId ? String(req.userId) : "";
      
      const brainDumps = await storage.getBrainDumps(userId);
      
      // Only return data if found
      if (!brainDumps || brainDumps.length === 0) {
        return res.status(404).json({ message: "Brain dump not found" });
      }
      
      return res.json(brainDumps[0] || {content: ""});
    } catch (error) {
      return res.status(500).json({ message: "Error fetching brain dump" });
    }
  }));

  app.post('/api/brain-dump', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = {
        userId: req.userId ? String(req.userId) : "", // User ID comes from auth middleware
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
        // Use getBrainDumps which is available in the storage interface
        const existingBrainDumps = await storage.getBrainDumps(req.userId ? String(req.userId) : "");
        const existingBrainDump = existingBrainDumps && existingBrainDumps.length > 0 ? existingBrainDumps[0] : null;
        // Explicit conversion for comparison
        if (!existingBrainDump || parseInt(existingBrainDump.id.toString()) !== parseInt(parsedId.toString())) {
          return res.status(403).json({ message: "Not authorized to update this brain dump" });
        }
      }
      
      const updatedBrainDump = await storage.updateBrainDump(parseInt(parsedId.toString()), content);
      if (!updatedBrainDump) {
        return res.status(404).json({ message: "Brain dump not found" });
      }
      
      return res.json(updatedBrainDump);
    } catch (error) {
      return res.status(500).json({ message: "Error updating brain dump" });
    }
  }));


  // Problem Tree endpoints - secured with auth wrapper
  app.get('/api/problem-trees', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const problemTrees = await storage.getProblemTrees(req.userId ? String(req.userId) : "");
      return res.json(problemTrees);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching problem trees" });
    }
  }));

  app.post('/api/problem-trees', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = {
        userId: req.userId ? String(req.userId) : "",
        ...req.body
      };
      const validatedData = insertProblemTreeSchema.parse(data);
      const problemTree = await storage.createProblemTree(validatedData);
      
      // Clear cache after creating new problem tree
      clearCacheMiddleware('problem-trees')(req, res, () => {});
      
      return res.status(201).json(problemTree);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));

  app.put('/api/problem-trees/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this problem tree
      if (process.env.NODE_ENV === 'production') {
        const problemTree = await storage.getProblemTree(parseInt(parsedId.toString()));
        if (!problemTree || problemTree.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to update this problem tree" });
        }
      }

      const updatedProblemTree = await storage.updateProblemTree(parseInt(parsedId.toString()), data);
      if (!updatedProblemTree) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      // Clear cache after update
      clearCacheMiddleware('problem-trees')(req, res, () => {});
      
      return res.json(updatedProblemTree);
    } catch (error) {
      return res.status(500).json({ message: "Error updating problem tree" });
    }
  }));

  app.delete('/api/problem-trees/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this problem tree
      if (process.env.NODE_ENV === 'production') {
        const problemTree = await storage.getProblemTree(parseInt(parsedId.toString()));
        if (!problemTree || problemTree.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to delete this problem tree" });
        }
      }

      await storage.deleteProblemTree(parseInt(parsedId.toString()));
      
      // Clear cache after deletion
      clearCacheMiddleware('problem-trees')(req, res, () => {});
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting problem tree" });
    }
  }));

  // Drafted Plans endpoints - Secured with auth wrapper
  app.get('/api/drafted-plans', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const draftedPlans = await storage.getDraftedPlans(req.userId ? String(req.userId) : "");
      return res.json(draftedPlans);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching drafted plans" });
    }
  }));
  
  app.post('/api/drafted-plans', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      const validatedData = insertDraftedPlanSchema.parse(data);
      const draftedPlan = await storage.createDraftedPlan(validatedData);
      return res.status(201).json(draftedPlan);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));
  
  app.put('/api/drafted-plans/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this drafted plan
      if (process.env.NODE_ENV === 'production') {
        const draftedPlan = await storage.getDraftedPlan(parseInt(parsedId.toString()));
        if (!draftedPlan || draftedPlan.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to update this drafted plan" });
        }
      }

      const updatedDraftedPlan = await storage.updateDraftedPlan(parseInt(parsedId.toString()), data);
      if (!updatedDraftedPlan) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      return res.json(updatedDraftedPlan);
    } catch (error) {
      return res.status(500).json({ message: "Error updating drafted plan" });
    }
  }));
  
  app.delete('/api/drafted-plans/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this drafted plan
      if (process.env.NODE_ENV === 'production') {
        const draftedPlan = await storage.getDraftedPlan(parseInt(parsedId.toString()));
        if (!draftedPlan || draftedPlan.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to delete this drafted plan" });
        }
      }

      try {
        await storage.deleteDraftedPlan(parseInt(parsedId.toString()));
        // Since deleteDraftedPlan returns void, no check needed
      } catch (deleteError) {
        console.error("Error deleting drafted plan:", deleteError);
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting drafted plan" });
    }
  }));

  // Clarity Lab endpoints - Secured with auth wrapper
  app.get('/api/clarity-labs', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const clarityLabs = await storage.getClarityLabs(req.userId ? String(req.userId) : "");
      return res.json(clarityLabs);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching clarity labs" });
    }
  }));
  
  app.post('/api/clarity-labs', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      const validatedData = insertClarityLabSchema.parse(data);
      const clarityLab = await storage.createClarityLab(validatedData);
      return res.status(201).json(clarityLab);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));
  
  app.put('/api/clarity-labs/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this clarity lab entry
      if (process.env.NODE_ENV === 'production') {
        const clarityLab = await storage.getClarityLab(parseInt(parsedId.toString()));
        if (!clarityLab || clarityLab.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to update this clarity lab entry" });
        }
      }

      const updatedClarityLab = await storage.updateClarityLab(parseInt(parsedId.toString()), data);
      if (!updatedClarityLab) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      return res.json(updatedClarityLab);
    } catch (error) {
      return res.status(500).json({ message: "Error updating clarity lab entry" });
    }
  }));
  
  app.delete('/api/clarity-labs/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this clarity lab entry
      if (process.env.NODE_ENV === 'production') {
        const clarityLab = await storage.getClarityLab(parseInt(parsedId.toString()));
        if (!clarityLab || clarityLab.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to delete this clarity lab entry" });
        }
      }

      try {
        await storage.deleteClarityLab(parseInt(parsedId.toString()));
        // Since deleteClarityLab returns void, we don't check its return value
      } catch (deleteError) {
        console.error("Error deleting clarity lab:", deleteError);
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting clarity lab entry" });
    }
  }));

  // Weekly Reflections endpoints - Secured with auth wrapper
  app.get('/api/weekly-reflections', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const weeklyReflections = await storage.getWeeklyReflections(req.userId ? String(req.userId) : "");
      return res.json(weeklyReflections);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching weekly reflections" });
    }
  }));
  
  app.post('/api/weekly-reflections', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      // Log incoming request for debugging
      console.log('Creating weekly reflection - request body:', JSON.stringify(req.body));
      
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      
      console.log('Creating weekly reflection - data with userId:', JSON.stringify(data));
      
      try {
        const validatedData = insertWeeklyReflectionSchema.parse(data);
        console.log('Creating weekly reflection - validated data:', JSON.stringify(validatedData));
        
        const weeklyReflection = await storage.createWeeklyReflection(validatedData);
        console.log('Weekly reflection created successfully:', JSON.stringify(weeklyReflection));
        
        return res.status(201).json(weeklyReflection);
      } catch (validationError) {
        console.error('Validation error in weekly reflection creation:', validationError);
        return handleZodError(validationError, res);
      }
    } catch (error) {
      console.error('Unexpected error in weekly reflection creation:', error);
      return res.status(500).json({ 
        message: "Error creating weekly reflection", 
        error: (error as Error).message 
      });
    }
  }));
  
  app.put('/api/weekly-reflections/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      console.log('Updating weekly reflection:', { id, data });

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this weekly reflection
      if (process.env.NODE_ENV === 'production') {
        const weeklyReflection = await storage.getWeeklyReflection(parseInt(parsedId.toString()));
        if (!weeklyReflection || weeklyReflection.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to update this weekly reflection" });
        }
      }

      try {
        const updatedWeeklyReflection = await storage.updateWeeklyReflection(parseInt(parsedId.toString()), data);
        if (!updatedWeeklyReflection) {
          console.log('Weekly reflection not found:', parsedId);
          return res.status(404).json({ message: "Weekly reflection not found" });
        }
        console.log('Weekly reflection updated successfully:', updatedWeeklyReflection);
        return res.json(updatedWeeklyReflection);
      } catch (storageError: any) {
        console.error('Error in storage.updateWeeklyReflection:', storageError);
        const errorMessage = storageError?.message || 'Unknown storage error';
        return res.status(500).json({ message: `Error updating weekly reflection: ${errorMessage}` });
      }
    } catch (error) {
      console.error('Error in weekly reflection update route:', error);
      return res.status(500).json({ message: "Error updating weekly reflection" });
    }
  }));
  
  app.delete('/api/weekly-reflections/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) {
        return res.status(400).json({ message: "Invalid ID" });
      }

      // In production, verify user owns this weekly reflection
      if (process.env.NODE_ENV === 'production') {
        const reflectionExists = await storage.getWeeklyReflection(parseInt(parsedId.toString()));
        if (!reflectionExists || reflectionExists.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to delete this weekly reflection" });
        }
      } else {
        // In development, just check if it exists
        const reflectionExists = await storage.getWeeklyReflection(parseInt(parsedId.toString()));
        if (!reflectionExists) {
          return res.status(404).json({ message: "Weekly reflection not found" });
        }
      }
      
      // Now try to delete it
      try {
        await storage.deleteWeeklyReflection(parseInt(parsedId.toString()));
        // Since deleteWeeklyReflection returns void, we don't check its return value
      } catch (deleteError) {
        console.error("Error deleting weekly reflection:", deleteError);
        return res.status(500).json({ message: "Failed to delete weekly reflection" });
      }
      
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting weekly reflection" });
    }
  }));

  // Monthly Check-ins endpoints - Secured with auth wrapper
  app.get('/api/monthly-check-ins', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const monthlyCheckIns = await storage.getMonthlyCheckIns(req.userId ? String(req.userId) : "");
      return res.json(monthlyCheckIns);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching monthly check-ins" });
    }
  }));
  
  app.post('/api/monthly-check-ins', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      const validatedData = insertMonthlyCheckInSchema.parse(data);
      const monthlyCheckIn = await storage.createMonthlyCheckIn(validatedData);
      return res.status(201).json(monthlyCheckIn);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));
  
  app.get('/api/monthly-check-ins/:month/:year', withAuthAndUser(async (req: Request, res: Response) => {
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
        req.userId ? String(req.userId) : "", 
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
  }));
  
  app.put('/api/monthly-check-ins/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this monthly check-in
      if (process.env.NODE_ENV === 'production') {
        // Get monthly check-ins for user to verify ownership
        const userCheckIns = await storage.getMonthlyCheckIns(req.userId ? String(req.userId) : "");
        const checkInExists = userCheckIns.some(checkIn => checkIn.id === parsedId);
        
        if (!checkInExists) {
          return res.status(403).json({ message: "Not authorized to update this monthly check-in" });
        }
      }

      const updatedMonthlyCheckIn = await storage.updateMonthlyCheckIn(parseInt(parsedId.toString()), data);
      if (!updatedMonthlyCheckIn) {
        return res.status(404).json({ message: "Monthly check-in not found" });
      }
      return res.json(updatedMonthlyCheckIn);
    } catch (error) {
      return res.status(500).json({ message: "Error updating monthly check-in" });
    }
  }));

  // Priorities endpoints - Secured with auth wrapper
  app.get('/api/priorities', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const priorities = await storage.getPriorities(req.userId ? String(req.userId) : "");
      return res.json(priorities);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching priorities" });
    }
  }));
  
  app.post('/api/priorities', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      const validatedData = insertPrioritySchema.parse(data);
      const priority = await storage.createPriority(validatedData);
      return res.status(201).json(priority);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));
  
  app.put('/api/priorities/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this priority
      if (process.env.NODE_ENV === 'production') {
        // Get all user priorities to verify ownership
        const userPriorities = await storage.getPriorities(req.userId ? String(req.userId) : "");
        const priorityExists = userPriorities.some(priority => priority.id === parsedId);
        
        if (!priorityExists) {
          return res.status(403).json({ message: "Not authorized to update this priority" });
        }
      }

      const updatedPriority = await storage.updatePriority(parseInt(parsedId.toString()), data);
      if (!updatedPriority) {
        return res.status(404).json({ message: "Priority not found" });
      }
      return res.json(updatedPriority);
    } catch (error) {
      return res.status(500).json({ message: "Error updating priority" });
    }
  }));
  
  app.delete('/api/priorities/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this priority
      if (process.env.NODE_ENV === 'production') {
        // Get all user priorities to verify ownership
        const userPriorities = await storage.getPriorities(req.userId ? String(req.userId) : "");
        const priorityExists = userPriorities.some(priority => priority.id === parsedId);
        
        if (!priorityExists) {
          return res.status(403).json({ message: "Not authorized to delete this priority" });
        }
      }

      try {
        await storage.deletePriority(parseInt(parsedId.toString()));
        // Since deletePriority returns void, we don't check its return value
      } catch (deleteError) {
        console.error("Error deleting priority:", deleteError);
        return res.status(404).json({ message: "Priority not found" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting priority" });
    }
  }));

  // Decision Log endpoints - Protected with auth wrapper
  app.get('/api/decisions', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const decisions = await storage.getDecisions(req.userId ? String(req.userId) : "");
      return res.json(decisions);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching decisions" });
    }
  }));
  
  app.post('/api/decisions', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      console.log("Received decision creation request with body:", JSON.stringify(req.body, null, 2));
      
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      
      console.log("Processing data for decision validation:", JSON.stringify(data, null, 2));
      
      try {
        const validatedData = insertDecisionSchema.parse(data);
        console.log("Validation successful, validated data:", JSON.stringify(validatedData, null, 2));
        
        const decision = await storage.createDecision(validatedData);
        console.log("Decision created successfully:", JSON.stringify(decision, null, 2));
        
        // Clear cache after creating new decision
        clearCacheMiddleware('decisions')(req, res, () => {});
        return res.status(201).json(decision);
      } catch (validationError) {
        console.error("Validation error:", validationError);
        if (validationError instanceof Error) {
          console.error("Error details:", validationError.message);
        }
        return handleZodError(validationError, res);
      }
    } catch (error) {
      console.error("Unexpected error in decision creation:", error);
      if (error instanceof Error) {
        return res.status(500).json({ message: `Error creating decision: ${error.message}` });
      }
      return res.status(500).json({ message: "Unknown error occurred creating decision" });
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
        const decision = await storage.getDecision(parseInt(parsedId.toString()));
        if (!decision || decision.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to update this decision" });
        }
      }

      const updatedDecision = await storage.updateDecision(parseInt(parsedId.toString()), data);
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
        const decision = await storage.getDecision(parseInt(parsedId.toString()));
        if (!decision || decision.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to delete this decision" });
        }
      }

      try {
        await storage.deleteDecision(parseInt(parsedId.toString()));
        // Since deleteDecision returns void, we don't check its return value
      } catch (deleteError) {
        console.error("Error deleting decision:", deleteError);
        return res.status(404).json({ message: "Decision not found after delete attempt" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting decision" });
    }
  }));

  // Offer Vault endpoints - Secured with auth wrapper
  app.get('/api/offers', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const offers = await storage.getOffers(req.userId ? String(req.userId) : "");
      return res.json(offers);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offers" });
    }
  }));
  
  app.post('/api/offers', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const data = { 
        userId: req.userId ? String(req.userId) : "", 
        ...req.body 
      };
      const validatedData = insertOfferSchema.parse(data);
      const offer = await storage.createOffer(validatedData);
      return res.status(201).json(offer);
    } catch (error) {
      return handleZodError(error, res);
    }
  }));
  app.put('/api/offers/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;

      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this offer
      if (process.env.NODE_ENV === 'production') {
        const offer = await storage.getOffer(parseInt(parsedId.toString()));
        if (!offer || offer.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to update this offer" });
        }
      }

      const updatedOffer = await storage.updateOffer(parseInt(parsedId.toString()), data);
      if (!updatedOffer) {
        return res.status(404).json({ message: "Offer not found after update" });
      }
      return res.json(updatedOffer);
    } catch (error) {
      return res.status(500).json({ message: "Error updating offer" });
    }
  }));
  
  app.delete('/api/offers/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      // In production, verify user owns this offer
      if (process.env.NODE_ENV === 'production') {
        const offer = await storage.getOffer(parseInt(parsedId.toString()));
        if (!offer || offer.userId !== (req.userId ? String(req.userId) : "")) {
          return res.status(403).json({ message: "Not authorized to delete this offer" });
        }
      }

      try {
        await storage.deleteOffer(parseInt(parsedId.toString()));
        // Since deleteOffer returns void, we don't check its return value
      } catch (deleteError) {
        console.error("Error deleting offer:", deleteError);
        return res.status(404).json({ message: "Offer not found after delete attempt" });
      }
      return res.status(204).end();
    } catch (error) {
      return res.status(500).json({ message: "Error deleting offer" });
    }
  }));

  // Offer Notes endpoints - Secured with auth wrapper
  app.get('/api/offer-notes', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      let offerNotes = await storage.getOfferNotesByUserId(req.userId ? String(req.userId) : "");
      
      // Create empty notes if none exist
      if (!offerNotes || offerNotes.length === 0) {
        const newNote = await storage.createOfferNote({ 
          userId: req.userId ? String(req.userId) : "", 
          content: "" 
        });
        offerNotes = [newNote];
      }
      
      return res.json(offerNotes);
    } catch (error) {
      return res.status(500).json({ message: "Error fetching offer notes" });
    }
  }));
  
  app.put('/api/offer-notes/:id', withAuthAndUser(async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const parsedId = parseAndValidateId(id, res);
      if (parsedId === undefined) return;
      
      if (content === undefined || content === null) {
        return res.status(400).json({ message: "Content is required" });
      }
      
      // In production, verify user owns these notes
      if (process.env.NODE_ENV === 'production') {
        // Fetch all user's notes to check ownership
        const userNotes = await storage.getOfferNotesByUserId(req.userId ? String(req.userId) : "");
        const noteExists = userNotes.some(note => note.id === parsedId);
        
        if (!noteExists) {
          return res.status(403).json({ message: "Not authorized to update these notes" });
        }
      }
      
      const updatedOfferNote = await storage.updateOfferNote(parseInt(parsedId.toString()), content);
      if (!updatedOfferNote) {
        return res.status(404).json({ message: "Offer notes not found" });
      }
      
      return res.json(updatedOfferNote);
    } catch (error) {
      return res.status(500).json({ message: "Error updating offer notes" });
    }
  }));

  // =========== User Information API ===========
  
  // Demo user information endpoint
  app.get('/api/user', (req, res) => {
    // Return a fixed demo user using the demoUserSchema format
    const demoUser = {
      id: "1",
      name: "Demo User",
      username: "demo",
      initials: "DU",
      plan: "Premium"
    };
    
    // Validate with schema to ensure it matches expected format
    try {
      const validated = demoUserSchema.parse(demoUser);
      return res.json(validated);
    } catch (error) {
      console.error("Demo user validation failed:", error);
      return res.status(500).json({ message: "Error creating demo user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}