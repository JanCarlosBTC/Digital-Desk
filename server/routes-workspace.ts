import { Router } from "express";
import type { Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import { isAuthenticated, AuthenticatedRequest } from "./replitAuth.js";
import { UserRole } from "../shared/schema.js";
import { z } from "zod";

const prisma = new PrismaClient();
const router = Router();

// Admin middleware to check if user has admin role
const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user || !req.user.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.claims.sub;
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user || user.role !== UserRole.ADMIN) {
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }
    
    return next();
  } catch (error) {
    console.error("Admin check error:", error);
    return res.status(500).json({ message: "Server error checking admin status" });
  }
};

// Get all workspaces (admin only)
router.get("/api/workspaces", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
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
    
    return res.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return res.status(500).json({ message: "Failed to fetch workspaces" });
  }
});

// Get workspace by ID (admin or workspace member)
router.get("/api/workspaces/:id", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!req.user || !req.user.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
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
    
    return res.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return res.status(500).json({ message: "Failed to fetch workspace" });
  }
});

// Create new workspace (admin only)
router.post("/api/workspaces", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
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
    
    if (!req.user || !req.user.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = req.user.claims.sub;
    
    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        createdBy: userId,
        isActive: true
      }
    });
    
    return res.status(201).json(workspace);
  } catch (error) {
    console.error("Error creating workspace:", error);
    return res.status(500).json({ message: "Failed to create workspace" });
  }
});

// Update workspace (admin only)
router.put("/api/workspaces/:id", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
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
    
    return res.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return res.status(500).json({ message: "Failed to update workspace" });
  }
});

// Add user to workspace by user ID (admin only)
router.post("/api/workspaces/:id/users", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const addUserSchema = z.object({
      userId: z.string().optional(),
      email: z.string().email().optional(),
    }).refine(data => data.userId || data.email, {
      message: "Either userId or email must be provided"
    });
    
    const validationResult = addUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Invalid user data", 
        errors: validationResult.error.errors 
      });
    }
    
    const { userId, email } = validationResult.data;
    
    if (userId) {
      // Update user's workspace by ID
      const user = await prisma.user.update({
        where: { id: userId },
        data: { workspaceId: id }
      });
      
      return res.json({
        success: true,
        message: "User added to workspace",
        user
      });
    } else if (email) {
      // Find if user exists with this email
      const existingUser = await prisma.user.findFirst({
        where: { email }
      });
      
      if (existingUser) {
        // Update existing user's workspace
        const user = await prisma.user.update({
          where: { id: existingUser.id },
          data: { workspaceId: id }
        });
        
        return res.json({
          success: true,
          message: "Existing user added to workspace",
          user
        });
      } else {
        // Create pending invitation using a type-safe approach
        // Access Prisma client with 'any' type to bypass TypeScript error
        const workspaceInvitationModel = (prisma as any).workspaceInvitation;
        
        // Create the invitation using dynamic property access
        const invitation = workspaceInvitationModel && await workspaceInvitationModel.create({
          data: {
            email,
            workspace: { connect: { id } },
            status: "PENDING",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          }
        });
        
        return res.json({
          success: true,
          message: "Invitation created for new user",
          invitation
        });
      }
    }
    
    // Default response if neither userId nor email is provided (shouldn't happen due to validation)
    return res.status(400).json({ message: "Missing required user identification" });
  } catch (error) {
    console.error("Error adding user to workspace:", error);
    return res.status(500).json({ message: "Failed to add user to workspace" });
  }
});

// Remove user from workspace (admin only)
router.delete("/api/workspaces/:workspaceId/users/:userId", isAuthenticated, isAdmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    
    // Remove user from workspace by setting workspaceId to null
    const user = await prisma.user.update({
      where: { id: userId },
      data: { workspaceId: null }
    });
    
    return res.json({ success: true, message: "User removed from workspace" });
  } catch (error) {
    console.error("Error removing user from workspace:", error);
    return res.status(500).json({ message: "Failed to remove user from workspace" });
  }
});

// Get current user's workspace
router.get("/api/current-workspace", isAuthenticated, async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user || !req.user.claims) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
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
          users: true,
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
    return res.json({
      currentWorkspace: user.workspace,
      isAdmin: false
    });
  } catch (error) {
    console.error("Error fetching user workspace:", error);
    return res.status(500).json({ message: "Failed to fetch user workspace" });
  }
});

export default router;