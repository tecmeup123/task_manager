import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
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
import { CalendarIcon } from "lucide-react";
import { WEEK_OPTIONS, TASK_STATUS_OPTIONS, OWNER_OPTIONS, ASSIGNED_TO_OPTIONS, TASK_TEMPLATE } from "@/lib/constants";

// Schema for the form
const formSchema = z.object({
  taskCode: z.string().min(1, "Task code is required"),
  week: z.string().min(1, "Week is required"),
  name: z.string().min(1, "Task name is required"),
  duration: z.string().optional().nullable(),
  dueDate: z.date().optional().nullable(),
  trainingType: z.string().min(1, "Training type is required"),
  inflexible: z.boolean().default(false),
  owner: z.string().optional().nullable(),
  assignedTo: z.string().optional().nullable(),
  status: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

interface AddTaskFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  edition?: any; // Current edition
}

export default function AddTaskForm({
  isOpen,
  onClose,
  onSave,
  edition,
}: AddTaskFormProps) {
  // Track selected week for task code generation
  const [selectedWeek, setSelectedWeek] = useState<string>("Week 1");
  
  // Handle generating a task code
  const generateTaskCode = (week: string): string => {
    // Extract template based on week (if exists)
    const weekTasks = TASK_TEMPLATE[week as keyof typeof TASK_TEMPLATE] || [];
    
    // Generate a code based on week (e.g., "W5T01" for Week 5, Task 1)
    const weekPrefix = week.startsWith("Week -") 
      ? `WM${week.replace("Week -", "")}T`
      : `W${week.replace("Week ", "")}T`;
    
    // Find next available number for the week
    const nextNumber = (weekTasks.length + 1).toString().padStart(2, '0');
    return `${weekPrefix}${nextNumber}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      taskCode: generateTaskCode("Week 1"),
      week: "Week 1",
      name: "",
      duration: "0:30:00",
      dueDate: new Date(),
      trainingType: edition?.trainingType || "GLR",
      inflexible: false,
      owner: "",
      assignedTo: "",
      status: "Not Started",
    },
  });

  // Update task code when week changes
  useEffect(() => {
    const newTaskCode = generateTaskCode(selectedWeek);
    form.setValue("taskCode", newTaskCode);
  }, [selectedWeek, form]);

  // Handle form submission
  const onSubmit = (values: FormValues) => {
    onSave(values);
    form.reset();
  };

  // Populate task template when week is selected
  const handleWeekChange = (week: string) => {
    setSelectedWeek(week);
    const weekTasks = TASK_TEMPLATE[week as keyof typeof TASK_TEMPLATE] || [];
    
    if (weekTasks.length > 0) {
      // Get a template for this week if available
      const template = weekTasks[0];
      if (template) {
        form.setValue("assignedTo", template.assignedTo || "");
        form.setValue("owner", template.owner || "");
        form.setValue("trainingType", template.trainingType || edition?.trainingType || "GLR");
        form.setValue("duration", template.duration || "0:30:00");
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="taskCode"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Task Code</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. W5T07" />
                    </FormControl>
                    <FormDescription>
                      Auto-generated based on week
                    </FormDescription>
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
                      onValueChange={(value) => {
                        field.onChange(value);
                        handleWeekChange(value);
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select week" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {WEEK_OPTIONS
                          .filter(option => option.value !== "all")
                          .map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))
                        }
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
                      <Input 
                        {...field} 
                        placeholder="Enter task description" 
                      />
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
                      <Input {...field} placeholder="e.g. 0:15:00" />
                    </FormControl>
                    <FormDescription>
                      Format: h:mm:ss
                    </FormDescription>
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
                              format(field.value, "MMM dd, yyyy")
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
                        {OWNER_OPTIONS.map(option => (
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
                name="inflexible"
                render={({ field }) => (
                  <FormItem className="md:col-span-1 flex flex-row items-start space-x-3 space-y-0 pt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Task has fixed date/time
                      </FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="assignedTo"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Assigned To</FormLabel>
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

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="mr-2"
              >
                Cancel
              </Button>
              <Button type="submit">Save Task</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
