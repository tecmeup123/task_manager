import { pgTable, text, serial, integer, boolean, timestamp, varchar, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Define user roles
export const roleEnum = z.enum(["admin", "editor", "viewer"]);
export type Role = z.infer<typeof roleEnum>;

// Expanded user model with roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name"),
  email: text("email"),
  role: text("role").default("viewer").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Trainer model
export const trainers = pgTable("trainers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  email: varchar("email", { length: 100 }),
  role: varchar("role", { length: 50 }),
  department: varchar("department", { length: 50 }),
  status: varchar("status", { length: 20 }).default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTrainerSchema = createInsertSchema(trainers).omit({
  id: true,
  createdAt: true,
});

export type InsertTrainer = z.infer<typeof insertTrainerSchema>;
export type Trainer = typeof trainers.$inferSelect;

// Training management models
export const editions = pgTable("editions", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 10 }).notNull().unique(),
  trainingType: varchar("training_type", { length: 10 }).notNull(),
  startDate: timestamp("start_date").notNull(),
  tasksStartDate: timestamp("tasks_start_date").notNull(),
  status: varchar("status", { length: 20 }).default("active"),
  currentWeek: integer("current_week").default(1),
});

export const insertEditionSchema = createInsertSchema(editions).omit({
  id: true,
  currentWeek: true,
  status: true,
});

export type InsertEdition = z.infer<typeof insertEditionSchema>;
export type Edition = typeof editions.$inferSelect;

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  editionId: integer("edition_id").notNull(),
  taskCode: varchar("task_code", { length: 20 }).notNull(),
  week: varchar("week", { length: 10 }).notNull(),
  name: text("name").notNull(),
  duration: varchar("duration", { length: 10 }),
  dueDate: timestamp("due_date"),
  trainingType: varchar("training_type", { length: 10 }).notNull(),
  links: text("links"),
  assignedTo: varchar("assigned_to", { length: 100 }),
  owner: varchar("owner", { length: 100 }),
  status: varchar("status", { length: 20 }).default("Not Started"),
  inflexible: boolean("inflexible").default(false),
  completionDate: timestamp("completion_date"),
  notes: text("notes"),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
});

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

// Status enum for tasks
export const taskStatusEnum = z.enum([
  "Not Started",
  "In Progress",
  "Pending",
  "Done"
]);

export type TaskStatus = z.infer<typeof taskStatusEnum>;

// Week status enum
export const weekStatusEnum = z.enum([
  "PAST WEEKS",
  "CURRENT WEEK",
  "FUTURE WEEKS"
]);

export type WeekStatus = z.infer<typeof weekStatusEnum>;

// Training type enum
export const trainingTypeEnum = z.enum([
  "GLR",
  "SLR"
]);

export type TrainingType = z.infer<typeof trainingTypeEnum>;

// Trainer status enum
export const trainerStatusEnum = z.enum([
  "active",
  "inactive",
]);

export type TrainerStatus = z.infer<typeof trainerStatusEnum>;

// Action types for audit log
export const actionEnum = z.enum([
  "create",
  "update",
  "delete",
  "complete"
]);

export type Action = z.infer<typeof actionEnum>;

// Entity types for audit log
export const entityEnum = z.enum([
  "task",
  "edition",
  "trainer",
  "user"
]);

export type Entity = z.infer<typeof entityEnum>;

// Audit log table to track all changes
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  action: text("action").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  previousState: json("previous_state"),
  newState: json("new_state"),
  notes: text("notes"),
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  timestamp: true,
}).extend({
  // Define types for previousState and newState
  previousState: z.any().optional(),
  newState: z.any().optional(),
  notes: z.string().nullable().optional()
});

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
