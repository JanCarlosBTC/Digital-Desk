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
import { Building, ChevronDown, Plus, Settings, Users } from 'lucide-react';
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
      apiRequest('/api/workspaces', { method: 'POST', data }),
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

  // Switch to a different workspace
  const switchWorkspaceMutation = useMutation({
    mutationFn: (workspaceId: string) =>
      apiRequest(`/api/workspaces/${workspaceId}/users`, { 
        method: 'POST', 
        data: { userId: user?.id } 
      }),
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
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-52 justify-start">
            <Building className="mr-2 h-4 w-4" />
            <span>{currentWorkspace?.name || 'No workspace'}</span>
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Current workspace */}
          {currentWorkspace && (
            <DropdownMenuItem className="justify-between">
              {currentWorkspace.name}
              <Settings className="h-4 w-4" />
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
          
          {/* Admin can create new workspaces */}
          {isAdmin && (
            <>
              <DropdownMenuSeparator />
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
  );
}