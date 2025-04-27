import prisma from './prisma.js';
import type { User } from '@prisma/client';
import type { ReplitUser } from '../shared/schema.js';
import { IStorage } from './storage.js';

/**
 * Prisma implementation of the storage interface adapted for Replit Auth
 * This implementation uses string userIds instead of numeric ones
 */
export class PrismaStorage implements IStorage {
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

export const storage = new PrismaStorage();