import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEditionSchema, insertTaskSchema, taskStatusEnum } from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api
  const apiRouter = app.route("/api");

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
      
      const updatedEdition = await storage.updateEdition(id, req.body);
      res.json(updatedEdition);
    } catch (error) {
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
      const task = await storage.getTask(id);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      
      // If status is being updated to "Done", add completion date if not provided
      if (req.body.status === "Done" && !req.body.completionDate) {
        req.body.completionDate = new Date();
      }
      
      const updatedTask = await storage.updateTask(id, req.body);
      res.json(updatedTask);
    } catch (error) {
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

  const httpServer = createServer(app);
  return httpServer;
}
