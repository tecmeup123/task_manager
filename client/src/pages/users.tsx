import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import MainLayout from "@/components/layouts/main-layout";
import CreateUserForm from "@/components/create-user-form";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Pencil, UserCog, UserPlus, XCircle } from "lucide-react";
import { Loader2 } from "lucide-react";

// Types for users
interface User {
  id: number;
  username: string;
  fullName: string | null;
  email: string | null;
  role: "admin" | "editor" | "viewer";
  approved: boolean;
  forcePasswordChange: boolean;
  passwordChangeRequired: boolean;
}

export default function UsersPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState<string>("");

  // Fetch all users
  const { data: users, isLoading, error } = useQuery<User[]>({
    queryKey: ["/api/users"],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Update user role mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, role }: { id: number; role: string }) => {
      const res = await apiRequest("PATCH", `/api/users/${id}`, { role });
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "User role updated",
        description: `${selectedUser?.username}'s role has been changed to ${newRole}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      setIsEditDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to update user role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Only admin users can access this page
  if (!user || user.role !== "admin") {
    return <Redirect to="/" />;
  }

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleRoleUpdate = () => {
    if (selectedUser && newRole) {
      updateUserMutation.mutate({ id: selectedUser.id, role: newRole });
    }
  };

  // Display a loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </MainLayout>
    );
  }

  // Display error state
  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <p className="text-destructive mb-4">Error loading users</p>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center">
                  <UserCog className="mr-2 h-6 w-6" />
                  User Management
                </CardTitle>
                <CardDescription>
                  Manage user roles and permissions
                </CardDescription>
              </div>
              <div>
                <Button 
                  onClick={() => setIsCreateUserDialogOpen(true)}
                  className="flex items-center"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Create User
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users && users.length > 0 ? (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.username}</TableCell>
                      <TableCell>{user.fullName || "-"}</TableCell>
                      <TableCell>{user.email || "-"}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            user.role === "admin"
                              ? "bg-red-500 hover:bg-red-600"
                              : user.role === "editor"
                              ? "bg-amber-500 hover:bg-amber-600"
                              : "bg-blue-500 hover:bg-blue-600"
                          }
                        >
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditClick(user)}
                          disabled={user.id === (window as any)?.currentUser?.id}
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No users found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit user role dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Change User Role</DialogTitle>
              <DialogDescription>
                Update the role for user: {selectedUser?.username}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <label className="block text-sm font-medium mb-2">Select a new role:</label>
              <Select 
                value={newRole} 
                onValueChange={setNewRole}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="editor">Editor</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  <strong>Role permissions:</strong>
                </p>
                <ul className="text-sm text-muted-foreground mt-1 list-disc list-inside">
                  <li><strong>Admin:</strong> Full access to manage users, editions, tasks, and trainers</li>
                  <li><strong>Editor:</strong> Can create and edit editions, tasks, and trainers</li>
                  <li><strong>Viewer:</strong> Can only view information</li>
                </ul>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button 
                onClick={handleRoleUpdate}
                disabled={updateUserMutation.isPending || newRole === selectedUser?.role}
              >
                {updateUserMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Create User dialog */}
        <CreateUserForm 
          isOpen={isCreateUserDialogOpen} 
          onClose={() => setIsCreateUserDialogOpen(false)} 
        />
      </div>
    </MainLayout>
  );
}