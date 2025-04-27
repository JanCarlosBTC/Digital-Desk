import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Building, ChevronDown, Plus, Settings, Users, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../hooks/useAuth';
import { apiRequest } from '@/lib/queryClient';

// Workspace creation schema
const createWorkspaceSchema = z.object({
  name: z.string().min(1, 'Workspace name is required'),
  description: z.string().optional(),
});

type CreateWorkspaceFormData = z.infer<typeof createWorkspaceSchema>;

type Workspace = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

type User = {
  id: string;
  username: string;
  name: string;
  email: string | null;
  role: string;
};

type WorkspaceWithUsers = Workspace & {
  users: User[];
  creator: {
    id: string;
    username: string;
    name: string;
  };
};

type WorkspaceResponse = {
  currentWorkspace: WorkspaceWithUsers | null;
  isAdmin: boolean;
  allWorkspaces?: WorkspaceWithUsers[];
};

export function WorkspaceSwitcher() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [workspaceToDelete, setWorkspaceToDelete] = useState<WorkspaceWithUsers | null>(null);
  
  // Form for creating a new workspace
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateWorkspaceFormData>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  // Get workspaces data
  const { data: workspaceData, isLoading, isError } = useQuery<WorkspaceResponse>({
    queryKey: ['/api/current-workspace'],
  });

  // Create a new workspace
  const createWorkspaceMutation = useMutation({
    mutationFn: (data: CreateWorkspaceFormData) => 
      apiRequest('POST', '/api/workspaces', data) as Promise<any>,
    onSuccess: () => {
      toast({
        title: 'Workspace created',
        description: 'Your new workspace has been created successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/current-workspace'] });
      setIsCreateDialogOpen(false);
      reset();
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create workspace',
        description: error.message || 'There was an error creating the workspace.',
        variant: 'destructive',
      });
    },
  });

  // Delete workspace mutation
  const deleteWorkspaceMutation = useMutation({
    mutationFn: (workspaceId: string) => 
      apiRequest('DELETE', `/api/workspaces/${workspaceId}`) as Promise<any>,
    onSuccess: () => {
      toast({
        title: 'Workspace deleted',
        description: 'The workspace has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/current-workspace'] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete workspace',
        description: error.message || 'There was an error deleting the workspace.',
        variant: 'destructive',
      });
    },
  });

  // Switch to a different workspace
  const switchWorkspaceMutation = useMutation({
    mutationFn: (workspaceId: string) => {
      // Safely extract user ID or fallback to empty string
      const userId = (typeof user === 'object' && user !== null && 'id' in user) 
        ? String(user.id) 
        : '';
      
      return apiRequest('POST', `/api/workspaces/${workspaceId}/users`, { 
        userId 
      }) as Promise<any>;
    },
    onSuccess: () => {
      toast({
        title: 'Workspace changed',
        description: 'You have switched to a different workspace.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/current-workspace'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to switch workspace',
        description: error.message || 'There was an error switching workspaces.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = (data: CreateWorkspaceFormData) => {
    createWorkspaceMutation.mutate(data);
  };
  
  // Handle delete workspace confirmation
  const handleDeleteWorkspace = (workspace: WorkspaceWithUsers) => {
    setWorkspaceToDelete(workspace);
    setIsDeleteDialogOpen(true);
  };

  // Confirm and execute delete workspace
  const confirmDeleteWorkspace = () => {
    if (workspaceToDelete) {
      deleteWorkspaceMutation.mutate(workspaceToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <Button variant="outline" size="sm" className="w-52 justify-start">
        <Building className="mr-2 h-4 w-4" />
        <span>Loading...</span>
      </Button>
    );
  }

  if (isError || !workspaceData) {
    return (
      <Button variant="outline" size="sm" className="w-52 justify-start">
        <Building className="mr-2 h-4 w-4" />
        <span>Error loading workspace</span>
      </Button>
    );
  }

  const { currentWorkspace, isAdmin, allWorkspaces } = workspaceData;

  return (
    <>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="w-52 justify-start">
              <Building className="mr-2 h-4 w-4" />
              <span>{currentWorkspace?.name || 'No workspace'}</span>
              <ChevronDown className="ml-auto h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-60">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            {/* Current workspace */}
            {currentWorkspace && (
              <DropdownMenuItem disabled>
                <div className="w-full flex justify-between items-center">
                  <span className="font-semibold">{currentWorkspace.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">(Current)</span>
                </div>
              </DropdownMenuItem>
            )}
            
            {/* Admin can see all workspaces */}
            {isAdmin && allWorkspaces && allWorkspaces.length > 0 && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Switch workspace</DropdownMenuLabel>
                
                {allWorkspaces.map((workspace) => (
                  workspace.id !== currentWorkspace?.id && (
                    <DropdownMenuItem 
                      key={workspace.id}
                      onClick={() => switchWorkspaceMutation.mutate(workspace.id)}
                    >
                      {workspace.name}
                    </DropdownMenuItem>
                  )
                ))}
              </>
            )}
            
            {/* Admin operations */}
            {isAdmin && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Admin Actions</DropdownMenuLabel>
                
                <DialogTrigger asChild>
                  <DropdownMenuItem>
                    <Plus className="mr-2 h-4 w-4" />
                    Create workspace
                  </DropdownMenuItem>
                </DialogTrigger>
                
                <DropdownMenuItem>
                  <Users className="mr-2 h-4 w-4" />
                  Manage users
                </DropdownMenuItem>

                {currentWorkspace && (
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive hover:bg-destructive/10"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDeleteWorkspace(currentWorkspace);
                      console.log("Delete workspace clicked:", currentWorkspace.id);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete workspace
                  </DropdownMenuItem>
                )}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Create workspace dialog */}
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create new workspace</DialogTitle>
            <DialogDescription>
              Add a new workspace for your team or client.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-4 py-2 pb-4">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace name</Label>
                <Input
                  id="name"
                  placeholder="Enter workspace name"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Input
                  id="description"
                  placeholder="Enter description"
                  {...register('description')}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createWorkspaceMutation.isPending}
              >
                {createWorkspaceMutation.isPending ? 'Creating...' : 'Create workspace'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete workspace confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the workspace "{workspaceToDelete?.name}"? 
              This action cannot be undone and will remove all users from this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteWorkspace}
              disabled={deleteWorkspaceMutation.isPending}
            >
              {deleteWorkspaceMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}