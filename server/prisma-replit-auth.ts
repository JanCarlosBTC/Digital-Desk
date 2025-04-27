import { PrismaClient, User } from '@prisma/client';
import prisma from './prisma.js';

// Define simple ReplitUser type for our auth storage
type ReplitUser = {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  bio?: string | null;
  profileImageUrl?: string | null;
};

// Storage interface for Replit Auth
export interface IAuthStorage {
  getUser(id: string): Promise<User | null>;
  upsertUser(user: ReplitUser): Promise<User>;
}

export class PrismaAuthStorage implements IAuthStorage {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async getUser(id: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { id }
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  }

  async getUserByUsername(username: string): Promise<User | null> {
    try {
      return await this.prisma.user.findUnique({
        where: { username }
      });
    } catch (error) {
      console.error("Error fetching user by username:", error);
      return null;
    }
  }

  async upsertUser(userData: ReplitUser): Promise<User> {
    try {
      return await this.prisma.user.upsert({
        where: { id: userData.id },
        update: {
          username: userData.username,
          name: userData.firstName || userData.username || 'User',
          initials: userData.firstName 
            ? userData.firstName.charAt(0) + (userData.lastName ? userData.lastName.charAt(0) : '') 
            : (userData.username ? userData.username.charAt(0) : 'U')
          // updatedAt will be handled automatically by Prisma
        },
        create: {
          id: userData.id,
          username: userData.username,
          password: "",
          name: userData.firstName || userData.username || 'User',
          initials: userData.firstName 
            ? userData.firstName.charAt(0) + (userData.lastName ? userData.lastName.charAt(0) : '') 
            : (userData.username ? userData.username.charAt(0) : 'U'),
          plan: "Free"
        }
      });
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }
}

export const authStorage = new PrismaAuthStorage();