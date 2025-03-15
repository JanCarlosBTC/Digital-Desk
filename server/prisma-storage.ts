import { IStorage } from './storage';
import prisma from './prisma';
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
} from "@shared/schema";

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
      data: user
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
    return await prisma.problemTree.create({
      data: problemTree
    });
  }

  async updateProblemTree(id: number, problemTree: Partial<InsertProblemTree>): Promise<ProblemTree | undefined> {
    const updatedProblemTree = await prisma.problemTree.update({
      where: { id },
      data: { 
        ...problemTree,
        updatedAt: new Date()
      }
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
    return await prisma.draftedPlan.create({
      data: draftedPlan
    });
  }

  async updateDraftedPlan(id: number, draftedPlan: Partial<InsertDraftedPlan>): Promise<DraftedPlan | undefined> {
    const updatedDraftedPlan = await prisma.draftedPlan.update({
      where: { id },
      data: { 
        ...draftedPlan,
        updatedAt: new Date()
      }
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
    return await prisma.monthlyCheckIn.findMany({
      where: { userId },
      orderBy: [
        { year: 'desc' },
        { month: 'desc' }
      ]
    });
  }

  async getMonthlyCheckInByMonthYear(userId: number, month: number, year: number): Promise<MonthlyCheckIn | undefined> {
    const monthlyCheckIn = await prisma.monthlyCheckIn.findFirst({
      where: { 
        userId,
        month,
        year
      }
    });
    return monthlyCheckIn || undefined;
  }

  async createMonthlyCheckIn(monthlyCheckIn: InsertMonthlyCheckIn): Promise<MonthlyCheckIn> {
    return await prisma.monthlyCheckIn.create({
      data: monthlyCheckIn
    });
  }

  async updateMonthlyCheckIn(id: number, monthlyCheckIn: Partial<InsertMonthlyCheckIn>): Promise<MonthlyCheckIn | undefined> {
    const updatedMonthlyCheckIn = await prisma.monthlyCheckIn.update({
      where: { id },
      data: { 
        ...monthlyCheckIn,
        updatedAt: new Date()
      }
    });
    return updatedMonthlyCheckIn;
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
      metadata: {
        category: newDecision.category,
        status: newDecision.status,
        decisionDate: newDecision.decisionDate,
      }
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
        metadata: {
          oldStatus: oldDecision.status,
          newStatus: decision.status,
        }
      });
    }
    
    if (decision.title && oldDecision.title !== decision.title) {
      await this.createActivity({
        userId: updatedDecision.userId,
        type: "updated",
        entityType: "decision",
        entityName: decision.title,
        metadata: {
          status: updatedDecision.status,
        }
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
        metadata: {
          category: decision.category,
          status: decision.status,
        }
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
      orderBy: { offerDate: 'desc' }
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
      entityName: `${newOffer.title} - ${newOffer.company}`,
      metadata: {
        status: newOffer.status,
        price: newOffer.price,
      }
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
        entityName: `${updatedOffer.title} - ${updatedOffer.company}`,
        metadata: {
          oldStatus: oldOffer.status,
          newStatus: offer.status,
        }
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
        entityName: `${offer.title} - ${offer.company}`,
        metadata: {
          status: offer.status,
        }
      });
      
      return true;
    } catch (error) {
      return false;
    }
  }

  // Offer Notes methods
  async getOfferNotesByUserId(userId: number): Promise<OfferNote | undefined> {
    const offerNote = await prisma.offerNote.findFirst({
      where: { userId }
    });
    return offerNote || undefined;
  }

  async createOfferNote(offerNote: InsertOfferNote): Promise<OfferNote> {
    return await prisma.offerNote.create({
      data: offerNote
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
      data: activity
    });
  }
} 