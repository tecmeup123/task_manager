import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  getStatusColor, 
  formatDate, 
  parseDate, 
  isDateOverdue, 
  isDateUpcoming,
  getRelativeDateDescription
} from "@/lib/utils";
import { 
  ListTodo, 
  Calendar, 
  Layers, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ChevronRight,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: editions, isLoading: loadingEditions } = useQuery({
    queryKey: ["/api/editions"],
  });

  const currentEdition = editions?.[0];
  
  // Set up an array to hold all edition IDs
  const editionIds = editions?.map((edition: any) => edition.id) || [];
  
  // Track the loading state of all task queries
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  
  // Query all tasks for all editions using TanStack Query instead of raw fetch
  const { data: taskData, isLoading: isTaskDataLoading } = useQuery<any[][]>({
    queryKey: ['/api/all-edition-tasks', editionIds],
    queryFn: async () => {
      if (!editionIds.length) {
        return [];
      }
      
      // Create an array of promises, one for each edition's tasks
      const fetchPromises = editionIds.map(id => 
        fetch(`/api/editions/${id}/tasks`).then(res => res.json())
      );
      
      // Wait for all promises to resolve
      return Promise.all(fetchPromises);
    },
    enabled: editionIds.length > 0,
    staleTime: 60000, // Consider data fresh for 1 minute to reduce API calls
    refetchOnWindowFocus: false, // Disable refetching on window focus
  });
  
  // Update tasks state when task data changes
  useEffect(() => {
    if (taskData) {
      // Flatten the array of arrays into a single array of tasks
      const combinedTasks = taskData.flat();
      setAllTasks(combinedTasks);
      setTasksLoading(false);
    }
  }, [taskData]);
  
  // Set loading state based on query loading state
  useEffect(() => {
    setTasksLoading(isTaskDataLoading);
  }, [isTaskDataLoading]);
  
  // Keep this for backward compatibility with existing code
  const tasks = allTasks;

  // Task completion stats
  const taskStats = tasks ? {
    total: tasks.length,
    completed: tasks.filter((task: any) => task.status === 'Done').length,
  } : null;

  // Calculate overdue and upcoming tasks
  // For testing, set today to a date in May 2024 to match our sample data
  const today = new Date("2024-04-11"); // Current date as of our application date
  console.log("Today's date for comparison:", today);
  
  // Get overdue tasks (tasks with dueDate in the past and not Done)
  const overdueTasks = tasks ? tasks.filter((task: any) => {
    if (task.status === 'Done') return false;
    if (!task.dueDate) return false;
    
    const isOverdue = isDateOverdue(task.dueDate);
    console.log("Task due date:", task.name, task.dueDate, "Is overdue:", isOverdue);
    return isOverdue;
  }).sort((a: any, b: any) => {
    // Sort by due date (earliest first)
    const dateA = parseDate(a.dueDate);
    const dateB = parseDate(b.dueDate);
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.getTime() - dateB.getTime();
  }) : [];
  
  console.log("Overdue tasks count:", overdueTasks?.length);
  
  // Get upcoming tasks (tasks with dueDate in the next 7 days and not Done)
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  console.log("Next week date for comparison:", nextWeek);
  
  const upcomingTasks = tasks ? tasks.filter((task: any) => {
    if (task.status === 'Done') return false;
    if (!task.dueDate) return false;
    
    // Use our utility function with default 7-day window
    const isUpcoming = isDateUpcoming(task.dueDate);
    console.log("Task due date:", task.name, task.dueDate, "Is upcoming:", isUpcoming);
    return isUpcoming;
  }).sort((a: any, b: any) => {
    // Sort by due date (earliest first)
    const dateA = parseDate(a.dueDate);
    const dateB = parseDate(b.dueDate);
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateA.getTime() - dateB.getTime();
  }) : [];
  
  console.log("Upcoming tasks count:", upcomingTasks?.length);
  
  // Loading states
  const isLoading = loadingEditions || tasksLoading;
  
  // State for collapsible sections - collapsed by default
  const [overdueCollapsed, setOverdueCollapsed] = useState(true);
  const [upcomingCollapsed, setUpcomingCollapsed] = useState(true);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Dashboard</h2>

        <div className="flex gap-2">
          <Link to="/tasks">
            <Button variant="default">
              <ListTodo className="mr-2 h-4 w-4" />
              View Tasks
            </Button>
          </Link>
          <Link to="/editions">
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" />
              Manage Editions
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-primary/10 rounded-full p-3 mr-4">
              <Layers className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Ongoing Training Sessions</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{editions?.length || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Tasks this week */}
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <ListTodo className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Tasks This Week</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">
                  {/* Count all tasks for current week across all editions */}
                  {Array.isArray(editions) && editions.length > 0 && (
                    <span>
                      {editions.reduce((count, edition) => {
                        // Get all tasks that match this edition's current week
                        const editionTasks = tasks?.filter((task: any) => 
                          task.editionId === edition.id && 
                          parseInt(task.week) === edition.currentWeek
                        )?.length || 0;
                        return count + editionTasks;
                      }, 0)}
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Completed tasks this week */}
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed This Week</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">
                  {/* Count all completed tasks for current week across all editions */}
                  {Array.isArray(editions) && editions.length > 0 && (
                    <span>
                      {editions.reduce((count, edition) => {
                        // Get all completed tasks that match this edition's current week
                        const completedTasks = tasks?.filter((task: any) => 
                          task.editionId === edition.id && 
                          parseInt(task.week) === edition.currentWeek &&
                          task.status === 'Done'
                        )?.length || 0;
                        return count + completedTasks;
                      }, 0)}
                    </span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <div className="bg-amber-100 rounded-full p-3 mr-4">
                <Calendar className="h-6 w-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">Current Weeks</p>
            </div>
            {isLoading ? (
              <Skeleton className="h-24 w-full mt-1" />
            ) : (
              <div className="space-y-2">
                {editions && editions.length > 0 ? (
                  editions.map((edition: any) => (
                    <div key={edition.id} className="flex justify-between items-center">
                      <span className="text-sm">{edition.code}</span>
                      <span className="text-sm font-medium">Week {edition.currentWeek}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No active editions</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Main content area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Editions Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Active Editions</CardTitle>
            <CardDescription>Currently running training editions</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : editions && editions.length > 0 ? (
              <div className="space-y-4">
                {editions.slice(0, 5).map((edition: any) => (
                  <div key={edition.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{edition.code}</p>
                      <p className="text-sm text-muted-foreground">
                        {edition.trainingType} · Started: {formatDate(edition.startDate, 'MMM d, yyyy')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeDateDescription(edition.startDate)}
                      </p>
                    </div>
                    <Link to={`/tasks/${edition.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No editions available</p>
                <Link to="/editions">
                  <Button variant="outline" className="mt-2">Create Edition</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Overdue and Upcoming Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Overdue Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                Overdue Tasks
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isLoading && overdueTasks.length > 0 && (
                  <Badge variant="destructive">{overdueTasks.length}</Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setOverdueCollapsed(!overdueCollapsed)}
                >
                  {overdueCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <CardDescription>Tasks that are past their due date</CardDescription>
          </CardHeader>
          <CardContent className={`transition-all duration-300 ease-in-out ${overdueCollapsed ? 'hidden' : ''}`}>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : overdueTasks.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {overdueTasks.map((task: any) => (
                  <div key={task.id} className="flex justify-between items-start border-b pb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-md mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Badge variant="outline">{task.week}</Badge>
                          <Badge variant={getStatusColor(task.status).bg}>{task.status}</Badge>
                          <span className="text-xs text-red-500">
                            Due: {formatDate(task.dueDate)} ({getRelativeDateDescription(task.dueDate)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/tasks/${task.editionId}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}

                {overdueTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/tasks">
                      <Button variant="link" size="sm">
                        View all {overdueTasks.length} overdue tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No overdue tasks</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <Clock className="mr-2 h-5 w-5 text-amber-500" />
                Upcoming Tasks
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isLoading && upcomingTasks.length > 0 && (
                  <Badge variant="secondary">{upcomingTasks.length}</Badge>
                )}
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setUpcomingCollapsed(!upcomingCollapsed)}
                >
                  {upcomingCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className={`transition-all duration-300 ease-in-out ${upcomingCollapsed ? 'hidden' : ''}`}>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : upcomingTasks.length > 0 ? (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {upcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex justify-between items-start border-b pb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-md mt-1">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Badge variant="outline">{task.week}</Badge>
                          <Badge variant={getStatusColor(task.status).bg}>{task.status}</Badge>
                          <span className="text-xs text-amber-600">
                            Due: {formatDate(task.dueDate)} ({getRelativeDateDescription(task.dueDate)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/tasks/${task.editionId}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}

                {upcomingTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/tasks">
                      <Button variant="link" size="sm">
                        View all {upcomingTasks.length} upcoming tasks
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No upcoming tasks due soon</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  );
}
