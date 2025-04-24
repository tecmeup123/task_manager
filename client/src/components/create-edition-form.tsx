import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Copy } from "lucide-react";
import { format, addWeeks, subWeeks } from "date-fns";
import { getEditionCode } from "@/lib/utils";

const formSchema = z.object({
  code: z.string().min(1, "Edition code is required"),
  trainingType: z.string().min(1, "Training type is required"),
  startDate: z.date(),
  tasksStartDate: z.date(),
  useTemplateTasks: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateEditionFormProps {
  isOpen: boolean;
  onClose: () => void;
  sourceEditionId?: number | null;
}

export default function CreateEditionForm({
  isOpen,
  onClose,
  sourceEditionId = null,
}: CreateEditionFormProps) {
  const { toast } = useToast();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [variant, setVariant] = useState<"A" | "B">("A");

  // Get source edition data if duplicating
  const { data: sourceEdition } = useQuery<any>({
    queryKey: ["/api/editions", sourceEditionId],
    enabled: !!sourceEditionId,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: getEditionCode(year, month, variant),
      trainingType: "GLR",
      startDate: new Date(),
      tasksStartDate: subWeeks(new Date(), 5),
      useTemplateTasks: true
    },
  });

  // Handle training type changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'trainingType' && value.trainingType === 'SLR') {
        const examDate = value.startDate || new Date();
        // Get Monday 35 days before exam date
        const taskStartDate = new Date(examDate);
        taskStartDate.setDate(taskStartDate.getDate() - 35);
        while (taskStartDate.getDay() !== 1) { // 1 is Monday
          taskStartDate.setDate(taskStartDate.getDate() - 1);
        }
        form.setValue('tasksStartDate', taskStartDate);
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Update the form when the year, month, or variant changes
  useEffect(() => {
    form.setValue("code", getEditionCode(year, month, variant));
  }, [year, month, variant, form]);

  // Populate form with source edition data if duplicating
  useEffect(() => {
    if (sourceEdition && sourceEdition.code) {
      form.reset({
        code: sourceEdition.code.replace(/\d{4}/, getEditionCode(year, month, variant).slice(0, 4)),
        trainingType: sourceEdition.trainingType,
        startDate: new Date(sourceEdition.startDate),
        tasksStartDate: new Date(sourceEdition.tasksStartDate),
        useTemplateTasks: true // Maintain template tasks option
      });
    }
  }, [sourceEdition, form, year, month, variant]);

  // Mutation for creating or duplicating an edition
  const createEdition = useMutation({
    mutationFn: async (values: FormValues) => {
      if (sourceEditionId) {
        // Duplicate edition
        return apiRequest("POST", `/api/editions/${sourceEditionId}/duplicate`, values);
      } else {
        // Create new edition - choose endpoint based on useTemplateTasks
        const { useTemplateTasks, ...editionData } = values;
        
        // Format dates as ISO strings for proper JSON serialization
        const formattedData = {
          ...editionData,
          startDate: editionData.startDate.toISOString(),
          tasksStartDate: editionData.tasksStartDate.toISOString()
        };
        
        console.log("Sending data:", formattedData);
        
        if (useTemplateTasks) {
          return apiRequest("POST", "/api/editions/with-template", formattedData);
        } else {
          return apiRequest("POST", "/api/editions", formattedData);
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/editions"] });
      toast({
        title: sourceEditionId ? "Edition duplicated" : "Edition created",
        description: sourceEditionId
          ? "The edition has been duplicated successfully"
          : "New edition has been created successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      // Check if it's a duplicate key error
      const errorMessage = error.message || "Failed to create edition";
      const isDuplicateError = errorMessage.includes("duplicate key") || 
                               errorMessage.includes("already exists");
      
      toast({
        title: "Error",
        description: isDuplicateError 
          ? `Edition code already exists. Please choose a different code.` 
          : errorMessage,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: FormValues) => {
    createEdition.mutate(values);
  };

  const updateCodeFromDate = (date: Date) => {
    const newYear = date.getFullYear();
    const newMonth = date.getMonth() + 1;
    setYear(newYear);
    setMonth(newMonth);
    form.setValue("code", getEditionCode(newYear, newMonth, variant));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {sourceEditionId ? "Duplicate Edition" : "Create New Edition"}
          </DialogTitle>
          <DialogDescription>
            {sourceEditionId
              ? "Create a new edition based on an existing one"
              : "Set up a new training edition with all required information"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trainingType"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Training Type</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        setVariant(value === "GLR" ? "A" : "B");
                        form.setValue("code", getEditionCode(year, month, value === "GLR" ? "A" : "B"));
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select training type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GLR">GLR (Guided Learning Route)</SelectItem>
                        <SelectItem value="SLR">SLR (Self Learning Route)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      GLR editions use variant A, SLR editions use variant B
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Edition Code</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="e.g. 2406-A"
                        className="flex-grow"
                        readOnly
                      />
                    </FormControl>
                    <FormDescription>
                      Auto-generated based on training type (A for GLR, B for SLR)
                    </FormDescription>
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
                    <FormDescription>
                      GLR: Guided Learning Route, SLR: Self Learning Route
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date) updateCodeFromDate(date);
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      The official start date of the training
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tasksStartDate"
                render={({ field }) => (
                  <FormItem className="md:col-span-1">
                    <FormLabel>Tasks Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
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
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormDescription>
                      When task planning should begin (usually 5 weeks before start)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="useTemplateTasks"
                render={({ field }) => (
                  <FormItem className="md:col-span-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mt-2">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Use template tasks</FormLabel>
                      <FormDescription>
                        Create this edition with predefined template tasks
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={createEdition.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={createEdition.isPending}
              >
                {createEdition.isPending ? "Saving..." : sourceEditionId ? "Duplicate" : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
