import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Menu, X, ArrowLeft, LogOut } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/hooks/use-auth";
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

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, navigate] = useLocation();
  const [currentEditionId, setCurrentEditionId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const isMobile = useIsMobile();
  const { user, logoutMutation } = useAuth();

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

  // Fetch editions for the sidebar
  const { data: editions = [], isLoading } = useQuery<any[]>({
    queryKey: ["/api/editions"],
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

  return (
    <div className="font-sans bg-[#f8f9fa] text-[#333333] min-h-screen flex flex-col">
      {/* Top Header Banner */}
      <div className="cmf-header">
        <div className="cmf-container flex justify-between items-center">
          <div className="text-sm">Training Management System</div>
          <div className="text-sm">
            {new Date().toLocaleDateString('en-US', {
              year: 'numeric', 
              month: 'short', 
              day: 'numeric'
            })}
          </div>
        </div>
      </div>
      
      {/* Main Navigation Header */}
      <header className="cmf-navbar px-4 md:px-6 py-3 flex justify-between items-center fixed top-[28px] w-full z-20">
        <div className="flex items-center">
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
          
          <h1 className="text-lg md:text-xl font-semibold text-[#0056b3] mr-6 truncate">
            {isMobile && location.startsWith('/tasks/') 
              ? 'Task Details' 
              : isMobile && location === '/tasks'
                ? 'Tasks'
                : isMobile && location === '/editions'
                  ? 'Editions'
                  : 'Training Management System'}
          </h1>
          
          <div className="hidden md:flex space-x-1">
            <Link to="/">
              <Button
                variant={location === "/" ? "default" : "ghost"}
                className={location === "/" ? "bg-[#0056b3] text-white hover:bg-[#004494]" : "hover:bg-[#e9ecef] text-[#0056b3]"}
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant={location.startsWith("/tasks") ? "default" : "ghost"}
                className={location.startsWith("/tasks") ? "bg-[#0056b3] text-white hover:bg-[#004494]" : "hover:bg-[#e9ecef] text-[#0056b3]"}
                size="sm"
              >
                Tasks
              </Button>
            </Link>
            <Link to="/editions">
              <Button
                variant={location === "/editions" ? "default" : "ghost"}
                className={location === "/editions" ? "bg-[#0056b3] text-white hover:bg-[#004494]" : "hover:bg-[#e9ecef] text-[#0056b3]"}
                size="sm"
              >
                Editions
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center">
          <div className="relative mr-2 hidden md:block">
            <Input 
              type="text" 
              placeholder="Search..." 
              className="w-40 h-9 pl-8 border-[#dee2e6] focus:border-[#0056b3] focus:ring-[#0056b3] focus:ring-opacity-25"
            />
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-[#6c757d]" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-[#6c757d] hover:text-[#0056b3] hover:bg-[#e9ecef]">
            <Bell className="h-5 w-5" />
          </Button>
          
          {/* User Avatar - new component */}
          <div className="ml-2">
            <UserAvatar />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobile && mobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-10 pt-20 pb-4 px-4 overflow-y-auto">
          <nav className="mt-4">
            <div className="flex flex-col space-y-2">
              <Link to="/">
                <div className={`flex items-center px-4 py-3 text-base ${location === "/" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <LayoutDashboard className="w-5 h-5 mr-3" />
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link to="/tasks">
                <div className={`flex items-center px-4 py-3 text-base ${location.startsWith("/tasks") ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <ListTodo className="w-5 h-5 mr-3" />
                  <span>Tasks</span>
                </div>
              </Link>
              <Link to="/editions">
                <div className={`flex items-center px-4 py-3 text-base ${location === "/editions" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <GraduationCap className="w-5 h-5 mr-3" />
                  <span>Editions</span>
                </div>
              </Link>
              <Link to="/trainers">
                <div className={`flex items-center px-4 py-3 text-base ${location === "/trainers" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <Users className="w-5 h-5 mr-3" />
                  <span>Trainers</span>
                </div>
              </Link>
              <Link to="/reports">
                <div className={`flex items-center px-4 py-3 text-base ${location === "/reports" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <BarChart className="w-5 h-5 mr-3" />
                  <span>Reports</span>
                </div>
              </Link>
              <Link to="/settings">
                <div className={`flex items-center px-4 py-3 text-base ${location === "/settings" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </div>
              </Link>
              {user && user.role === "admin" && (
                <Link to="/users">
                  <div className={`flex items-center px-4 py-3 text-base ${location === "/users" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                    <Users className="w-5 h-5 mr-3" />
                    <span>Users</span>
                  </div>
                </Link>
              )}
            </div>
          </nav>
          
          <div className="mt-8">
            <h3 className="px-4 text-base font-medium text-[#6c757d]">Current Editions</h3>
            <div className="mt-2 space-y-1">
              {isLoading ? (
                <>
                  <Skeleton className="h-12 w-full mb-2" />
                  <Skeleton className="h-12 w-full mb-2" />
                </>
              ) : editions && editions.length > 0 ? (
                editions.map((edition: any) => (
                  <Link key={edition.id} to={`/tasks/${edition.id}`}>
                    <div className={`flex items-center px-4 py-3 text-base ${edition.id === currentEditionId ? 'cmf-sidebar-nav-item-active' : 'cmf-sidebar-nav-item'}`}>
                      <BookOpen className="w-5 h-5 mr-3" />
                      {edition.code}
                    </div>
                  </Link>
                ))
              ) : (
                <div className="px-4 py-3 text-[#6c757d]">No editions available</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 pt-16 mt-[28px]">
        {/* Desktop Sidebar */}
        <aside className="w-48 hidden md:block cmf-sidebar fixed h-full pt-4">
          <div className="px-4 py-2 text-sm font-medium text-[#6c757d] uppercase">Navigation</div>
          <nav>
            <div>
              <Link to="/">
                <div className={`flex items-center text-sm ${location === "/" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </div>
            <div>
              <Link to="/tasks">
                <div className={`flex items-center text-sm ${location.startsWith("/tasks") ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <ListTodo className="w-5 h-5 mr-2" />
                  <span>Tasks</span>
                </div>
              </Link>
            </div>
            <div>
              <Link to="/editions">
                <div className={`flex items-center text-sm ${location === "/editions" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  <span>Editions</span>
                </div>
              </Link>
            </div>
            <Link to="/trainers">
              <div className={`flex items-center text-sm ${location === "/trainers" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                <Users className="w-5 h-5 mr-2" />
                <span>Trainers</span>
              </div>
            </Link>
            <Link to="/reports">
              <div className={`flex items-center text-sm ${location === "/reports" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                <BarChart className="w-5 h-5 mr-2" />
                <span>Reports</span>
              </div>
            </Link>
            <Link to="/settings">
              <div className={`flex items-center text-sm ${location === "/settings" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                <Settings className="w-5 h-5 mr-2" />
                <span>Settings</span>
              </div>
            </Link>
            {user && user.role === "admin" && (
              <Link to="/users">
                <div className={`flex items-center text-sm ${location === "/users" ? "cmf-sidebar-nav-item-active" : "cmf-sidebar-nav-item"}`}>
                  <Users className="w-5 h-5 mr-2" />
                  <span>Users</span>
                </div>
              </Link>
            )}
          </nav>
          
          <div className="px-4 py-2 mt-6 text-sm font-medium text-[#6c757d] uppercase">Current Editions</div>
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
                    <div className={`text-sm mb-2 px-2 py-1 flex items-center ${edition.id === currentEditionId ? 'text-[#0056b3] font-medium' : 'text-[#495057] hover:text-[#0056b3]'}`}>
                      <BookOpen className="w-4 h-4 mr-1" />
                      {edition.code}
                    </div>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-sm text-[#6c757d]">No editions available</div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 md:ml-48 p-4 md:p-6">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      {isMobile && !mobileMenuOpen && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#dee2e6] flex justify-around items-center py-2 px-4 z-10">
          <Link to="/" className={`flex flex-col items-center ${location === '/' ? 'text-[#0056b3]' : 'text-[#6c757d]'}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/tasks" className={`flex flex-col items-center ${location.startsWith('/tasks') ? 'text-[#0056b3]' : 'text-[#6c757d]'}`}>
            <ListTodo className="h-6 w-6" />
            <span className="text-xs mt-1">Tasks</span>
          </Link>
          <Link to="/editions" className={`flex flex-col items-center ${location === '/editions' ? 'text-[#0056b3]' : 'text-[#6c757d]'}`}>
            <GraduationCap className="h-6 w-6" />
            <span className="text-xs mt-1">Editions</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center ${location === '/settings' ? 'text-[#0056b3]' : 'text-[#6c757d]'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
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
