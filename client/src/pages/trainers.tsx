import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Pencil, Trash2, Users } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { apiRequest } from '@/lib/queryClient';
import { useToast } from "@/hooks/use-toast";

// Define the Trainer type
interface Trainer {
  id: number;
  name: string;
  email: string | null;
  role: string | null;
  department: string | null;
  status: string;
  createdAt: string;
}

// Form validation schema
const trainerFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address").optional().nullable(),
  role: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

type TrainerFormValues = z.infer<typeof trainerFormSchema>;

export default function Trainers() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentTrainer, setCurrentTrainer] = useState<Trainer | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch trainers
  const { data: trainers = [], isLoading, isError } = useQuery({
    queryKey: ['/api/trainers'],
    queryFn: async () => {
      const res = await fetch('/api/trainers');
      if (!res.ok) {
        throw new Error('Failed to fetch trainers');
      }
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    }
  });

  // Create trainer mutation
  const createTrainerMutation = useMutation({
    mutationFn: async (data: TrainerFormValues) => {
      return await apiRequest('POST', '/api/trainers', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Trainer created",
        description: "The trainer has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error creating trainer",
        description: `There was an error creating the trainer: ${error}`,
      });
    }
  });

  // Update trainer mutation
  const updateTrainerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: TrainerFormValues }) => {
      return await apiRequest('PATCH', `/api/trainers/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Trainer updated",
        description: "The trainer has been successfully updated.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating trainer",
        description: `There was an error updating the trainer: ${error}`,
      });
    }
  });

  // Delete trainer mutation
  const deleteTrainerMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest('DELETE', `/api/trainers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trainers'] });
      setIsDeleteDialogOpen(false);
      toast({
        title: "Trainer deleted",
        description: "The trainer has been successfully deleted.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error deleting trainer",
        description: `There was an error deleting the trainer: ${error}`,
      });
    }
  });

  // Form for adding a new trainer
  const addForm = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      status: "active",
    },
  });

  // Form for editing a trainer
  const editForm = useForm<TrainerFormValues>({
    resolver: zodResolver(trainerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      department: "",
      status: "active",
    },
  });

  // Handlers
  const handleAddSubmit = (values: TrainerFormValues) => {
    createTrainerMutation.mutate(values);
  };

  const handleEditSubmit = (values: TrainerFormValues) => {
    if (currentTrainer) {
      updateTrainerMutation.mutate({ id: currentTrainer.id, data: values });
    }
  };

  const handleDeleteConfirm = () => {
    if (currentTrainer) {
      deleteTrainerMutation.mutate(currentTrainer.id);
    }
  };

  const openEditDialog = (trainer: Trainer) => {
    setCurrentTrainer(trainer);
    editForm.reset({
      name: trainer.name,
      email: trainer.email || "",
      role: trainer.role || "",
      department: trainer.department || "",
      status: trainer.status as "active" | "inactive",
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (trainer: Trainer) => {
    setCurrentTrainer(trainer);
    setIsDeleteDialogOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Trainers</h2>

        <Button variant="default" onClick={() => {
          addForm.reset();
          setIsAddDialogOpen(true);
        }}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trainers Management</CardTitle>
          <CardDescription>
            Manage trainers for your training programs. Trainers can be assigned to tasks and editions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-6">
              <p>Loading trainers...</p>
            </div>
          ) : isError ? (
            <div className="flex justify-center py-6 text-red-500">
              <p>Error loading trainers. Please try again later.</p>
            </div>
          ) : trainers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="bg-neutral-100 p-3 rounded-full mb-4">
                <Users className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">No Trainers Found</h3>
              <p className="text-neutral-500 text-center max-w-md mb-6">
                You don't have any trainers added yet. Add your first trainer to get started.
              </p>
              <Button onClick={() => {
                addForm.reset();
                setIsAddDialogOpen(true);
              }}>
                Add Your First Trainer
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trainers.map((trainer: Trainer) => (
                    <TableRow key={trainer.id}>
                      <TableCell className="font-medium">{trainer.name}</TableCell>
                      <TableCell>{trainer.email || "-"}</TableCell>
                      <TableCell>{trainer.role || "-"}</TableCell>
                      <TableCell>{trainer.department || "-"}</TableCell>
                      <TableCell>
                        <Badge variant={trainer.status === "active" ? "success" : "secondary"}>
                          {trainer.status === "active" ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(trainer)}>
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => openDeleteDialog(trainer)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Trainer Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Trainer</DialogTitle>
            <DialogDescription>
              Add a new trainer to the system. Trainers can be assigned to tasks and editions.
            </DialogDescription>
          </DialogHeader>
          <Form {...addForm}>
            <form onSubmit={addForm.handleSubmit(handleAddSubmit)} className="space-y-4">
              <FormField
                control={addForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trainer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={addForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter email address" 
                        type="email" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={addForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter role" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter department" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={addForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTrainerMutation.isPending}>
                  {createTrainerMutation.isPending ? "Creating..." : "Add Trainer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Trainer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Trainer</DialogTitle>
            <DialogDescription>
              Update trainer information.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter trainer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter email address" 
                        type="email" 
                        {...field} 
                        value={field.value || ""} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter role" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter department" 
                          {...field} 
                          value={field.value || ""} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updateTrainerMutation.isPending}>
                  {updateTrainerMutation.isPending ? "Updating..." : "Update Trainer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trainer</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this trainer? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={deleteTrainerMutation.isPending}
            >
              {deleteTrainerMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}