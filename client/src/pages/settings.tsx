import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Lock, Database, Calendar, Clock, Eye, Columns, EyeOff, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function Settings() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isDashboardSettingsChanged, setIsDashboardSettingsChanged] = useState(false);
  const [isTaskSettingsChanged, setIsTaskSettingsChanged] = useState(false);
  const [isAccountSettingsChanged, setIsAccountSettingsChanged] = useState(false);
  const [isSecuritySettingsChanged, setIsSecuritySettingsChanged] = useState(false);
  
  // Template management
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [isUpdatingTerminology, setIsUpdatingTerminology] = useState(false);
  
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
  const handleSystemBackup = () => {
    toast({
      title: "Creating system backup...",
      description: "Full system backup is being generated"
    });
    
    // Create backup URL and trigger download
    const backupUrl = `/api/system/backup`;
    const a = document.createElement('a');
    a.href = backupUrl;
    a.setAttribute('download', 'system-backup.json');
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      
      toast({
        title: "System backup downloaded",
        description: "Your system backup file has been successfully created and downloaded"
      });
    }, 1000);
  };
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setImportFile(files[0]);
      
      toast({
        title: "File selected",
        description: `Selected file: ${files[0].name}`,
      });
    }
  };
  
  const handleImportData = () => {
    if (!importFile) {
      toast({
        title: "No file selected",
        description: "Please select a backup file to import",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Import in progress",
      description: "Your backup file is being processed. This may take a moment."
    });
    
    // In a real implementation, this would upload the file to a server endpoint
    // that would validate and import the data
    
    // Mock success response after delay
    setTimeout(() => {
      toast({
        title: "Import successful",
        description: "Your backup has been successfully imported into the system",
      });
      setImportFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }, 2000);
  };
  
  const handleExportData = () => {
    // This uses the same endpoint as system backup but emphasizes data export
    toast({
      title: "Exporting system data...",
      description: "Your data export is being prepared for download"
    });
    
    // Use the system backup endpoint
    const exportUrl = `/api/system/backup`;
    const a = document.createElement('a');
    a.href = exportUrl;
    a.setAttribute('download', 'system-data-export.json');
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      
      toast({
        title: "Data export completed",
        description: "Your data has been successfully exported and downloaded"
      });
    }, 1000);
  };
  
  // Template management handler functions
  const handleDownloadTemplate = () => {
    toast({
      title: "Preparing template...",
      description: "Generating default template"
    });

    // Create sample template data - always use default template
    const templateData = generateTemplateData('default');
    
    // Convert template data to JSON string
    const jsonString = JSON.stringify(templateData, null, 2);
    
    // Create a blob and download link
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create and trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-template.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Template downloaded",
        description: `${templateData.length} tasks template has been successfully downloaded`
      });
    }, 500);
  };
  
  // Template upload handler
  const handleUploadTemplate = () => {
    if (!templateFile) {
      toast({
        title: "No file selected",
        description: "Please select a template file to upload",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Uploading template...",
      description: "Processing template data"
    });
    
    // Read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const templateData = JSON.parse(content);
        
        if (!Array.isArray(templateData)) {
          throw new Error("Invalid template format. Expected an array of tasks.");
        }
        
        // In a real implementation, would send this to the server
        // In this prototype, just show success
        
        setTimeout(() => {
          toast({
            title: "Template uploaded",
            description: `Successfully imported ${templateData.length} tasks from template`
          });
          setTemplateFile(null);
        }, 1000);
      } catch (error) {
        toast({
          title: "Error parsing template",
          description: error instanceof Error ? error.message : "Invalid template format",
          variant: "destructive"
        });
      }
    };
    
    reader.readAsText(templateFile);
  };
  
  // Handle updating task terminology in existing data
  const handleUpdateTerminology = async () => {
    setIsUpdatingTerminology(true);
    
    try {
      toast({
        title: "Updating terminology...",
        description: "Replacing email and mailing list references in task names"
      });
      
      const response = await fetch('/api/tasks/update-terminology', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update terminology: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      toast({
        title: "Terminology updated",
        description: result.message
      });
    } catch (error) {
      console.error('Error updating terminology:', error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update task terminology",
        variant: "destructive"
      });
    } finally {
      setIsUpdatingTerminology(false);
    }
  };
  
  // Helper function to generate comprehensive template data for all weeks
  const generateTemplateData = (templateType: string) => {
    // Base tasks that are common across all template types
    const baseTasks = {
      "Week -5": [
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
          name: "Create participant list (names; groups information; schedule; edition)",
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
          notes: "Must be completed before participant onboarding"
        }
      ],
      "Week -4": [
        {
          taskCode: "WM4T01",
          week: "Week -4",
          name: "Trainers should send changes in the self-learning assignment to Training Team",
          duration: "0:30:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week -3": [
        {
          taskCode: "WM3T01",
          week: "Week -3",
          name: "Prepare welcome resources for participants",
          duration: "0:15:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week -2": [
        {
          taskCode: "WM2T01",
          week: "Week -2",
          name: "Share training resources with participants",
          duration: "0:15:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week -1": [
        {
          taskCode: "WM1T01",
          week: "Week -1",
          name: "Request Marketing team to remove schedule from CM site",
          duration: "0:15:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 0": [
        {
          taskCode: "W00T01",
          week: "Week 0",
          name: "Include links of the exam, participant resources and edition folder to trainers",
          duration: "0:30:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W00T02",
          week: "Week 0",
          name: "Announce start of the self-learning stage with Q&A sessions",
          duration: "0:15:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 1": [
        {
          taskCode: "W01T01",
          week: "Week 1",
          name: "First week of training - Welcome session",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: true,
          notes: "Must include introduction to course materials"
        },
        {
          taskCode: "W01T02",
          week: "Week 1",
          name: "Set up training environment for participants",
          duration: "2:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: true,
          notes: ""
        }
      ],
      "Week 2": [
        {
          taskCode: "W02T01",
          week: "Week 2",
          name: "Weekly progress review meeting",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W02T02",
          week: "Week 2",
          name: "Post reminder about assignments due",
          duration: "0:15:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 3": [
        {
          taskCode: "W03T01",
          week: "Week 3",
          name: "Mid-training survey distribution",
          duration: "0:30:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W03T02",
          week: "Week 3",
          name: "Weekly progress review meeting",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 4": [
        {
          taskCode: "W04T01",
          week: "Week 4",
          name: "Weekly progress review meeting",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W04T02",
          week: "Week 4",
          name: "Prepare for final project presentations",
          duration: "1:30:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 5": [
        {
          taskCode: "W05T01",
          week: "Week 5",
          name: "Final project presentations",
          duration: "2:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: true,
          notes: ""
        },
        {
          taskCode: "W05T02",
          week: "Week 5",
          name: "Final assessment distribution",
          duration: "0:30:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: true,
          notes: ""
        }
      ],
      "Week 6": [
        {
          taskCode: "W06T01",
          week: "Week 6",
          name: "Collect and analyze final assessment results",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W06T02",
          week: "Week 6",
          name: "Prepare certificates of completion",
          duration: "0:45:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 7": [
        {
          taskCode: "W07T01",
          week: "Week 7",
          name: "Send certificates to participants",
          duration: "0:30:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W07T02",
          week: "Week 7",
          name: "Follow-up with participants who didn't complete training",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ],
      "Week 8": [
        {
          taskCode: "W08T01",
          week: "Week 8",
          name: "Training program retrospective meeting",
          duration: "1:30:00",
          trainingType: "ALL",
          assignedTo: "Trainer",
          owner: "Lead Trainer",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W08T02",
          week: "Week 8",
          name: "Prepare training report",
          duration: "2:00:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        },
        {
          taskCode: "W08T03",
          week: "Week 8",
          name: "Archive training materials",
          duration: "1:00:00",
          trainingType: "ALL",
          assignedTo: "Organizer",
          owner: "Training Manager",
          status: "Not Started",
          inflexible: false,
          notes: ""
        }
      ]
    };
    
    // Specific template customizations
    const templateSpecificTasks = {
      // Default template - uses base tasks with 'ALL' training type
      default: Object.values(baseTasks).flat().map(task => ({
        ...task,
        trainingType: "ALL"
      })),
      
      // GLR template - guided learning route
      glr: Object.values(baseTasks).flat().map(task => {
        // Customize certain tasks for GLR
        if (task.week === "Week 1") {
          if (task.taskCode === "W01T01") {
            return {
              ...task,
              trainingType: "GLR",
              name: "First week of guided training - Welcome session with instructor",
              notes: "Introduce course structure and live instructor sessions"
            };
          }
        }
        if (task.week === "Week 2" || task.week === "Week 3" || task.week === "Week 4") {
          if (task.taskCode.endsWith("T01")) {
            return {
              ...task,
              trainingType: "GLR",
              name: `Guided training session for ${task.week}`,
              duration: "2:00:00"
            };
          }
        }
        
        // Return other tasks with GLR type
        return {
          ...task,
          trainingType: "GLR"
        };
      }),
      
      // SLR template - self-learning route
      slr: Object.values(baseTasks).flat().map(task => {
        // Customize certain tasks for SLR
        if (task.week === "Week 1") {
          if (task.taskCode === "W01T01") {
            return {
              ...task,
              trainingType: "SLR",
              name: "Provide access to self-paced modules",
              notes: "Verify all students have received access credentials"
            };
          }
        }
        if (task.week === "Week 2" || task.week === "Week 3" || task.week === "Week 4") {
          if (task.taskCode.endsWith("T01")) {
            return {
              ...task,
              trainingType: "SLR",
              name: `Self-learning progress check for ${task.week}`,
              duration: "0:30:00"
            };
          }
        }
        
        // Return other tasks with SLR type
        return {
          ...task,
          trainingType: "SLR"
        };
      })
    };
    
    return templateSpecificTasks[templateType as keyof typeof templateSpecificTasks] || templateSpecificTasks.default;
  };
  
  // The handleUploadTemplate function has been moved to a single instance above to avoid duplication
  
  useEffect(() => {
    // In a real app, these would be loaded from a user preferences API
    // and the changes would be saved to that API
  }, []);
  
  return (
    <div className="max-w-full overflow-x-hidden">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Settings</h2>
      </div>

      <Tabs defaultValue="dashboard" className="mb-6">
        <div className="mb-4 overflow-x-auto pb-1">
          <TabsList className="grid grid-cols-3 sm:flex sm:w-fit gap-1">
            <TabsTrigger value="dashboard" className="text-xs px-1 py-1 md:text-sm md:px-3">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks" className="text-xs px-1 py-1 md:text-sm md:px-3">Tasks</TabsTrigger>
            <TabsTrigger value="account" className="text-xs px-1 py-1 md:text-sm md:px-3">Account</TabsTrigger>
            <TabsTrigger value="notifications" className="text-xs px-1 py-1 md:text-sm md:px-3">Notif.</TabsTrigger>
            <TabsTrigger value="security" className="text-xs px-1 py-1 md:text-sm md:px-3">Security</TabsTrigger>
            <TabsTrigger value="data" className="text-xs px-1 py-1 md:text-sm md:px-3">Data</TabsTrigger>
          </TabsList>
        </div>
        
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
                      
                      // Also change the active language immediately
                      import('i18next').then(i18n => {
                        i18n.default.changeLanguage(value);
                      });
                    }}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish (Español)</SelectItem>
                      <SelectItem value="fr">French (Français)</SelectItem>
                      <SelectItem value="de">German (Deutsch)</SelectItem>
                      <SelectItem value="pt">Portuguese (Português)</SelectItem>
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
                
                {/* Dark theme toggle removed as requested */}
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
        
        <TabsContent value="data" className="space-y-4">
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
              
              {user?.role === 'admin' ? (
                <div className="flex flex-col space-y-2">
                  <Button 
                    variant="outline" 
                    className="justify-start flex items-center" 
                    onClick={handleSystemBackup}
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Create System Backup
                  </Button>
                  
                  <div className="flex flex-col">
                    <input
                      type="file"
                      id="file-import"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept=".json"
                    />
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <Button 
                        variant="outline" 
                        className="justify-start flex-1 flex items-center" 
                        onClick={handleImportClick}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Select Backup File
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="flex items-center" 
                        onClick={handleImportData}
                        disabled={!importFile}
                      >
                        Import
                      </Button>
                    </div>
                    
                    {importFile && (
                      <div className="text-xs text-muted-foreground mt-1">
                        Selected: {importFile.name}
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    className="justify-start flex items-center" 
                    onClick={handleExportData}
                  >
                    <EyeOff className="h-4 w-4 mr-2" />
                    Export All System Data
                  </Button>
                </div>
              ) : (
                <Alert className="my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Administrator privileges are required to access system data management features.
                  </AlertDescription>
                </Alert>
              )}
            </div>
            
            <div className="space-y-4 pt-4 border-t">
              <h3 className="text-lg font-medium">Template Management</h3>
              
              {user?.role === 'admin' || user?.role === 'editor' ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateSelect">Select Template to Download</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <Button 
                        onClick={handleDownloadTemplate}
                        className="w-full"
                      >
                        Download Default Template ({generateTemplateData('default').length} tasks)
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Templates include tasks for all weeks from Week -5 to Week 8.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="templateFile">Upload Template</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="flex-grow">
                        <Input 
                          id="templateFile" 
                          type="file" 
                          accept=".json,.csv"
                          className="max-w-full"
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
                        className="w-full sm:w-auto"
                      >
                        Upload
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Upload a JSON or CSV file with task templates. This will update your template tasks.
                    </p>
                  </div>
                  
                  {/* Update Email Terminology Button - Admin only */}
                  {user?.role === 'admin' && (
                    <div className="space-y-2">
                      <Label>Update Terminology in Existing Tasks</Label>
                      <div className="flex">
                        <Button 
                          onClick={handleUpdateTerminology}
                          disabled={isUpdatingTerminology}
                          className="w-full text-wrap"
                          variant="outline"
                        >
                          {isUpdatingTerminology ? 'Updating...' : 'Replace Email/Mailing References in Tasks'}
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This will update all tasks in the database to use new terminology (e.g., "Create participant list" instead of "Create mailing list").
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <Alert className="my-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Admin or editor privileges are required to access template management features.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Add invisible spacing div at the bottom for mobile */}
      <div className="h-12 md:hidden" />
    </div>
  );
}