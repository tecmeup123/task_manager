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
      className={`task-row grid grid-cols-12 gap-2 p-3 border-t border-neutral-200 text-sm cursor-pointer ${
        isCurrentWeek 
          ? 'hover:bg-primary hover:bg-opacity-5' 
          : 'hover:bg-neutral-50'
      }`}
      onClick={onClick}
    >
      <div className="col-span-2 md:col-span-1 flex items-center">
        {task.taskCode}
      </div>
      
      <div className="col-span-3 md:col-span-2 flex items-center">
        {task.week}
      </div>
      
      <div className="col-span-7 md:col-span-4 flex items-center">
        {task.name}
      </div>
      
      <div className="hidden md:flex md:col-span-1 items-center">
        {formattedDuration}
      </div>
      
      <div className="hidden md:flex md:col-span-1 items-center">
        {formattedDueDate}
      </div>
      
      <div className="hidden md:flex md:col-span-1 items-center">
        {task.trainingType}
      </div>
      
      <div className="hidden md:flex md:col-span-1 items-center">
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
      
      <div className="hidden md:flex md:col-span-1 items-center">
        <Badge
          className={`${statusColors.bg} ${statusColors.text} font-normal`}
        >
          {task.status}
        </Badge>
      </div>
    </div>
  );
}
