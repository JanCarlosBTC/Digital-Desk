import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Storage interface for Replit Auth
export const authStorage = {
  /**
   * Get a user by ID
   */
  async getUser(id: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id }
      });
      return user;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  },

  /**
   * Create or update a user from Replit Auth claims
   */
  async upsertUser(userData: {
    id: string,
    username: string,
    email?: string | null,
    firstName?: string | null,
    lastName?: string | null,
    bio?: string | null,
    profileImageUrl?: string | null
  }) {
    try {
      // Generate a name and initials from the username if not provided
      const name = userData.firstName && userData.lastName 
        ? `${userData.firstName} ${userData.lastName}`
        : userData.username;
      
      const initials = userData.firstName && userData.lastName
        ? `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase()
        : userData.username.substring(0, 2).toUpperCase();

      const user = await prisma.user.upsert({
        where: { id: userData.id },
        update: {
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          bio: userData.bio,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date()
        },
        create: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          bio: userData.bio,
          profileImageUrl: userData.profileImageUrl,
          // Required fields in the User model
          name: name,
          initials: initials,
          password: "", // Empty password since we're using Replit Auth
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      return user;
    } catch (error) {
      console.error('Error upserting user:', error);
      throw error;
    }
  }
};