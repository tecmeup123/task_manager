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
import { ChevronDown, ChevronRight, Plus, Copy, Download, MoreVertical } from "lucide-react";
import AddTaskForm from "@/components/add-task-form";
import WeekTasks from "@/components/week-tasks";
import TaskDetailModal from "@/components/task-detail-modal";
import CreateEditionForm from "@/components/create-edition-form";
import { formatDate, getTasksByWeek, getWeekStatus, sortWeeks, getAllWeeks } from "@/lib/utils";
import { WEEK_OPTIONS, TRAINING_TYPE_OPTIONS, TASK_STATUS_OPTIONS } from "@/lib/constants";

export default function Tasks() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const editionId = params.editionId ? parseInt(params.editionId) : null;

  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAddTaskFormOpen, setIsAddTaskFormOpen] = useState(false);
  const [isCreateEditionOpen, setIsCreateEditionOpen] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState("all");
  const [selectedTrainingType, setSelectedTrainingType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [expandedWeeks, setExpandedWeeks] = useState<Record<string, boolean>>({});

  // Fetch all editions
  const { data: editions = [], isLoading: editionsLoading } = useQuery<any[]>({
    queryKey: ["/api/editions"],
  });

  // Find the current edition
  const currentEdition = editionId 
    ? editions?.find((edition: any) => edition.id === editionId) 
    : editions?.[0];
  
  useEffect(() => {
    // If editions are loaded and no edition is selected, redirect to the first one
    if (editions && editions.length > 0 && !editionId) {
      setLocation(`/tasks/${editions[0].id}`);
    }
  }, [editions, editionId, setLocation]);

  // Fetch tasks for the current edition
  const { data: tasks = [], isLoading: tasksLoading, refetch: refetchTasks } = useQuery<any[]>({
    queryKey: [`/api/editions/${currentEdition?.id}/tasks`],
    enabled: !!currentEdition?.id,
    staleTime: 60000, // Consider data fresh for 1 minute to reduce API calls
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });

  // Initialize expanded state for all weeks
  useEffect(() => {
    if (tasks) {
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
    }
  }, [tasks, currentEdition]);

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
      console.log("Sending task update for:", updatedTask);
      await apiRequest('PATCH', `/api/tasks/${updatedTask.id}`, updatedTask);
      
      // Also invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/editions/${currentEdition?.id}/tasks`] });
      
      setIsTaskModalOpen(false);
      toast({
        title: "Task updated",
        description: "Task has been successfully updated",
      });
      // Force refetch to ensure we have the latest data
      refetchTasks();
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
      
      // Also invalidate the general tasks query
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/editions/${currentEdition?.id}/tasks`] });
      
      setIsAddTaskFormOpen(false);
      toast({
        title: "Task created",
        description: "New task has been created successfully",
      });
      // Force refetch to ensure we have the latest data
      refetchTasks();
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
                    setLocation(`/tasks/${value}`);
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
          // No tasks found
          <div className="p-8 text-center text-neutral-500">
            <p className="mb-2">No tasks found for the selected filters.</p>
            <Button onClick={() => setIsAddTaskFormOpen(true)}>Add Your First Task</Button>
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
        }}
        onSave={handleTaskSave}
      />
      
      {/* Add invisible spacing div at the bottom for mobile */}
      <div className="h-12 md:hidden" />
    </div>
  );
}
