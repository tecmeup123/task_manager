import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEditionSchema, insertTaskSchema, insertTrainerSchema, taskStatusEnum, trainerStatusEnum } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, hashPassword, comparePasswords } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
    const uploadDir = path.join(process.cwd(), "public/uploads/avatars");
    // Ensure the directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
    // Generate a unique filename with timestamp and user ID
    const userId = (req as any).user?.id || "unknown";
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname).toLowerCase();
    cb(null, `avatar-${userId}-${timestamp}${fileExt}`);
  }
});

// Set up multer with file filters
const avatarUpload = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept only image files
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."));
    }
  }
});

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Middleware to check for admin role
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin role required" });
  }
  next();
}

// Middleware to check for editor or admin role
function requireEditor(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  if (req.user.role !== "editor" && req.user.role !== "admin") {
    return res.status(403).json({ message: "Editor or Admin role required" });
  }
  next();
}

// Middleware for audit logging
function createAuditLog(entityType: string, action: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return next();
    }
    
    // Store the original response methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override json method to capture response
    res.json = function(body) {
      // Try to identify the entity ID - specific handling for different routes
      let entityId: number | undefined;
      
      if (req.params.id) {
        entityId = parseInt(req.params.id);
      } else if (body && body.id) {
        entityId = body.id;
      }
      
      // Only log if we have an entity ID
      if (entityId) {
        const auditLog = {
          userId: req.user.id,
          entityType,
          entityId,
          action,
          previousState: req.method === 'PATCH' || req.method === 'DELETE' ? req.body.previousState : null,
          newState: req.method === 'POST' || req.method === 'PATCH' ? body : null,
          notes: `${action} ${entityType} by ${req.user.username}`
        };
        
        // Log to audit log asynchronously (don't wait for completion)
        storage.createAuditLog(auditLog)
          .catch(err => console.error('Error creating audit log:', err));
      }
      
      // Call the original method
      return originalJson.call(res, body);
    };
    
    // Override send method (for DELETE responses)
    res.send = function(body) {
      if (req.method === 'DELETE' && req.params.id) {
        const auditLog = {
          userId: req.user.id,
          entityType,
          entityId: parseInt(req.params.id),
          action,
          previousState: null,
          newState: null,
          notes: `${action} ${entityType} by ${req.user.username}`
        };
        
        // Log to audit log asynchronously
        storage.createAuditLog(auditLog)
          .catch(err => console.error('Error creating audit log:', err));
      }
      
      // Call the original method
      return originalSend.call(res, body);
    };
    
    next();
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Serve static files from the uploads directory
  const uploadDir = path.join(process.cwd(), "public/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  app.use('/uploads', express.static(uploadDir));
  
  // Set up authentication
  setupAuth(app);
  
  // Note: The uploads directory is already served at line 153
  
  // Notification endpoints
  app.get("/api/notifications", requireAuth, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const includeRead = req.query.includeRead === 'true';
      const userId = req.user!.id;
      
      console.log(`Fetching notifications for user ${userId}, limit: ${limit}, includeRead: ${includeRead}`);
      const notifications = await storage.getUserNotifications(userId, limit, includeRead);
      console.log(`Found ${notifications.length} notifications for user ${userId}`);
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });
  
  // Test endpoint to create a notification (for debugging)
  app.post("/api/notifications/test", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      
      // Find a valid task to use as entity
      const tasks = await storage.getAllTasks();
      const task = tasks.length > 0 ? tasks[0] : null;
      
      // Create a test notification
      const notification = await storage.createNotification({
        userId,
        type: "task_assigned",
        title: "Test Notification",
        message: "This is a test notification created at " + new Date().toLocaleTimeString(),
        entityType: "task",
        entityId: task ? task.id : 1,
        actionUrl: task ? `/tasks?editionId=${task.editionId}&taskId=${task.id}` : "/tasks",
        metadata: { 
          test: true, 
          timestamp: new Date().toISOString(),
          created_by: "admin"
        }
      });
      
      console.log("Created test notification:", notification);
      res.json({ success: true, notification });
    } catch (error) {
      console.error("Error creating test notification:", error);
      res.status(500).json({ message: "Failed to create test notification" });
    }
  });
  
  app.get("/api/notifications/count", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      const count = await storage.getUnreadNotificationCount(userId);
      res.json({ count });
    } catch (error) {
      console.error("Error counting notifications:", error);
      res.status(500).json({ message: "Failed to count notifications" });
    }
  });
  
  app.post("/api/notifications/mark-read/:id", requireAuth, async (req, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(notificationId);
      res.json(notification);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });
  
  app.post("/api/notifications/mark-all-read", requireAuth, async (req, res) => {
    try {
      const userId = req.user!.id;
      await storage.markAllNotificationsAsRead(userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Failed to mark all notifications as read" });
    }
  });
  
  // put application routes here
  // prefix all routes with /api
  const apiRouter = app.route("/api");
  
  // User profile endpoint
  app.get("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });
  
  // Update user profile
  app.patch("/api/user/profile", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const { fullName, email, avatarUrl, avatarColor, avatarShape, avatarIcon, avatarBackground } = req.body;
      
      // Get the current user for the audit log
      const currentUser = await storage.getUser(req.user.id);
      if (!currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update only the fields provided
      const updatedFields: any = {};
      if (fullName !== undefined) updatedFields.fullName = fullName;
      if (email !== undefined) updatedFields.email = email;
      if (avatarUrl !== undefined) updatedFields.avatarUrl = avatarUrl;
      if (avatarColor !== undefined) updatedFields.avatarColor = avatarColor;
      if (avatarShape !== undefined) updatedFields.avatarShape = avatarShape;
      if (avatarIcon !== undefined) updatedFields.avatarIcon = avatarIcon;
      if (avatarBackground !== undefined) updatedFields.avatarBackground = avatarBackground;
      
      // Skip update if no fields provided
      if (Object.keys(updatedFields).length === 0) {
        const { password, ...userWithoutPassword } = currentUser;
        return res.json(userWithoutPassword);
      }
      
      // Update the user profile
      const updatedUser = await storage.updateUser(req.user.id, updatedFields);
      
      // Create audit log for profile update
      await storage.createAuditLog({
        userId: req.user.id,
        entityType: "user",
        entityId: req.user.id,
        action: "update",
        previousState: { ...currentUser, password: "[REDACTED]" },
        newState: { ...updatedUser, password: "[REDACTED]" },
        notes: "User profile updated"
      });
      
      // Return updated user without password
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });
  
  // Upload avatar
  app.post("/api/user/avatar", avatarUpload.single('avatar'), async (req: Request & { file?: Express.Multer.File }, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Generate URL for the uploaded file
      const avatarUrl = `/uploads/avatars/${file.filename}`;
      
      // Update user with avatar URL
      const updatedUser = await storage.updateUser(req.user.id, { avatarUrl });
      
      // Create audit log for avatar upload
      await storage.createAuditLog({
        userId: req.user.id,
        entityType: "user",
        entityId: req.user.id,
        action: "update",
        previousState: { avatarUrl: (req.user as any).avatarUrl || null },
        newState: { avatarUrl },
        notes: "User avatar updated"
      });
      
      // Return success with the URL
      res.json({ 
        message: "Avatar uploaded successfully", 
        avatarUrl 
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);
      res.status(500).json({ message: "Failed to upload avatar" });
    }
  });
  
  // Change password endpoint has been moved to auth.ts to avoid duplicates

  // Audit Logs - admin can see all logs
  app.get("/api/audit-logs", requireAdmin, async (req, res) => {
    try {
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId ? Number(req.query.entityId) : undefined;
      
      const logs = await storage.getAuditLogs(entityType, entityId);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  
  // Entity-specific audit logs - accessible to all authenticated users
  app.get("/api/entity-audit-logs", async (req, res) => {
    try {
      // We don't require authentication for audit logs to make them visible on task detail modals
      // This makes them accessible from task detail modals even for non-logged in users
      
      const entityType = req.query.entityType as string;
      const entityId = req.query.entityId ? Number(req.query.entityId) : undefined;
      
      if (!entityType || !entityId) {
        return res.status(400).json({ message: "Entity type and ID are required" });
      }
      
      const logs = await storage.getAuditLogs(entityType, entityId);
      
      // Enhance the logs with username information
      const enhancedLogs = await Promise.all(logs.map(async (log) => {
        if (log.userId) {
          try {
            const user = await storage.getUser(log.userId);
            return {
              ...log,
              username: user ? (user.fullName || user.username) : "Unknown User"
            };
          } catch (err) {
            return {
              ...log,
              username: "Unknown User"
            };
          }
        }
        return {
          ...log,
          username: "System"
        };
      }));
      
      res.json(enhancedLogs);
    } catch (error) {
      console.error("Error fetching entity audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Get all editions
  app.get("/api/editions", async (req, res) => {
    try {
      // Converte o parâmetro includeArchived de string para booleano
      const includeArchived = req.query.includeArchived === 'true';
      const editions = await storage.getAllEditions(includeArchived);
      res.json(editions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch editions" });
    }
  });

  // Get a specific edition
  app.get("/api/editions/:id", async (req, res) => {
    try {
      const edition = await storage.getEdition(Number(req.params.id));
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      res.json(edition);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch edition" });
    }
  });

  // Create a new edition
  app.post("/api/editions", async (req, res) => {
    try {
      const editionData = insertEditionSchema.parse(req.body);
      const edition = await storage.createEdition(editionData);
      res.status(201).json(edition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating edition:", error);
      res.status(500).json({ message: "Failed to create edition" });
    }
  });
  
  // Create a new edition with template tasks
  app.post("/api/editions/with-template", async (req, res) => {
    try {
      // Log the received data for debugging
      console.log("Received data for edition with template:", req.body);
      
      // Ensure dates are properly formatted
      const formattedData = {
        ...req.body,
        startDate: req.body.startDate ? new Date(req.body.startDate) : new Date(),
        tasksStartDate: req.body.tasksStartDate ? new Date(req.body.tasksStartDate) : new Date()
      };
      
      console.log("Formatted data:", formattedData);
      
      // Validate edition data
      const editionData = insertEditionSchema.parse(formattedData);
      
      // Create the edition (set a temporary current week which we'll update later)
      const edition = await storage.createEdition(editionData);
      
      // Add template tasks to the new edition
      const { TASK_TEMPLATE } = await import("../client/src/lib/constants");
      const { calculateTaskDueDate, getCurrentWeekFromDate } = await import("../client/src/lib/utils");
      
      // Loop through all weeks and tasks in the template
      for (const [week, weekTasks] of Object.entries(TASK_TEMPLATE)) {
        for (const templateTask of weekTasks) {
          // Calculate due date based on week number and training start date
          const dueDate = calculateTaskDueDate(week.replace("Week ", ""), edition.startDate);
          
          // Create a task in the database for each template task
          const task = {
            editionId: edition.id,
            week,
            name: templateTask.name,
            taskCode: templateTask.taskCode,
            trainingType: templateTask.trainingType,
            status: "Not Started",
            duration: templateTask.duration || null,
            assignedTo: templateTask.assignedTo || null,
            owner: templateTask.owner || null,
            dueDate: dueDate,
            links: null,
            inflexible: false,
            notes: null
          };
          
          await storage.createTask(task);
        }
      }
      
      // Calculate current week based on today's date relative to the start date
      const today = new Date();
      const currentWeek = getCurrentWeekFromDate(today, edition.startDate);
      
      // Update the edition with the correct current week
      const updatedEdition = await storage.updateEdition(edition.id, { currentWeek });
      
      
      res.status(201).json(edition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating edition with template:", error);
      res.status(500).json({ message: "Failed to create edition" });
    }
  });

  // Update an edition
  app.patch("/api/editions/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const edition = await storage.getEdition(id);
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      
      // Create audit log for the edition update
      if (req.user) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "edition",
          entityId: id,
          action: "update",
          previousState: edition,
          newState: { ...edition, ...req.body },
          notes: `Edition ${edition.code} updated by ${req.user.username}`
        });
      }
      
      const updatedEdition = await storage.updateEdition(id, req.body);
      res.json(updatedEdition);
    } catch (error) {
      console.error("Error updating edition:", error);
      res.status(500).json({ message: "Failed to update edition" });
    }
  });

  // Delete an edition
  app.delete("/api/editions/:id", async (req, res) => {
    try {
      const result = await storage.deleteEdition(Number(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Edition not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete edition" });
    }
  });

  // Archive an edition
  app.patch("/api/editions/:id/archive", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const edition = await storage.getEdition(id);
      
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      
      // Create audit log
      if (req.isAuthenticated()) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "edition",
          entityId: id,
          action: "update",
          previousState: edition,
          newState: { ...edition, archived: true },
          notes: `Edition ${edition.code} archived by ${req.user.username}`
        });
      }
      
      const updatedEdition = await storage.updateEdition(id, { archived: true });
      res.json(updatedEdition);
    } catch (error) {
      console.error("Error archiving edition:", error);
      res.status(500).json({ message: "Failed to archive edition" });
    }
  });
  
  // Restore (unarchive) an edition
  app.patch("/api/editions/:id/restore", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const edition = await storage.getEdition(id);
      
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      
      // Create audit log
      if (req.isAuthenticated()) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "edition",
          entityId: id,
          action: "update",
          previousState: edition,
          newState: { ...edition, archived: false },
          notes: `Edition ${edition.code} restored from archive by ${req.user.username}`
        });
      }
      
      const updatedEdition = await storage.updateEdition(id, { archived: false });
      res.json(updatedEdition);
    } catch (error) {
      console.error("Error restoring edition:", error);
      res.status(500).json({ message: "Failed to restore edition" });
    }
  });

  // Duplicate an edition
  app.post("/api/editions/:id/duplicate", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const editionData = insertEditionSchema.parse(req.body);
      
      // Check if edition with the same code already exists
      const existingEdition = await storage.getEditionByCode(editionData.code);
      if (existingEdition) {
        return res.status(400).json({ message: "An edition with this code already exists" });
      }
      
      const newEdition = await storage.duplicateEdition(id, editionData);
      res.status(201).json(newEdition);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to duplicate edition" });
    }
  });

  // Get all tasks for an edition
  app.get("/api/editions/:id/tasks", async (req, res) => {
    try {
      const editionId = Number(req.params.id);
      const edition = await storage.getEdition(editionId);
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      
      // Se a edição estiver arquivada e não for explicitamente solicitado para incluí-la,
      // retorne um erro ou array vazio
      if (edition.archived) {
        return res.status(403).json({ message: "Cannot fetch tasks for archived editions" });
      }
      
      const week = req.query.week as string | undefined;
      
      let tasks;
      if (week) {
        tasks = await storage.getTasksByEditionAndWeek(editionId, week);
      } else {
        tasks = await storage.getTasksByEdition(editionId);
      }
      
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  // Get all tasks (for notifications and global search)
  app.get("/api/tasks", async (req, res) => {
    try {
      // Modifique a API para filtrar tarefas de edições arquivadas
      // Primeiro, obtenha todas as edições não arquivadas
      const activeEditions = await storage.getAllEditions(false); // false = não incluir arquivadas
      const activeEditionIds = activeEditions.map(edition => edition.id);
      
      const tasks = await storage.getAllTasks();
      
      // Filtre as tarefas para retornar apenas aquelas de edições ativas
      const filteredTasks = tasks.filter(task => activeEditionIds.includes(task.editionId));
      
      res.json(filteredTasks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });
  
  // Special route to update email/mailing terminology in task names
  app.post("/api/tasks/update-terminology", requireAuth, requireAdmin, async (req, res) => {
    try {
      // Define word/phrase replacements for flexibility
      const wordReplacements = [
        { search: /\be-learning\b/gi, replace: "self-learning" },
        { search: /\belearning\b/gi, replace: "self-learning" },
        { search: /\bE-Learning\b/g, replace: "Self-Learning" },
        { search: /\bElearning\b/g, replace: "Self-Learning" },
        { search: /\bemail\b/gi, replace: "resources" },
        { search: /\bmailing list\b/gi, replace: "participant list" },
        { search: /\bmailing\b/gi, replace: "participant resources" },
        { search: /\bsend mail\b/gi, replace: "announce" },
        { search: /\bsend reminder\b/gi, replace: "post reminder" }
      ];

      // Define exact replacements for entire task names
      const exactReplacements = [
        {
          search: "Send mail announcing start of the e-learning stage with Q&A sessions",
          replace: "Announce start of the self-learning stage with Q&A sessions"
        },
        { 
          search: "Send reminder about assignments due", 
          replace: "Post reminder about assignments due" 
        },
        {
          search: "Create mailing list (names; groups information; schedule; edition)",
          replace: "Create participant list (names; groups information; schedule; edition)"
        },
        {
          search: "Include links of the exam, mailing and edition folder to trainers",
          replace: "Include links of the exam, participant resources and edition folder to trainers"
        },
        {
          search: "Trainers should send changes in the e-learning assignment to Training Team",
          replace: "Trainers should send changes in the self-learning assignment to Training Team"
        },
        {
          search: "Send welcome to e-learning email",
          replace: "Send welcome to self-learning resources"
        },
        {
          search: "Update mailing list (names; groups information; schedule; edition)",
          replace: "Update participant list (names; groups information; schedule; edition)"
        },
        {
          search: "Verify if the e-learning group elements are correct",
          replace: "Verify if the self-learning group elements are correct"
        },
        {
          search: "Send Elearning Q&A Session invites",
          replace: "Send self-learning Q&A Session invites"
        }
      ];

      // Get all tasks
      const tasks = await storage.getAllTasks();
      let updatedCount = 0;

      // Update each task with the appropriate replacements
      for (const task of tasks) {
        if (!task.name) continue;

        let newName = task.name;
        let wasUpdated = false;
        
        // Check for exact matches first
        const exactMatch = exactReplacements.find(pair => 
          pair.search.toLowerCase() === task.name.toLowerCase()
        );
        
        // Log for debugging
        console.log(`Cleaning task data for update: ${task.id}`, {
          before: { name: task.name },
          after: { name: exactMatch ? exactMatch.replace : task.name }
        });

        if (exactMatch) {
          newName = exactMatch.replace;
          wasUpdated = true;
        } else {
          // Apply word replacements if no exact match
          for (const replacement of wordReplacements) {
            if (replacement.search.test(newName)) {
              newName = newName.replace(replacement.search, replacement.replace);
              wasUpdated = true;
            }
          }
        }
        
        // Update the task if changes were made
        if (wasUpdated && newName !== task.name) {
          console.log(`Updating task ${task.id}:`, {
            before: task.name,
            after: newName
          });
          await storage.updateTask(task.id, { name: newName });
          updatedCount++;
        }
      }

      res.json({ 
        success: true, 
        message: `Successfully updated ${updatedCount} tasks with new terminology.` 
      });
    } catch (error) {
      console.error("Error updating task terminology:", error);
      res.status(500).json({ success: false, message: "Error updating task terminology." });
    }
  });

  // Get a specific task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(Number(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verificar se a edição da tarefa está arquivada
      const edition = await storage.getEdition(task.editionId);
      if (edition && edition.archived) {
        return res.status(403).json({ message: "Task belongs to an archived edition" });
      }
      
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
    }
  });
  
  // Get task resources
  app.get("/api/tasks/:id/resources", requireAuth, async (req, res) => {
    try {
      const resources = await storage.getTaskResources(Number(req.params.id));
      res.json(resources);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task resources" });
    }
  });
  
  // Add a resource to a task
  app.post("/api/tasks/:id/resources", requireAuth, async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Since requireAuth middleware ensures req.user exists, we can safely assert it's non-null
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const resourceData = {
        taskId,
        uploadedBy: req.user.id,
        ...req.body
      };
      
      const resource = await storage.createResource(resourceData);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        entityType: "task",
        entityId: taskId,
        action: "update",
        notes: `Added resource: ${resource.name}`
      });
      
      res.status(201).json(resource);
    } catch (error) {
      res.status(500).json({ message: "Failed to add resource to task" });
    }
  });
  
  // Delete a resource
  app.delete("/api/resources/:id", requireAuth, async (req, res) => {
    try {
      const resourceId = Number(req.params.id);
      const resource = await storage.getResource(resourceId);
      
      if (!resource) {
        return res.status(404).json({ message: "Resource not found" });
      }
      
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      await storage.deleteResource(resourceId);
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        entityType: "task",
        entityId: resource.taskId,
        action: "update",
        notes: `Deleted resource: ${resource.name}`
      });
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete resource" });
    }
  });
  
  // Get task comments
  app.get("/api/tasks/:id/comments", requireAuth, async (req, res) => {
    try {
      const comments = await storage.getTaskComments(Number(req.params.id));
      
      // Enhance comments with user information
      const enhancedComments = await Promise.all(comments.map(async (comment) => {
        const user = await storage.getUser(comment.userId);
        return {
          ...comment,
          user: user ? {
            id: user.id,
            username: user.username,
            fullName: user.fullName
          } : null
        };
      }));
      
      res.json(enhancedComments);
    } catch (error) {
      console.error("Error fetching task comments:", error);
      res.status(500).json({ message: "Failed to fetch task comments" });
    }
  });
  
  // Add a comment to a task
  app.post("/api/tasks/:id/comments", requireAuth, async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTask(taskId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const commentData = {
        taskId,
        userId: req.user.id,
        content: req.body.content
      };
      
      const comment = await storage.createTaskComment(commentData);
      
      // Add user information to the response
      const enhancedComment = {
        ...comment,
        user: {
          id: req.user.id,
          username: req.user.username,
          fullName: req.user.fullName
        }
      };
      
      res.status(201).json(enhancedComment);
    } catch (error) {
      console.error("Error adding comment to task:", error);
      res.status(500).json({ message: "Failed to add comment to task" });
    }
  });
  
  // Delete a comment
  app.delete("/api/comments/:id", requireAuth, async (req, res) => {
    try {
      const commentId = Number(req.params.id);
      const comment = await storage.getTaskComment(commentId);
      
      if (!comment) {
        return res.status(404).json({ message: "Comment not found" });
      }
      
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      // Only the comment author or admins can delete comments
      if (comment.userId !== req.user.id && req.user.role !== "admin") {
        return res.status(403).json({ message: "Not authorized to delete this comment" });
      }
      
      await storage.deleteTaskComment(commentId);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete comment" });
    }
  });
  
  // Get user mentions
  app.get("/api/mentions", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const isRead = req.query.read === "true";
      const mentions = await storage.getUserMentions(req.user.id, isRead);
      res.json(mentions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch mentions" });
    }
  });
  
  // Mark mention as read
  app.patch("/api/mentions/:id/read", requireAuth, async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "User not authenticated" });
      }
      
      const mentionId = Number(req.params.id);
      const mention = await storage.markMentionAsRead(mentionId);
      res.json(mention);
    } catch (error) {
      res.status(500).json({ message: "Failed to mark mention as read" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      
      // Validate that the edition exists
      const edition = await storage.getEdition(taskData.editionId);
      if (!edition) {
        return res.status(404).json({ message: "Edition not found" });
      }
      
      // Não permitir a criação de tarefas em edições arquivadas
      if (edition.archived) {
        return res.status(403).json({ message: "Cannot create tasks for archived editions" });
      }
      
      // Verify assignedUserId is valid if provided and not null
      if (taskData.assignedUserId !== null && taskData.assignedUserId !== undefined) {
        const assignedUser = await storage.getUser(taskData.assignedUserId);
        if (!assignedUser) {
          return res.status(400).json({ 
            message: "Invalid user assignment. User does not exist.", 
            field: "assignedUserId" 
          });
        }
      }
      
      // Create audit log if user is authenticated
      if (req.isAuthenticated()) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "task",
          entityId: 0, // Will be updated after task creation
          action: "create",
          previousState: null,
          newState: taskData,
          notes: `New task "${taskData.name}" created for edition ${edition.code}`
        });
      }
      
      const task = await storage.createTask(taskData);
      
      // Create notification if task is assigned to a user
      if (req.isAuthenticated() && task.assignedUserId) {
        const editionCode = edition ? edition.code : "Unknown";
        
        // Create notification for the assigned user
        await storage.createNotification({
          userId: task.assignedUserId,
          type: "task_assigned",
          title: "New Task Assigned",
          message: `You have been assigned to a new task "${task.name}" (${editionCode})`,
          entityType: "task",
          entityId: task.id,
          actionUrl: `/tasks?editionId=${task.editionId}&taskId=${task.id}`,
          metadata: { taskId: task.id, editionId: task.editionId }
        });
      }
      
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  // Update a task
  app.patch("/api/tasks/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      console.log(`Updating task ${id} with data:`, req.body);
      
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verificar se a edição da tarefa está arquivada
      const edition = await storage.getEdition(task.editionId);
      if (edition && edition.archived) {
        return res.status(403).json({ message: "Cannot update tasks from archived editions" });
      }
      
      // Track assignment changes for notifications (user ID only)
      const previousAssignedUserId = task.assignedUserId;
      const newAssignedUserId = req.body.assignedUserId !== undefined ? req.body.assignedUserId : previousAssignedUserId;
      
      // Debug log for assignment changes
      console.log("Task assignment changes:", {
        previousAssignedUserId,
        newAssignedUserId
      });
      
      // Verify assignedUserId is valid if provided and not null
      if (newAssignedUserId !== null && newAssignedUserId !== undefined) {
        const assignedUser = await storage.getUser(newAssignedUserId);
        if (!assignedUser) {
          return res.status(400).json({ 
            message: "Invalid user assignment. User does not exist.", 
            field: "assignedUserId" 
          });
        }
      }
      
      // If status is being updated to "Done", add completion date if not provided
      if (req.body.status === "Done" && !req.body.completionDate) {
        req.body.completionDate = new Date();
      }
      
      // Handle task ownership changes per requirement:
      // 1. When a task has no owner and a user is assigned, that user becomes the owner
      // 2. When task is reassigned to another user, new assignee becomes the owner
      if (req.isAuthenticated() && req.user) {
        // If task status changes from "Not Started" to "In Progress" and has no owner, 
        // assign the authenticated user as owner
        if (task.status === "Not Started" && req.body.status === "In Progress" && (!task.owner || task.owner === "")) {
          console.log(`Setting current user ${req.user.username} as owner for task ${id} that's being started`);
          req.body.owner = req.user.username;
        }
        
        // If a user is explicitly assigned to the task, make that user the owner
        if (newAssignedUserId) {
          // Get the assigned user's information
          const assignedUser = await storage.getUser(newAssignedUserId);
          if (assignedUser) {
            console.log(`Updating task owner to ${assignedUser.username} for task ${id}`);
            req.body.owner = assignedUser.username;
          }
        }
      }
      
      // Convert dates if they are strings
      const updatedData = { ...req.body };
      if (typeof updatedData.dueDate === 'string') {
        updatedData.dueDate = new Date(updatedData.dueDate);
      }
      if (typeof updatedData.completionDate === 'string') {
        updatedData.completionDate = new Date(updatedData.completionDate);
      }
      
      // Create audit log before updating the task
      if (req.user) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "task",
          entityId: id,
          action: "update",
          previousState: task,
          newState: { ...task, ...updatedData },
          notes: `Task ${task.taskCode} (${task.name}) updated by ${req.user.username}`
        });
      }
      
      // Debug cleaning process
      console.log("Cleaning task data for update:", id, {
        before: task,
        after: updatedData
      });
      
      const updatedTask = await storage.updateTask(id, updatedData);
      console.log(`Task ${id} updated successfully:`, updatedTask);
      
      // Create notifications based on task updates
      if (req.isAuthenticated()) {
        // Get the edition details for notifications
        const edition = await storage.getEdition(task.editionId);
        const editionCode = edition ? edition.code : "Unknown";
        
        // If task is newly assigned to a user via assignedUserId
        if (newAssignedUserId && (previousAssignedUserId === null || newAssignedUserId !== previousAssignedUserId)) {
          // Create notification for the assigned user
          console.log("Creating task assignment notification for userId:", newAssignedUserId);
          await storage.createNotification({
            userId: newAssignedUserId,
            type: "task_assigned",
            title: "Task Assigned",
            message: `You have been assigned to task "${task.name}" (${editionCode})`,
            entityType: "task",
            entityId: task.id,
            actionUrl: `/tasks?editionId=${task.editionId}&taskId=${task.id}`,
            metadata: { taskId: task.id, editionId: task.editionId }
          });
        }
        
        // We've removed the assignedTo role-based assignment flow
        
        // If task status is changed to "Done"
        if (req.body.status === "Done" && task.status !== "Done") {
          // Check if we have a direct user ID assigned
          if (task.assignedUserId) {
            // Create completion notification for the assigned user
            await storage.createNotification({
              userId: task.assignedUserId,
              type: "task_completed",
              title: "Task Completed",
              message: `Task "${task.name}" has been marked as completed`,
              entityType: "task",
              entityId: task.id,
              actionUrl: `/tasks?editionId=${task.editionId}&taskId=${task.id}`,
              metadata: { taskId: task.id, editionId: task.editionId }
            });
          } 
          // We've removed the assignedTo role-based assignment flow
        }
        
        // If task is updated with changes other than assignment
        // Check if there are updates beyond assignment changes
        const hasNonAssignmentChanges = Object.keys(updatedData).some(key => 
          key !== 'assignedUserId');
          
        // Notify assigned user through assignedUserId
        if (hasNonAssignmentChanges && newAssignedUserId && newAssignedUserId === previousAssignedUserId) {
          // Only notify for other updates if the user was already assigned and not just now
          await storage.createNotification({
            userId: newAssignedUserId,
            type: "task_updated",
            title: "Task Updated",
            message: `Task "${task.name}" has been updated`,
            entityType: "task",
            entityId: task.id,
            actionUrl: `/tasks?editionId=${task.editionId}&taskId=${task.id}`,
            metadata: { taskId: task.id, editionId: task.editionId }
          });
        }
      }
      
      res.json(updatedTask);
    } catch (error) {
      console.error(`Error updating task ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const taskId = Number(req.params.id);
      const task = await storage.getTask(taskId);
      
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // Verificar se a edição da tarefa está arquivada
      const edition = await storage.getEdition(task.editionId);
      if (edition && edition.archived) {
        return res.status(403).json({ message: "Cannot delete tasks from archived editions" });
      }
      
      const result = await storage.deleteTask(taskId);
      
      // Create audit log if user is authenticated
      if (req.isAuthenticated()) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "task",
          entityId: taskId,
          action: "delete",
          previousState: task,
          newState: null,
          notes: `Task ${task.taskCode} (${task.name}) deleted by ${req.user.username}`
        });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Trainer routes
  // Get all trainers
  app.get("/api/trainers", async (req, res) => {
    try {
      const trainers = await storage.getAllTrainers();
      res.json(trainers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainers" });
    }
  });

  // Get a specific trainer
  app.get("/api/trainers/:id", async (req, res) => {
    try {
      const trainer = await storage.getTrainer(Number(req.params.id));
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.json(trainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch trainer" });
    }
  });

  // Create a new trainer
  app.post("/api/trainers", async (req, res) => {
    try {
      const trainerData = insertTrainerSchema.parse(req.body);
      const trainer = await storage.createTrainer(trainerData);
      res.status(201).json(trainer);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
      res.status(500).json({ message: "Failed to create trainer" });
    }
  });

  // Update a trainer
  app.patch("/api/trainers/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      const trainer = await storage.getTrainer(id);
      if (!trainer) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      
      const updatedTrainer = await storage.updateTrainer(id, req.body);
      res.json(updatedTrainer);
    } catch (error) {
      res.status(500).json({ message: "Failed to update trainer" });
    }
  });

  // Delete a trainer
  app.delete("/api/trainers/:id", async (req, res) => {
    try {
      const result = await storage.deleteTrainer(Number(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Trainer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete trainer" });
    }
  });

  // User management routes (admin only)
  // Get all users
  app.get("/api/users", async (req, res) => {
    // Check if user is authenticated
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    try {
      const users = await storage.getAllUsers();
      // Remove password field from response
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });
  
  // Create a new user (admin only)
  app.post("/api/users", requireAdmin, async (req, res) => {
    try {
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      // Set a generic initial password if not provided
      const initialPassword = req.body.password || "ChangeMe123!";
      
      // Hash password
      const hashedPassword = await hashPassword(initialPassword);
      
      // Admins are auto-approved, other users need approval
      const isAdmin = req.body.role === 'admin';
      
      // Create the user with appropriate flags
      const user = await storage.createUser({
        ...req.body,
        password: hashedPassword,
        forcePasswordChange: true, // Force password change on first login
        passwordChangeRequired: true, // Mark that password change is required
        approved: isAdmin // Automatically approve admins, regular users need approval
      });
      
      // Create audit log
      if (req.user) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "user",
          entityId: user.id,
          action: "create",
          previousState: null,
          newState: { ...user, password: "[REDACTED]" },
          notes: "User created by admin with generic password"
        });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });
  
  // Update a user (used for changing role)
  app.patch("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Don't allow changing user's own role (to prevent removing all admins)
      if (id === req.user?.id && req.body.role && req.body.role !== req.user.role) {
        return res.status(400).json({ message: "You cannot change your own role" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create audit log before updating
      if (req.user) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "user",
          entityId: id,
          action: "update",
          previousState: { ...user, password: "[REDACTED]" },
          newState: { ...user, ...req.body, password: "[REDACTED]" },
          notes: `User ${user.username} updated by ${req.user.username}`
        });
      }
      
      const updatedUser = await storage.updateUser(id, req.body);
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
    }
  });
  
  // Approve a user (admin only)
  app.post("/api/users/:id/approve", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create audit log before updating
      if (req.user) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "user",
          entityId: id,
          action: "update",
          previousState: { ...user, password: "[REDACTED]" },
          newState: { ...user, approved: true, password: "[REDACTED]" },
          notes: `User ${user.username} approved by ${req.user.username}`
        });
      }
      
      const updatedUser = await storage.updateUser(id, { approved: true });
      
      // Remove password from response
      const { password, ...safeUser } = updatedUser;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error approving user:", error);
      res.status(500).json({ message: "Failed to approve user" });
    }
  });
  
  // Delete a user (admin only)
  app.delete("/api/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = Number(req.params.id);
      
      // Não permitir que o usuário delete a si mesmo
      if (id === req.user?.id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }
      
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Não permitir deletar administradores
      if (user.role === 'admin') {
        return res.status(403).json({ message: "Administrator accounts cannot be deleted" });
      }
      
      // Verificar se o usuário tem tarefas atribuídas
      const tasks = await storage.getAllTasks();
      const userTasks = tasks.filter(task => task.assignedUserId === id);
      
      if (userTasks.length > 0) {
        return res.status(409).json({ 
          message: "Cannot delete user with assigned tasks. Please reassign or complete all tasks first.", 
          affectedTasks: userTasks 
        });
      }
      
      // Create audit log before deleting
      if (req.user) {
        await storage.createAuditLog({
          userId: req.user.id,
          entityType: "user",
          entityId: id,
          action: "delete",
          previousState: { ...user, password: "[REDACTED]" },
          newState: null,
          notes: `User ${user.username} deleted by ${req.user.username}`
        });
      }
      
      // Deletar o usuário
      const result = await storage.deleteUser(id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });
  
  // Audit logs routes
  // Get all audit logs endpoint is already defined above
  
  // TEMPORARY ENDPOINT: Make Telmo an admin (will be removed after use)
  app.get("/api/make-telmo-admin", async (req, res) => {
    try {
      // Find Telmo's user account
      const telmo = await storage.getUserByUsername("Telmo");
      if (!telmo) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update to admin role
      const updatedUser = await storage.updateUser(telmo.id, { role: "admin" });
      
      // Create audit log
      await storage.createAuditLog({
        userId: telmo.id,
        entityType: "user",
        entityId: telmo.id,
        action: "update",
        previousState: telmo,
        newState: updatedUser,
        notes: "Automatic role update to admin via temporary endpoint"
      });
      
      // Force refresh the session data
      if (req.user && req.user.id === telmo.id) {
        req.logout((err) => {
          if (err) {
            console.error("Error during logout", err);
            return res.status(500).json({ message: "Error refreshing session" });
          }
          
          req.login(updatedUser, (err) => {
            if (err) {
              console.error("Error during re-login", err);
              return res.status(500).json({ message: "Error refreshing session" });
            }
            
            res.json({ message: "User role updated to admin", user: { ...updatedUser, password: undefined } });
          });
        });
      } else {
        res.json({ message: "User role updated to admin", user: { ...updatedUser, password: undefined } });
      }
    } catch (error) {
      console.error("Error updating user role:", error);
      res.status(500).json({ message: "Failed to update user role" });
    }
  });
  
  // Get audit logs for a specific entity
  app.get("/api/audit-logs/:type/:id", requireEditor, async (req, res) => {
    try {
      const entityType = req.params.type;
      const entityId = Number(req.params.id);
      
      const logs = await storage.getAuditLogs(entityType, entityId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });

  // Note: Notification routes are defined earlier in this file
  
  // System backup and restore endpoints
  app.get("/api/system/backup", requireAdmin, async (req, res) => {
    try {
      // Collect all system data
      const users = await storage.getAllUsers();
      const trainers = await storage.getAllTrainers();
      const editions = await storage.getAllEditions();
      const tasks = await storage.getAllTasks();
      const auditLogs = await storage.getAuditLogs();
      
      // Create a backup object with metadata
      const backup = {
        metadata: {
          version: "1.0",
          timestamp: new Date().toISOString(),
          exportedBy: req.user!.id,
        },
        data: {
          users: users.map(user => ({
            ...user,
            // Don't include password hashes in export for security
            password: "[REDACTED]"
          })),
          trainers,
          editions,
          tasks,
          auditLogs
        }
      };
      
      // Send as a download with a timestamp filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      res.setHeader('Content-Disposition', `attachment; filename="training-system-backup-${timestamp}.json"`);
      res.setHeader('Content-Type', 'application/json');
      res.json(backup);
      
      // Log the export
      await storage.createAuditLog({
        action: "export",
        entityType: "system",
        entityId: 0,
        userId: req.user!.id,
        notes: "Full system backup exported",
        previousState: null,
        newState: null
      });
      
    } catch (error) {
      console.error("Export error:", error);
      res.status(500).json({ error: "Failed to export system data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
