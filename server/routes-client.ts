import { Router } from 'express';
import type { Request, Response } from 'express';
import { isAuthenticated, AuthenticatedRequest } from './replitAuth.js';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import crypto from 'crypto';

// Extend PrismaClient with the models we need
// This is just for TypeScript - the actual models are defined in Prisma schema
interface ExtendedPrismaClient extends PrismaClient {
  client: any;
  clientAccessToken: any;
}

const prisma = new PrismaClient() as ExtendedPrismaClient;
const router = Router();

// Input validation schemas
const createClientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  company: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional()
});

const updateClientSchema = createClientSchema.partial();

// Get all clients (for the current user/organization)
router.get('/clients', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // In a real Replit Auth implementation, we'd get the user ID from req.user.claims.sub
    // For our simplified version, we'll use a placeholder ID
    const userId = "demo-user-id";
    
    // Safety check
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const clients = await prisma.client.findMany({
      where: {
        createdById: userId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return res.json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return res.status(500).json({ message: "Failed to fetch clients" });
  }
});

// Get a single client by ID
router.get('/clients/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Using the same demo ID for consistency
    const userId = "demo-user-id";
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const client = await prisma.client.findFirst({
      where: {
        id: Number(id),
        createdById: userId
      }
    });
    
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    return res.json(client);
  } catch (error) {
    console.error("Error fetching client:", error);
    return res.status(500).json({ message: "Failed to fetch client" });
  }
});

// Create a new client
router.post('/clients', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Using the same demo ID for consistency
    const userId = "demo-user-id";
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate input
    const validatedData = createClientSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: "Invalid client data", 
        errors: validatedData.error.format() 
      });
    }
    
    // Create client
    const client = await prisma.client.create({
      data: {
        ...validatedData.data,
        createdById: userId
      }
    });

    // Generate access token for client
    const accessToken = await prisma.clientAccessToken.create({
      data: {
        clientId: client.id,
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    
    return res.status(201).json({ 
      ...client, 
      accessToken: accessToken.token
    });
  } catch (error) {
    console.error("Error creating client:", error);
    return res.status(500).json({ message: "Failed to create client" });
  }
});

// Update a client
router.patch('/clients/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Using the same demo ID for consistency
    const userId = "demo-user-id";
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Validate input
    const validatedData = updateClientSchema.safeParse(req.body);
    
    if (!validatedData.success) {
      return res.status(400).json({ 
        message: "Invalid client data", 
        errors: validatedData.error.format() 
      });
    }
    
    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: Number(id),
        createdById: userId
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    // Update client
    const client = await prisma.client.update({
      where: {
        id: Number(id)
      },
      data: validatedData.data
    });
    
    return res.json(client);
  } catch (error) {
    console.error("Error updating client:", error);
    return res.status(500).json({ message: "Failed to update client" });
  }
});

// Delete a client
router.delete('/clients/:id', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Using the same demo ID for consistency
    const userId = "demo-user-id";
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: Number(id),
        createdById: userId
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    // Delete client (this will also delete related access tokens via cascading)
    await prisma.client.delete({
      where: {
        id: Number(id)
      }
    });
    
    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting client:", error);
    return res.status(500).json({ message: "Failed to delete client" });
  }
});

// Verify client invitation token
router.get('/verify-token', async (req: Request, res: Response) => {
  try {
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ message: "Invalid token" });
    }
    
    // Find the token in the database
    const accessToken = await prisma.clientAccessToken.findFirst({
      where: {
        token: token,
        active: true,
        expiresAt: {
          gt: new Date() // Token must not be expired
        }
      },
      include: {
        client: true // Include client data
      }
    });
    
    if (!accessToken) {
      return res.status(404).json({ 
        message: "Invalid or expired token",
        valid: false
      });
    }
    
    // Return client information with the token
    return res.status(200).json({
      valid: true,
      client: {
        id: accessToken.client.id,
        name: accessToken.client.name,
        email: accessToken.client.email
      },
      expiresAt: accessToken.expiresAt
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.status(500).json({ message: "Failed to verify token" });
  }
});

// Generate new invitation link for client
router.post('/clients/:id/invite', isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    // Using the same demo ID for consistency
    const userId = "demo-user-id";
    
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    // Check if client exists and belongs to user
    const existingClient = await prisma.client.findFirst({
      where: {
        id: Number(id),
        createdById: userId
      }
    });
    
    if (!existingClient) {
      return res.status(404).json({ message: "Client not found" });
    }
    
    // Invalidate existing tokens
    await prisma.clientAccessToken.updateMany({
      where: {
        clientId: Number(id),
        active: true
      },
      data: {
        active: false
      }
    });
    
    // Generate new token
    const accessToken = await prisma.clientAccessToken.create({
      data: {
        clientId: Number(id),
        token: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    });
    
    // Generate invitation link using host from request
    const host = req.headers.host || 'localhost:3000';
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const inviteLink = `${protocol}://${host}/auth?token=${accessToken.token}`;
    
    return res.json({ 
      token: accessToken.token,
      inviteLink: inviteLink,
      expiresAt: accessToken.expiresAt
    });
  } catch (error) {
    console.error("Error generating invitation:", error);
    return res.status(500).json({ message: "Failed to generate invitation" });
  }
});

export default router;