import { useState, useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Menu, X, ArrowLeft, LogOut } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageSwitcher } from "@/components/language-switcher";
import TaskLink from "@/components/task-link";
import { 
  LayoutDashboard, 
  ListTodo,
  GraduationCap,
  Users,
  BarChart, 
  Settings,
  BookOpen,
  KeyRound
} from "lucide-react";
import { format, addDays, isAfter, isBefore, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
import { useNotifications } from "@/hooks/use-notifications";
import { UserAvatar } from "@/components/user-avatar";
import ChangePasswordForm from "@/components/change-password-form";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type MainLayoutProps = {
  children: React.ReactNode;
};

// Helper function to format dates
const formatDate = (dateString: string, formatStr: string) => {
  try {
    if (!dateString) return '';
    return format(parseISO(dateString), formatStr);
  } catch (error) {
    return 'Invalid date';
  }
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, navigate] = useLocation();
  const [currentEditionId, setCurrentEditionId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  // State for dropdown menu
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, logoutMutation } = useAuth();
  const { t } = useTranslation();
  const { 
    notifications, 
    unreadCount, 
    isLoading: isNotificationsLoading, 
    markAsRead, 
    markAllAsRead,
    isMarkingAsRead,
    isMarkingAllAsRead,
    createTestNotification,
    refetch
  } = useNotifications();

  // Fetch all tasks for all editions to get upcoming tasks
  const { data: allTasks = [], isLoading: isTasksLoading } = useQuery<any[]>({
    queryKey: ["/api/tasks"],
    enabled: !!user,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });

  // Determine if we need to show a back button
  const showBackButton = location !== "/" && !mobileMenuOpen;
  
  // Determine the back destination
  const getBackDestination = () => {
    if (location.startsWith('/tasks/')) {
      return '/tasks'; // From task detail to task list
    } else if (location === '/tasks') {
      return '/'; // From task list to home
    } else if (location === '/editions') {
      return '/'; // From editions to home
    }
    return '/';
  };

  // Fetch editions for the sidebar (excluding archived)
  const { data: editions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editions", { includeArchived: false }],
    queryFn: async () => {
      const response = await fetch(`/api/editions?includeArchived=false`);
      if (!response.ok) {
        throw new Error('Failed to fetch editions');
      }
      return response.json();
    },
    staleTime: 60000, // Consider data fresh for 1 minute
    refetchOnWindowFocus: false, // Don't refetch when window gets focus
  });

  // Set the first edition as current if available
  useEffect(() => {
    if (editions && editions.length > 0 && !currentEditionId) {
      setCurrentEditionId(editions[0].id);
    }
  }, [editions, currentEditionId]);

  // Close mobile menu when location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);
  
  // Check if user needs to change password
  useEffect(() => {
    if (user && (user.forcePasswordChange || user.passwordChangeRequired)) {
      setIsChangePasswordOpen(true);
    } else {
      setIsChangePasswordOpen(false);
    }
  }, [user]);
  
  // Calculate upcoming tasks for notifications
  const upcomingTasks = useMemo(() => {
    if (!allTasks || !Array.isArray(allTasks) || !user) return [];
    
    const today = new Date();
    const nextWeek = addDays(today, 7);
    
    // Due date tasks (coming up in the next week)
    const dueDateTasks = allTasks
      .filter(task => {
        if (!task.dueDate) return false;
        
        const dueDate = parseISO(task.dueDate);
        return isAfter(dueDate, today) && isBefore(dueDate, nextWeek) && task.status !== 'completed';
      });
      
    // Tasks assigned to current user
    const assignedTasks = allTasks
      .filter(task => {
        return task.assignedUserId === user.id && task.status !== 'completed';
      });
    
    // Combine and sort tasks, removing duplicates
    const combinedTasks = [...dueDateTasks];
    
    // Add assigned tasks that aren't already in the due date list
    assignedTasks.forEach(task => {
      if (!combinedTasks.some(t => t.id === task.id)) {
        combinedTasks.push(task);
      }
    });
    
    return combinedTasks.sort((a, b) => {
      return new Date(a.dueDate || '2099-01-01').getTime() - new Date(b.dueDate || '2099-01-01').getTime();
    });
  }, [allTasks, user]);

  return (
    <div className="font-sans bg-neutral-100 text-neutral-700 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex justify-between items-center fixed top-0 w-full shadow-sm z-20">
        <div className="flex items-center flex-shrink-0">
          {isMobile && showBackButton ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => navigate(getBackDestination())}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          ) : isMobile ? (
            <Button 
              variant="ghost" 
              size="icon" 
              className="mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          ) : null}
          
          <h1 className="text-lg md:text-xl font-semibold text-primary mr-6 truncate max-w-[150px] md:max-w-none">
            {isMobile && location.startsWith('/tasks/') 
              ? t('tasks.details') 
              : isMobile && location === '/tasks'
                ? t('tasks.title')
                : isMobile && location === '/editions'
                  ? t('editions.title')
                  : t('app.title')}
          </h1>
          
          <div className="hidden md:flex space-x-1">
            <Link to="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                className={location === "/" ? "bg-primary text-white" : "hover:bg-neutral-100"}
                size="sm"
              >
                {t('menu_dashboard')}
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant={location.startsWith("/tasks") ? "default" : "ghost"}
                className={location.startsWith("/tasks") ? "bg-primary text-white" : "hover:bg-neutral-100"}
                size="sm"
              >
                {t('menu_tasks')}
              </Button>
            </Link>
            <Link to="/editions">
              <Button
                variant={location === "/editions" ? "default" : "ghost"}
                className={location === "/editions" ? "bg-primary text-white" : "hover:bg-neutral-100"}
                size="sm"
              >
                {t('menu_editions')}
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center flex-shrink-0">
          <div className="relative mr-2 hidden md:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-40 h-9 pl-8"
            />
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-neutral-500" />
          </div>
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell className="h-5 w-5 text-neutral-500" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="flex items-center justify-between px-4 py-2 border-b">
                <h4 className="font-medium">{t('notifications.title')}</h4>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => markAllAsRead()}
                  disabled={isMarkingAllAsRead || notifications.length === 0 || !notifications.some(n => !n.isRead)}
                >
                  {t('notifications.markAllAsRead')}
                </Button>
              </div>
              <div className="max-h-[400px] overflow-y-auto py-2">
                {isNotificationsLoading ? (
                  <div className="p-4 text-center text-sm text-neutral-500">
                    {t('notifications.loading')}
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <DropdownMenuItem 
                      key={notification.id} 
                      className={`p-3 focus:bg-neutral-100 cursor-default ${!notification.isRead ? 'bg-primary-50' : ''}`}
                    >
                      <div className="flex flex-col space-y-1 w-full">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm flex items-center">
                            {notification.type === 'task_assigned' && (
                              <Badge variant="success" className="mr-1 py-0 px-1 text-[10px]">{t('notifications.assigned')}</Badge>
                            )}
                            {notification.type === 'task_updated' && (
                              <Badge variant="outline" className="mr-1 py-0 px-1 text-[10px]">{t('notifications.updated')}</Badge>
                            )}
                            {notification.type === 'due_date' && (
                              <Badge variant="destructive" className="mr-1 py-0 px-1 text-[10px]">{t('notifications.dueSoon')}</Badge>
                            )}
                            <span className="text-neutral-600">{notification.title}</span>
                          </span>
                          <span className="text-xs text-neutral-500">
                            {formatDate(notification.createdAt, "MMM d")}
                          </span>
                        </div>
                        <p className="text-sm mb-1">
                          {notification.message && notification.message.startsWith('notifications.') 
                            ? t(notification.message) 
                            : notification.message}
                        </p>
                        <div className="flex justify-between">
                          {!notification.isRead && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={() => markAsRead(notification.id)}
                            >
                              {t('notifications.markAsRead')}
                            </Button>
                          )}
                          {notification.entityType === 'task' && notification.entityId && (
                            <TaskLink
                              taskId={notification.entityId}
                              editionId={notification.metadata?.editionId || 0}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={async () => {
                                // Mark notification as read when clicked
                                if (!notification.isRead) {
                                  await markAsRead(notification.id);
                                }
                                
                                // Close the notifications dropdown
                                setIsDropdownOpen(false);
                              }}
                            >
                              {t('notifications.goToTask')}
                            </TaskLink>
                          )}
                          {notification.entityType === 'edition' && notification.entityId && (
                            <Link to={`/editions?id=${notification.entityId}`}>
                              <Button size="sm" variant="outline" className="h-7 text-xs">
                                {t('notifications.viewEdition')}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <p className="text-sm text-neutral-500">{t('notifications.empty')}</p>
                    {user?.role === 'admin' && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs"
                        onClick={() => createTestNotification()}
                      >
                        {t('notifications.createTest')}
                      </Button>
                    )}
                  </div>
                )}
              </div>
              <div className="p-2 border-t text-center">
                <Button variant="ghost" size="sm" className="w-full text-xs">{t('notifications.viewAll')}</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* User Avatar - new component */}
          <div className="ml-2 flex items-center">
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-10 pt-16 pb-4 px-4 overflow-y-auto">
          <nav className="mt-4">
            <div className="flex flex-col space-y-2">
              <Link to="/">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <span>{t('menu_dashboard')}</span>
                </div>
              </Link>
              <Link to="/tasks">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location.startsWith("/tasks") ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <ListTodo className="w-5 h-5 mr-3" />
                  <span>{t('menu_tasks')}</span>
                </div>
              </Link>
              <Link to="/editions">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/editions" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <GraduationCap className="w-5 h-5 mr-3" />
                  <span>{t('menu_editions')}</span>
                </div>
              </Link>
              {/* Trainers and reports links removed to simplify navigation */}
              <Link to="/settings">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/settings" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <Settings className="w-5 h-5 mr-3" />
                  <span>{t('menu_settings')}</span>
                </div>
              </Link>
              {user && user.role === "admin" && (
                <Link to="/users">
                  <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/users" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                    <Users className="w-5 h-5 mr-3" />
                    <span>{t('menu_users')}</span>
                  </div>
                </Link>
              )}
            </div>
          </nav>
          
          <div className="mt-8">
            <h3 className="px-4 text-base font-medium text-neutral-500">{t('menu_current_editions')}</h3>
            <div className="mt-2 space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-full mb-2" />
                  <Skeleton className="h-12 w-full mb-2" />
                </>
              ) : editions && editions.length > 0 ? (
                editions.map((edition: any) => (
                  <Link key={edition.id} to={`/tasks/${edition.id}`}>
                    <div className={`flex items-center px-4 py-3 text-base rounded-md ${edition.id === currentEditionId ? 'bg-primary-light bg-opacity-10 text-primary' : 'text-neutral-600 hover:bg-neutral-100'}`}>
                      <BookOpen className="w-5 h-5 mr-3" />
                      {edition.code}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-neutral-500">{t('editions.none_found')}</div>
              )}
            </div>
          </div>
          
          {/* Footer with heart symbol for mobile menu */}
          <div className="mt-auto pt-8 pb-4 text-xs text-center text-neutral-500">
            {t('app.footer')}
          </div>
          
          {/* Language selection removed from mobile menu as requested */}
        </div>
      )}

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <aside className="w-48 hidden md:block bg-white border-r border-neutral-200 fixed h-full pt-4">
          <div className="px-4 py-2 text-sm font-medium text-neutral-500 uppercase">{t('menu_navigation')}</div>
          <nav>
            <div>
              <Link to="/">
                <div className={`flex items-center px-4 py-2 text-sm ${location === "/" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  <span>{t('menu_dashboard')}</span>
                </div>
              </Link>
            </div>
            <div>
              <Link to="/tasks">
                <div className={`flex items-center px-4 py-2 text-sm ${location.startsWith("/tasks") ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <ListTodo className="w-5 h-5 mr-2" />
                  <span>{t('menu_tasks')}</span>
                </div>
              </Link>
            </div>
            <div>
              <Link to="/editions">
                <div className={`flex items-center px-4 py-2 text-sm ${location === "/editions" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  <span>{t('menu_editions')}</span>
                </div>
              </Link>
            </div>
            <Link to="/settings">
              <div className={`flex items-center px-4 py-2 text-sm ${location === "/settings" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <Settings className="w-5 h-5 mr-2" />
                <span>{t('menu_settings')}</span>
              </div>
            </Link>
          </nav>
          
          <div className="px-4 py-2 mt-6 text-sm font-medium text-neutral-500 uppercase">{t('menu_current_editions')}</div>
          <div className="px-4 py-2">
            {isLoading ? (
              <>
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full mb-2" />
                <Skeleton className="h-8 w-full" />
              </>
            ) : editions && editions.length > 0 ? (
              editions.map((edition: any) => (
                <div key={edition.id}>
                  <Link to={`/tasks/${edition.id}`}>
                    <div className={`text-sm mb-2 px-2 py-1 rounded flex items-center ${edition.id === currentEditionId ? 'bg-primary-light bg-opacity-10 text-primary' : 'hover:bg-neutral-100 text-neutral-600'}`}>
                      <BookOpen className="w-4 h-4 mr-1" />
                      {edition.code}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-sm text-neutral-500">{t('editions.none_found')}</div>
            )}
          </div>

          {/* Footer with heart symbol */}
          <div className="mt-auto px-4 py-3 text-xs text-center text-neutral-500 border-t">
            {t('app.footer')}
          </div>

          {/* Language switcher removed from sidebar as requested */}
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-48 p-4 pb-20 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && !mobileMenuOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center py-2 px-4 z-10">
          <Link to="/" className={`flex flex-col items-center ${location === '/' ? 'text-primary' : 'text-neutral-500'}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs mt-1">{t('menu_home')}</span>
          </Link>
          <Link to="/tasks" className={`flex flex-col items-center ${location.startsWith('/tasks') ? 'text-primary' : 'text-neutral-500'}`}>
            <ListTodo className="h-6 w-6" />
            <span className="text-xs mt-1">{t('menu_tasks')}</span>
          </Link>
          <Link to="/editions" className={`flex flex-col items-center ${location === '/editions' ? 'text-primary' : 'text-neutral-500'}`}>
            <GraduationCap className="h-6 w-6" />
            <span className="text-xs mt-1">{t('menu_editions')}</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center ${location === '/settings' ? 'text-primary' : 'text-neutral-500'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">{t('menu_settings')}</span>
          </Link>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordForm 
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </div>
  );
}
