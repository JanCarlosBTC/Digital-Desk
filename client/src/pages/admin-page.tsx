import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingState } from "@/components/ui/loading-state";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/useAuth";
import { queryClient, apiRequest } from "@/lib/queryClient";

// Define the form schema for creating a new user
const formSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("A valid email address is required"),
  name: z.string().min(1, "Name is required"),
  isAdmin: z.boolean().optional()
});

type FormValues = z.infer<typeof formSchema>;

// Define TypeScript types for user data
interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  initials: string;
  isAdmin: boolean;
  lastLogin: Date | null;
  lastLoginFormatted: string;
  createdAt: Date;
  workspaceId?: string | null;
}

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  newestUser: {
    username: string;
    email: string;
    createdAt: Date;
  } | null;
}

export default function AdminPage() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [inviteLink, setInviteLink] = useState<string>("");

  // Fetch all users
  const { data: users, isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ["/api/admin/users"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/users");
      return res.json();
    },
    enabled: !!user?.isAdmin, // Only fetch if the user is an admin
  });

  // Fetch admin stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/stats");
      return res.json();
    },
    enabled: !!user?.isAdmin, // Only fetch if the user is an admin
  });

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: FormValues) => {
      const res = await apiRequest("POST", "/api/admin/users", userData);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "User created successfully",
        description: "The user has been created and can now be invited",
      });
      setCreateDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create user",
        description: error.message || "An error occurred while creating the user",
        variant: "destructive",
      });
    },
  });

  // Generate invite link mutation
  const generateInviteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/invite`);
      return res.json();
    },
    onSuccess: (data) => {
      setInviteLink(data.inviteUrl);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to generate invite",
        description: error.message || "An error occurred while generating the invite link",
        variant: "destructive",
      });
    },
  });

  // Setup form for creating a new user
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      email: "",
      name: "",
      isAdmin: false
    }
  });

  // If user is not an admin or not authenticated, redirect to home page
  if (!isLoading && (!user || !user.isAdmin)) {
    return <Redirect to="/" />;
  }

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    createUserMutation.mutate(values);
  };

  // Handle invite generation
  const handleInvite = (user: User) => {
    setSelectedUser(user);
    generateInviteMutation.mutate(user.id);
    setInviteDialogOpen(true);
  };

  // Copy invite link to clipboard
  const copyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: "Copied to clipboard",
      description: "The invitation link has been copied to your clipboard",
    });
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container p-4 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Total Users</CardTitle>
            <CardDescription>All registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.totalUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Active Users</CardTitle>
            <CardDescription>Users who have logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.activeUsers}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Inactive Users</CardTitle>
            <CardDescription>Users who haven't logged in</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{isLoadingStats ? "..." : stats?.inactiveUsers}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>User Accounts</CardTitle>
            <Button variant="outline" size="sm" onClick={() => refetchUsers()}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh
            </Button>
          </div>
          <CardDescription>Manage all user accounts from here</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingUsers ? (
            <LoadingState />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Admin</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users && users.length > 0 ? (
                    users.map((user: User) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div 
                            className="flex items-center cursor-pointer hover:text-primary transition-colors"
                            onClick={() => {
                              if (user.workspaceId) {
                                window.location.href = `/workspace/${user.workspaceId}`;
                              } else {
                                toast({
                                  title: "No workspace assigned",
                                  description: "This user is not assigned to any workspace.",
                                  variant: "destructive"
                                });
                              }
                            }}
                          >
                            <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center mr-2">
                              {user.initials}
                            </div>
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.isAdmin ? "Yes" : "No"}</TableCell>
                        <TableCell>{user.lastLoginFormatted}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleInvite(user)}
                            >
                              <User className="mr-2 h-4 w-4" /> Invite
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="username" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@example.com" type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Admin User</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        This user will have admin privileges
                      </p>
                    </div>
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createUserMutation.isPending}
                >
                  {createUserMutation.isPending ? "Creating..." : "Create User"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invitation Link</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-2">Share this link with {selectedUser?.name}:</p>
            <div className="flex items-center gap-2">
              <Input 
                value={inviteLink} 
                readOnly 
                className="flex-1"
              />
              <Button size="sm" onClick={copyInviteLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              The invitation link will expire in 7 days
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setInviteDialogOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}