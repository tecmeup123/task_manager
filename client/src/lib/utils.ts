import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isValid, isBefore, isAfter, isToday, addDays, differenceInDays, formatDistance } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely parses a date from various formats
 * @param date Date to parse (can be string, Date object, or null/undefined)
 * @returns A valid Date object or null if parsing fails
 */
export function parseDate(date: Date | string | null | undefined): Date | null {
  if (!date) return null;
  
  try {
    const parsedDate = typeof date === 'string' ? parseISO(date) : date;
    return isValid(parsedDate) ? parsedDate : null;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
}

/**
 * Formats a date using a specified format pattern
 * @param date Date to format (can be string, Date object, or null/undefined)
 * @param formatPattern Format pattern to use (defaults to MM/dd/yyyy)
 * @returns Formatted date string, or empty string if date is invalid
 */
export function formatDate(
  date: Date | string | null | undefined, 
  formatPattern: string = 'MM/dd/yyyy'
): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  try {
    return format(parsedDate, formatPattern);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Returns a relative date description (e.g., "today", "yesterday", "in 3 days", "5 days ago")
 * @param date Date to describe
 * @returns Relative description of the date
 */
export function getRelativeDateDescription(date: Date | string | null | undefined): string {
  const parsedDate = parseDate(date);
  if (!parsedDate) return '';
  
  try {
    const now = new Date();
    
    if (isToday(parsedDate)) {
      return 'Today';
    }
    
    const daysDifference = differenceInDays(parsedDate, now);
    
    if (daysDifference === 1) {
      return 'Tomorrow';
    } else if (daysDifference === -1) {
      return 'Yesterday';
    } else if (daysDifference > 1 && daysDifference <= 7) {
      return `In ${daysDifference} days`;
    } else if (daysDifference < -1 && daysDifference >= -7) {
      return `${Math.abs(daysDifference)} days ago`;
    } else {
      return formatDistance(parsedDate, now, { addSuffix: true });
    }
  } catch (error) {
    console.error('Error getting relative date:', error);
    return formatDate(date);
  }
}

/**
 * Checks if a date is overdue (before today)
 * @param date Date to check
 * @returns True if the date is before today, false otherwise
 */
export function isDateOverdue(date: Date | string | null | undefined): boolean {
  const parsedDate = parseDate(date);
  if (!parsedDate) return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for accurate comparison
    return isBefore(parsedDate, today);
  } catch (error) {
    console.error('Error checking if date is overdue:', error);
    return false;
  }
}

/**
 * Checks if a date is upcoming (within the next specified number of days)
 * @param date Date to check
 * @param daysWindow Number of days to consider "upcoming"
 * @returns True if the date is within the upcoming window, false otherwise
 */
export function isDateUpcoming(
  date: Date | string | null | undefined, 
  daysWindow: number = 7
): boolean {
  const parsedDate = parseDate(date);
  if (!parsedDate) return false;
  
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    const futureLimit = addDays(today, daysWindow);
    futureLimit.setHours(23, 59, 59, 999); // Set to end of day
    
    return !isBefore(parsedDate, today) && !isAfter(parsedDate, futureLimit);
  } catch (error) {
    console.error('Error checking if date is upcoming:', error);
    return false;
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

export function getStatusColor(status: string): {bg: "default" | "destructive" | "outline" | "secondary" | "success", text: string} {
  switch (status) {
    case 'Done':
      return { bg: "success", text: 'text-white' };
    case 'In Progress':
      return { bg: "default", text: 'text-white' };
    case 'Pending':
      return { bg: "secondary", text: 'text-neutral-900' };
    default:
      return { bg: "outline", text: 'text-neutral-700' };
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

/**
 * Calculate the current week number based on today's date relative to the training start date
 * @param currentDate The current date to use for calculation
 * @param startDate The training start date
 * @returns The current week number (-5 to 8)
 */
export function getCurrentWeekFromDate(currentDate: Date, startDate: Date): number {
  const start = new Date(startDate);
  const current = new Date(currentDate);
  
  // Calculate the difference in days
  const diffTime = current.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  // Calculate the difference in weeks
  const diffWeeks = Math.floor(diffDays / 7);
  
  // Before the start date: weeks -5 to -1
  if (diffDays < 0) {
    // If more than 5 weeks before start, default to week -5
    const negativeWeek = Math.max(-5, Math.ceil(diffDays / 7));
    return negativeWeek;
  }
  
  // After the start date: weeks 1 to 8
  const positiveWeek = Math.min(8, diffWeeks + 1);
  return positiveWeek;
}

/**
 * Add business days to a date (skipping weekends)
 * @param date The starting date
 * @param days Number of business days to add
 * @returns A new date with the business days added
 */
export function addBusinessDays(date: Date, days: number): Date {
  const result = new Date(date);
  let daysAdded = 0;
  
  while (daysAdded < days) {
    // Move to the next day
    result.setDate(result.getDate() + 1);
    
    // Skip weekends (0 = Sunday, 6 = Saturday)
    const dayOfWeek = result.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      daysAdded++;
    }
  }
  
  return result;
}

/**
 * Calculate a due date based on week number and the training start date
 * @param week Week number (e.g., "-5", "2", etc.)
 * @param trainingStartDate The start date of the training
 * @returns The calculated due date
 */
export function calculateTaskDueDate(week: string, trainingStartDate: Date): Date {
  const weekNum = getWeekNumber(week);
  const startDate = new Date(trainingStartDate);
  
  // Tasks are generally due 5 business days before the week starts
  // For week -5, that's 5 weeks before training start + 5 business days earlier
  // For week 1, that's the training start date - 5 business days
  
  // First, calculate when this week starts relative to the training start date
  let weekStartDate: Date;
  if (weekNum <= 0) {
    // For negative weeks (pre-training preparation), go back from training start
    weekStartDate = new Date(startDate);
    weekStartDate.setDate(weekStartDate.getDate() + (weekNum * 7));
  } else {
    // For positive weeks (during training), go forward from training start
    weekStartDate = new Date(startDate);
    weekStartDate.setDate(weekStartDate.getDate() + ((weekNum - 1) * 7));
  }
  
  // Then go back 5 business days to set the due date
  // This ensures the task is completed before the week starts
  const dueDate = new Date(weekStartDate);
  dueDate.setDate(dueDate.getDate() - 7); // Go back 1 week
  
  return dueDate;
}
