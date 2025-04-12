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
      className="border-b border-neutral-200"
    >
      {/* Week Header */}
      <div 
        className="p-3 cursor-pointer bg-neutral-50 hover:bg-neutral-100"
        onClick={onToggleExpand}
      >
        <div className="flex flex-wrap items-center justify-between">
          <div className="flex items-center mr-2">
            {isExpanded ? (
              <ChevronDown 
                className="mr-2 flex-shrink-0 text-neutral-500" 
              />
            ) : (
              <ChevronRight 
                className="mr-2 flex-shrink-0 text-neutral-500" 
              />
            )}
            <span 
              className="font-medium whitespace-nowrap"
            >
              {week === "undefined" ? "Week Unknown" : `Week ${week}`}{weekStatus === 'CURRENT WEEK' ? " (Current)" : ""}
            </span>
          </div>
          
          <div className="flex items-center flex-wrap">
            <Badge 
              variant="outline" 
              className="mr-2 my-1 px-2 py-0.5 text-xs rounded-full bg-neutral-200 text-neutral-700"
            >
              {taskCount} {taskCount === 1 ? 'task' : 'tasks'}
            </Badge>
            <Badge 
              variant={
                completionStatus === 'Complete' ? 'success' : 
                completionStatus === 'In Progress' ? 'default' : 
                'secondary'
              }
              className="mr-2 my-1"
            >
              {weekStatus === 'CURRENT WEEK' ? 'Current' : completionStatus}
            </Badge>
            <MoreVertical className="h-4 w-4 text-neutral-500" />
          </div>
        </div>
      </div>

      {/* Week Tasks (show only if expanded) */}
      {isExpanded && tasks.map((task) => (
        <TaskRow 
          key={task.id} 
          task={task} 
          onClick={() => onTaskClick(task)}
          isCurrentWeek={false}
        />
      ))}
    </div>
  );
}
