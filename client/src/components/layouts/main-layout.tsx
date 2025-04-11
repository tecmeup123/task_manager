import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Search, Bell, ChevronDown } from "lucide-react";
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

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  const [location] = useLocation();
  const [currentEditionId, setCurrentEditionId] = useState<number | null>(null);

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

  return (
    <div className="font-sans bg-neutral-100 text-neutral-700 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 px-6 py-3 flex justify-between items-center fixed top-0 w-full shadow-sm z-20">
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-primary mr-6">Training Management System</h1>
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
          <div className="relative mr-2">
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

      <div className="flex flex-1 pt-16">
        {/* Sidebar */}
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
            <a href="#" className="flex items-center px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              <Users className="w-5 h-5 mr-2" />
              <span>Trainers</span>
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              <BarChart className="w-5 h-5 mr-2" />
              <span>Reports</span>
            </a>
            <a href="#" className="flex items-center px-4 py-2 text-sm text-neutral-600 hover:bg-neutral-100">
              <Settings className="w-5 h-5 mr-2" />
              <span>Settings</span>
            </a>
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
        <main className="flex-1 md:ml-48 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
