import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { User } from "@shared/schema";
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
  assignedTo: z.string().optional().nullable(),
  assignedUserId: z.number().optional().nullable(),
  status: z.string(),
  notes: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface TaskDetailModalProps {
  isOpen: boolean;
  task: any;
  onClose: () => void;
  onSave: (task: any) => void;
}

export default function TaskDetailModal({
  isOpen,
  task,
  onClose,
  onSave,
}: TaskDetailModalProps) {
  const { t } = useTranslation();
  const [activityHistory, setActivityHistory] = useState<any[]>([
    {
      action: `Status changed to ${task.status}`,
      timestamp: new Date(),
      user: task.owner || "System",
    },
    {
      action: `Task assigned to ${task.owner}`,
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      user: "System",
    },
    {
      action: "Task created",
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      user: "System",
    },
  ]);

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
      assignedTo: task?.assignedTo || "",
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
        assignedTo: task.assignedTo,
        assignedUserId: task.assignedUserId || null,
        status: task.status,
        notes: task.notes,
      });
    }
  }, [task, form]);

  const onSubmit = (values: FormValues) => {
    // Process the assignedUserId field (convert "none" to null)
    const formData = { ...values };
    if (typeof formData.assignedUserId === 'string' && formData.assignedUserId === "none") {
      formData.assignedUserId = null;
    }
    
    onSave(formData);
  };

  // Simplified closing approach
  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={(open) => {
        if (!open) {
          console.log("Dialog close triggered");
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md md:max-w-2xl">
        <DialogHeader className="flex flex-row items-center justify-start">
          <div className="flex items-center">
            <DialogTitle>Task Detail: {task?.taskCode || ""}</DialogTitle>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Task Status Progress Bar */}
            <div className="mb-4">
              <h3 className="text-sm font-semibold mb-2">Status</h3>
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
                    Due: {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}
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
                    <FormLabel>Task Code</FormLabel>
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
                    <FormLabel>Week</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select week" />
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
                    <FormLabel>Task Description</FormLabel>
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
                    <FormLabel>Duration</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ''} placeholder="e.g. 0:15:00" />
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
                    <FormLabel>Due Date</FormLabel>
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
                              <span>Pick a date</span>
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
                    <FormLabel>Training Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select training type" />
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
                        Inflexible (task has fixed date/time)
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
                    <FormLabel>Owner</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select owner" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading users...</span>
                          </div>
                        ) : users && users.length > 0 ? (
                          users.map(user => (
                            <SelectItem key={user.username} value={user.username}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-users" disabled>No users available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Assigned To (Role/Group)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignment" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ASSIGNED_TO_OPTIONS.map(option => (
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
                name="assignedUserId"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Assign to User</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(value ? parseInt(value) : null)}
                      value={field.value?.toString() || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assign to specific user" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {isLoadingUsers ? (
                          <div className="flex items-center justify-center p-2">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span>Loading users...</span>
                          </div>
                        ) : users && users.length > 0 ? (
                          users.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-users" disabled>No users available</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      User assignment will send a notification
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
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
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
                  <FormLabel>Task Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      value={field.value || ''}
                      placeholder="Add notes about this task..."
                      className="min-h-[100px]"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <h3 className="text-sm font-medium mb-2">Activity History</h3>
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
                        {format(new Date(activity.timestamp), "MMM d, yyyy - h:mm a")}
                      </span>
                    </div>
                    <div className="text-neutral-600 text-xs mt-1">
                      By {activity.user}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onClose()}
                className="flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Task List
              </Button>
              <Button type="submit">Update Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
