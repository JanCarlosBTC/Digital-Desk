import { Router } from "express";
import type { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated } from "./replitAuth.js";
import { UserRole } from "../shared/schema.js";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

// Admin middleware to check if user has admin role
const isAdmin = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.claims.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    next();
  } catch (error) {
    console.error("Admin check error:", error);
    res.status(500).json({ message: "Server error checking admin status" });
  }
};

// Get all workspaces (admin only)
router.get("/api/workspaces", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const workspaces = await prisma.workspace.findMany({
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });
    
    res.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    res.status(500).json({ message: "Failed to fetch workspaces" });
  }
});

// Get workspace by ID (admin or workspace member)
router.get("/api/workspaces/:id", isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.claims.sub;
    
    // Get user to check permissions
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { workspace: true }
    });
    
    // User is either admin or belongs to this workspace
    if (user?.role !== UserRole.ADMIN && user?.workspaceId !== id) {
      return res.status(403).json({ message: "Forbidden: Not authorized to access this workspace" });
    }
    
    const workspace = await prisma.workspace.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            name: true,
            email: true,
            role: true
          }
        },
        creator: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      }
    });
    
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }
    
    res.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    res.status(500).json({ message: "Failed to fetch workspace" });
  }
});

// Create new workspace (admin only)
router.post("/api/workspaces", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const createWorkspaceSchema = z.object({
      name: z.string().min(1, "Workspace name is required"),
      description: z.string().optional(),
    });
    
    const validationResult = createWorkspaceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid workspace data", 
        errors: validationResult.error.errors 
      });
    }
    
    const { name, description } = validationResult.data;
    const userId = req.user.claims.sub;
    
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        createdBy: userId,
        isActive: true
      }
    });
    
    res.status(201).json(workspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    res.status(500).json({ message: "Failed to create workspace" });
  }
});

// Update workspace (admin only)
router.put("/api/workspaces/:id", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const updateWorkspaceSchema = z.object({
      name: z.string().min(1, "Workspace name is required").optional(),
      description: z.string().optional(),
      isActive: z.boolean().optional(),
    });
    
    const validationResult = updateWorkspaceSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid workspace data", 
        errors: validationResult.error.errors 
      });
    }
    
    const workspace = await prisma.workspace.update({
      where: { id },
      data: validationResult.data
    });
    
    res.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    res.status(500).json({ message: "Failed to update workspace" });
  }
});

// Add user to workspace (admin only)
router.post("/api/workspaces/:id/users", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const addUserSchema = z.object({
      userId: z.string(),
    });
    
    const validationResult = addUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid user data", 
        errors: validationResult.error.errors 
      });
    }
    
    const { userId } = validationResult.data;
    
    // Update user's workspace
    const user = await prisma.user.update({
      where: { id: userId },
      data: { workspaceId: id }
    });
    
    res.json(user);
  } catch (error) {
    console.error("Error adding user to workspace:", error);
    res.status(500).json({ message: "Failed to add user to workspace" });
  }
});

// Remove user from workspace (admin only)
router.delete("/api/workspaces/:workspaceId/users/:userId", isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Remove user from workspace by setting workspaceId to null
    const user = await prisma.user.update({
      where: { id: userId },
      data: { workspaceId: null }
    });
    
    res.json({ success: true, message: "User removed from workspace" });
  } catch (error) {
    console.error("Error removing user from workspace:", error);
    res.status(500).json({ message: "Failed to remove user from workspace" });
  }
});

// Get current user's workspace
router.get("/api/current-workspace", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.claims.sub;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        workspace: {
          include: {
            creator: {
              select: {
                id: true,
                username: true,
                name: true
              }
            }
          }
        }
      }
    });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.role === UserRole.ADMIN) {
      // For admins, get all workspaces
      const workspaces = await prisma.workspace.findMany({
        include: {
          creator: {
            select: {
              id: true,
              username: true,
              name: true
            }
          }
        }
      });
      
      return res.json({
        currentWorkspace: user.workspace,
        isAdmin: true,
        allWorkspaces: workspaces
      });
    }
    
    // For non-admins, just return their workspace
    res.json({
      currentWorkspace: user.workspace,
      isAdmin: false
    });
  } catch (error) {
    console.error("Error fetching user workspace:", error);
    res.status(500).json({ message: "Failed to fetch user workspace" });
  }
});

export default router;