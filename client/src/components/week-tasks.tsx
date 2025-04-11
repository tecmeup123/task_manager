import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, MoreVertical } from "lucide-react";
import TaskRow from "@/components/task-row";
import { getWeekStatus, getTaskCountByWeek, getWeekCompletionStatus } from "@/lib/utils";

interface WeekTasksProps {
  week: string;
  tasks: any[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onTaskClick: (task: any) => void;
  currentWeek: number;
}

export default function WeekTasks({
  week,
  tasks,
  isExpanded,
  onToggleExpand,
  onTaskClick,
  currentWeek,
}: WeekTasksProps) {
  // Get week status (PAST WEEKS, CURRENT WEEK, FUTURE WEEKS)
  const weekStatus = getWeekStatus(week, currentWeek);
  
  // Get completion status for the week
  const completionStatus = getWeekCompletionStatus(tasks, week);
  
  // Task count
  const taskCount = tasks.length;

  return (
    <div 
      className={`border-b border-neutral-200 ${weekStatus === 'CURRENT WEEK' ? 'bg-primary bg-opacity-5' : ''}`}
    >
      {/* Week Header */}
      <div 
        className={`grid grid-cols-12 gap-2 p-3 cursor-pointer ${
          weekStatus === 'CURRENT WEEK' 
            ? 'bg-primary bg-opacity-10 hover:bg-primary hover:bg-opacity-15' 
            : 'bg-neutral-50 hover:bg-neutral-100'
        }`}
        onClick={onToggleExpand}
      >
        <div className="col-span-11 flex items-center">
          {isExpanded ? (
            <ChevronDown 
              className={`mr-2 ${
                weekStatus === 'CURRENT WEEK' ? 'text-primary' : 'text-neutral-500'
              }`} 
            />
          ) : (
            <ChevronRight 
              className={`mr-2 ${
                weekStatus === 'CURRENT WEEK' ? 'text-primary' : 'text-neutral-500'
              }`} 
            />
          )}
          <span 
            className={`font-medium ${
              weekStatus === 'CURRENT WEEK' ? 'text-primary' : ''
            }`}
          >
            {week}{weekStatus === 'CURRENT WEEK' ? " (Current)" : ""}
          </span>
          <Badge 
            variant="outline" 
            className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
              weekStatus === 'CURRENT WEEK' ? 'bg-primary bg-opacity-20 text-primary' : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
          </Badge>
          <Badge 
            variant={completionStatus === 'Complete' ? 'success' : completionStatus === 'In Progress' ? 'warning' : 'secondary'} 
            className="ml-2"
          >
            {completionStatus}
          </Badge>
        </div>
        <div 
          className={`col-span-1 text-right ${
            weekStatus === 'CURRENT WEEK' ? 'text-primary' : 'text-neutral-500'
          }`}
        >
          <MoreVertical className="h-4 w-4 inline" />
        </div>
      </div>

      {/* Week Tasks (show only if expanded) */}
      {isExpanded && tasks.map((task) => (
        <TaskRow 
          key={task.id} 
          task={task} 
          onClick={() => onTaskClick(task)}
          isCurrentWeek={weekStatus === 'CURRENT WEEK'}
        />
      ))}
    </div>
  );
}
