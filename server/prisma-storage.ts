/**
 * Prisma Storage Implementation
 * 
 * This file implements the IStorage interface using Prisma ORM.
 * It provides the data access layer for all Digital Desk entities.
 * 
 * For comprehensive documentation on Prisma usage, data access patterns,
 * and troubleshooting, refer to the PRISMA-GUIDE.md file in the root directory.
 */

import { IStorage } from './storage.js';
import prisma from './prisma.js';
import session from 'express-session';
import connectPg from 'connect-pg-simple';
import { pool } from './db.js';
import type { User } from "@prisma/client";
import {
  ReplitUser,
  BrainDump, InsertBrainDump,
  ProblemTree, InsertProblemTree,
  DraftedPlan, InsertDraftedPlan,
  ClarityLab, InsertClarityLab,
  WeeklyReflection, InsertWeeklyReflection,
  MonthlyCheckIn, InsertMonthlyCheckIn,
  Priority, InsertPriority,
  Decision, InsertDecision,
  Offer, InsertOffer,
  OfferNote, InsertOfferNote
} from "../shared/schema.js";

const PostgresSessionStore = connectPg(session);

export class PrismaStorage implements IStorage {
  // Session store for auth persistence
  sessionStore: session.Store;
  
  constructor() {
    // Initialize PostgreSQL session store
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true
    });
  }
  // User methods
  async getUser(id: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { username }
      });
      return user;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return null;
    }
  }

  async createUser(user: ReplitUser): Promise<User> {
    return await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        email: user.email || null,
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        bio: user.bio || null,
        profileImageUrl: user.profileImageUrl || null,
        // Legacy fields that still exist in the schema
        password: '',
        name: user.username,  // Use username as name
        initials: user.username.substring(0, 2).toUpperCase()  // First two chars as initials
      }
    });
  }

  async updateUser(id: string, userData: Partial<ReplitUser>): Promise<User | undefined> {
    try {
      const updateData: any = {
        updatedAt: new Date()
      };
      
      if (userData.username !== undefined) updateData.username = userData.username;
      if (userData.email !== undefined) updateData.email = userData.email;
      if (userData.firstName !== undefined) updateData.firstName = userData.firstName;
      if (userData.lastName !== undefined) updateData.lastName = userData.lastName;
      if (userData.bio !== undefined) updateData.bio = userData.bio;
      if (userData.profileImageUrl !== undefined) updateData.profileImageUrl = userData.profileImageUrl;
      
      // Update name and initials if username changes
      if (userData.username !== undefined) {
        updateData.name = userData.username;
        updateData.initials = userData.username.substring(0, 2).toUpperCase();
      }
      
      return await prisma.user.update({
        where: { id },
        data: updateData
      });
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Brain Dump methods
  async getBrainDumps(userId: string): Promise<BrainDump[]> {
    try {
      const brainDumps = await prisma.brainDump.findMany({
        where: { userId }
      });
      return brainDumps;
    } catch (error) {
      console.error('Error fetching brain dumps:', error);
      return [];
    }
  }
  
  async getBrainDumpByUserId(userId: string): Promise<BrainDump | undefined> {
    try {
      const brainDump = await prisma.brainDump.findFirst({
        where: { userId }
      });
      return brainDump || undefined;
    } catch (error) {
      console.error('Error fetching brain dump:', error);
      return undefined;
    }
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
  async getProblemTrees(userId: string): Promise<ProblemTree[]> {
    try {
      return await prisma.problemTree.findMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error fetching problem trees:', error);
      return [];
    }
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

  async deleteProblemTree(id: number): Promise<void> {
    try {
      await prisma.problemTree.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting problem tree:', error);
      throw error;
    }
  }

  // Drafted Plans methods
  async getDraftedPlans(userId: string): Promise<DraftedPlan[]> {
    try {
      return await prisma.draftedPlan.findMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error fetching drafted plans:', error);
      return [];
    }
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

  async deleteDraftedPlan(id: number): Promise<void> {
    try {
      await prisma.draftedPlan.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting drafted plan:', error);
      throw error;
    }
  }

  // Clarity Lab methods
  async getClarityLabs(userId: string, category?: string): Promise<ClarityLab[]> {
    try {
      return await prisma.clarityLab.findMany({
        where: { 
          userId,
          ...(category ? { category } : {})
        }
      });
    } catch (error) {
      console.error('Error fetching clarity labs:', error);
      return [];
    }
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

  async deleteClarityLab(id: number): Promise<void> {
    try {
      await prisma.clarityLab.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting clarity lab:', error);
      throw error;
    }
  }

  // Weekly Reflections methods
  async getWeeklyReflections(userId: string): Promise<WeeklyReflection[]> {
    try {
      return await prisma.weeklyReflection.findMany({
        where: { userId },
        orderBy: { weekDate: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching weekly reflections:', error);
      return [];
    }
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
  
  async getWeeklyReflectionByWeek(userId: string, weekDate: Date): Promise<WeeklyReflection | null> {
    try {
      // Calculate the start and end of the week for the given date
      const startOfWeek = new Date(weekDate);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Start of week (Sunday)
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6); // End of week (Saturday)
      endOfWeek.setHours(23, 59, 59, 999);
      
      // Find the weekly reflection within the date range
      const reflection = await prisma.weeklyReflection.findFirst({
        where: {
          userId,
          weekDate: {
            gte: startOfWeek,
            lte: endOfWeek
          }
        }
      });
      
      return reflection;
    } catch (error) {
      console.error('Error fetching weekly reflection by week:', error);
      return null;
    }
  }

  async updateWeeklyReflection(id: number, weeklyReflection: Partial<InsertWeeklyReflection>): Promise<WeeklyReflection | undefined> {
    try {
      console.log('In PrismaStorage.updateWeeklyReflection, updating with data:', { id, weeklyReflection });
      
      // Process date fields specifically
      const dataToUpdate: any = { ...weeklyReflection };
      
      // Handle weekDate separately if present
      if (dataToUpdate.weekDate) {
        if (typeof dataToUpdate.weekDate === 'string') {
          dataToUpdate.weekDate = new Date(dataToUpdate.weekDate);
        }
      }
      
      // Always set updatedAt to the current time
      dataToUpdate.updatedAt = new Date();
      
      console.log('Processed data for update:', dataToUpdate);
      
      const updatedWeeklyReflection = await prisma.weeklyReflection.update({
        where: { id },
        data: dataToUpdate
      });
      
      return updatedWeeklyReflection;
    } catch (error) {
      console.error('Error in updateWeeklyReflection:', error);
      throw error; // Re-throw to allow proper error handling upstream
    }
  }

  async deleteWeeklyReflection(id: number): Promise<void> {
    try {
      await prisma.weeklyReflection.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting weekly reflection:', error);
      throw error;
    }
  }

  // Monthly Check-in methods
  async getMonthlyCheckIns(userId: string): Promise<MonthlyCheckIn[]> {
    try {
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
    } catch (error) {
      console.error('Error fetching monthly check-ins:', error);
      return [];
    }
  }

  async getMonthlyCheckInByMonthYear(userId: string, month: number, year: number): Promise<MonthlyCheckIn | undefined> {
    try {
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
    } catch (error) {
      console.error('Error fetching monthly check-in by month/year:', error);
      return undefined;
    }
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
  async getPriorities(userId: string): Promise<Priority[]> {
    try {
      return await prisma.priority.findMany({
        where: { userId },
        orderBy: { order: 'asc' }
      });
    } catch (error) {
      console.error('Error fetching priorities:', error);
      return [];
    }
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

  async deletePriority(id: number): Promise<void> {
    try {
      await prisma.priority.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting priority:', error);
      throw error;
    }
  }

  // Decision methods
  async getDecisions(userId: string): Promise<Decision[]> {
    try {
      return await prisma.decision.findMany({
        where: { userId },
        orderBy: { decisionDate: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching decisions:', error);
      return [];
    }
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



    return updatedDecision;
  }

  async deleteDecision(id: number): Promise<void> {
    try {
      // Get the decision before deleting it
      const decision = await this.getDecision(id);
      if (!decision) {
        console.error(`Decision with ID ${id} not found`);
        return;
      }

      // Delete the decision
      await prisma.decision.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting decision:', error);
      throw error;
    }
  }

  // Offer methods
  async getOffers(userId: string): Promise<Offer[]> {
    try {
      return await prisma.offer.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching offers:', error);
      return [];
    }
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



    return updatedOffer;
  }

  async deleteOffer(id: number): Promise<void> {
    try {
      // Get the offer before deleting it
      const offer = await this.getOffer(id);
      if (!offer) {
        console.error(`Offer with ID ${id} not found`);
        return;
      }

      // Delete the offer
      await prisma.offer.delete({
        where: { id }
      });
    } catch (error) {
      console.error('Error deleting offer:', error);
      throw error;
    }
  }

  // Offer Notes methods
  async getOfferNotesByUserId(userId: string): Promise<OfferNote[]> {
    try {
      const offerNotes = await prisma.offerNote.findMany({
        where: { userId }
      });
      return offerNotes;
    } catch (error) {
      console.error('Error fetching offer notes:', error);
      return [];
    }
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

}