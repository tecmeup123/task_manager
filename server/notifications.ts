import { storage } from './storage';
import { addDays, isBefore, isAfter } from 'date-fns';

// Check for tasks with due dates approaching and create notifications
export async function checkDueDateNotifications() {
  try {
    // Get all tasks
    const allTasks = await storage.getAllTasks();
    const today = new Date();
    const threeDaysFromNow = addDays(today, 3);
    
    // Find tasks due in the next 3 days that are not completed
    const approachingTasks = allTasks.filter(task => {
      if (!task.dueDate || task.status === 'Done') return false;
      
      const dueDate = new Date(task.dueDate);
      return isAfter(dueDate, today) && isBefore(dueDate, threeDaysFromNow);
    });
    
    // Create notifications for assigned users
    for (const task of approachingTasks) {
      if (task.assignedUserId) {
        // Get the edition to include in the notification
        const edition = await storage.getEdition(task.editionId);
        const editionCode = edition ? edition.code : "Unknown";
        
        // Calculate days until due
        const dueDate = new Date(task.dueDate!);
        const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Create notification
        await storage.createNotification({
          userId: task.assignedUserId,
          type: "due_date_approaching",
          title: "Task Due Soon",
          message: `Task "${task.name}" (${editionCode}) is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}`,
          entityType: "task",
          entityId: task.id,
          actionUrl: `/tasks/${task.id}`,
          metadata: { taskId: task.id, editionId: task.editionId, daysUntilDue }
        });
      }
    }
    
    console.log(`Checked ${allTasks.length} tasks for approaching due dates, found ${approachingTasks.length}`);
  } catch (error) {
    console.error("Error checking for due date notifications:", error);
  }
}

// Simple function to run the check on a schedule
export function startNotificationScheduler() {
  // Run immediately on startup
  checkDueDateNotifications();
  
  // Then set interval to run every day
  const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;
  setInterval(() => {
    checkDueDateNotifications();
  }, TWENTY_FOUR_HOURS);
}