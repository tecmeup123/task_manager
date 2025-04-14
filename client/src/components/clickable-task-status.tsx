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
  const getNextStatus = (currentStatus: string): string => {
    const statuses = ["Not Started", "In Progress", "Done"];
    const currentIndex = statuses.indexOf(currentStatus);
    
    // If the current status is not in our cycle list or it's the last one, go back to the beginning
    if (currentIndex === -1 || currentIndex === statuses.length - 1) {
      return statuses[0];
    }
    
    // Otherwise return the next status
    return statuses[currentIndex + 1];
  };

  const handleStatusClick = async (e: React.MouseEvent) => {
    // Stop the click event from bubbling up to the parent element
    e.stopPropagation();
    
    if (isUpdating) return; // Prevent double-clicking

    // Get the next status in the cycle
    const nextStatus = getNextStatus(task.status);
    
    // If the status is the same, do nothing
    if (nextStatus === task.status) return;
    
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
      
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: [`/api/editions/${task.editionId}/tasks`] });
      
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

  return (
    <div className="inline-block" onClick={handleBadgeClick}>
      <Badge
        className={`${statusColors.bg} ${statusColors.text} font-normal cursor-pointer transition-all duration-200 hover:scale-105 ${className}`}
      >
        {isUpdating ? "Updating..." : task.status}
      </Badge>
    </div>
  );
}