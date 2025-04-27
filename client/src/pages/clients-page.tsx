import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, RefreshCw, User, Link2, Check, Clipboard } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { enhanceError, extractErrorMessage } from '@/lib/error-utils';

// Helper function to handle API errors with toast
const handleApiErrorWithToast = (error: unknown, toast: any) => {
  const enhancedError = enhanceError(error);
  const message = extractErrorMessage(error);
  
  toast({
    title: "Error",
    description: message,
    variant: "destructive"
  });
};

// Client type definition
interface Client {
  id: number;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
  createdAt: string;
}

// Client form state
interface ClientFormData {
  name: string;
  email: string;
  company?: string;
  phone?: string;
  notes?: string;
}

// Invitation info type
interface InvitationInfo {
  token: string;
  inviteLink: string;
  expiresAt: string;
}

export default function ClientsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<ClientFormData>({
    name: '',
    email: '',
    company: '',
    phone: '',
    notes: ''
  });
  const [invitation, setInvitation] = useState<InvitationInfo | null>(null);
  const [copied, setCopied] = useState(false);

  // Fetch clients
  const { data: clients = [], isLoading, error, refetch } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    retry: 1,
  });

  // Create client mutation
  const createMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      const response = await apiRequest('POST', '/api/clients', data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: 'Success',
        description: 'Client created successfully',
      });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      handleApiErrorWithToast(error, toast);
    }
  });

  // Generate invitation mutation
  const inviteMutation = useMutation({
    mutationFn: async (clientId: number) => {
      const response = await apiRequest('POST', `/api/clients/${clientId}/invite`);
      return response.json();
    },
    onSuccess: (data) => {
      setInvitation(data);
      toast({
        title: 'Invitation Generated',
        description: 'Copy the link to share with your client',
      });
    },
    onError: (error) => {
      handleApiErrorWithToast(error, toast);
    }
  });

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      notes: ''
    });
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  // Handle invitation generation
  const handleGenerateInvite = (client: Client) => {
    setSelectedClient(client);
    inviteMutation.mutate(client.id);
    setIsInviteDialogOpen(true);
  };

  // Copy invitation link to clipboard
  const copyToClipboard = async () => {
    if (invitation) {
      try {
        await navigator.clipboard.writeText(invitation.inviteLink);
        setCopied(true);
        toast({
          title: 'Copied!',
          description: 'Invitation link copied to clipboard',
        });
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        toast({
          title: 'Error',
          description: 'Failed to copy to clipboard',
          variant: 'destructive',
        });
      }
    }
  };

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardHeader>
            <CardTitle>Error Loading Clients</CardTitle>
          </CardHeader>
          <CardContent>
            <p>There was an error loading your clients. Please try again.</p>
            <Button onClick={() => refetch()} className="mt-4">
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Client Management</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add Client
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Client</DialogTitle>
              <DialogDescription>
                Add a new client to your workspace. They'll receive an invitation link.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="company" className="text-right">
                    Company
                  </Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">
                    Phone
                  </Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="col-span-3"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? 'Creating...' : 'Create Client'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Clients</CardTitle>
          <CardDescription>
            Manage your clients and send them access invitations.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-10">
              <User className="mx-auto h-12 w-12 opacity-20 mb-4" />
              <h3 className="text-lg font-medium">No clients yet</h3>
              <p className="text-sm text-muted-foreground mt-2">
                Add your first client to get started
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client: Client) => (
                  <TableRow key={client.id}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.company || '-'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleGenerateInvite(client)}
                      >
                        <Link2 className="h-4 w-4 mr-2" />
                        Invite
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Invitation Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Client Invitation</DialogTitle>
            <DialogDescription>
              Share this link with {selectedClient?.name} to invite them to your workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {inviteMutation.isPending ? (
              <div className="text-center py-8">
                <p>Generating invitation link...</p>
              </div>
            ) : invitation ? (
              <>
                <div className="bg-muted p-3 rounded-md break-all mb-4">
                  <p className="text-sm font-mono">{invitation.inviteLink}</p>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  This link will expire on {new Date(invitation.expiresAt).toLocaleDateString()} at {new Date(invitation.expiresAt).toLocaleTimeString()}
                </div>
              </>
            ) : (
              <p>Failed to generate invitation link. Please try again.</p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="default"
              onClick={copyToClipboard}
              disabled={!invitation || inviteMutation.isPending}
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Copied
                </>
              ) : (
                <>
                  <Clipboard className="mr-2 h-4 w-4" /> Copy Link
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}