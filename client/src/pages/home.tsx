import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getStatusColor, formatDate } from "@/lib/utils";
import { ListTodo, Calendar, Layers, CheckCircle, Clock, AlertTriangle, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { data: editions, isLoading: loadingEditions } = useQuery({
    queryKey: ["/api/editions"],
  });

  const currentEdition = editions?.[0];

  // Fetch tasks for the first edition if available
  const { data: tasks, isLoading: loadingTasks } = useQuery({
    queryKey: ["/api/editions", currentEdition?.id, "tasks"],
    enabled: !!currentEdition?.id,
  });

  // Task completion stats
  const taskStats = tasks ? {
    total: tasks.length,
    completed: tasks.filter((task: any) => task.status === 'Done').length,
  } : null;

  // Calculate overdue and upcoming tasks
  const today = new Date();
  
  // Get overdue tasks (tasks with dueDate in the past and not Done)
  const overdueTasks = tasks ? tasks.filter((task: any) => {
    if (task.status === 'Done') return false;
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < today;
  }).sort((a: any, b: any) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }) : [];
  
  // Get upcoming tasks (tasks with dueDate in the next 7 days and not Done)
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  
  const upcomingTasks = tasks ? tasks.filter((task: any) => {
    if (task.status === 'Done') return false;
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= today && dueDate <= nextWeek;
  }).sort((a: any, b: any) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  }) : [];
  
  // Loading states
  const isLoading = loadingEditions || loadingTasks;

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
              <p className="text-sm font-medium text-muted-foreground">Total Editions</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{editions?.length || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-blue-100 rounded-full p-3 mr-4">
              <ListTodo className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{taskStats?.total || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-green-100 rounded-full p-3 mr-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">{taskStats?.completed || 0}</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex items-center">
            <div className="bg-amber-100 rounded-full p-3 mr-4">
              <Calendar className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Current Week</p>
              {isLoading ? (
                <Skeleton className="h-7 w-16 mt-1" />
              ) : (
                <p className="text-2xl font-bold">Week {currentEdition?.currentWeek || 5}</p>
              )}
            </div>
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
                        {edition.trainingType} · Started: {formatDate(edition.startDate)}
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
              {!isLoading && overdueTasks.length > 0 && (
                <Badge variant="destructive">{overdueTasks.length}</Badge>
              )}
            </div>
            <CardDescription>Tasks that are past their due date</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : overdueTasks.length > 0 ? (
              <div className="space-y-4">
                {overdueTasks.slice(0, 5).map((task: any) => (
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
                            Due: {formatDate(task.dueDate)}
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
              {!isLoading && upcomingTasks.length > 0 && (
                <Badge variant="secondary">{upcomingTasks.length}</Badge>
              )}
            </div>
            <CardDescription>Tasks due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : upcomingTasks.length > 0 ? (
              <div className="space-y-4">
                {upcomingTasks.slice(0, 5).map((task: any) => (
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
                            Due: {formatDate(task.dueDate)}
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
