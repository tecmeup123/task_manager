import { useState, useEffect, FormEvent } from "react";
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
  CheckCircle,
  Plus,
  Trash,
  X,
  Link
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
  
  // Form states
  const [form, setForm] = useState({
    status: "",
    assignedUserId: null as number | null,
    notes: "",
    completionDate: null as string | null,
  });
  
  // Comment form state
  const [commentForm, setCommentForm] = useState({
    content: ""
  });
  
  // Resource form state
  const [resourceForm, setResourceForm] = useState({
    name: "",
    url: "",
    type: "link"
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
  
  // Fetch task audit logs/history
  const { 
    data: auditLogs = [], 
    isLoading: isAuditLogsLoading 
  } = useQuery<any[]>({
    queryKey: [`/api/audit-logs/task/${taskId}`],
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
  
  // Add comment mutation
  const addCommentMutation = useMutation({
    mutationFn: async (comment: { content: string }) => {
      const response = await apiRequest('POST', `/api/tasks/${taskId}/comments`, comment);
      return response.json();
    },
    onSuccess: () => {
      // Clear form and invalidate comments query
      setCommentForm({ content: "" });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/comments`] });
      
      toast({
        title: t('tasks.commentAdded'),
        description: t('tasks.commentAddedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('tasks.commentError'),
        description: error.message || t('tasks.commentErrorDescription'),
        variant: "destructive",
      });
    }
  });
  
  // Add resource mutation
  const addResourceMutation = useMutation({
    mutationFn: async (resource: { name: string, url: string, type: string }) => {
      const response = await apiRequest('POST', `/api/tasks/${taskId}/resources`, resource);
      return response.json();
    },
    onSuccess: () => {
      // Clear form and invalidate resources query
      setResourceForm({ name: "", url: "", type: "link" });
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/resources`] });
      
      toast({
        title: t('tasks.resourceAdded'),
        description: t('tasks.resourceAddedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('tasks.resourceError'),
        description: error.message || t('tasks.resourceErrorDescription'),
        variant: "destructive",
      });
    }
  });
  
  // Delete resource mutation
  const deleteResourceMutation = useMutation({
    mutationFn: async (resourceId: number) => {
      await apiRequest('DELETE', `/api/tasks/${taskId}/resources/${resourceId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tasks/${taskId}/resources`] });
      
      toast({
        title: t('tasks.resourceDeleted'),
        description: t('tasks.resourceDeletedDescription'),
      });
    },
    onError: (error) => {
      toast({
        title: t('tasks.deleteError'),
        description: error.message || t('tasks.deleteErrorDescription'),
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
          <TabsTrigger value="history">{t('tasks.tabHistory')}</TabsTrigger>
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
              ) : (
                <>
                  {comments.length > 0 ? (
                    <div className="space-y-4 mb-6">
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
                    <p className="text-center text-muted-foreground py-8 mb-4">
                      {t('tasks.noComments')}
                    </p>
                  )}
                  
                  {/* Add comment form */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-2">{t('tasks.addComment')}</h3>
                    <form 
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (commentForm.content.trim()) {
                          addCommentMutation.mutate(commentForm);
                        }
                      }}
                    >
                      <Textarea 
                        value={commentForm.content}
                        onChange={(e) => setCommentForm({ content: e.target.value })}
                        placeholder={t('tasks.commentPlaceholder')}
                        rows={3}
                        required
                      />
                      <Button 
                        type="submit"
                        disabled={addCommentMutation.isPending || !commentForm.content.trim()}
                      >
                        {addCommentMutation.isPending ? (
                          <>{t('common.saving')}...</>
                        ) : (
                          <>
                            <MessageSquare className="mr-2 h-4 w-4" /> {t('tasks.addComment')}
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </>
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
              ) : (
                <>
                  {resources.length > 0 ? (
                    <div className="space-y-2 mb-6">
                      {resources.map(resource => (
                        <div key={resource.id} className="flex items-center p-3 border rounded-md">
                          <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="flex-1">
                            <div className="font-medium">{resource.name}</div>
                            <div className="text-sm text-muted-foreground">{resource.type}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" asChild>
                              <a href={resource.url} target="_blank" rel="noopener noreferrer">
                                <Link className="h-4 w-4 mr-1" /> {t('common.view')}
                              </a>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="text-destructive hover:text-destructive" 
                              onClick={() => deleteResourceMutation.mutate(resource.id)}
                              disabled={deleteResourceMutation.isPending}
                            >
                              <Trash className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 mb-4">
                      {t('tasks.noResources')}
                    </p>
                  )}
                  
                  {/* Add resource form */}
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-medium mb-2">{t('tasks.addResource')}</h3>
                    <form 
                      className="space-y-4"
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (resourceForm.name.trim() && resourceForm.url.trim()) {
                          addResourceMutation.mutate(resourceForm);
                        }
                      }}
                    >
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="resourceName">{t('tasks.resourceName')}</Label>
                          <Input
                            id="resourceName"
                            value={resourceForm.name}
                            onChange={(e) => setResourceForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder={t('tasks.resourceNamePlaceholder')}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="resourceUrl">{t('tasks.resourceUrl')}</Label>
                          <Input
                            id="resourceUrl"
                            value={resourceForm.url}
                            onChange={(e) => setResourceForm(prev => ({ ...prev, url: e.target.value }))}
                            placeholder={t('tasks.resourceUrlPlaceholder')}
                            required
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="resourceType">{t('tasks.resourceType')}</Label>
                          <Select
                            value={resourceForm.type}
                            onValueChange={(value) => setResourceForm(prev => ({ ...prev, type: value }))}
                          >
                            <SelectTrigger>
                              <SelectValue>{resourceForm.type}</SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="link">{t('tasks.resourceTypeLink')}</SelectItem>
                              <SelectItem value="document">{t('tasks.resourceTypeDocument')}</SelectItem>
                              <SelectItem value="video">{t('tasks.resourceTypeVideo')}</SelectItem>
                              <SelectItem value="image">{t('tasks.resourceTypeImage')}</SelectItem>
                              <SelectItem value="other">{t('tasks.resourceTypeOther')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button 
                        type="submit"
                        disabled={addResourceMutation.isPending || !resourceForm.name.trim() || !resourceForm.url.trim()}
                      >
                        {addResourceMutation.isPending ? (
                          <>{t('common.saving')}...</>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" /> {t('tasks.addResource')}
                          </>
                        )}
                      </Button>
                    </form>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <History className="mr-2 h-5 w-5" /> {t('tasks.history')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isAuditLogsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-5 w-40" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  {auditLogs.length > 0 ? (
                    <div className="space-y-4">
                      {auditLogs.map((log, index) => {
                        // Find the user who made the change
                        const user = users.find(u => u.id === log.userId);
                        
                        // Determine which fields were changed
                        const changes = [];
                        if (log.previousState && log.newState) {
                          // Check for status change
                          if (log.previousState.status !== log.newState.status) {
                            changes.push({
                              field: t('tasks.status'),
                              from: log.previousState.status || t('common.none'),
                              to: log.newState.status || t('common.none')
                            });
                          }
                          
                          // Check for assigned user change
                          if (log.previousState.assignedUserId !== log.newState.assignedUserId) {
                            const previousUser = users.find(u => u.id === log.previousState.assignedUserId);
                            const newUser = users.find(u => u.id === log.newState.assignedUserId);
                            
                            changes.push({
                              field: t('tasks.assignedTo'),
                              from: previousUser ? (previousUser.fullName || previousUser.username) : t('common.none'),
                              to: newUser ? (newUser.fullName || newUser.username) : t('common.none')
                            });
                          }
                          
                          // Check for notes change
                          if (log.previousState.notes !== log.newState.notes) {
                            changes.push({
                              field: t('tasks.notes'),
                              from: log.previousState.notes || t('common.none'),
                              to: log.newState.notes || t('common.none')
                            });
                          }
                          
                          // Check for completion date change
                          if (log.previousState.completionDate !== log.newState.completionDate) {
                            changes.push({
                              field: t('tasks.completionDate'),
                              from: log.previousState.completionDate ? formatDate(log.previousState.completionDate) : t('common.none'),
                              to: log.newState.completionDate ? formatDate(log.newState.completionDate) : t('common.none')
                            });
                          }
                        }
                        
                        return (
                          <div key={log.id} className="border rounded-md p-4">
                            <div className="flex justify-between mb-3">
                              <span className="font-medium">
                                {user ? (user.fullName || user.username) : t('common.unknownUser')}
                              </span>
                              <span className="text-sm text-muted-foreground">
                                {formatDate(log.timestamp)}
                              </span>
                            </div>
                            
                            <div className="text-sm">
                              <p className="mb-2">
                                <span className="font-medium">{t(`tasks.action.${log.action}`)}</span>
                                {log.action === 'update' && changes.length > 0 && (
                                  <>
                                    <span>: {t('tasks.changedFields')}</span>
                                    <ul className="mt-2 space-y-2 pl-6">
                                      {changes.map((change, i) => (
                                        <li key={i} className="list-disc">
                                          <span className="font-medium">{change.field}:</span> {change.from} → {change.to}
                                        </li>
                                      ))}
                                    </ul>
                                  </>
                                )}
                              </p>
                              {log.notes && <p className="italic text-muted-foreground">{log.notes}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {t('tasks.noHistory')}
                    </p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}