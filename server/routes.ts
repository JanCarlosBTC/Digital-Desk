import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertBrainDumpSchema, insertProblemTreeSchema, insertDraftedPlanSchema, 
  insertClarityLabSchema, insertWeeklyReflectionSchema, insertMonthlyCheckInSchema, 
  insertPrioritySchema, insertDecisionSchema, insertOfferSchema, insertOfferNoteSchema 
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

// For simplicity, we're using a fixed user ID for now
const DEMO_USER_ID = 1;

export async function registerRoutes(app: Express): Promise<Server> {
  // Error handling middleware for Zod validation errors
  const handleZodError = (error: unknown, res: Response) => {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ 
        message: validationError.message,
        errors: error.errors 
      });
    }
    return res.status(500).json({ message: "An unexpected error occurred" });
  };

  // Current user endpoint (using mock user for now)
  app.get('/api/user', async (req: Request, res: Response) => {
    try {
      const user = await storage.getUser(DEMO_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  // Recent activities
  app.get('/api/activities', async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(DEMO_USER_ID, limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching activities" });
    }
  });

  // Brain Dump endpoints
  app.get('/api/brain-dump', async (req: Request, res: Response) => {
    try {
      let brainDump = await storage.getBrainDumpByUserId(DEMO_USER_ID);
      
      // If no brain dump exists, create an empty one
      if (!brainDump) {
        brainDump = await storage.createBrainDump({
          userId: DEMO_USER_ID,
          content: ""
        });
      }
      
      res.json(brainDump);
    } catch (error) {
      res.status(500).json({ message: "Error fetching brain dump" });
    }
  });

  app.put('/api/brain-dump/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const updatedBrainDump = await storage.updateBrainDump(parseInt(id), content);
      if (!updatedBrainDump) {
        return res.status(404).json({ message: "Brain dump not found" });
      }
      
      res.json(updatedBrainDump);
    } catch (error) {
      res.status(500).json({ message: "Error updating brain dump" });
    }
  });

  // Problem Tree endpoints
  app.get('/api/problem-trees', async (req: Request, res: Response) => {
    try {
      const problemTrees = await storage.getProblemTrees(DEMO_USER_ID);
      res.json(problemTrees);
    } catch (error) {
      res.status(500).json({ message: "Error fetching problem trees" });
    }
  });

  app.get('/api/problem-trees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const problemTree = await storage.getProblemTree(parseInt(id));
      
      if (!problemTree) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      res.json(problemTree);
    } catch (error) {
      res.status(500).json({ message: "Error fetching problem tree" });
    }
  });

  app.post('/api/problem-trees', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertProblemTreeSchema.parse(data);
      const problemTree = await storage.createProblemTree(validatedData);
      
      res.status(201).json(problemTree);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/problem-trees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedProblemTree = await storage.updateProblemTree(parseInt(id), data);
      if (!updatedProblemTree) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      res.json(updatedProblemTree);
    } catch (error) {
      res.status(500).json({ message: "Error updating problem tree" });
    }
  });

  app.delete('/api/problem-trees/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteProblemTree(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Problem tree not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting problem tree" });
    }
  });

  // Drafted Plans endpoints
  app.get('/api/drafted-plans', async (req: Request, res: Response) => {
    try {
      const draftedPlans = await storage.getDraftedPlans(DEMO_USER_ID);
      res.json(draftedPlans);
    } catch (error) {
      res.status(500).json({ message: "Error fetching drafted plans" });
    }
  });

  app.get('/api/drafted-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const draftedPlan = await storage.getDraftedPlan(parseInt(id));
      
      if (!draftedPlan) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      
      res.json(draftedPlan);
    } catch (error) {
      res.status(500).json({ message: "Error fetching drafted plan" });
    }
  });

  app.post('/api/drafted-plans', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertDraftedPlanSchema.parse(data);
      const draftedPlan = await storage.createDraftedPlan(validatedData);
      
      res.status(201).json(draftedPlan);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/drafted-plans/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedDraftedPlan = await storage.updateDraftedPlan(parseInt(id), data);
      if (!updatedDraftedPlan) {
        return res.status(404).json({ message: "Drafted plan not found" });
      }
      
      res.json(updatedDraftedPlan);
    } catch (error) {
      res.status(500).json({ message: "Error updating drafted plan" });
    }
  });

  // Clarity Lab endpoints
  app.get('/api/clarity-labs', async (req: Request, res: Response) => {
    try {
      const category = req.query.category as string | undefined;
      const clarityLabs = await storage.getClarityLabs(DEMO_USER_ID, category);
      res.json(clarityLabs);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clarity labs" });
    }
  });

  app.get('/api/clarity-labs/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const clarityLab = await storage.getClarityLab(parseInt(id));
      
      if (!clarityLab) {
        return res.status(404).json({ message: "Clarity lab entry not found" });
      }
      
      res.json(clarityLab);
    } catch (error) {
      res.status(500).json({ message: "Error fetching clarity lab entry" });
    }
  });

  app.post('/api/clarity-labs', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertClarityLabSchema.parse(data);
      const clarityLab = await storage.createClarityLab(validatedData);
      
      res.status(201).json(clarityLab);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  // Weekly Reflections endpoints
  app.get('/api/weekly-reflections', async (req: Request, res: Response) => {
    try {
      const weeklyReflections = await storage.getWeeklyReflections(DEMO_USER_ID);
      res.json(weeklyReflections);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weekly reflections" });
    }
  });

  app.get('/api/weekly-reflections/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const weeklyReflection = await storage.getWeeklyReflection(parseInt(id));
      
      if (!weeklyReflection) {
        return res.status(404).json({ message: "Weekly reflection not found" });
      }
      
      res.json(weeklyReflection);
    } catch (error) {
      res.status(500).json({ message: "Error fetching weekly reflection" });
    }
  });

  app.post('/api/weekly-reflections', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      console.log("Received weekly reflection data:", data);
      
      try {
        const validatedData = insertWeeklyReflectionSchema.parse(data);
        const weeklyReflection = await storage.createWeeklyReflection(validatedData);
        res.status(201).json(weeklyReflection);
      } catch (zodError) {
        console.error("Weekly reflection validation error:", zodError);
        handleZodError(zodError, res);
      }
    } catch (error) {
      console.error("Unexpected error in weekly reflection creation:", error);
      res.status(500).json({ message: "Error creating weekly reflection" });
    }
  });

  app.put('/api/weekly-reflections/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedWeeklyReflection = await storage.updateWeeklyReflection(parseInt(id), data);
      if (!updatedWeeklyReflection) {
        return res.status(404).json({ message: "Weekly reflection not found" });
      }
      
      res.json(updatedWeeklyReflection);
    } catch (error) {
      res.status(500).json({ message: "Error updating weekly reflection" });
    }
  });

  // Monthly Check-ins endpoints
  app.get('/api/monthly-check-ins', async (req: Request, res: Response) => {
    try {
      const monthlyCheckIns = await storage.getMonthlyCheckIns(DEMO_USER_ID);
      res.json(monthlyCheckIns);
    } catch (error) {
      res.status(500).json({ message: "Error fetching monthly check-ins" });
    }
  });

  app.get('/api/monthly-check-ins/:month/:year', async (req: Request, res: Response) => {
    try {
      const { month, year } = req.params;
      const monthlyCheckIn = await storage.getMonthlyCheckInByMonthYear(
        DEMO_USER_ID, 
        parseInt(month), 
        parseInt(year)
      );
      
      if (!monthlyCheckIn) {
        return res.status(404).json({ message: "Monthly check-in not found" });
      }
      
      res.json(monthlyCheckIn);
    } catch (error) {
      res.status(500).json({ message: "Error fetching monthly check-in" });
    }
  });

  app.post('/api/monthly-check-ins', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertMonthlyCheckInSchema.parse(data);
      const monthlyCheckIn = await storage.createMonthlyCheckIn(validatedData);
      
      res.status(201).json(monthlyCheckIn);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/monthly-check-ins/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedMonthlyCheckIn = await storage.updateMonthlyCheckIn(parseInt(id), data);
      if (!updatedMonthlyCheckIn) {
        return res.status(404).json({ message: "Monthly check-in not found" });
      }
      
      res.json(updatedMonthlyCheckIn);
    } catch (error) {
      res.status(500).json({ message: "Error updating monthly check-in" });
    }
  });

  // Priorities endpoints
  app.get('/api/priorities', async (req: Request, res: Response) => {
    try {
      const priorities = await storage.getPriorities(DEMO_USER_ID);
      res.json(priorities);
    } catch (error) {
      res.status(500).json({ message: "Error fetching priorities" });
    }
  });

  app.post('/api/priorities', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertPrioritySchema.parse(data);
      const priority = await storage.createPriority(validatedData);
      
      res.status(201).json(priority);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/priorities/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedPriority = await storage.updatePriority(parseInt(id), data);
      if (!updatedPriority) {
        return res.status(404).json({ message: "Priority not found" });
      }
      
      res.json(updatedPriority);
    } catch (error) {
      res.status(500).json({ message: "Error updating priority" });
    }
  });

  app.delete('/api/priorities/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deletePriority(parseInt(id));
      
      if (!deleted) {
        return res.status(404).json({ message: "Priority not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ message: "Error deleting priority" });
    }
  });

  // Decision Log endpoints
  app.get('/api/decisions', async (req: Request, res: Response) => {
    try {
      const decisions = await storage.getDecisions(DEMO_USER_ID);
      res.json(decisions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching decisions" });
    }
  });

  app.get('/api/decisions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const decision = await storage.getDecision(parseInt(id));
      
      if (!decision) {
        return res.status(404).json({ message: "Decision not found" });
      }
      
      res.json(decision);
    } catch (error) {
      res.status(500).json({ message: "Error fetching decision" });
    }
  });

  app.post('/api/decisions', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertDecisionSchema.parse(data);
      const decision = await storage.createDecision(validatedData);
      
      res.status(201).json(decision);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/decisions/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedDecision = await storage.updateDecision(parseInt(id), data);
      if (!updatedDecision) {
        return res.status(404).json({ message: "Decision not found" });
      }
      
      res.json(updatedDecision);
    } catch (error) {
      res.status(500).json({ message: "Error updating decision" });
    }
  });

  // Offer Vault endpoints
  app.get('/api/offers', async (req: Request, res: Response) => {
    try {
      const offers = await storage.getOffers(DEMO_USER_ID);
      res.json(offers);
    } catch (error) {
      res.status(500).json({ message: "Error fetching offers" });
    }
  });

  app.get('/api/offers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const offer = await storage.getOffer(parseInt(id));
      
      if (!offer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      res.json(offer);
    } catch (error) {
      res.status(500).json({ message: "Error fetching offer" });
    }
  });

  app.post('/api/offers', async (req: Request, res: Response) => {
    try {
      const data = {
        ...req.body,
        userId: DEMO_USER_ID
      };
      
      const validatedData = insertOfferSchema.parse(data);
      const offer = await storage.createOffer(validatedData);
      
      res.status(201).json(offer);
    } catch (error) {
      handleZodError(error, res);
    }
  });

  app.put('/api/offers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const data = req.body;
      
      const updatedOffer = await storage.updateOffer(parseInt(id), data);
      if (!updatedOffer) {
        return res.status(404).json({ message: "Offer not found" });
      }
      
      res.json(updatedOffer);
    } catch (error) {
      res.status(500).json({ message: "Error updating offer" });
    }
  });

  // Offer Notes endpoints
  app.get('/api/offer-notes', async (req: Request, res: Response) => {
    try {
      let offerNote = await storage.getOfferNotesByUserId(DEMO_USER_ID);
      
      // If no notes exist, create empty notes
      if (!offerNote) {
        offerNote = await storage.createOfferNote({
          userId: DEMO_USER_ID,
          content: ""
        });
      }
      
      res.json(offerNote);
    } catch (error) {
      res.status(500).json({ message: "Error fetching offer notes" });
    }
  });

  app.put('/api/offer-notes/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { content } = req.body;
      
      const updatedOfferNote = await storage.updateOfferNote(parseInt(id), content);
      if (!updatedOfferNote) {
        return res.status(404).json({ message: "Offer notes not found" });
      }
      
      res.json(updatedOfferNote);
    } catch (error) {
      res.status(500).json({ message: "Error updating offer notes" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
