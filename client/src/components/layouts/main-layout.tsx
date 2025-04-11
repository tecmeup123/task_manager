import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, Menu, X, ArrowLeft } from "lucide-react";
import { 
  LayoutDashboard, 
  ListTodo,
  GraduationCap,
  Users,
  BarChart, 
  Settings,
  BookOpen
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [location, navigate] = useLocation();
  const [currentEditionId, setCurrentEditionId] = useState<number | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  return (
    <div className="font-sans bg-neutral-100 text-neutral-700 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-4 md:px-6 py-3 flex justify-between items-center fixed top-0 w-full shadow-sm z-20">
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
          
          <h1 className="text-lg md:text-xl font-semibold text-primary mr-6 truncate">
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
                className={location === "/" ? "bg-primary text-white" : "hover:bg-neutral-100"}
                size="sm"
              >
                Dashboard
              </Button>
            </Link>
            <Link to="/tasks">
              <Button
                variant={location.startsWith("/tasks") ? "default" : "ghost"}
                className={location.startsWith("/tasks") ? "bg-primary text-white" : "hover:bg-neutral-100"}
                size="sm"
              >
                Tasks
              </Button>
            </Link>
            <Link to="/editions">
              <Button
                variant={location === "/editions" ? "default" : "ghost"}
                className={location === "/editions" ? "bg-primary text-white" : "hover:bg-neutral-100"}
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
              className="w-40 h-9 pl-8"
            />
            <Search className="absolute left-2 top-2.5 w-4 h-4 text-neutral-500" />
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5 text-neutral-500" />
          </Button>
          <div className="w-8 h-8 rounded-full bg-primary ml-2 flex items-center justify-center text-white text-sm">
            AM
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
                  <span>Dashboard</span>
                </div>
              </Link>
              <Link to="/tasks">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location.startsWith("/tasks") ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <ListTodo className="w-5 h-5 mr-3" />
                  <span>Tasks</span>
                </div>
              </Link>
              <Link to="/editions">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/editions" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <GraduationCap className="w-5 h-5 mr-3" />
                  <span>Editions</span>
                </div>
              </Link>
              <Link to="/trainers">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/trainers" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <Users className="w-5 h-5 mr-3" />
                  <span>Trainers</span>
                </div>
              </Link>
              <Link to="/reports">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/reports" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <BarChart className="w-5 h-5 mr-3" />
                  <span>Reports</span>
                </div>
              </Link>
              <Link to="/settings">
                <div className={`flex items-center px-4 py-3 text-base rounded-md ${location === "/settings" ? "bg-primary text-white" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <Settings className="w-5 h-5 mr-3" />
                  <span>Settings</span>
                </div>
              </Link>
            </div>
          </nav>
          
          <div className="mt-8">
            <h3 className="px-4 text-base font-medium text-neutral-500">Current Editions</h3>
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
                <div className="px-4 py-3 text-neutral-500">No editions available</div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 pt-16">
        {/* Desktop Sidebar */}
        <aside className="w-48 hidden md:block bg-white border-r border-neutral-200 fixed h-full pt-4">
          <div className="px-4 py-2 text-sm font-medium text-neutral-500 uppercase">Navigation</div>
          <nav>
            <div>
              <Link to="/">
                <div className={`flex items-center px-4 py-2 text-sm ${location === "/" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  <span>Dashboard</span>
                </div>
              </Link>
            </div>
            <div>
              <Link to="/tasks">
                <div className={`flex items-center px-4 py-2 text-sm ${location.startsWith("/tasks") ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <ListTodo className="w-5 h-5 mr-2" />
                  <span>Tasks</span>
                </div>
              </Link>
            </div>
            <div>
              <Link to="/editions">
                <div className={`flex items-center px-4 py-2 text-sm ${location === "/editions" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                  <GraduationCap className="w-5 h-5 mr-2" />
                  <span>Editions</span>
                </div>
              </Link>
            </div>
            <Link to="/trainers">
              <div className={`flex items-center px-4 py-2 text-sm ${location === "/trainers" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <Users className="w-5 h-5 mr-2" />
                <span>Trainers</span>
              </div>
            </Link>
            <Link to="/reports">
              <div className={`flex items-center px-4 py-2 text-sm ${location === "/reports" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <BarChart className="w-5 h-5 mr-2" />
                <span>Reports</span>
              </div>
            </Link>
            <Link to="/settings">
              <div className={`flex items-center px-4 py-2 text-sm ${location === "/settings" ? "bg-primary-light bg-opacity-10 text-primary font-medium" : "text-neutral-600 hover:bg-neutral-100"}`}>
                <Settings className="w-5 h-5 mr-2" />
                <span>Settings</span>
              </div>
            </Link>
          </nav>
          
          <div className="px-4 py-2 mt-6 text-sm font-medium text-neutral-500 uppercase">Current Editions</div>
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
              <div className="text-sm text-neutral-500">No editions available</div>
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 flex justify-around items-center py-2 px-4 z-10">
          <Link to="/" className={`flex flex-col items-center ${location === '/' ? 'text-primary' : 'text-neutral-500'}`}>
            <LayoutDashboard className="h-6 w-6" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          <Link to="/tasks" className={`flex flex-col items-center ${location.startsWith('/tasks') ? 'text-primary' : 'text-neutral-500'}`}>
            <ListTodo className="h-6 w-6" />
            <span className="text-xs mt-1">Tasks</span>
          </Link>
          <Link to="/editions" className={`flex flex-col items-center ${location === '/editions' ? 'text-primary' : 'text-neutral-500'}`}>
            <GraduationCap className="h-6 w-6" />
            <span className="text-xs mt-1">Editions</span>
          </Link>
          <Link to="/settings" className={`flex flex-col items-center ${location === '/settings' ? 'text-primary' : 'text-neutral-500'}`}>
            <Settings className="h-6 w-6" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      )}
    </div>
  );
}
