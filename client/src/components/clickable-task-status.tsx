import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { getStatusColor } from "@/lib/utils";
import { TASK_STATUS_OPTIONS } from "@/lib/constants";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

interface ClickableTaskStatusProps {
  task: any;
  className?: string;
}

export default function ClickableTaskStatus({ task, className }: ClickableTaskStatusProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Get current status colors
  const statusColors = getStatusColor(task.status);

  // Function to get the next status in the cycle
  const getNextStatus = (currentStatus: string): string | null => {
    const statuses = ["Not Started", "In Progress", "Done"];
    const currentIndex = statuses.indexOf(currentStatus);
    
    // If current status is "Done", return null to indicate we can't go further
    if (currentStatus === "Done") {
      return null;
    }
    
    // If the current status is not in our cycle list, start with "Not Started"
    if (currentIndex === -1) {
      return statuses[0];
    }
    
    // Otherwise return the next status
    return statuses[currentIndex + 1];
  };

  const handleStatusClick = async (e: React.MouseEvent) => {
    // Stop the click event from bubbling up to the parent element
    e.stopPropagation();
    
    if (isUpdating) return; // Prevent double-clicking

    // Check if the task is already completed
    if (task.status === "Done") {
      toast({
        title: "Task already completed",
        description: "This task is already marked as done. If needed, please create a new task.",
        variant: "destructive",
      });
      return;
    }

    // Get the next status in the cycle
    const nextStatus = getNextStatus(task.status);
    
    // If no next status, do nothing (this should not happen with our new logic)
    if (!nextStatus) return;
    
    try {
      setIsUpdating(true);
      
      // Determine if we should set a completion date
      const completionDate = nextStatus === "Done" ? new Date().toISOString() : null;
      
      // Update the task with the new status
      await apiRequest('PATCH', `/api/tasks/${task.id}`, {
        ...task,
        status: nextStatus,
        completionDate
      });
      
      // Salvar a posição de rolagem atual antes de atualizar
      const scrollPosition = window.scrollY;
      
      // Invalidate queries to refetch data, mas manter a posição na página
      queryClient.invalidateQueries({ 
        queryKey: ['/api/tasks'],
        refetchType: 'none' // Não refetch automático para controlar melhor a UX
      });
      
      queryClient.invalidateQueries({ 
        queryKey: [`/api/editions/${task.editionId}/tasks`],
        refetchType: 'none' // Não refetch automático para controlar melhor a UX
      });
      
      // Realizar o refetch manualmente e restaurar a posição de rolagem
      setTimeout(() => {
        queryClient.refetchQueries({ queryKey: ['/api/tasks'] }).then(() => {
          queryClient.refetchQueries({ queryKey: [`/api/editions/${task.editionId}/tasks`] }).then(() => {
            // Restaurar a posição de rolagem após o refetch
            window.scrollTo(0, scrollPosition);
          });
        });
      }, 100);
      
      toast({
        title: "Status updated",
        description: `Task status changed to ${nextStatus}`,
      });
    } catch (error) {
      console.error("Failed to update task status:", error);
      toast({
        title: "Error",
        description: "Failed to update task status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Wrapper to completely isolate badge from parent
  const handleBadgeClick = (e: React.MouseEvent) => {
    // Stop event from propagating up to parent elements
    e.stopPropagation();
    e.preventDefault();
    // Handle the status update
    handleStatusClick(e);
    // Return false to prevent default browser action
    return false;
  };

  // Determine if task is completed
  const isCompleted = task.status === "Done";
  
  return (
    <div className="inline-block" onClick={handleBadgeClick}>
      <Badge
        className={`
          ${statusColors.bg} 
          ${statusColors.text} 
          font-normal 
          ${isCompleted ? 'cursor-not-allowed opacity-90' : 'cursor-pointer hover:scale-105'} 
          transition-all 
          duration-200 
          ${className}
        `}
        title={isCompleted ? "This task is already completed" : "Click to change status"}
      >
        {isUpdating ? "Updating..." : task.status}
      </Badge>
    </div>
  );
}