import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
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
  ChevronUp,
  Filter,
  Search,
  X
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const { t } = useTranslation();
  const { data: allEditions, isLoading: loadingEditions } = useQuery({
    queryKey: ["/api/editions"],
  });

  // Filter out archived editions for the dashboard
  const editions = allEditions && Array.isArray(allEditions) 
    ? allEditions.filter((edition: any) => !edition.archived) 
    : [];
  
  const currentEdition = editions?.[0];
  
  // Set up an array to hold all active edition IDs (exclude archived)
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
      const fetchPromises = editionIds.map((id: number) => 
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
  
  // Task filtering variables
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [weekFilter, setWeekFilter] = useState("all");
  const [editionFilter, setEditionFilter] = useState("all");
  const [ownerFilter, setOwnerFilter] = useState("all");
  
  // Get unique task weeks, statuses, and owners for filter dropdowns
  const getUniqueValues = (tasks: any[], field: string): string[] => {
    if (!tasks || !Array.isArray(tasks)) return [];
    
    // Use a regular array and object to track unique values instead of Set
    const unique: {[key: string]: boolean} = {};
    const result: string[] = [];
    
    tasks.forEach(task => {
      const value = task[field];
      if (value && !unique[value]) {
        unique[value] = true;
        result.push(value);
      }
    });
    
    return result.sort();
  };
  
  const uniqueWeeks = getUniqueValues(tasks, 'week');
  const uniqueStatuses = getUniqueValues(tasks, 'status');
  const uniqueOwners = getUniqueValues(tasks, 'owner');
  
  // Apply filters to tasks
  const filterTasks = (taskList: any[]) => {
    return taskList.filter((task: any) => {
      // Search query filter
      const matchesSearch = searchQuery === "" || 
        (task.name && task.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.owner && task.owner.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (task.status && task.status.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Status filter
      const matchesStatus = statusFilter === "all" || task.status === statusFilter;
      
      // Week filter
      const matchesWeek = weekFilter === "all" || task.week === weekFilter;
      
      // Edition filter
      const matchesEdition = editionFilter === "all" || 
        (editions && editions.find((e: any) => e.id === task.editionId && e.code === editionFilter));
      
      // Owner filter
      const matchesOwner = ownerFilter === "all" || task.owner === ownerFilter;
      
      return matchesSearch && matchesStatus && matchesWeek && matchesEdition && matchesOwner;
    });
  };
  
  // Apply filters to overdue and upcoming tasks
  const filteredOverdueTasks = isFiltersVisible && overdueTasks ? filterTasks(overdueTasks) : overdueTasks;
  const filteredUpcomingTasks = isFiltersVisible && upcomingTasks ? filterTasks(upcomingTasks) : upcomingTasks;

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">{t('dashboard.title')}</h2>

        <div className="flex gap-2">
          <Link to="/tasks">
            <Button variant="default">
              <ListTodo className="mr-2 h-4 w-4" />
              {t('tasks.title')}
            </Button>
          </Link>
          <Link to="/editions">
            <Button variant="outline">
              <Layers className="mr-2 h-4 w-4" />
              {t('editions.title')}
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
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.ongoingTrainingSessions')}</p>
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
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.tasksThisWeek')}</p>
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
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.completedThisWeek')}</p>
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
              <p className="text-sm font-medium text-muted-foreground">{t('dashboard.currentWeeks')}</p>
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
                  <p className="text-sm text-muted-foreground">{t('dashboard.noActiveEditions')}</p>
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
            <CardTitle>{t('dashboard.activeEditions')}</CardTitle>
            <CardDescription>{t('dashboard.currentlyRunningEditions')}</CardDescription>
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
                    <Link to={`/tasks?editionId=${edition.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>{t('dashboard.noEditionsAvailable')}</p>
                <Link to="/editions">
                  <Button variant="outline" className="mt-2">{t('dashboard.createEdition')}</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>


      </div>

      {/* Task Filtering UI */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-medium">{t('dashboard.taskManagement')}</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setIsFiltersVisible(!isFiltersVisible)}
            className="gap-2"
          >
            <Filter className="h-4 w-4" />
            {isFiltersVisible ? t('dashboard.hideFilters') : t('dashboard.showFilters')}
          </Button>
        </div>
        
        {isFiltersVisible && (
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">{t('dashboard.searchTasks')}</Label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder={t('dashboard.searchPlaceholder')}
                      className="pl-8"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setSearchQuery("")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status-filter">{t('tasks.status')}</Label>
                  <Select 
                    value={statusFilter} 
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder={t('dashboard.filterByStatus')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('dashboard.allStatuses')}</SelectItem>
                      {uniqueStatuses.map((status: string) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="week-filter">{t('tasks.week')}</Label>
                  <Select 
                    value={weekFilter} 
                    onValueChange={setWeekFilter}
                  >
                    <SelectTrigger id="week-filter">
                      <SelectValue placeholder={t('dashboard.filterByWeek')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('dashboard.allWeeks')}</SelectItem>
                      {uniqueWeeks.map((week: string) => (
                        <SelectItem key={week} value={week}>
                          {week}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edition-filter">{t('editions.title')}</Label>
                  <Select 
                    value={editionFilter} 
                    onValueChange={setEditionFilter}
                  >
                    <SelectTrigger id="edition-filter">
                      <SelectValue placeholder={t('dashboard.filterByEdition')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('dashboard.allEditions')}</SelectItem>
                      {editions && editions.map((edition: any) => (
                        <SelectItem key={edition.id} value={edition.code}>
                          {edition.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="owner-filter">{t('tasks.owner')}</Label>
                  <Select 
                    value={ownerFilter} 
                    onValueChange={setOwnerFilter}
                  >
                    <SelectTrigger id="owner-filter">
                      <SelectValue placeholder={t('dashboard.filterByOwner')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('dashboard.allOwners')}</SelectItem>
                      {uniqueOwners.map((owner: string) => (
                        <SelectItem key={owner} value={owner}>
                          {owner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setWeekFilter("all");
                      setEditionFilter("all");
                      setOwnerFilter("all");
                    }}
                  >
                    {t('dashboard.resetFilters')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Overdue and Upcoming Tasks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* Overdue Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-red-500" />
                {t('dashboard.overdueTasks')}
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isLoading && overdueTasks.length > 0 && (
                  <Badge variant="destructive">
                    {isFiltersVisible ? filteredOverdueTasks.length : overdueTasks.length}
                  </Badge>
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
            <CardDescription>{t('dashboard.tasksDueSoon')}</CardDescription>
          </CardHeader>
          <CardContent className={`transition-all duration-300 ease-in-out ${overdueCollapsed ? 'hidden' : ''}`}>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : filteredOverdueTasks && filteredOverdueTasks.length > 0 ? (
              <div className="space-y-4 max-h-[calc(40vh-50px)] overflow-y-auto pr-2">
                {filteredOverdueTasks.map((task: any) => (
                  <div key={task.id} className="flex justify-between items-start border-b pb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-2 rounded-md mt-1">
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      </div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Badge variant="outline">{task.week}</Badge>
                          <Badge className={getStatusColor(task.status).bg}>{task.status}</Badge>
                          <span className="text-xs text-red-500">
                            {t('tasks.due')}: {formatDate(task.dueDate)} ({getRelativeDateDescription(task.dueDate)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/tasks?editionId=${task.editionId}&taskId=${task.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}

                {filteredOverdueTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/tasks">
                      <Button variant="link" size="sm">
                        {t('dashboard.viewAll')} {filteredOverdueTasks.length} {t('dashboard.overdueTasks').toLowerCase()}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>{t('dashboard.noOverdueTasks')}</p>
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
                {t('dashboard.upcomingTasks')}
              </CardTitle>
              <div className="flex items-center gap-2">
                {!isLoading && upcomingTasks.length > 0 && (
                  <Badge variant="secondary">
                    {isFiltersVisible ? filteredUpcomingTasks.length : upcomingTasks.length}
                  </Badge>
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
            <CardDescription>{t('dashboard.tasksInNext7Days')}</CardDescription>
          </CardHeader>
          <CardContent className={`transition-all duration-300 ease-in-out ${upcomingCollapsed ? 'hidden' : ''}`}>
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full mb-2" />
                <Skeleton className="h-12 w-full" />
              </>
            ) : filteredUpcomingTasks && filteredUpcomingTasks.length > 0 ? (
              <div className="space-y-4 max-h-[calc(40vh-50px)] overflow-y-auto pr-2">
                {filteredUpcomingTasks.map((task: any) => (
                  <div key={task.id} className="flex justify-between items-start border-b pb-3">
                    <div className="flex items-start gap-3">
                      <div className="bg-amber-100 p-2 rounded-md mt-1">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">{task.name}</p>
                        <div className="flex flex-wrap items-center gap-1 mt-1">
                          <Badge variant="outline">{task.week}</Badge>
                          <Badge className={getStatusColor(task.status).bg}>{task.status}</Badge>
                          <span className="text-xs text-amber-600">
                            {t('tasks.due')}: {formatDate(task.dueDate)} ({getRelativeDateDescription(task.dueDate)})
                          </span>
                        </div>
                      </div>
                    </div>
                    <Link to={`/tasks?editionId=${task.editionId}&taskId=${task.id}`}>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}

                {filteredUpcomingTasks.length > 5 && (
                  <div className="text-center pt-2">
                    <Link to="/tasks">
                      <Button variant="link" size="sm">
                        {t('dashboard.viewAll')} {filteredUpcomingTasks.length} {t('dashboard.upcomingTasks').toLowerCase()}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <p>{t('dashboard.noUpcomingTasks')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add invisible spacing div at the bottom for mobile */}
      <div className="h-12 md:hidden" />
    </div>
  );
}
