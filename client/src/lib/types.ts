// Task activity history related types
export interface AuditLogResponse {
  id: number;
  userId: number;
  entityType: string;
  entityId: number;
  action: string;
  timestamp: string;
  previousState: any;
  newState: any;
  notes: string | null;
  username?: string; // Added by the API
}

export interface ActivityHistoryItem {
  action: string;
  timestamp: Date;
  username: string;
}

// Enhanced Date utilities
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

export function parseTimestamp(timestamp: any): Date | null {
  if (!timestamp) return null;
  
  try {
    // Handle string timestamps
    if (typeof timestamp === 'string') {
      const parsedDate = new Date(timestamp);
      return isValidDate(parsedDate) ? parsedDate : null;
    }
    
    // Handle Date objects
    if (timestamp instanceof Date) {
      return isValidDate(timestamp) ? timestamp : null;
    }
    
    // Handle numeric timestamps
    if (typeof timestamp === 'number') {
      const parsedDate = new Date(timestamp);
      return isValidDate(parsedDate) ? parsedDate : null;
    }
  } catch (e) {
    console.error('Error parsing timestamp:', e);
  }
  
  return null;
}