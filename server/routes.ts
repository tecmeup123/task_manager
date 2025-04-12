import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEditionSchema, insertTaskSchema, insertTrainerSchema, taskStatusEnum, trainerStatusEnum } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, hashPassword, comparePasswords } from "./auth";

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
  // Set up authentication
  setupAuth(app);
  
  // put application routes here
  // prefix all routes with /api
  const apiRouter = app.route("/api");
  
  // Change password endpoint
  app.post("/api/change-password", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current password and new password are required" });
    }
    
    try {
      // Get the user from storage
      const user = await storage.getUser(req.user.id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Verify current password
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash the new password
      const hashedPassword = await hashPassword(newPassword);
      
      // Update user with new password and reset both password change flags
      const updatedUser = await storage.updateUser(user.id, {
        password: hashedPassword,
        forcePasswordChange: false,
        passwordChangeRequired: false, // Always set passwordChangeRequired to false
      });
      
      // Create audit log for password change
      await storage.createAuditLog({
        action: "update",
        entityType: "user",
        entityId: user.id,
        userId: user.id,
        previousState: { passwordChanged: false },
        newState: { passwordChanged: true },
        notes: "User changed password",
      });
      
      // Return the updated user without the password
      const { password, ...userWithoutPassword } = updatedUser;
      res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  // Audit Logs
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

  // Get all editions
  app.get("/api/editions", async (req, res) => {
    try {
      const editions = await storage.getAllEditions();
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

  // Get a specific task
  app.get("/api/tasks/:id", async (req, res) => {
    try {
      const task = await storage.getTask(Number(req.params.id));
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch task" });
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
      
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        return res.status(400).json({ message: validationError.message });
      }
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
      
      // If status is being updated to "Done", add completion date if not provided
      if (req.body.status === "Done" && !req.body.completionDate) {
        req.body.completionDate = new Date();
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
      
      const updatedTask = await storage.updateTask(id, updatedData);
      console.log(`Task ${id} updated successfully:`, updatedTask);
      res.json(updatedTask);
    } catch (error) {
      console.error(`Error updating task ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const result = await storage.deleteTask(Number(req.params.id));
      if (!result) {
        return res.status(404).json({ message: "Task not found" });
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
  app.get("/api/users", requireAdmin, async (req, res) => {
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
  
  // Audit logs routes
  // Get all audit logs
  app.get("/api/audit-logs", requireAdmin, async (req, res) => {
    try {
      const entityType = req.query.entityType as string | undefined;
      const entityId = req.query.entityId ? Number(req.query.entityId) : undefined;
      
      const logs = await storage.getAuditLogs(entityType, entityId);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ message: "Failed to fetch audit logs" });
    }
  });
  
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

  const httpServer = createServer(app);
  return httpServer;
}
