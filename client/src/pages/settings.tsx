import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Lock, Database, Calendar, Clock, Eye, Columns, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDashboardSettingsChanged, setIsDashboardSettingsChanged] = useState(false);
  const [isTaskSettingsChanged, setIsTaskSettingsChanged] = useState(false);
  
  // Dashboard settings
  const [collapseOverdueTasks, setCollapseOverdueTasks] = useState(true);
  const [collapseUpcomingTasks, setCollapseUpcomingTasks] = useState(true);
  const [upcomingDaysRange, setUpcomingDaysRange] = useState("7");
  const [maxTasksPerSection, setMaxTasksPerSection] = useState("5");
  
  // Task display settings
  const [taskSortOrder, setTaskSortOrder] = useState("due-date");
  const [taskGrouping, setTaskGrouping] = useState("week");
  const [defaultTaskView, setDefaultTaskView] = useState("list");
  
  const handleSaveDashboardSettings = () => {
    toast({
      title: "Dashboard settings saved",
      description: "Your dashboard customization preferences have been updated"
    });
    setIsDashboardSettingsChanged(false);
  };
  
  const handleSaveTaskSettings = () => {
    toast({
      title: "Task settings saved",
      description: "Your task display preferences have been updated"
    });
    setIsTaskSettingsChanged(false);
  };
  
  useEffect(() => {
    // In a real app, these would be loaded from a user preferences API
    // and the changes would be saved to that API
  }, []);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Settings</h2>
      </div>

      <Tabs defaultValue="dashboard" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Columns className="h-5 w-5 mr-2" />
                Dashboard Settings
              </CardTitle>
              <CardDescription>
                Customize how information is displayed on your dashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Task Display</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Collapse Overdue Tasks by Default</Label>
                    <p className="text-sm text-muted-foreground">Whether overdue tasks should be collapsed when you first load the dashboard</p>
                  </div>
                  <Switch 
                    checked={collapseOverdueTasks} 
                    onCheckedChange={(value) => {
                      setCollapseOverdueTasks(value);
                      setIsDashboardSettingsChanged(true);
                    }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Collapse Upcoming Tasks by Default</Label>
                    <p className="text-sm text-muted-foreground">Whether upcoming tasks should be collapsed when you first load the dashboard</p>
                  </div>
                  <Switch 
                    checked={collapseUpcomingTasks} 
                    onCheckedChange={(value) => {
                      setCollapseUpcomingTasks(value);
                      setIsDashboardSettingsChanged(true);
                    }}
                  />
                </div>
                
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="upcomingDays">Upcoming Tasks Range (Days)</Label>
                    <Select 
                      value={upcomingDaysRange} 
                      onValueChange={(value) => {
                        setUpcomingDaysRange(value);
                        setIsDashboardSettingsChanged(true);
                      }}
                    >
                      <SelectTrigger id="upcomingDays">
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="14">14 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxTasks">Maximum Tasks Displayed per Section</Label>
                    <Select 
                      value={maxTasksPerSection} 
                      onValueChange={(value) => {
                        setMaxTasksPerSection(value);
                        setIsDashboardSettingsChanged(true);
                      }}
                    >
                      <SelectTrigger id="maxTasks">
                        <SelectValue placeholder="Select max tasks" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">3 tasks</SelectItem>
                        <SelectItem value="5">5 tasks</SelectItem>
                        <SelectItem value="10">10 tasks</SelectItem>
                        <SelectItem value="all">Show all</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <Button 
                  onClick={handleSaveDashboardSettings} 
                  disabled={!isDashboardSettingsChanged}
                >
                  Save Dashboard Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Task Display Settings
              </CardTitle>
              <CardDescription>
                Customize how tasks are displayed and organized
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="taskSort">Default Task Sort Order</Label>
                    <Select 
                      value={taskSortOrder} 
                      onValueChange={(value) => {
                        setTaskSortOrder(value);
                        setIsTaskSettingsChanged(true);
                      }}
                    >
                      <SelectTrigger id="taskSort">
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="due-date">Due Date (soonest first)</SelectItem>
                        <SelectItem value="due-date-desc">Due Date (latest first)</SelectItem>
                        <SelectItem value="creation-date">Creation Date</SelectItem>
                        <SelectItem value="week-asc">Week (ascending)</SelectItem>
                        <SelectItem value="week-desc">Week (descending)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taskGroup">Task Grouping</Label>
                    <Select 
                      value={taskGrouping} 
                      onValueChange={(value) => {
                        setTaskGrouping(value);
                        setIsTaskSettingsChanged(true);
                      }}
                    >
                      <SelectTrigger id="taskGroup">
                        <SelectValue placeholder="Select grouping" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">By Week</SelectItem>
                        <SelectItem value="status">By Status</SelectItem>
                        <SelectItem value="training-type">By Training Type</SelectItem>
                        <SelectItem value="none">No Grouping</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="taskView">Default Task View</Label>
                    <Select 
                      value={defaultTaskView} 
                      onValueChange={(value) => {
                        setDefaultTaskView(value);
                        setIsTaskSettingsChanged(true);
                      }}
                    >
                      <SelectTrigger id="taskView">
                        <SelectValue placeholder="Select view" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="list">List View</SelectItem>
                        <SelectItem value="board">Board View</SelectItem>
                        <SelectItem value="calendar">Calendar View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <Button 
                  onClick={handleSaveTaskSettings} 
                  disabled={!isTaskSettingsChanged}
                >
                  Save Task Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2" />
                Account Information
              </CardTitle>
              <CardDescription>
                Manage your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="email@example.com" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Notification preferences management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Security settings management coming soon.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="h-5 w-5 mr-2" />
            Data Management
          </CardTitle>
          <CardDescription>
            Manage system data and backups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4">
            <Button variant="outline" className="justify-start" disabled>
              Create Database Backup
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              Import Data
            </Button>
            <Button variant="outline" className="justify-start" disabled>
              Export Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}