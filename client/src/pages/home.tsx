import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { getStatusColor, getTasksByWeek, formatDate } from "@/lib/utils";
import { ListTodo, Calendar, Users, Layers, CheckCircle } from "lucide-react";

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
    inProgress: tasks.filter((task: any) => task.status === 'In Progress').length,
    pending: tasks.filter((task: any) => task.status === 'Pending').length,
    notStarted: tasks.filter((task: any) => task.status === 'Not Started').length,
  } : null;

  // Chart data
  const statusChartData = [
    { name: 'Done', value: taskStats?.completed || 0, color: '#4CAF50' },
    { name: 'In Progress', value: taskStats?.inProgress || 0, color: '#FF9800' },
    { name: 'Pending', value: taskStats?.pending || 0, color: '#FFC107' },
    { name: 'Not Started', value: taskStats?.notStarted || 0, color: '#9E9E9E' },
  ];

  const weeklyTasksData = tasks ? Object.entries(getTasksByWeek(tasks)).map(([week, weekTasks]) => {
    return {
      week,
      total: weekTasks.length,
      completed: weekTasks.filter((task: any) => task.status === 'Done').length,
    };
  }).sort((a, b) => {
    const aNum = parseInt(a.week.replace(/\D/g, '')) * (a.week.includes('-') ? -1 : 1);
    const bNum = parseInt(b.week.replace(/\D/g, '')) * (b.week.includes('-') ? -1 : 1);
    return aNum - bNum;
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

        {/* Task Status Chart */}
        <Card className="md:col-span-2 h-full">
          <CardHeader>
            <CardTitle>Tasks Overview</CardTitle>
            <CardDescription>
              {currentEdition ? `Current edition: ${currentEdition.code}` : 'No active edition'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : taskStats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium mb-2">Task Completion</h4>
                  <div className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Progress</span>
                      <span className="text-sm font-medium">{Math.round((taskStats.completed / taskStats.total) * 100)}%</span>
                    </div>
                    <Progress value={(taskStats.completed / taskStats.total) * 100} className="h-2" />
                  </div>
                  <div className="mt-4">
                    {statusChartData.map(status => (
                      <div key={status.name} className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }}></div>
                          <span className="text-sm">{status.name}</span>
                        </div>
                        <div className="text-sm font-medium">{status.value}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Status Distribution</h4>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statusChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {statusChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>No task data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Weekly Tasks Chart */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Weekly Tasks Progress</CardTitle>
          <CardDescription>Task completion by week</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : weeklyTasksData.length > 0 ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={weeklyTasksData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="total" name="Total Tasks" fill="#8884d8" />
                  <Bar dataKey="completed" name="Completed Tasks" fill="#4CAF50" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <p>No task data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
