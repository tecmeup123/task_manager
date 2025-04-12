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
  const [isAccountSettingsChanged, setIsAccountSettingsChanged] = useState(false);
  const [isSecuritySettingsChanged, setIsSecuritySettingsChanged] = useState(false);
  
  // Template management
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState("default");
  
  // Dashboard settings
  const [collapseOverdueTasks, setCollapseOverdueTasks] = useState(true);
  const [collapseUpcomingTasks, setCollapseUpcomingTasks] = useState(true);
  const [upcomingDaysRange, setUpcomingDaysRange] = useState("7");
  const [maxTasksPerSection, setMaxTasksPerSection] = useState("5");
  
  // Task display settings
  const [taskSortOrder, setTaskSortOrder] = useState("due-date");
  const [taskGrouping, setTaskGrouping] = useState("week");
  const [defaultTaskView, setDefaultTaskView] = useState("list");
  
  // Account settings
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("utc");
  const [useDarkTheme, setUseDarkTheme] = useState(false);
  
  // Notification settings
  const [playSound, setPlaySound] = useState(true);
  const [showPopup, setShowPopup] = useState(true);
  const [showBadge, setShowBadge] = useState(true);
  const [reminderTime, setReminderTime] = useState("3");
  const [isNotificationSettingsChanged, setIsNotificationSettingsChanged] = useState(false);
  
  // Security settings
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [sessionTimeout, setSessionTimeout] = useState("120");
  const [rememberMe, setRememberMe] = useState(true);
  
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
  
  const handleSaveAccountSettings = () => {
    toast({
      title: "Account settings saved",
      description: "Your account information has been updated"
    });
    setIsAccountSettingsChanged(false);
  };
  
  const handleChangePassword = () => {
    // Basic validation
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive"
      });
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully"
    });
    
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsSecuritySettingsChanged(false);
  };
  
  const handleSaveSecuritySettings = () => {
    toast({
      title: "Security settings saved",
      description: "Your security preferences have been updated"
    });
    setIsSecuritySettingsChanged(false);
  };
  
  const handleSaveNotificationSettings = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated"
    });
    setIsNotificationSettingsChanged(false);
  };
  
  // Data Management handler functions
  const handleCreateBackup = () => {
    toast({
      title: "Creating backup...",
      description: "Database backup has been initiated"
    });
    
    // Simulate a backup process
    setTimeout(() => {
      toast({
        title: "Backup completed",
        description: "Database backup has been successfully created"
      });
    }, 2000);
  };
  
  const handleImportData = () => {
    // In a real app, this would open a file picker dialog
    toast({
      title: "Import data",
      description: "Data import functionality is now available"
    });
  };
  
  const handleExportData = () => {
    toast({
      title: "Exporting data...",
      description: "Data export has been initiated"
    });
    
    // Simulate an export process
    setTimeout(() => {
      toast({
        title: "Export completed",
        description: "Data has been successfully exported"
      });
    }, 2000);
  };
  
  // Template management handler functions
  const handleDownloadTemplate = () => {
    toast({
      title: "Preparing template...",
      description: `Generating ${selectedTemplate} template`
    });

    // Create sample template data based on selected template type
    const templateData = generateTemplateData(selectedTemplate);
    
    // Convert template data to JSON string
    const jsonString = JSON.stringify(templateData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedTemplate}-template-tasks.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Template downloaded",
        description: "Task template has been successfully downloaded"
      });
    }, 500);
  };
  
  // Helper function to generate template data
  const generateTemplateData = (templateType: string) => {
    // Sample task templates based on type
    const templates = {
      default: [
        {
          taskCode: "WM5T01",
          week: "Week -5",
          name: "Check if the cohort for the edition exists and if not create it",
          duration: "0:10:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: "This is a required preparation task"
        },
        {
          taskCode: "WM5T02",
          week: "Week -5",
          name: "Create mailing list (names; groups information; schedule; edition)",
          duration: "0:30:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "WM5T03",
          week: "Week -5",
          name: "Copy course's path and update exam and assignments dates and configure cohorts",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: true,
          notes: "Must be completed before sending welcome emails"
        }
      ],
      glr: [
        {
          taskCode: "WM5T01",
          week: "Week -5",
          name: "Check if the cohort for the edition exists and if not create it",
          duration: "0:10:00",
          trainingType: "GLR",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: "This is a required preparation task"
        },
        {
          taskCode: "WM4T01",
          week: "Week -4",
          name: "Send welcome to e-learning email",
          duration: "0:15:00",
          trainingType: "GLR",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W01T01",
          week: "Week 1",
          name: "First week of training - Welcome session",
          duration: "1:00:00",
          trainingType: "GLR",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: true,
          notes: "Must include introduction to course materials"
        }
      ],
      slr: [
        {
          taskCode: "WM5T01",
          week: "Week -5",
          name: "Check if the cohort for the edition exists and if not create it",
          duration: "0:10:00",
          trainingType: "SLR",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: "This is a required preparation task"
        },
        {
          taskCode: "WM4T01",
          week: "Week -4",
          name: "Send self-learning materials",
          duration: "0:15:00",
          trainingType: "SLR",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: "Include login instructions"
        },
        {
          taskCode: "W01T01",
          week: "Week 1",
          name: "Provide access to self-paced modules",
          duration: "0:30:00",
          trainingType: "SLR",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: true,
          notes: "Verify all students have access"
        }
      ]
    };
    
    return templates[templateType as keyof typeof templates] || templates.default;
  };
  
  const handleUploadTemplate = () => {
    if (!templateFile) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Uploading template...",
      description: `Processing ${templateFile.name}`
    });
    
    // Read and parse the file
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        // Attempt to parse as JSON
        const fileContent = event.target?.result as string;
        const jsonData = JSON.parse(fileContent);
        
        // Validate the structure
        if (!Array.isArray(jsonData)) {
          throw new Error("Template must be an array of tasks");
        }
        
        // Check if tasks have required fields
        const hasRequiredFields = jsonData.every((task: any) => 
          task.taskCode && task.week && task.name && task.trainingType
        );
        
        if (!hasRequiredFields) {
          throw new Error("Some tasks are missing required fields");
        }
        
        // In a real app, would send this data to the backend to update templates
        console.log("Template data validated:", jsonData);
        
        toast({
          title: "Template uploaded",
          description: `${jsonData.length} template tasks have been successfully processed`
        });
        
        // Clear the file input
        setTemplateFile(null);
      } catch (error) {
        console.error("Template parsing error:", error);
        
        toast({
          title: "Upload error",
          description: `Could not process template file: ${error instanceof Error ? error.message : "Invalid format"}`,
          variant: "destructive"
        });
      }
    };
    
    reader.onerror = () => {
      toast({
        title: "Upload error",
        description: "Failed to read the file",
        variant: "destructive"
      });
    };
    
    reader.readAsText(templateFile);
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
                Manage your account details and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input 
                    id="username" 
                    value={user?.username || ''} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">Username cannot be changed</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="Your full name" 
                    value={fullName} 
                    onChange={(e) => {
                      setFullName(e.target.value);
                      setIsAccountSettingsChanged(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="email@example.com" 
                    value={email} 
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setIsAccountSettingsChanged(true);
                    }}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input 
                    id="role" 
                    value={user?.role || ''} 
                    disabled 
                  />
                  <p className="text-xs text-muted-foreground">Contact an administrator to change your role</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Account Preferences</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="language">Interface Language</Label>
                  <Select 
                    value={language} 
                    onValueChange={(value) => {
                      setLanguage(value);
                      setIsAccountSettingsChanged(true);
                    }}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Time Zone</Label>
                  <Select 
                    value={timezone} 
                    onValueChange={(value) => {
                      setTimezone(value);
                      setIsAccountSettingsChanged(true);
                    }}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Select time zone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="utc">UTC (Coordinated Universal Time)</SelectItem>
                      <SelectItem value="est">EST (Eastern Standard Time)</SelectItem>
                      <SelectItem value="cst">CST (Central Standard Time)</SelectItem>
                      <SelectItem value="mst">MST (Mountain Standard Time)</SelectItem>
                      <SelectItem value="pst">PST (Pacific Standard Time)</SelectItem>
                      <SelectItem value="gmt">GMT (Greenwich Mean Time)</SelectItem>
                      <SelectItem value="cet">CET (Central European Time)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="theme-switch" 
                    checked={useDarkTheme}
                    onCheckedChange={(value) => {
                      setUseDarkTheme(value);
                      setIsAccountSettingsChanged(true);
                    }}
                  />
                  <Label htmlFor="theme-switch">Use Dark Theme</Label>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <Button 
                  onClick={handleSaveAccountSettings}
                  disabled={!isAccountSettingsChanged}
                >
                  Save Account Settings
                </Button>
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
                Configure how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Bell Icon Notifications</h3>
                <p className="text-sm text-muted-foreground mb-4">All notifications will appear in the bell icon at the top right of the application</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Assignments</Label>
                      <p className="text-sm text-muted-foreground">Show notifications when you are assigned a task</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Task Updates</Label>
                      <p className="text-sm text-muted-foreground">Show notifications when tasks you own are updated</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Approaching Due Dates</Label>
                      <p className="text-sm text-muted-foreground">Show reminders for tasks with approaching due dates</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>New Edition Created</Label>
                      <p className="text-sm text-muted-foreground">Show notifications when a new training edition is created</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Weekly Summary</Label>
                      <p className="text-sm text-muted-foreground">Show a weekly summary of your tasks and upcoming deadlines</p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Notification Appearance</h3>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="sound-switch" 
                    checked={playSound}
                    onCheckedChange={(value) => {
                      setPlaySound(value);
                      setIsNotificationSettingsChanged(true);
                    }} 
                  />
                  <Label htmlFor="sound-switch">Play sound when new notifications arrive</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="popup-switch" 
                    checked={showPopup}
                    onCheckedChange={(value) => {
                      setShowPopup(value);
                      setIsNotificationSettingsChanged(true);
                    }}
                  />
                  <Label htmlFor="popup-switch">Show popup notifications</Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="badge-switch" 
                    checked={showBadge}
                    onCheckedChange={(value) => {
                      setShowBadge(value);
                      setIsNotificationSettingsChanged(true);
                    }}
                  />
                  <Label htmlFor="badge-switch">Show notification count badge on bell icon</Label>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Notification Frequency</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="dueDateReminder">Due Date Reminder</Label>
                  <Select 
                    value={reminderTime}
                    onValueChange={(value) => {
                      setReminderTime(value);
                      setIsNotificationSettingsChanged(true);
                    }}
                  >
                    <SelectTrigger id="dueDateReminder">
                      <SelectValue placeholder="Select reminder time" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day before</SelectItem>
                      <SelectItem value="2">2 days before</SelectItem>
                      <SelectItem value="3">3 days before</SelectItem>
                      <SelectItem value="5">5 days before</SelectItem>
                      <SelectItem value="7">1 week before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 border-t flex justify-end">
                <Button onClick={handleSaveNotificationSettings}>
                  Save Notification Settings
                </Button>
              </div>
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
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Password Management</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setIsSecuritySettingsChanged(true);
                      }}
                    />
                  </div>
                  
                  <div className="hidden md:block" />
                  
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setIsSecuritySettingsChanged(true);
                      }}
                    />
                    <p className="text-xs text-muted-foreground">Password must be at least 8 characters and include letters, numbers, and special characters</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setIsSecuritySettingsChanged(true);
                      }}
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end">
                  <Button 
                    onClick={handleChangePassword}
                    disabled={!currentPassword || !newPassword || !confirmPassword}
                  >
                    Change Password
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Login Security</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Session Timeout</Label>
                      <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
                    </div>
                    <Select 
                      value={sessionTimeout}
                      onValueChange={(value) => {
                        setSessionTimeout(value);
                        setIsSecuritySettingsChanged(true);
                      }}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select timeout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 minutes</SelectItem>
                        <SelectItem value="60">1 hour</SelectItem>
                        <SelectItem value="120">2 hours</SelectItem>
                        <SelectItem value="240">4 hours</SelectItem>
                        <SelectItem value="480">8 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Remember Me</Label>
                      <p className="text-sm text-muted-foreground">Stay logged in on this device</p>
                    </div>
                    <Switch 
                      checked={rememberMe}
                      onCheckedChange={(value) => {
                        setRememberMe(value);
                        setIsSecuritySettingsChanged(true);
                      }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium">Account Activity</h3>
                
                <div className="border rounded-md">
                  <div className="bg-muted px-4 py-2 border-b">
                    <div className="grid grid-cols-3 font-medium">
                      <div>Date & Time</div>
                      <div>IP Address</div>
                      <div>Device</div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2 border-b">
                    <div className="grid grid-cols-3">
                      <div className="text-sm">Apr 12, 2025 02:15 AM</div>
                      <div className="text-sm">127.0.0.1</div>
                      <div className="text-sm">Chrome - Windows</div>
                    </div>
                  </div>
                  
                  <div className="px-4 py-2">
                    <div className="grid grid-cols-3">
                      <div className="text-sm">Apr 11, 2025 10:24 PM</div>
                      <div className="text-sm">127.0.0.1</div>
                      <div className="text-sm">Firefox - MacOS</div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <Button variant="outline">View Full Activity Log</Button>
                  <Button 
                    onClick={handleSaveSecuritySettings}
                    disabled={!isSecuritySettingsChanged}
                  >
                    Save Security Settings
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-destructive">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mt-1">Once you delete your account, there is no going back</p>
                </div>
                <Button variant="destructive">Delete Account</Button>
              </div>
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
          <div className="flex flex-col space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Database Operations</h3>
              <div className="flex flex-col space-y-2">
                <Button variant="outline" className="justify-start" onClick={handleCreateBackup}>
                  Create Database Backup
                </Button>
                <Button variant="outline" className="justify-start" onClick={handleImportData}>
                  Import Data
                </Button>
                <Button variant="outline" className="justify-start" onClick={handleExportData}>
                  Export Data
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Template Management</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateSelect">Select Template to Download</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <Select 
                      value={selectedTemplate}
                      onValueChange={setSelectedTemplate}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Template</SelectItem>
                        <SelectItem value="glr">GLR Template</SelectItem>
                        <SelectItem value="slr">SLR Template</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleDownloadTemplate}>
                      Download
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="templateFile">Upload Template</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div className="md:col-span-2">
                      <Input 
                        id="templateFile" 
                        type="file" 
                        accept=".json,.csv"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const files = e.target.files;
                          if (files && files.length > 0) {
                            setTemplateFile(files[0]);
                          }
                        }}
                      />
                    </div>
                    <Button 
                      onClick={handleUploadTemplate}
                      disabled={!templateFile}
                    >
                      Upload
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload a JSON or CSV file with task templates. This will update your template tasks.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}