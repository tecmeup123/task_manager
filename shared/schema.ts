import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User model remains unchanged
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

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
