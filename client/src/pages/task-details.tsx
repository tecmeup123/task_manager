import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  ArrowLeft,
  Save,
  Calendar,
  Clock,
  User,
  Tag,
  AlertCircle,
  MessageSquare,
  Paperclip,
  CheckCircle
} from "lucide-react";
import { format, parseISO } from "date-fns";
import { useTranslation } from "react-i18next";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { getStatusColor } from "@/lib/utils";

// Helper function to parse query parameters
function useQueryParams() {
  const [location] = useLocation();
  return new URLSearchParams(location.split('?')[1] || '');
}

export default function TaskDetails() {
  const { t } = useTranslation();
  const [, navigate] = useLocation();
  const params = useParams();
  const queryParams = useQueryParams();
  const editionId = queryParams.get('editionId');
  const taskId = params.taskId;
  
  // Form state
  const [form, setForm] = useState({
    status: "",
    assignedUserId: null as number | null,
    notes: "",
    completionDate: null as string | null,
  });
  
  const { toast } = useToast();
  
  // Fetch task details
  const { 
    data: task, 
    isLoading: isTaskLoading,
    error: taskError
  } = useQuery({
    queryKey: [`/api/tasks/${taskId}`],
    enabled: !!taskId,
  });
  
  // Fetch users for assignment dropdown
  const { data: users = [] } = useQuery<any[]>({
    queryKey: ['/api/users'],
    enabled: !!task,
  });
  
  // Fetch task comments
  const { 
    data: comments = [], 
    isLoading: isCommentsLoading 
  } = useQuery<any[]>({
    queryKey: [`/api/tasks/${taskId}/comments`],
    enabled: !!taskId,
  });
  
  // Fetch task resources
  const { 
    data: resources = [], 
    isLoading: isResourcesLoading 
  } = useQuery<any[]>({
    queryKey: [`/api/tasks/${taskId}/resources`],
    enabled: !!taskId,
  });
  
  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async (updatedTask: any) => {
      const response = await apiRequest('PATCH', `/api/tasks/${taskId}`, updatedTask);
      return response.json();
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      if (editionId) {
        queryClient.invalidateQueries({ queryKey: [`/api/editions/${editionId}/tasks`] });
      }
      
      toast({
        title: t('tasks.updateSuccess'),
        description: t('tasks.updateSuccessDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('tasks.updateError'),
        description: error.message || t('tasks.updateErrorDescription'),
        variant: "destructive",
      });
    }
  });
  
  // Initialize form when task data loads
  useEffect(() => {
    if (task) {
      setForm({
        status: task.status || "",
        assignedUserId: task.assignedUserId,
        notes: task.notes || "",
        completionDate: task.completionDate ? new Date(task.completionDate).toISOString().split('T')[0] : null,
      });
    }
  }, [task]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!task) return;
    
    const updatedTask = {
      ...task,
      status: form.status,
      assignedUserId: form.assignedUserId,
      notes: form.notes,
      completionDate: form.completionDate,
    };
    
    updateTaskMutation.mutate(updatedTask);
  };
  
  // Format date helper
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      return format(parseISO(dateString), "MMM d, yyyy");
    } catch (e) {
      return "Invalid date";
    }
  };
  
  const handleGoBack = () => {
    // Navigate back to tasks page for the edition
    if (editionId) {
      navigate(`/tasks?editionId=${editionId}`);
    } else {
      navigate('/tasks');
    }
  };
  
  if (isTaskLoading) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
          </Button>
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-1/2" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-2/3 mb-2" />
            <Skeleton className="h-4 w-1/3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (taskError || !task) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
          </Button>
        </div>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">{t('tasks.notFound')}</h2>
            <p className="text-muted-foreground mb-6">{t('tasks.notFoundDescription')}</p>
            <Button onClick={handleGoBack}>{t('common.backToTasks')}</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const statusOptions = [
    { value: "Not Started", label: t('tasks.statusNotStarted') },
    { value: "In Progress", label: t('tasks.statusInProgress') },
    { value: "Done", label: t('tasks.statusDone') },
    { value: "Blocked", label: t('tasks.statusBlocked') },
  ];
  
  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> {t('common.back')}
        </Button>
        <h1 className="text-2xl font-bold mb-2">{task.name}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            {task.taskCode}
          </Badge>
          <Badge 
            className={`${getStatusColor(task.status).bg}`}
          >
            {task.status}
          </Badge>
          <Badge variant="secondary">{task.week}</Badge>
          <Badge variant="outline">{task.trainingType}</Badge>
        </div>
      </div>
      
      <Tabs defaultValue="details" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="details">{t('tasks.tabDetails')}</TabsTrigger>
          <TabsTrigger value="comments">{t('tasks.tabComments')}</TabsTrigger>
          <TabsTrigger value="resources">{t('tasks.tabResources')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>{t('tasks.details')}</CardTitle>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Task information - left column */}
                  <div className="space-y-4">
                    <div className="flex items-start space-x-2">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium leading-none">{t('tasks.dueDate')}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatDate(task.dueDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium leading-none">{t('tasks.duration')}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.duration}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium leading-none">{t('tasks.owner')}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {task.owner}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-2">
                      <Tag className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium leading-none">{t('tasks.inflexible')}</h3>
                        <div className="flex items-center mt-1">
                          <Checkbox 
                            disabled 
                            checked={task.inflexible} 
                            className="data-[state=checked]:bg-primary"
                          />
                          <span className="text-sm text-muted-foreground ml-2">
                            {task.inflexible ? t('common.yes') : t('common.no')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Editable fields - right column */}
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="status">{t('tasks.status')}</Label>
                      <Select 
                        value={form.status} 
                        onValueChange={(value) => setForm(prev => ({ ...prev, status: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.selectStatus')} />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map(option => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="assignedUserId">{t('tasks.assignedTo')}</Label>
                      <Select 
                        value={form.assignedUserId?.toString() || "none"} 
                        onValueChange={(value) => setForm(prev => ({ 
                          ...prev, 
                          assignedUserId: value && value !== "none" ? parseInt(value) : null 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t('tasks.selectAssignee')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">
                            {t('tasks.noAssignee')}
                          </SelectItem>
                          {users.map(user => (
                            <SelectItem key={user.id} value={user.id.toString()}>
                              {user.fullName || user.username}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {form.status === "Done" && (
                      <div className="space-y-2">
                        <Label htmlFor="completionDate">{t('tasks.completionDate')}</Label>
                        <Input 
                          id="completionDate" 
                          type="date" 
                          value={form.completionDate || ""} 
                          onChange={(e) => setForm(prev => ({ 
                            ...prev, 
                            completionDate: e.target.value || null 
                          }))}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="notes">{t('tasks.notes')}</Label>
                      <Textarea 
                        id="notes" 
                        value={form.notes || ""} 
                        onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder={t('tasks.notesPlaceholder')}
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="ghost" onClick={handleGoBack}>
                  {t('common.cancel')}
                </Button>
                <Button 
                  type="submit" 
                  disabled={updateTaskMutation.isPending}
                >
                  {updateTaskMutation.isPending ? (
                    <>{t('common.saving')}...</>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t('common.save')}
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        
        <TabsContent value="comments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" /> {t('tasks.comments')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isCommentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map(comment => (
                    <div key={comment.id} className="p-4 border rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{comment.user?.fullName || comment.user?.username || t('common.unknownUser')}</span>
                        <span className="text-sm text-muted-foreground">{formatDate(comment.createdAt)}</span>
                      </div>
                      <p className="text-sm">{comment.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('tasks.noComments')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="resources">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Paperclip className="mr-2 h-5 w-5" /> {t('tasks.resources')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isResourcesLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : resources.length > 0 ? (
                <div className="space-y-2">
                  {resources.map(resource => (
                    <div key={resource.id} className="flex items-center p-3 border rounded-md">
                      <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-sm text-muted-foreground">{resource.type}</div>
                      </div>
                      <Button size="sm" variant="outline" asChild>
                        <a href={resource.url} target="_blank" rel="noopener noreferrer">
                          {t('common.view')}
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('tasks.noResources')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}