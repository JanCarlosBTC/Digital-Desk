import { IStorage } from './storage.js';
import prisma from './prisma.js';
import {
  User, InsertUser,
  BrainDump, InsertBrainDump,
  ProblemTree, InsertProblemTree,
  DraftedPlan, InsertDraftedPlan,
  ClarityLab, InsertClarityLab,
  WeeklyReflection, InsertWeeklyReflection,
  MonthlyCheckIn, InsertMonthlyCheckIn,
  Priority, InsertPriority,
  Decision, InsertDecision,
  Offer, InsertOffer,
  OfferNote, InsertOfferNote,
  Activity, InsertActivity,
} from "../shared/schema.js";

export class PrismaStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { id }
    });
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await prisma.user.findUnique({
      where: { username }
    });
    return user || undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    return await prisma.user.create({
      data: {
        username: user.username,
        password: user.password,
        name: user.name,
        initials: user.initials,
        plan: user.plan || undefined // Ensure plan is never null
      }
    });
  }

  // Brain Dump methods
  async getBrainDumpByUserId(userId: number): Promise<BrainDump | undefined> {
    const brainDump = await prisma.brainDump.findFirst({
      where: { userId }
    });
    return brainDump || undefined;
  }

  async createBrainDump(brainDump: InsertBrainDump): Promise<BrainDump> {
    return await prisma.brainDump.create({
      data: brainDump
    });
  }

  async updateBrainDump(id: number, content: string): Promise<BrainDump | undefined> {
    const updatedBrainDump = await prisma.brainDump.update({
      where: { id },
      data: { 
        content,
        updatedAt: new Date()
      }
    });
    return updatedBrainDump;
  }

  // Problem Tree methods
  async getProblemTrees(userId: number): Promise<ProblemTree[]> {
    return await prisma.problemTree.findMany({
      where: { userId }
    });
  }

  async getProblemTree(id: number): Promise<ProblemTree | undefined> {
    const problemTree = await prisma.problemTree.findUnique({
      where: { id }
    });
    return problemTree || undefined;
  }

  async createProblemTree(problemTree: InsertProblemTree): Promise<ProblemTree> {
    // Ensure arrays are properly handled with explicit casting
    const subProblemsArray = Array.isArray(problemTree.subProblems) 
      ? [...problemTree.subProblems]
      : [];
    
    const rootCausesArray = Array.isArray(problemTree.rootCauses) 
      ? [...problemTree.rootCauses]
      : [];
    
    const potentialSolutionsArray = Array.isArray(problemTree.potentialSolutions) 
      ? [...problemTree.potentialSolutions]
      : [];
    
    const nextActionsArray = Array.isArray(problemTree.nextActions) 
      ? [...problemTree.nextActions]
      : [];

    return await prisma.problemTree.create({
      data: {
        userId: problemTree.userId,
        title: problemTree.title,
        mainProblem: problemTree.mainProblem,
        subProblems: subProblemsArray,
        rootCauses: rootCausesArray,
        potentialSolutions: potentialSolutionsArray,
        nextActions: nextActionsArray
      }
    });
  }

  async updateProblemTree(id: number, problemTree: Partial<InsertProblemTree>): Promise<ProblemTree | undefined> {
    // Get existing problem tree
    const existingTree = await this.getProblemTree(id);
    if (!existingTree) return undefined;

    const updateData: any = {
      updatedAt: new Date()
    };

    // Carefully update each field, ensuring arrays are properly handled
    if (problemTree.title !== undefined) updateData.title = problemTree.title;
    if (problemTree.mainProblem !== undefined) updateData.mainProblem = problemTree.mainProblem;
    
    // Handle arrays with care - using explicit array creation to ensure proper type handling
    if (problemTree.subProblems !== undefined) {
      const subProblemsArray = Array.isArray(problemTree.subProblems) 
        ? [...problemTree.subProblems]
        : [];
      updateData.subProblems = subProblemsArray;
    }
    
    if (problemTree.rootCauses !== undefined) {
      const rootCausesArray = Array.isArray(problemTree.rootCauses) 
        ? [...problemTree.rootCauses]
        : [];
      updateData.rootCauses = rootCausesArray;
    }
    
    if (problemTree.potentialSolutions !== undefined) {
      const potentialSolutionsArray = Array.isArray(problemTree.potentialSolutions) 
        ? [...problemTree.potentialSolutions]
        : [];
      updateData.potentialSolutions = potentialSolutionsArray;
    }
    
    if (problemTree.nextActions !== undefined) {
      const nextActionsArray = Array.isArray(problemTree.nextActions) 
        ? [...problemTree.nextActions]
        : [];
      updateData.nextActions = nextActionsArray;
    }

    // Update the problem tree
    const updatedProblemTree = await prisma.problemTree.update({
      where: { id },
      data: updateData
    });
    
    return updatedProblemTree;
  }

  async deleteProblemTree(id: number): Promise<boolean> {
    try {
      await prisma.problemTree.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Drafted Plans methods
  async getDraftedPlans(userId: number): Promise<DraftedPlan[]> {
    return await prisma.draftedPlan.findMany({
      where: { userId }
    });
  }

  async getDraftedPlan(id: number): Promise<DraftedPlan | undefined> {
    const draftedPlan = await prisma.draftedPlan.findUnique({
      where: { id }
    });
    return draftedPlan || undefined;
  }

  async createDraftedPlan(draftedPlan: InsertDraftedPlan): Promise<DraftedPlan> {
    // Ensure arrays are properly handled with explicit casting
    const componentsArray = Array.isArray(draftedPlan.components) 
      ? [...draftedPlan.components]
      : [];
    
    const resourcesNeededArray = Array.isArray(draftedPlan.resourcesNeeded) 
      ? [...draftedPlan.resourcesNeeded]
      : [];
    
    const expectedOutcomesArray = Array.isArray(draftedPlan.expectedOutcomes) 
      ? [...draftedPlan.expectedOutcomes]
      : [];

    return await prisma.draftedPlan.create({
      data: {
        userId: draftedPlan.userId,
        title: draftedPlan.title,
        description: draftedPlan.description,
        status: draftedPlan.status,
        components: componentsArray,
        resourcesNeeded: resourcesNeededArray,
        expectedOutcomes: expectedOutcomesArray,
        comments: draftedPlan.comments || 0,
        attachments: draftedPlan.attachments || 0
      }
    });
  }

  async updateDraftedPlan(id: number, draftedPlan: Partial<InsertDraftedPlan>): Promise<DraftedPlan | undefined> {
    // Get existing drafted plan
    const existingPlan = await this.getDraftedPlan(id);
    if (!existingPlan) return undefined;

    const updateData: any = {
      updatedAt: new Date()
    };

    // Carefully update each field, ensuring arrays are properly handled
    if (draftedPlan.title !== undefined) updateData.title = draftedPlan.title;
    if (draftedPlan.description !== undefined) updateData.description = draftedPlan.description;
    if (draftedPlan.status !== undefined) updateData.status = draftedPlan.status;
    
    // Handle arrays with care - using explicit array creation to ensure proper type handling
    if (draftedPlan.components !== undefined) {
      const componentsArray = Array.isArray(draftedPlan.components) 
        ? [...draftedPlan.components]
        : [];
      updateData.components = componentsArray;
    }
    
    if (draftedPlan.resourcesNeeded !== undefined) {
      const resourcesNeededArray = Array.isArray(draftedPlan.resourcesNeeded) 
        ? [...draftedPlan.resourcesNeeded]
        : [];
      updateData.resourcesNeeded = resourcesNeededArray;
    }
    
    if (draftedPlan.expectedOutcomes !== undefined) {
      const expectedOutcomesArray = Array.isArray(draftedPlan.expectedOutcomes) 
        ? [...draftedPlan.expectedOutcomes]
        : [];
      updateData.expectedOutcomes = expectedOutcomesArray;
    }

    // Handle numeric values
    if (draftedPlan.comments !== undefined) updateData.comments = draftedPlan.comments;
    if (draftedPlan.attachments !== undefined) updateData.attachments = draftedPlan.attachments;

    // Update the drafted plan
    const updatedDraftedPlan = await prisma.draftedPlan.update({
      where: { id },
      data: updateData
    });
    
    return updatedDraftedPlan;
  }

  async deleteDraftedPlan(id: number): Promise<boolean> {
    try {
      await prisma.draftedPlan.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Clarity Lab methods
  async getClarityLabs(userId: number, category?: string): Promise<ClarityLab[]> {
    return await prisma.clarityLab.findMany({
      where: { 
        userId,
        ...(category ? { category } : {})
      }
    });
  }

  async getClarityLab(id: number): Promise<ClarityLab | undefined> {
    const clarityLab = await prisma.clarityLab.findUnique({
      where: { id }
    });
    return clarityLab || undefined;
  }

  async createClarityLab(clarityLab: InsertClarityLab): Promise<ClarityLab> {
    return await prisma.clarityLab.create({
      data: clarityLab
    });
  }

  async updateClarityLab(id: number, clarityLab: Partial<InsertClarityLab>): Promise<ClarityLab | undefined> {
    const updatedClarityLab = await prisma.clarityLab.update({
      where: { id },
      data: { 
        ...clarityLab,
        updatedAt: new Date()
      }
    });
    return updatedClarityLab;
  }

  async deleteClarityLab(id: number): Promise<boolean> {
    try {
      await prisma.clarityLab.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Weekly Reflections methods
  async getWeeklyReflections(userId: number): Promise<WeeklyReflection[]> {
    return await prisma.weeklyReflection.findMany({
      where: { userId },
      orderBy: { weekDate: 'desc' }
    });
  }

  async getWeeklyReflection(id: number): Promise<WeeklyReflection | undefined> {
    const weeklyReflection = await prisma.weeklyReflection.findUnique({
      where: { id }
    });
    return weeklyReflection || undefined;
  }

  async createWeeklyReflection(weeklyReflection: InsertWeeklyReflection): Promise<WeeklyReflection> {
    return await prisma.weeklyReflection.create({
      data: weeklyReflection
    });
  }

  async updateWeeklyReflection(id: number, weeklyReflection: Partial<InsertWeeklyReflection>): Promise<WeeklyReflection | undefined> {
    const updatedWeeklyReflection = await prisma.weeklyReflection.update({
      where: { id },
      data: { 
        ...weeklyReflection,
        updatedAt: new Date()
      }
    });
    return updatedWeeklyReflection;
  }

  // Monthly Check-in methods
  async getMonthlyCheckIns(userId: number): Promise<MonthlyCheckIn[]> {
    // First get all check-ins from the database
    const checkIns = await prisma.monthlyCheckIn.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
    
    // Create a new array with properly typed objects
    const result: MonthlyCheckIn[] = [];
    
    // Process each check-in to ensure correct typing
    for (const checkIn of checkIns) {
      const typedCheckIn: MonthlyCheckIn = {
        id: checkIn.id,
        userId: checkIn.userId,
        month: checkIn.month,
        year: checkIn.year,
        completedOn: checkIn.completedOn,
        achievements: Array.isArray(checkIn.achievements) ? checkIn.achievements : [],
        challenges: Array.isArray(checkIn.challenges) ? checkIn.challenges : [],
        nextMonthPriorities: Array.isArray(checkIn.nextMonthPriorities) ? checkIn.nextMonthPriorities : [],
        // Ensure goalProgress is properly typed
        goalProgress: this.transformGoalProgress(checkIn.goalProgress),
        createdAt: checkIn.createdAt,
        updatedAt: checkIn.updatedAt
      };
      
      result.push(typedCheckIn);
    }
    
    return result;
  }

  async getMonthlyCheckInByMonthYear(userId: number, month: number, year: number): Promise<MonthlyCheckIn | undefined> {
    const checkIn = await prisma.monthlyCheckIn.findFirst({
      where: { 
        userId,
        month,
        year
      }
    });
    
    if (!checkIn) return undefined;
    
    // Create a properly typed object
    const typedCheckIn: MonthlyCheckIn = {
      id: checkIn.id,
      userId: checkIn.userId,
      month: checkIn.month,
      year: checkIn.year,
      completedOn: checkIn.completedOn,
      achievements: Array.isArray(checkIn.achievements) ? checkIn.achievements : [],
      challenges: Array.isArray(checkIn.challenges) ? checkIn.challenges : [],
      nextMonthPriorities: Array.isArray(checkIn.nextMonthPriorities) ? checkIn.nextMonthPriorities : [],
      // Ensure goalProgress is properly typed
      goalProgress: this.transformGoalProgress(checkIn.goalProgress),
      createdAt: checkIn.createdAt,
      updatedAt: checkIn.updatedAt
    };
    
    return typedCheckIn;
  }
  
  // Helper method for transforming goalProgress to the correct type
  private transformGoalProgress(goalProgress: any): { goal: string, progress: number }[] {
    if (!goalProgress) return [];
    
    // If it's already an array, map through it
    if (Array.isArray(goalProgress)) {
      return goalProgress.map((item: any) => {
        if (typeof item === 'object' && item !== null && 'goal' in item && 'progress' in item) {
          return {
            goal: String(item.goal),
            progress: Number(item.progress)
          };
        }
        // Default empty item if structure is incorrect
        return { goal: '', progress: 0 };
      });
    }
    
    // If it's not an array, return an empty array
    return [];
  }

  async createMonthlyCheckIn(monthlyCheckIn: InsertMonthlyCheckIn): Promise<MonthlyCheckIn> {
    // Ensure arrays are properly handled with explicit casting
    const challengesArray = Array.isArray(monthlyCheckIn.challenges) 
      ? [...monthlyCheckIn.challenges]
      : [];
    
    const achievementsArray = Array.isArray(monthlyCheckIn.achievements) 
      ? [...monthlyCheckIn.achievements]
      : [];
    
    const nextMonthPrioritiesArray = Array.isArray(monthlyCheckIn.nextMonthPriorities) 
      ? [...monthlyCheckIn.nextMonthPriorities]
      : [];
    
    // Handle the goalProgress array with proper typing
    const goalProgressArray: { goal: string, progress: number }[] = [];
    if (Array.isArray(monthlyCheckIn.goalProgress)) {
      monthlyCheckIn.goalProgress.forEach((item: any) => {
        if (typeof item === 'object' && item !== null && 'goal' in item && 'progress' in item) {
          goalProgressArray.push({
            goal: String(item.goal),
            progress: Number(item.progress)
          });
        }
      });
    }

    // Create in database
    const createdCheckIn = await prisma.monthlyCheckIn.create({
      data: {
        userId: monthlyCheckIn.userId,
        month: monthlyCheckIn.month,
        year: monthlyCheckIn.year,
        challenges: challengesArray,
        achievements: achievementsArray,
        nextMonthPriorities: nextMonthPrioritiesArray,
        completedOn: monthlyCheckIn.completedOn || null,
        goalProgress: goalProgressArray as any // Use type assertion to bypass type checking
      }
    });
    
    // Return with properly typed goalProgress
    return {
      ...createdCheckIn,
      goalProgress: this.transformGoalProgress(createdCheckIn.goalProgress)
    } as MonthlyCheckIn;
  }

  async updateMonthlyCheckIn(id: number, monthlyCheckIn: Partial<InsertMonthlyCheckIn>): Promise<MonthlyCheckIn | undefined> {
    // Get existing monthly check-in
    const existingCheckIn = await prisma.monthlyCheckIn.findUnique({
      where: { id }
    });
    if (!existingCheckIn) return undefined;

    const updateData: any = {
      updatedAt: new Date()
    };

    // Carefully update each field, ensuring arrays are properly handled
    if (monthlyCheckIn.month !== undefined) updateData.month = monthlyCheckIn.month;
    if (monthlyCheckIn.year !== undefined) updateData.year = monthlyCheckIn.year;
    if (monthlyCheckIn.completedOn !== undefined) updateData.completedOn = monthlyCheckIn.completedOn;
    
    // Handle arrays with care
    if (monthlyCheckIn.challenges !== undefined) {
      const challengesArray = Array.isArray(monthlyCheckIn.challenges) 
        ? [...monthlyCheckIn.challenges]
        : [];
      updateData.challenges = challengesArray;
    }
    
    if (monthlyCheckIn.achievements !== undefined) {
      const achievementsArray = Array.isArray(monthlyCheckIn.achievements) 
        ? [...monthlyCheckIn.achievements]
        : [];
      updateData.achievements = achievementsArray;
    }
    
    if (monthlyCheckIn.nextMonthPriorities !== undefined) {
      const nextMonthPrioritiesArray = Array.isArray(monthlyCheckIn.nextMonthPriorities) 
        ? [...monthlyCheckIn.nextMonthPriorities]
        : [];
      updateData.nextMonthPriorities = nextMonthPrioritiesArray;
    }
    
    // Handle goalProgress with proper typing
    if (monthlyCheckIn.goalProgress !== undefined) {
      const goalProgressArray: { goal: string, progress: number }[] = [];
      if (Array.isArray(monthlyCheckIn.goalProgress)) {
        monthlyCheckIn.goalProgress.forEach((item: any) => {
          if (typeof item === 'object' && item !== null && 'goal' in item && 'progress' in item) {
            goalProgressArray.push({
              goal: String(item.goal),
              progress: Number(item.progress)
            });
          }
        });
      }
      updateData.goalProgress = goalProgressArray as any; // Use type assertion to bypass type checking
    }

    // Update the monthly check-in
    const updatedCheckIn = await prisma.monthlyCheckIn.update({
      where: { id },
      data: updateData
    });
    
    // Return with properly typed goalProgress
    return {
      ...updatedCheckIn,
      goalProgress: this.transformGoalProgress(updatedCheckIn.goalProgress)
    } as MonthlyCheckIn;
  }

  // Priorities methods
  async getPriorities(userId: number): Promise<Priority[]> {
    return await prisma.priority.findMany({
      where: { userId },
      orderBy: { order: 'asc' }
    });
  }

  async createPriority(priority: InsertPriority): Promise<Priority> {
    return await prisma.priority.create({
      data: priority
    });
  }

  async updatePriority(id: number, priority: Partial<InsertPriority>): Promise<Priority | undefined> {
    const updatedPriority = await prisma.priority.update({
      where: { id },
      data: { 
        ...priority,
        updatedAt: new Date()
      }
    });
    return updatedPriority;
  }

  async deletePriority(id: number): Promise<boolean> {
    try {
      await prisma.priority.delete({
        where: { id }
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Decision methods
  async getDecisions(userId: number): Promise<Decision[]> {
    return await prisma.decision.findMany({
      where: { userId },
      orderBy: { decisionDate: 'desc' }
    });
  }

  async getDecision(id: number): Promise<Decision | undefined> {
    const decision = await prisma.decision.findUnique({
      where: { id }
    });
    return decision || undefined;
  }

  async createDecision(decision: InsertDecision): Promise<Decision> {
    // Create the decision
    const newDecision = await prisma.decision.create({
      data: decision
    });

    // Create an activity record for the new decision
    await this.createActivity({
      userId: decision.userId,
      type: "created",
      entityType: "decision",
      entityName: newDecision.title,
      metadata: JSON.parse(JSON.stringify({
        category: newDecision.category,
        status: newDecision.status,
        decisionDate: newDecision.decisionDate,
      }))
    });

    return newDecision;
  }

  async updateDecision(id: number, decision: Partial<InsertDecision>): Promise<Decision | undefined> {
    // Get the old decision for comparing changes
    const oldDecision = await this.getDecision(id);
    if (!oldDecision) return undefined;

    // Update the decision
    const updatedDecision = await prisma.decision.update({
      where: { id },
      data: { 
        ...decision,
        updatedAt: new Date()
      }
    });

    // Create activity records for significant changes
    if (decision.status && oldDecision.status !== decision.status) {
      await this.createActivity({
        userId: updatedDecision.userId,
        type: "updated",
        entityType: "decision",
        entityName: updatedDecision.title,
        metadata: JSON.parse(JSON.stringify({
          oldStatus: oldDecision.status,
          newStatus: decision.status,
        }))
      });
    }

    if (decision.title && oldDecision.title !== decision.title) {
      await this.createActivity({
        userId: updatedDecision.userId,
        type: "updated",
        entityType: "decision",
        entityName: decision.title,
        metadata: JSON.parse(JSON.stringify({
          status: updatedDecision.status,
        }))
      });
    }

    return updatedDecision;
  }

  async deleteDecision(id: number): Promise<boolean> {
    try {
      // Get the decision before deleting it
      const decision = await this.getDecision(id);
      if (!decision) return false;

      // Delete the decision
      await prisma.decision.delete({
        where: { id }
      });

      // Create an activity record for the deletion
      await this.createActivity({
        userId: decision.userId,
        type: "deleted",
        entityType: "decision",
        entityName: decision.title,
        metadata: JSON.parse(JSON.stringify({
          category: decision.category,
          status: decision.status,
        }))
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Offer methods
  async getOffers(userId: number): Promise<Offer[]> {
    return await prisma.offer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
  }

  async getOffer(id: number): Promise<Offer | undefined> {
    const offer = await prisma.offer.findUnique({
      where: { id }
    });
    return offer || undefined;
  }

  async createOffer(offer: InsertOffer): Promise<Offer> {
    // Create the offer
    const newOffer = await prisma.offer.create({
      data: offer
    });

    // Create an activity record for the new offer
    await this.createActivity({
      userId: offer.userId,
      type: "created",
      entityType: "offer",
      entityName: newOffer.title,
      metadata: JSON.parse(JSON.stringify({
        status: newOffer.status,
        price: newOffer.price,
      }))
    });

    return newOffer;
  }

  async updateOffer(id: number, offer: Partial<InsertOffer>): Promise<Offer | undefined> {
    // Get the old offer for comparing changes
    const oldOffer = await this.getOffer(id);
    if (!oldOffer) return undefined;

    // Update the offer
    const updatedOffer = await prisma.offer.update({
      where: { id },
      data: { 
        ...offer,
        updatedAt: new Date()
      }
    });

    // Create activity records for significant changes
    if (offer.status && oldOffer.status !== offer.status) {
      await this.createActivity({
        userId: updatedOffer.userId,
        type: "updated",
        entityType: "offer",
        entityName: updatedOffer.title,
        metadata: JSON.parse(JSON.stringify({
          oldStatus: oldOffer.status,
          newStatus: offer.status,
        }))
      });
    }

    return updatedOffer;
  }

  async deleteOffer(id: number): Promise<boolean> {
    try {
      // Get the offer before deleting it
      const offer = await this.getOffer(id);
      if (!offer) return false;

      // Delete the offer
      await prisma.offer.delete({
        where: { id }
      });

      // Create an activity record for the deletion
      await this.createActivity({
        userId: offer.userId,
        type: "deleted",
        entityType: "offer",
        entityName: offer.title,
        metadata: JSON.parse(JSON.stringify({
          status: offer.status,
        }))
      });

      return true;
    } catch (error) {
      return false;
    }
  }

  // Offer Notes methods
  async getOfferNotesByUserId(userId: number): Promise<OfferNote[]> {
    const offerNotes = await prisma.offerNote.findMany({
      where: { userId }
    });
    return offerNotes;
  }

  async createOfferNote(offerNote: InsertOfferNote): Promise<OfferNote> {
    return await prisma.offerNote.create({
      data: {
        userId: offerNote.userId,
        content: offerNote.content || ""  // Ensure content is never undefined
      }
    });
  }

  async updateOfferNote(id: number, content: string): Promise<OfferNote | undefined> {
    const updatedOfferNote = await prisma.offerNote.update({
      where: { id },
      data: { 
        content,
        updatedAt: new Date()
      }
    });
    return updatedOfferNote;
  }

  // Activity methods
  async getRecentActivities(userId: number, limit: number): Promise<Activity[]> {
    return await prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit
    });
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    return await prisma.activity.create({
      data: {
        userId: activity.userId,
        type: activity.type,
        entityType: activity.entityType,
        entityName: activity.entityName,
        metadata: activity.metadata ? JSON.parse(JSON.stringify(activity.metadata)) : {} // Ensure metadata is never undefined
      }
    });
  }
}