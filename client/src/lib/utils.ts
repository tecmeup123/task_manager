import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? format(parsedDate, 'MM/dd/yyyy') : '';
  } catch (error) {
    return '';
  }
}

export function formatTime(duration: string | null | undefined): string {
  if (!duration) return '';
  
  // Duration format is expected to be "h:mm:ss"
  return duration;
}

export function getWeekNumber(week: string): number {
  const match = week.match(/-?(\d+)/);
  if (!match) return 0;
  
  const num = parseInt(match[0], 10);
  return num;
}

export function getInitials(name: string): string {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

export function getStatusColor(status: string): {bg: string, text: string} {
  switch (status) {
    case 'Done':
      return { bg: 'bg-green-500', text: 'text-white' };
    case 'In Progress':
      return { bg: 'bg-amber-500', text: 'text-white' };
    case 'Pending':
      return { bg: 'bg-amber-500', text: 'text-white' };
    default:
      return { bg: 'bg-neutral-300', text: 'text-neutral-700' };
  }
}

export function getWeekStatusColor(status: string): {bg: string, text: string} {
  switch (status) {
    case 'CURRENT WEEK':
      return { bg: 'bg-primary', text: 'text-white' };
    case 'PAST WEEKS':
    case 'FUTURE WEEKS':
      return { bg: 'bg-neutral-200', text: 'text-neutral-700' };
    default:
      return { bg: 'bg-neutral-200', text: 'text-neutral-700' };
  }
}

export function getEditionCode(year: number, month: number, variant: 'A' | 'B'): string {
  const yearStr = year.toString().slice(-2);
  const monthStr = month.toString().padStart(2, '0');
  return `${yearStr}${monthStr}-${variant}`;
}

export function getWeekStatus(weekLabel: string, currentWeek: number): string {
  const weekNum = getWeekNumber(weekLabel);
  
  if (weekNum < currentWeek) {
    return 'PAST WEEKS';
  } else if (weekNum === currentWeek) {
    return 'CURRENT WEEK';
  } else {
    return 'FUTURE WEEKS';
  }
}

export function sortWeeks(weeks: string[]): string[] {
  return weeks.sort((a, b) => {
    const aNum = getWeekNumber(a);
    const bNum = getWeekNumber(b);
    return aNum - bNum;
  });
}

export function getTaskCountByWeek(tasks: any[], week: string): number {
  return tasks.filter(task => task.week === week).length;
}

export function getWeekCompletionStatus(tasks: any[], week: string): string {
  const weekTasks = tasks.filter(task => task.week === week);
  
  if (weekTasks.length === 0) return 'Not Started';
  
  const completedTasks = weekTasks.filter(task => task.status === 'Done');
  const pendingTasks = weekTasks.filter(task => 
    task.status !== 'Done' && task.status !== 'Not Started'
  );
  
  if (completedTasks.length === weekTasks.length) {
    return 'Complete';
  } else if (completedTasks.length > 0 || pendingTasks.length > 0) {
    return 'In Progress';
  } else {
    return 'Not Started';
  }
}

export function getTasksByWeek(tasks: any[]): Record<string, any[]> {
  const result: Record<string, any[]> = {};
  
  tasks.forEach(task => {
    if (!result[task.week]) {
      result[task.week] = [];
    }
    result[task.week].push(task);
  });
  
  return result;
}

export function getAllWeeks(): string[] {
  const weeks = [];
  
  // Add negative weeks (-5 to -1)
  for (let i = 5; i >= 1; i--) {
    weeks.push(`-${i}`);
  }
  
  // Add positive weeks (1 to 8)
  for (let i = 1; i <= 8; i++) {
    weeks.push(`${i}`);
  }
  
  return weeks;
}

export function getCurrentWeek(edition: any): number {
  return edition?.currentWeek || 5; // Default to week 5 if not specified
}
