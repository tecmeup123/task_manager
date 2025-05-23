import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronRight, Plus, Copy, Download, MoreVertical, CalendarDays } from "lucide-react";
import AddTaskForm from "@/components/add-task-form";
import WeekTasks from "@/components/week-tasks";
import TaskDetailModal from "@/components/task-detail-modal";
import CreateEditionForm from "@/components/create-edition-form";
import { formatDate, getTasksByWeek, getWeekStatus, sortWeeks, getAllWeeks } from "@/lib/utils";
import { WEEK_OPTIONS, TRAINING_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/constants";

// Helper function to parse query parameters
function useQueryParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1] || '');
}

export default function Tasks() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryParams = useQueryParams();
  const urlEditionId = queryParams.get('editionId');
  const urlTaskId = queryParams.get('taskId');
  
  // Priority: URL editionId parameter > route editionId parameter
  const editionId = urlEditionId ? parseInt(urlEditionId) : 
                    params.editionId ? parseInt(params.editionId) : null;

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const [isCreateEditionOpen, setIsCreateEditionOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [selectedTrainingType, setSelectedTrainingType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});
  const [editionHasChanged, setEditionHasChanged] = useState(false);

  // Fetch all editions (excluding archived)
  const { data: editions = [], isLoading: editionsLoading } = useQuery<any[]>({
    queryKey: ["/api/editions", { includeArchived: false }],
    queryFn: async () => {
      const response = await fetch(`/api/editions?includeArchived=false`);
      if (!response.ok) {
        throw new Error('Failed to fetch editions');
      }
      return response.json();
    },
  });

  // Find the current edition
  const currentEdition = editionId 
    ? editions?.find((edition: any) => edition.id === editionId) 
    : editions?.[0];
  
  // Track edition changes to reset expanded weeks
  useEffect(() => {
    if (editionId) {
      setEditionHasChanged(true);
    }
  }, [editionId]);
  
  useEffect(() => {
    // If editions are loaded and no edition is selected, redirect to the first one
    if (editions && editions.length > 0 && !editionId) {
      setLocation(`/tasks?editionId=${editions[0].id}`);
    }
  }, [editions, editionId, setLocation]);
  
  // Current location to handle task URL parameters
  const [currentLocation] = useLocation();

  // Fetch tasks for the current edition
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<any[]>({
    queryKey: [`/api/editions/${currentEdition?.id}/tasks`],
    enabled: !!currentEdition?.id,
    staleTime: 60000, // Consider data fresh for 1 minute to reduce API calls
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Check if we have state passed from notification click
  const historyState = typeof window !== 'undefined' && window.history.state ? window.history.state : {};
  const locationState = historyState.state || {};
  
  // Log the state for debugging
  console.log("Raw history state:", historyState);
  
  const fromNotification = locationState.fromNotification || false;
  const stateTaskId = locationState.taskId || locationState.openTaskId;
  const openTaskModal = locationState.openTaskModal || false;
  
  // Also check URL for taskId as a fallback
  useEffect(() => {
    if (urlTaskId && editionId && !isTaskModalOpen) {
      console.log("Opening task from URL params:", urlTaskId);
      
      // If we have a taskId in the URL but modal isn't open, try to open it
      const taskIdInt = parseInt(urlTaskId);
      if (!isNaN(taskIdInt) && tasks && tasks.length > 0) {
        const taskToOpen = tasks.find((t: any) => t.id === taskIdInt);
        if (taskToOpen) {
          console.log("Found task in loaded tasks, opening modal");
          setSelectedTask(taskToOpen);
          setIsTaskModalOpen(true);
        } else {
          // Try to fetch the specific task
          console.log("Task not in loaded tasks, fetching directly");
          apiRequest('GET', `/api/tasks/${taskIdInt}`)
            .then(res => res.json())
            .then(task => {
              if (task) {
                setSelectedTask(task);
                setIsTaskModalOpen(true);
              }
            })
            .catch(err => console.error("Failed to fetch task:", err));
        }
      }
    }
  }, [urlTaskId, editionId, tasks, isTaskModalOpen]);

  // Open task detail modal when task ID is in URL (from notification) or in history state
  useEffect(() => {
    const openTaskFromUrl = async () => {
      // Log the state for debugging purposes
      console.log("Task state:", { historyState, locationState, urlTaskId, stateTaskId, openTaskModal });
      
      // Determine which task ID to use (prefer state taskId over URL taskId)
      const taskIdToUse = stateTaskId || (urlTaskId ? parseInt(urlTaskId) : null);
      
      // Skip if we just came from closing a modal
      const fromModal = locationState.fromModal || false;
      if (fromModal) {
        console.log("Skipping task open as we just closed a modal");
        return;
      }
      
      // If explicitly requested to open modal via state or taskId present
      const shouldOpenModal = openTaskModal || locationState.openTaskModal || !!stateTaskId;
      
      // Only execute if we have a taskId and editionId and should open modal
      if (taskIdToUse && editionId && shouldOpenModal) {
        console.log(`Attempting to open task ID: ${taskIdToUse} for edition: ${editionId}`, { fromState: !!stateTaskId, fromUrl: !!urlTaskId });
        
        // If tasks aren't loaded yet or the specific task isn't found, fetch it directly
        if (!tasks || tasks.length === 0 || !tasks.find((task: any) => task.id === taskIdToUse)) {
          try {
            // Fetch the specific task directly if needed
            console.log(`Fetching specific task: ${taskIdToUse}`);
            const taskResponse = await apiRequest('GET', `/api/tasks/${taskIdToUse}`);
            const specificTask = await taskResponse.json();
            
            if (specificTask) {
              console.log("Found specific task:", specificTask);
              setSelectedTask(specificTask);
              setIsTaskModalOpen(true);
              
              // Clear the history state to avoid reopening on refresh
              if (fromNotification) {
                window.history.replaceState({}, '', window.location.pathname + window.location.search);
              }
            }
          } catch (error) {
            console.error("Error fetching specific task:", error);
          }
        } else {
          // Task is in the loaded tasks array
          const taskToOpen = tasks.find((task: any) => task.id === taskIdToUse);
          
          if (taskToOpen) {
            console.log(`Opening task from loaded tasks: ${taskIdToUse}`, taskToOpen);
            setSelectedTask(taskToOpen);
            setIsTaskModalOpen(true);
            
            // Clear the history state to avoid reopening on refresh
            if (fromNotification) {
              window.history.replaceState({}, '', window.location.pathname + window.location.search);
            }
          }
        }
      }
    };
    
    openTaskFromUrl();
  }, [urlTaskId, stateTaskId, fromNotification, editionId, tasks]);

  // Initialize expanded state for all weeks - but only on first load or edition change
  useEffect(() => {
    if (tasks && (!expandedWeeks || Object.keys(expandedWeeks).length === 0 || editionHasChanged)) {
      // Create a unique array of weeks without using Set (to avoid TypeScript downlevelIteration issues)
      const uniqueWeeks: string[] = [];
      tasks.forEach((task: any) => {
        if (task.week && !uniqueWeeks.includes(task.week)) {
          uniqueWeeks.push(task.week);
        }
      });
      
      const initialExpandedState: Record<string, boolean> = {};
      
      // Initialize all weeks as collapsed except for the current week
      const allWeeks = getAllWeeks();
      allWeeks.forEach(week => {
        // Current week is expanded by default
        const isCurrentWeek = getWeekStatus(week, currentEdition?.currentWeek || 5) === 'CURRENT WEEK';
        initialExpandedState[week] = isCurrentWeek;
      });
      
      setExpandedWeeks(initialExpandedState);
      
      // Reset the editionHasChanged flag
      if (editionHasChanged) {
        setEditionHasChanged(false);
      }
    }
  }, [currentEdition?.id, editionHasChanged]);

  // Handle week expansion toggle
  const toggleWeekExpanded = (week: string) => {
    setExpandedWeeks(prev => ({
      ...prev,
      [week]: !prev[week]
    }));
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSave = async (updatedTask: any) => {
    try {
      // Enhanced logging for debugging assignment
      console.log("Sending task update with data:", {
        id: updatedTask.id,
        assignedUserId: updatedTask.assignedUserId,
        owner: updatedTask.owner,
        fullTask: updatedTask
      });
      
      // Make the API request with the complete task data
      await apiRequest('PATCH', `/api/tasks/${updatedTask.id}`, updatedTask);
      
      // Salvar a posição de rolagem antes de refetch
      const scrollPosition = window.scrollY;
      
      // Also invalidate the general tasks query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tasks'],
        refetchType: 'none'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/editions/${currentEdition?.id}/tasks`],
        refetchType: 'none'
      });
      
      setIsTaskModalOpen(false);
      toast({
        title: "Task updated",
        description: "Task has been successfully updated",
      });
      
      // Force refetch e restaurar scrolling
      setTimeout(() => {
        refetchTasks().then(() => {
          window.scrollTo(0, scrollPosition);
        });
      }, 100);
    } catch (error) {
      console.error("Failed to update task:", error);
      toast({
        title: "Error",
        description: "Failed to update task",
        variant: "destructive",
      });
    }
  };

  const handleNewTask = async (newTask: any) => {
    try {
      console.log("Creating new task:", newTask);
      await apiRequest('POST', '/api/tasks', {
        ...newTask,
        editionId: currentEdition.id,
      });
      
      // Salvar a posição de rolagem atual
      const scrollPosition = window.scrollY;
      
      // Also invalidate the general tasks query
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tasks'],
        refetchType: 'none'
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/editions/${currentEdition?.id}/tasks`],
        refetchType: 'none'
      });
      
      setIsAddTaskFormOpen(false);
      toast({
        title: "Task created",
        description: "New task has been created successfully",
      });
      
      // Force refetch e restaurar posição de rolagem
      setTimeout(() => {
        refetchTasks().then(() => {
          window.scrollTo(0, scrollPosition);
        });
      }, 100);
    } catch (error) {
      console.error("Failed to create task:", error);
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      });
    }
  };

  // Filter tasks based on selected week, training type, and status
  const filteredTasks = tasks ? tasks.filter((task: any) => {
    const matchesWeek = selectedWeek === "all" || task.week === selectedWeek;
    const matchesType = selectedTrainingType === "all" || task.trainingType === selectedTrainingType;
    const matchesStatus = selectedStatus === "all" || task.status === selectedStatus;
    return matchesWeek && matchesType && matchesStatus;
  }) : [];

  // Add logging to debug task data
  console.log("Task data example:", tasks.length > 0 ? tasks[0] : "No tasks");
  
  // Group tasks by week
  const tasksByWeek = getTasksByWeek(filteredTasks);
  
  // Get all weeks, sorted
  const weeks = sortWeeks(Object.keys(tasksByWeek));
  
  // Calculate progress based on completed tasks
  const completedTasks = tasks ? tasks.filter((task: any) => task.status === 'Done').length : 0;
  const totalTasks = tasks ? tasks.length : 0;
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Determine week progress statuses
  const pastWeeks = Math.max(0, (currentEdition?.currentWeek || 1) - 1);
  const futureWeeks = Math.max(0, 8 - (currentEdition?.currentWeek || 1));
  const isStarted = currentEdition?.currentWeek && currentEdition.currentWeek > 0;
  
  // Used for the progress indicator badges
  const weekStatuses = ["PAST WEEKS", "CURRENT WEEK", "FUTURE WEEKS"];

  const isLoading = editionsLoading || tasksLoading;

  return (
    <div className="pb-20 md:pb-0">
      {/* Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 md:mb-6">
        <div className="flex flex-col mb-4 md:mb-0">
          {isLoading ? (
            <Skeleton className="h-8 w-48" />
          ) : currentEdition ? (
            <>
              <div className="flex items-center">
                <h2 className="text-xl font-semibold">Edition: {currentEdition.code}</h2>
                <Badge variant="default" className="ml-2 bg-green-500 hover:bg-green-600">
                  Active
                </Badge>
              </div>
              
              {/* Edition Picker Dropdown */}
              <div className="mt-2">
                <Select
                  value={editionId ? editionId.toString() : ''}
                  onValueChange={(value) => {
                    setLocation(`/tasks?editionId=${value}`);
                  }}
                  disabled={editionsLoading}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Switch Edition" />
                  </SelectTrigger>
                  <SelectContent>
                    {editions.map(edition => (
                      <SelectItem key={edition.id} value={edition.id.toString()}>
                        {edition.code} ({edition.trainingType})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <h2 className="text-xl font-semibold">No Edition Selected</h2>
          )}
        </div>
        
        {/* Filter and action buttons - responsive layout */}
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Select
              value={selectedWeek}
              onValueChange={setSelectedWeek}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Select Week" />
              </SelectTrigger>
              <SelectContent>
                {WEEK_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedTrainingType}
              onValueChange={setSelectedTrainingType}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Training Type" />
              </SelectTrigger>
              <SelectContent>
                {TRAINING_TYPE_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={isLoading}
            >
              <SelectTrigger className="w-full md:w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {TASK_STATUS_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Action buttons - separate row on mobile */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto mt-2 md:mt-0">
            <Button 
              className="flex-1 md:flex-initial"
              disabled={isLoading || !currentEdition} 
              onClick={() => setIsAddTaskFormOpen(true)}
            >
              <Plus className="mr-1 h-4 w-4" /> Add Task
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 md:flex-initial"
              disabled={isLoading || !currentEdition}
              onClick={() => setIsCreateEditionOpen(true)}
            >
              <Copy className="mr-1 h-4 w-4" /> Duplicate
            </Button>
            
            {/* Export button removed as requested */}
          </div>
        </div>
      </div>

      {/* Week progress indicator */}
      <Card className="mb-4 md:mb-6">
        <CardContent className="p-4">
          <h3 className="text-sm font-semibold mb-3">Progress</h3>
          {isLoading ? (
            <>
              <Skeleton className="h-2.5 w-full mb-2" />
              <Skeleton className="h-6 w-full" />
            </>
          ) : currentEdition ? (
            <>
              {/* Progress bar - similar to the screenshot */}
              <div className="space-y-4">
                {/* Week indicator and progress bar */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 bg-neutral-200 rounded-full h-2.5 mr-4">
                    <div
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${(currentEdition.currentWeek / 8) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap">
                    Week {currentEdition.currentWeek} / 8
                  </span>
                </div>
                
                {/* Week progress removed as requested */}
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No edition selected
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tasks Table */}
      <Card>
        {/* Table Header - more mobile-friendly */}
        <div className="grid grid-cols-12 gap-2 p-3 border-b border-neutral-200 bg-neutral-100 text-sm font-medium text-neutral-700">
          <div className="col-span-3 md:col-span-1">Task Code</div>
          <div className="col-span-3 md:col-span-2">Week</div>
          <div className="col-span-6 md:col-span-4">Task</div>
          <div className="hidden md:block md:col-span-1">Duration</div>
          <div className="hidden md:block md:col-span-1">Due Date</div>
          <div className="hidden md:block md:col-span-1">Type</div>
          <div className="hidden md:block md:col-span-1">Owner</div>
          <div className="hidden md:block md:col-span-1">Status</div>
        </div>

        {isLoading ? (
          // Loading skeleton
          <div className="p-4 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : weeks.length > 0 ? (
          // Display tasks grouped by week
          <>
            {weeks.map((week) => (
              <WeekTasks
                key={week}
                week={week}
                tasks={tasksByWeek[week]}
                isExpanded={!!expandedWeeks[week]}
                onToggleExpand={() => toggleWeekExpanded(week)}
                onTaskClick={handleTaskClick}
                currentWeek={currentEdition?.currentWeek || 5}
              />
            ))}
          </>
        ) : (
          // No tasks found - different message depending on whether an edition exists
          <div className="p-8 text-center text-neutral-500">
            {currentEdition ? (
              <>
                <p className="mb-2">No tasks found for the selected filters.</p>
                <Button onClick={() => setIsAddTaskFormOpen(true)}>Add Your First Task</Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="mx-auto w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium">No Edition Available</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  You need to create an edition first before you can add tasks. An edition represents a training period.
                </p>
                <Button onClick={() => setIsCreateEditionOpen(true)}>
                  Create Your First Edition
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Add Task Form (initially hidden) */}
        <AddTaskForm
          isOpen={isAddTaskFormOpen}
          onClose={() => setIsAddTaskFormOpen(false)}
          onSave={handleNewTask}
          edition={currentEdition}
        />
      </Card>

      {/* Create New Edition Card */}
      <CreateEditionForm
        isOpen={isCreateEditionOpen}
        onClose={() => setIsCreateEditionOpen(false)}
        sourceEditionId={currentEdition?.id}
      />

      {/* Task Detail Modal */}
      <TaskDetailModal
        isOpen={isTaskModalOpen}
        task={selectedTask || {}}
        onClose={() => {
          console.log("Task modal onClose called from tasks page");
          setIsTaskModalOpen(false);
          setSelectedTask(null);
          
          // Clean up the URL to avoid reopening modal on page refresh,
          // but keep the editionId param to preserve context
          if (editionId) {
            // Use setLocation to update the URL without the taskId
            // This preserves the editionId for context
            window.history.replaceState(
              { state: { fromModal: true } }, 
              '', 
              `/tasks?editionId=${editionId}`
            );
          }
        }}
        onSave={handleTaskSave}
        redirectPath={editionId ? `/tasks?editionId=${editionId}` : '/tasks'}
      />
      
      {/* Add invisible spacing div at the bottom for mobile */}
      <div className="h-12 md:hidden" />
    </div>
  );
}
