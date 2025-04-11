import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDate, formatTime, getInitials, getStatusColor } from "@/lib/utils";

interface TaskRowProps {
  task: any;
  onClick: () => void;
  isCurrentWeek?: boolean;
}

export default function TaskRow({ task, onClick, isCurrentWeek = false }: TaskRowProps) {
  // Get status color styles
  const statusColors = getStatusColor(task.status);
  
  // Generate initials for the owner
  const ownerInitials = getInitials(task.owner || '');
  
  // Format the duration
  const formattedDuration = formatTime(task.duration);
  
  // Format the due date
  const formattedDueDate = formatDate(task.dueDate);

  return (
    <div 
      className={`task-row p-3 border-t border-neutral-200 text-sm cursor-pointer ${
        isCurrentWeek 
          ? 'hover:bg-primary hover:bg-opacity-5' 
          : 'hover:bg-neutral-50'
      }`}
      onClick={onClick}
    >
      {/* Desktop View */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-2">
        <div className="md:col-span-1 flex items-center">
          {task.taskCode}
        </div>
        
        <div className="md:col-span-2 flex items-center">
          {task.week}
        </div>
        
        <div className="md:col-span-4 flex items-center">
          {task.name}
        </div>
        
        <div className="md:col-span-1 flex items-center">
          {formattedDuration}
        </div>
        
        <div className="md:col-span-1 flex items-center">
          {formattedDueDate}
        </div>
        
        <div className="md:col-span-1 flex items-center">
          {task.trainingType}
        </div>
        
        <div className="md:col-span-1 flex items-center">
          {task.owner && (
            <span className="inline-flex items-center">
              <Avatar className="h-6 w-6 mr-1">
                <AvatarFallback className="bg-primary text-white text-xs">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{task.owner.split('\\')[0]}</span>
            </span>
          )}
        </div>
        
        <div className="md:col-span-1 flex items-center">
          <Badge
            className={`${statusColors.bg} ${statusColors.text} font-normal`}
          >
            {task.status}
          </Badge>
        </div>
      </div>
      
      {/* Mobile View */}
      <div className="md:hidden">
        <div className="grid grid-cols-12 gap-2 mb-2">
          <div className="col-span-3 flex items-center text-xs text-neutral-500">
            {task.taskCode}
          </div>
          
          <div className="col-span-3 flex items-center text-xs text-neutral-500">
            {task.week}
          </div>
          
          <div className="col-span-6 flex items-center justify-end">
            <Badge
              className={`${statusColors.bg} ${statusColors.text} font-normal text-xs`}
            >
              {task.status}
            </Badge>
          </div>
        </div>
        
        <div className="font-medium mb-1 line-clamp-2">
          {task.name}
        </div>
        
        <div className="flex flex-wrap items-center text-xs text-neutral-500 gap-2 mt-2">
          {task.owner && (
            <span className="inline-flex items-center mr-3">
              <Avatar className="h-5 w-5 mr-1">
                <AvatarFallback className="bg-primary text-white text-[10px]">
                  {ownerInitials}
                </AvatarFallback>
              </Avatar>
              <span>{task.owner.split('\\')[0]}</span>
            </span>
          )}
          
          {formattedDuration && (
            <span className="mr-3">
              Duration: {formattedDuration}
            </span>
          )}
          
          {formattedDueDate && (
            <span className="mr-3">
              Due: {formattedDueDate}
            </span>
          )}
          
          {task.trainingType && (
            <span>
              Type: {task.trainingType}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
