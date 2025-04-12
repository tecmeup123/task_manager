import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, isAfter, isBefore, addWeeks } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Plus, MoreVertical, Copy, Trash2, Edit, CalendarDays, Layers, ArrowRight, Archive, ArchiveRestore } from "lucide-react";
import WeekProgressIndicator from "@/components/week-progress-indicator";
import CreateEditionForm from "@/components/create-edition-form";
import { formatDate } from "@/lib/utils";

export default function Editions() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isCreateEditionOpen, setIsCreateEditionOpen] = useState(false);
  const [isDuplicateEditionOpen, setIsDuplicateEditionOpen] = useState(false);
  const [sourceEditionId, setSourceEditionId] = useState<number | null>(null);
  const [editionToDelete, setEditionToDelete] = useState<any | null>(null);

  // Show archived editions state
  const [showArchived, setShowArchived] = useState(false);
  
  // Fetch all editions
  const { data: allEditions, isLoading } = useQuery<any[]>({
    queryKey: ["/api/editions"],
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });
  
  // Filter editions based on archived status
  const editions = allEditions ? allEditions.filter(edition => showArchived ? edition.archived : !edition.archived) : [];

  // Delete edition mutation
  const deleteEdition = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/editions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editions"] });
      toast({
        title: "Edition deleted",
        description: "The edition has been successfully deleted.",
      });
      setEditionToDelete(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the edition.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteConfirm = () => {
    if (editionToDelete) {
      deleteEdition.mutate(editionToDelete.id);
    }
  };

  // Helper functions to determine edition status
  const isEditionUpcoming = (edition: any) => {
    const startDate = new Date(edition.startDate);
    const now = new Date();
    return startDate > now;
  };

  const isEditionActive = (edition: any) => {
    const startDate = new Date(edition.startDate);
    const now = new Date();
    // An edition is active if it has started but hasn't reached week 8 yet
    // Assuming each week is 7 days
    const endDate = addWeeks(startDate, 8);
    return startDate <= now && now <= endDate;
  };
  
  const isEditionFinished = (edition: any) => {
    const startDate = new Date(edition.startDate);
    const now = new Date();
    const endDate = addWeeks(startDate, 8);
    return now > endDate;
  };

  // Archive edition mutation
  const archiveEdition = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("PATCH", `/api/editions/${id}/archive`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editions"] });
      toast({
        title: "Edition archived",
        description: "The edition has been successfully archived.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to archive the edition.",
        variant: "destructive",
      });
    },
  });
  
  const handleArchiveEdition = (edition: any) => {
    archiveEdition.mutate(edition.id);
  };

  const handleDuplicateEdition = (edition: any) => {
    setSourceEditionId(edition.id);
    setIsDuplicateEditionOpen(true);
  };

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Training Editions</h2>
        <Button onClick={() => setIsCreateEditionOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Create New Edition</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      {/* Editions Table (Desktop) */}
      <Card className="hidden md:block">
        <CardHeader className="pb-3">
          <CardTitle>All Editions</CardTitle>
          <CardDescription>Manage your training editions</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            // Loading skeleton
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : editions && editions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Edition Code</TableHead>
                  <TableHead>Training Type</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Week</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {editions.map((edition: any) => (
                  <TableRow key={edition.id}>
                    <TableCell className="font-medium">{edition.code}</TableCell>
                    <TableCell>
                      <Badge variant={edition.trainingType === "GLR" ? "default" : "secondary"}>
                        {edition.trainingType}
                      </Badge>
                    </TableCell>
                    <TableCell>{formatDate(edition.startDate)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          isEditionUpcoming(edition) ? "outline" : 
                          isEditionActive(edition) ? "success" : 
                          "destructive"
                        }
                        className={
                          isEditionUpcoming(edition) ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200" : ""
                        }
                      >
                        {isEditionUpcoming(edition) ? "Upcoming" : 
                         isEditionActive(edition) ? "Active" : 
                         "Finished"}
                      </Badge>
                    </TableCell>
                    <TableCell className="w-[250px]">
                    <WeekProgressIndicator currentWeek={edition.currentWeek || 1} />
                  </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setLocation(`/tasks/${edition.id}`)}>
                            <Layers className="mr-2 h-4 w-4" />
                            View Tasks
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateEdition(edition)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {isEditionFinished(edition) && !edition.archived && (
                            <DropdownMenuItem onClick={() => handleArchiveEdition(edition)}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => setEditionToDelete(edition)}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Layers className="h-12 w-12 text-muted-foreground mx-auto" />
              </div>
              <h3 className="text-lg font-medium mb-2">No Editions Found</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first training edition.
              </p>
              <Button onClick={() => setIsCreateEditionOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create New Edition
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Editions List (Mobile) */}
      <div className="md:hidden">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Editions</CardTitle>
            <CardDescription>Manage your training editions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              // Loading skeleton
              <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : editions && editions.length > 0 ? (
              <div className="space-y-4">
                {editions.map((edition: any) => (
                  <div 
                    key={edition.id} 
                    className="border rounded-lg p-4 shadow-sm hover:shadow transition-all"
                    onClick={() => setLocation(`/tasks/${edition.id}`)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{edition.code}</p>
                          <Badge variant={edition.trainingType === "GLR" ? "default" : "secondary"}>
                            {edition.trainingType}
                          </Badge>
                          <Badge 
                            variant={
                              isEditionUpcoming(edition) ? "outline" : 
                              isEditionActive(edition) ? "success" : 
                              "destructive"
                            }
                            className={
                              isEditionUpcoming(edition) ? "bg-yellow-100 hover:bg-yellow-200 text-yellow-800 border-yellow-200" : ""
                            }
                          >
                            {isEditionUpcoming(edition) ? "Upcoming" : 
                             isEditionActive(edition) ? "Active" : 
                             "Finished"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Starts {formatDate(edition.startDate)}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/tasks/${edition.id}`);
                          }}>
                            <Layers className="mr-2 h-4 w-4" />
                            View Tasks
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicateEdition(edition);
                          }}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          {isEditionFinished(edition) && !edition.archived && (
                            <DropdownMenuItem onClick={(e) => {
                              e.stopPropagation();
                              handleArchiveEdition(edition);
                            }}>
                              <Archive className="mr-2 h-4 w-4" />
                              Archive
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={(e) => {
                            e.stopPropagation();
                            setEditionToDelete(edition);
                          }}>
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="mt-2">
                      <div className="text-sm font-medium mb-1">Week {edition.currentWeek || 1}/8</div>
                      <WeekProgressIndicator currentWeek={edition.currentWeek || 1} />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Layers className="h-12 w-12 text-muted-foreground mx-auto" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Editions Found</h3>
                <p className="text-muted-foreground mb-4">
                  Start by creating your first training edition.
                </p>
                <Button onClick={() => setIsCreateEditionOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Edition
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Upcoming Editions Card */}
      <Card className="mt-4 md:mt-6">
        <CardHeader className="pb-3">
          <CardTitle>Upcoming Editions</CardTitle>
          <CardDescription>Training editions scheduled to start soon</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : editions && editions.length > 0 ? (
            <div className="space-y-4">
              {(() => {
                // Get current date
                const currentDate = new Date();
                
                // Filter and sort editions that haven't started yet
                const upcomingEditions = [...editions]
                  .filter((edition: any) => {
                    const startDate = new Date(edition.startDate);
                    return startDate > currentDate;
                  })
                  .sort((a: any, b: any) => {
                    const dateA = new Date(a.startDate);
                    const dateB = new Date(b.startDate);
                    return dateA.getTime() - dateB.getTime();
                  })
                  .slice(0, 3);
                
                if (upcomingEditions.length === 0) {
                  return (
                    <div className="text-center py-4 text-muted-foreground">
                      No upcoming editions scheduled
                    </div>
                  );
                }
                
                return upcomingEditions.map((edition: any) => (
                  <div key={edition.id} className="flex flex-col gap-3 border-b pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-primary/10 p-2 rounded-md mr-3">
                          <CalendarDays className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{edition.code}</p>
                            <Badge variant={edition.trainingType === "GLR" ? "default" : "secondary"}>
                              {edition.trainingType}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Starts {formatDate(edition.startDate)}
                          </p>
                        </div>
                      </div>
                      <Link to={`/tasks/${edition.id}`}>
                        <Button variant="ghost" size="sm" className="hidden sm:flex">
                          View <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="sm:hidden">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                ));
              })()}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No upcoming editions
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create New Edition Dialog */}
      <CreateEditionForm
        isOpen={isCreateEditionOpen}
        onClose={() => setIsCreateEditionOpen(false)}
      />

      {/* Duplicate Edition Dialog */}
      <CreateEditionForm
        isOpen={isDuplicateEditionOpen}
        onClose={() => setIsDuplicateEditionOpen(false)}
        sourceEditionId={sourceEditionId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!editionToDelete} onOpenChange={(open) => !open && setEditionToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the edition "{editionToDelete?.code}" and all its
              associated tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
