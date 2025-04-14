import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useLocation } from "wouter";
import { User } from "@shared/schema";
import { ActivityHistoryItem, AuditLogResponse, parseTimestamp } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, ChevronLeft, Loader2 } from "lucide-react";
import { WEEK_OPTIONS, TASK_STATUS_OPTIONS, OWNER_OPTIONS, ASSIGNED_TO_OPTIONS } from "@/lib/constants";
import { formatDate, getInitials, getStatusColor } from "@/lib/utils";

const formSchema = z.object({
  id: z.number(),
  taskCode: z.string().min(1, "Task code is required"),
  week: z.string().min(1, "Week is required"),
  name: z.string().min(1, "Task name is required"),
  duration: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  trainingType: z.string().min(1, "Training type is required"),
  inflexible: z.boolean().default(false),
  owner: z.string().optional().nullable(),
  assignedUserId: z.union([z.number(), z.string(), z.null()]),
  status: z.string(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDetailModalProps {
  isOpen: boolean;
  task: any;
  onClose: () => void;
  onSave: (task: any) => void;
  redirectPath?: string;
}

export default function TaskDetailModal({
  isOpen,
  task,
  onClose,
  onSave,
  redirectPath = '/',
}: TaskDetailModalProps) {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  // Use a ref to store activity history for the Task Activity section
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryItem[]>([
    {
      action: "Task created",
      timestamp: parseTimestamp(task?.createdAt) || new Date(),
      username: "System"
    }
  ]);
  
  // Flag to track if we've processed logs for this task
  const processedLogsRef = useRef<boolean>(false);
  const taskIdRef = useRef<number | null>(null);
  
  // If task ID changes, reset the processed flag
  useEffect(() => {
    if (taskIdRef.current !== task?.id) {
      processedLogsRef.current = false;
      taskIdRef.current = task?.id || null;
      
      // Reset to default state when task changes
      setActivityHistory([{
        action: "Task created",
        timestamp: parseTimestamp(task?.createdAt) || new Date(),
        username: "System"
      }]);
    }
  }, [task?.id, task?.createdAt]);
  
  // Fetch task's audit logs directly (not with useQuery)
  useEffect(() => {
    // Only fetch if we have a task, the modal is open, and we haven't processed logs yet
    if (task?.id && isOpen && !processedLogsRef.current) {
      // Use the API request function with proper error handling
      console.log('Fetching audit logs for task:', task.id);
      fetch(`/api/entity-audit-logs?entityType=task&entityId=${task.id}`, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch audit logs');
          return res.json();
        })
        .then(logs => {
          console.log('Received audit logs:', logs);
          if (logs && logs.length > 0) {
            // Transform logs to activity history
            const history = logs.map((log: any) => {
              // Determine the action text based on log data
              let actionText = log.notes || '';
              
              // Special handling for specific actions
              if (log.action === 'update') {
                const oldState = log.previousState;
                const newState = log.newState;
                
                if (oldState && newState) {
                  if (oldState.status !== newState.status) {
                    actionText = `Status changed from "${oldState.status}" to "${newState.status}"`;
                  } else if (oldState.owner !== newState.owner) {
                    actionText = `Task ownership changed from "${oldState.owner || 'Unassigned'}" to "${newState.owner || 'Unassigned'}"`;
                  } else if (oldState.assignedUserId !== newState.assignedUserId) {
                    actionText = `Task assignment changed`;
                  }
                }
              } else if (log.action === 'create') {
                actionText = 'Task created';
              }
              
              return {
                action: actionText,
                // Use log.timestamp if available (from our enhanced API)
                timestamp: log.timestamp ? new Date(log.timestamp) : new Date(),
                username: log.username || 'System'
              };
            });
            
            // Update state only once per task
            setActivityHistory(history);
          }
          
          // Mark as processed
          processedLogsRef.current = true;
        })
        .catch(error => {
          console.error('Error fetching audit logs:', error);
        });
    }
  }, [task?.id, isOpen]);

  // Fetch users for task assignment
  const { data: users = [], isLoading: isLoadingUsers } = useQuery<User[]>({
    queryKey: ['/api/users'],
    enabled: isOpen, // Only fetch when modal is open
  });
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: task?.id || 0,
      taskCode: task?.taskCode || "",
      week: task?.week || "",
      name: task?.name || "",
      duration: task?.duration || "",
      dueDate: task?.dueDate ? new Date(task.dueDate) : null,
      trainingType: task?.trainingType || "GLR",
      inflexible: task?.inflexible || false,
      owner: task?.owner || "",
      assignedUserId: task?.assignedUserId || null,
      status: task?.status || "Not Started",
      notes: task?.notes || "",
    },
  });

  // Update form when task changes
  useEffect(() => {
    if (task) {
      form.reset({
        id: task.id,
        taskCode: task.taskCode,
        week: task.week,
        name: task.name,
        duration: task.duration,
        dueDate: task.dueDate ? new Date(task.dueDate) : null,
        trainingType: task.trainingType,
        inflexible: task.inflexible,
        owner: task.owner,
        assignedUserId: task.assignedUserId || null,
        status: task.status,
        notes: task.notes,
      });
    }
  }, [task, form]);

  const onSubmit = (values: FormValues) => {
    // Process the assignedUserId field
    const formData = { ...values };
    
    // Handle different possible assignedUserId values
    if (typeof formData.assignedUserId === 'string') {
      if (formData.assignedUserId === "none" || formData.assignedUserId === "") {
        formData.assignedUserId = null;
      } else {
        // Ensure numeric strings are converted to numbers
        formData.assignedUserId = parseInt(formData.assignedUserId, 10);
      }
    }
    
    // Debug log for task form submission
    console.log("Task form submitted with values:", values);
    console.log("Processed form data (with assignedUserId):", formData);
    
    onSave(formData);
  };

  // Check if we're already on the tasks page
  const [currentLocation] = useLocation();
  const isOnTasksPage = currentLocation.startsWith('/tasks');

  // Simplified closing approach
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          onClose();
          // Only redirect if we're not already on the tasks page
          if (redirectPath && !isOnTasksPage) {
            setLocation(redirectPath);
          }
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-start">
          <button 
            className="mr-3 hover:bg-neutral-100 p-1 rounded-full transition-colors"
            onClick={() => {
              onClose();
              // Only redirect if we're not already on the tasks page
              if (!isOnTasksPage && redirectPath) {
                setLocation(redirectPath);
              }
            }}
            aria-label="Back to dashboard"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center">
            <DialogTitle>{t('tasks.details')}: {task?.taskCode || ""}</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Status Progress Bar */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">{t('tasks.status')}</h3>
              <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <Badge 
                    variant={
                      task?.status === "Done" ? "success" : 
                      task?.status === "In Progress" ? "default" : 
                      task?.status === "Not Started" ? "secondary" :
                      task?.status === "Blocked" ? "destructive" :
                      "secondary"
                    }
                    className={
                      task?.status === "Done" ? "bg-green-600 text-white font-medium" : 
                      task?.status === "In Progress" ? "bg-blue-600 text-white font-medium" : 
                      task?.status === "Not Started" ? "bg-slate-600 text-white font-medium" :
                      task?.status === "Blocked" ? "bg-red-600 text-white font-medium" :
                      "bg-slate-600 text-white font-medium"
                    }
                  >
                    {task?.status || "Not Started"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {task?.week || "Week Unknown"}
                  </span>
                </div>
                
                <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mb-2">
                  <div 
                    className={
                      task?.status === "Done" ? "h-2 bg-green-500 rounded-full" : 
                      task?.status === "In Progress" ? "h-2 bg-yellow-500 rounded-full" : 
                      task?.status === "Blocked" ? "h-2 bg-red-500 rounded-full" : 
                      "h-2 bg-neutral-300 rounded-full"
                    }
                    style={{ 
                      width: task?.status === "Done" ? "100%" : 
                             task?.status === "In Progress" ? "50%" : 
                             task?.status === "Blocked" ? "25%" : 
                             "5%" 
                    }}
                  />
                </div>
                
                {task?.dueDate && (
                  <div className="text-xs text-muted-foreground">
                    {t('tasks.due')}: {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : t('tasks.noDueDate')}
                  </div>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskCode"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.code')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="week"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.week')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.selectWeek')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEEK_OPTIONS.filter(option => option.value !== "all").map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>{t('tasks.description')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.duration')}</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder={t('tasks.durationPlaceholder')} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.dueDate')}</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={`w-full justify-start text-left font-normal ${
                              !field.value && "text-muted-foreground"
                            }`}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>{t('tasks.pickDate')}</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="trainingType"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.trainingType')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.selectTrainingType')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GLR">GLR</SelectItem>
                        <SelectItem value="SLR">SLR</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inflexible"
                render={({ field }) => (
                  <FormItem className="md:col-span-1 flex flex-row items-start space-x-3 space-y-0 pt-6">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        {t('tasks.inflexible')}
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="owner"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.owner')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.selectOwner')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>{t('common.loadingUsers')}</span>
                          </div>
                        ) : users && users.length > 0 ? (
                          users.map(user => (
                            <SelectItem key={user.username} value={user.username}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-users" disabled>{t('common.noUsersAvailable')}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

{/* Removed assignedTo role field as requested */}
              
              <FormField
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.assignToUser')}</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        console.log("Select assignedUserId changing to:", value);
                        // Convert to number or null
                        field.onChange(value === "none" ? null : value ? parseInt(value, 10) : null);
                      }}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.assignToSpecificUser')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">{t('common.none')}</SelectItem>
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>{t('common.loadingUsers')}</span>
                          </div>
                        ) : users && users.length > 0 ? (
                          users.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-users" disabled>{t('common.noUsersAvailable')}</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      {t('tasks.userAssignmentNotification')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>{t('tasks.status')}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.selectStatus')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_STATUS_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('tasks.notes')}</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ''}
                      placeholder={t('tasks.addNotesPlaceholder')}
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-sm font-medium mb-2">{t('tasks.activityHistory')}</h3>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                {activityHistory.map((activity, index) => (
                  <div
                    key={index}
                    className={`p-3 text-sm ${
                      index < activityHistory.length - 1
                        ? "border-b border-neutral-200"
                        : ""
                    } ${index === 0 ? "bg-neutral-50" : ""}`}
                  >
                    <div className="flex justify-between">
                      <span dangerouslySetInnerHTML={{ __html: activity.action }} />
                      <span className="text-neutral-500">
                        {typeof activity.timestamp === 'string' 
                          ? format(new Date(activity.timestamp), "MMM d, yyyy - h:mm a")
                          : activity.timestamp instanceof Date
                            ? format(activity.timestamp, "MMM d, yyyy - h:mm a")
                            : format(new Date(), "MMM d, yyyy - h:mm a")}
                      </span>
                    </div>
                    <div className="text-neutral-600 text-xs mt-1">
                      {t('tasks.by')} {activity.username || activity.user || "Unknown"}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  onClose();
                  // Only redirect if we're not already on the tasks page
                  if (!isOnTasksPage && redirectPath) {
                    setLocation(redirectPath);
                  }
                }}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                {t('tasks.backToList')}
              </Button>
              <Button type="submit">{t('tasks.update')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
