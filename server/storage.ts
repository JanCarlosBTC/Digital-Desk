import prisma from './prisma.js';
import type { User } from '@prisma/client';
import type { ReplitUser } from '../shared/schema.js';

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | null>;
  getUserByUsername(username: string): Promise<User | null>;
  createUser(userData: any): Promise<User>;
  
  // Brain dump operations
  getBrainDumps(userId: string): Promise<any[]>;
  createBrainDump(data: any): Promise<any>;
  updateBrainDump(id: number, content: string): Promise<any>;
  
  // Problem tree operations
  getProblemTrees(userId: string): Promise<any[]>; 
  createProblemTree(data: any): Promise<any>;
  getProblemTree(id: number): Promise<any | null>;
  updateProblemTree(id: number, data: any): Promise<any>;
  deleteProblemTree(id: number): Promise<void>;
  
  // Other operations as needed
  getDraftedPlans(userId: string): Promise<any[]>;
  createDraftedPlan(data: any): Promise<any>;
  getDraftedPlan(id: number): Promise<any | null>;
  updateDraftedPlan(id: number, data: any): Promise<any>;
  deleteDraftedPlan(id: number): Promise<void>;
  
  getClarityLabs(userId: string): Promise<any[]>;
  createClarityLab(data: any): Promise<any>;
  getClarityLab(id: number): Promise<any | null>;
  updateClarityLab(id: number, data: any): Promise<any>;
  deleteClarityLab(id: number): Promise<void>;
  
  getWeeklyReflections(userId: string): Promise<any[]>;
  createWeeklyReflection(data: any): Promise<any>;
  getWeeklyReflectionByWeek(userId: string, weekDate: Date): Promise<any | null>;
  updateWeeklyReflection(id: number, data: any): Promise<any>;
  deleteWeeklyReflection(id: number): Promise<void>;
  
  getMonthlyCheckIns(userId: string): Promise<any[]>;
  createMonthlyCheckIn(data: any): Promise<any>;
  getMonthlyCheckInByMonthYear(userId: string, month: number, year: number): Promise<any | null>;
  updateMonthlyCheckIn(id: number, data: any): Promise<any>;
  
  getPriorities(userId: string): Promise<any[]>;
  createPriority(data: any): Promise<any>;
  updatePriority(id: number, data: any): Promise<any>;
  deletePriority(id: number): Promise<void>;
  
  getDecisions(userId: string): Promise<any[]>;
  createDecision(data: any): Promise<any>;
  getDecision(id: number): Promise<any | null>;
  updateDecision(id: number, data: any): Promise<any>;
  deleteDecision(id: number): Promise<void>;
  
  getOffers(userId: string): Promise<any[]>;
  createOffer(data: any): Promise<any>;
  getOffer(id: number): Promise<any | null>;
  updateOffer(id: number, data: any): Promise<any>;
  deleteOffer(id: number): Promise<void>;
  
  getOfferNotesByUserId(userId: string): Promise<any[]>;
  createOfferNote(data: any): Promise<any>;
  updateOfferNote(id: number, data: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { id }
    });
  }

  async getUserByUsername(username: string): Promise<User | null> {
    return await prisma.user.findUnique({
      where: { username }
    });
  }

  async createUser(userData: any): Promise<User> {
    return await prisma.user.create({
      data: userData
    });
  }
  
  // Brain dump operations
  async getBrainDumps(userId: string): Promise<any[]> {
    return await prisma.brainDump.findMany({
      where: { userId }
    });
  }
  
  async createBrainDump(data: any): Promise<any> {
    return await prisma.brainDump.create({
      data
    });
  }
  
  async updateBrainDump(id: number, content: string): Promise<any> {
    return await prisma.brainDump.update({
      where: { id },
      data: { content }
    });
  }
  
  // Problem tree operations
  async getProblemTrees(userId: string): Promise<any[]> {
    return await prisma.problemTree.findMany({
      where: { userId }
    });
  }
  
  async createProblemTree(data: any): Promise<any> {
    return await prisma.problemTree.create({
      data
    });
  }
  
  async getProblemTree(id: number): Promise<any | null> {
    return await prisma.problemTree.findUnique({
      where: { id }
    });
  }
  
  async updateProblemTree(id: number, data: any): Promise<any> {
    return await prisma.problemTree.update({
      where: { id },
      data
    });
  }
  
  async deleteProblemTree(id: number): Promise<void> {
    await prisma.problemTree.delete({
      where: { id }
    });
  }
  
  // Drafted plans operations
  async getDraftedPlans(userId: string): Promise<any[]> {
    return await prisma.draftedPlan.findMany({
      where: { userId }
    });
  }
  
  async createDraftedPlan(data: any): Promise<any> {
    return await prisma.draftedPlan.create({
      data
    });
  }
  
  async getDraftedPlan(id: number): Promise<any | null> {
    return await prisma.draftedPlan.findUnique({
      where: { id }
    });
  }
  
  async updateDraftedPlan(id: number, data: any): Promise<any> {
    return await prisma.draftedPlan.update({
      where: { id },
      data
    });
  }
  
  async deleteDraftedPlan(id: number): Promise<void> {
    await prisma.draftedPlan.delete({
      where: { id }
    });
  }
  
  // Clarity Labs operations
  async getClarityLabs(userId: string): Promise<any[]> {
    return await prisma.clarityLab.findMany({
      where: { userId }
    });
  }
  
  async createClarityLab(data: any): Promise<any> {
    return await prisma.clarityLab.create({
      data
    });
  }
  
  async getClarityLab(id: number): Promise<any | null> {
    return await prisma.clarityLab.findUnique({
      where: { id }
    });
  }
  
  async updateClarityLab(id: number, data: any): Promise<any> {
    return await prisma.clarityLab.update({
      where: { id },
      data
    });
  }
  
  async deleteClarityLab(id: number): Promise<void> {
    await prisma.clarityLab.delete({
      where: { id }
    });
  }
  
  // Weekly Reflections operations
  async getWeeklyReflections(userId: string): Promise<any[]> {
    return await prisma.weeklyReflection.findMany({
      where: { userId }
    });
  }
  
  async createWeeklyReflection(data: any): Promise<any> {
    return await prisma.weeklyReflection.create({
      data
    });
  }
  
  async getWeeklyReflectionByWeek(userId: string, weekDate: Date): Promise<any | null> {
    return await prisma.weeklyReflection.findFirst({
      where: {
        userId,
        weekDate
      }
    });
  }
  
  async updateWeeklyReflection(id: number, data: any): Promise<any> {
    return await prisma.weeklyReflection.update({
      where: { id },
      data
    });
  }
  
  async deleteWeeklyReflection(id: number): Promise<void> {
    await prisma.weeklyReflection.delete({
      where: { id }
    });
  }
  
  // Monthly Check-ins operations
  async getMonthlyCheckIns(userId: string): Promise<any[]> {
    return await prisma.monthlyCheckIn.findMany({
      where: { userId }
    });
  }
  
  async createMonthlyCheckIn(data: any): Promise<any> {
    return await prisma.monthlyCheckIn.create({
      data
    });
  }
  
  async getMonthlyCheckInByMonthYear(userId: string, month: number, year: number): Promise<any | null> {
    return await prisma.monthlyCheckIn.findFirst({
      where: {
        userId,
        month,
        year
      }
    });
  }
  
  async updateMonthlyCheckIn(id: number, data: any): Promise<any> {
    return await prisma.monthlyCheckIn.update({
      where: { id },
      data
    });
  }
  
  // Priorities operations
  async getPriorities(userId: string): Promise<any[]> {
    return await prisma.priority.findMany({
      where: { userId }
    });
  }
  
  async createPriority(data: any): Promise<any> {
    return await prisma.priority.create({
      data
    });
  }
  
  async updatePriority(id: number, data: any): Promise<any> {
    return await prisma.priority.update({
      where: { id },
      data
    });
  }
  
  async deletePriority(id: number): Promise<void> {
    await prisma.priority.delete({
      where: { id }
    });
  }
  
  // Decisions operations
  async getDecisions(userId: string): Promise<any[]> {
    return await prisma.decision.findMany({
      where: { userId }
    });
  }
  
  async createDecision(data: any): Promise<any> {
    return await prisma.decision.create({
      data
    });
  }
  
  async getDecision(id: number): Promise<any | null> {
    return await prisma.decision.findUnique({
      where: { id }
    });
  }
  
  async updateDecision(id: number, data: any): Promise<any> {
    return await prisma.decision.update({
      where: { id },
      data
    });
  }
  
  async deleteDecision(id: number): Promise<void> {
    await prisma.decision.delete({
      where: { id }
    });
  }
  
  // Offers operations
  async getOffers(userId: string): Promise<any[]> {
    return await prisma.offer.findMany({
      where: { userId }
    });
  }
  
  async createOffer(data: any): Promise<any> {
    return await prisma.offer.create({
      data
    });
  }
  
  async getOffer(id: number): Promise<any | null> {
    return await prisma.offer.findUnique({
      where: { id }
    });
  }
  
  async updateOffer(id: number, data: any): Promise<any> {
    return await prisma.offer.update({
      where: { id },
      data
    });
  }
  
  async deleteOffer(id: number): Promise<void> {
    await prisma.offer.delete({
      where: { id }
    });
  }
  
  // Offer Notes operations
  async getOfferNotesByUserId(userId: string): Promise<any[]> {
    return await prisma.offerNote.findMany({
      where: { userId }
    });
  }
  
  async createOfferNote(data: any): Promise<any> {
    return await prisma.offerNote.create({
      data
    });
  }
  
  async updateOfferNote(id: number, data: any): Promise<any> {
    return await prisma.offerNote.update({
      where: { id },
      data
    });
  }
}

export const storage = new DatabaseStorage();