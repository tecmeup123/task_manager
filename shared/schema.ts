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
  forcePasswordChange: boolean("force_password_change").default(false).notNull(),
  passwordChangeRequired: boolean("password_change_required").default(false).notNull(),
  approved: boolean("approved").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  // Security settings
  rememberMe: boolean("remember_me").default(false),
  sessionTimeoutMinutes: integer("session_timeout_minutes").default(120),
  lastActive: timestamp("last_active"),
  // Avatar settings
  avatarUrl: text("avatar_url"), // URL to the uploaded photo
  avatarColor: text("avatar_color").default("#6366F1"), // Fallback color for avatar
  avatarShape: text("avatar_shape").default("circle"), // circle or square
  avatarIcon: text("avatar_icon").default("user"), // Default icon if no photo
  avatarBackground: text("avatar_background").default("gradient"), // solid or gradient
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
  archived: boolean("archived").default(false),
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
  assignedUserId: integer("assigned_user_id").references(() => users.id),
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

// Notification types enum
export const notificationTypeEnum = z.enum([
  "task_assigned",
  "task_updated",
  "due_date_approaching",
  "edition_created",
  "task_completed"
]);

export type NotificationType = z.infer<typeof notificationTypeEnum>;

// Resource types
export const resourceTypeEnum = z.enum([
  "file",
  "link",
  "document"
]);

export type ResourceType = z.infer<typeof resourceTypeEnum>;

// Resources/attachments table
export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  name: text("name").notNull(),
  type: text("type").notNull(),
  url: text("url").notNull(),
  size: integer("size"),
  format: text("format"),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  description: text("description"),
});

export const insertResourceSchema = createInsertSchema(resources).omit({
  id: true,
  createdAt: true,
});

export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Mentions table to implement @mentions functionality
export const mentions = pgTable("mentions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  commentId: integer("comment_id"), // Optional reference to a comment if implemented
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").references(() => users.id),
  isRead: boolean("is_read").default(false).notNull(),
});

export const insertMentionSchema = createInsertSchema(mentions).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export type InsertMention = z.infer<typeof insertMentionSchema>;
export type Mention = typeof mentions.$inferSelect;

// Task comments table
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at"),
});

export const insertTaskCommentSchema = createInsertSchema(taskComments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type TaskComment = typeof taskComments.$inferSelect;

// Task reactions table for emoji reactions to tasks
export const taskReactions = pgTable("task_reactions", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id),
  userId: integer("user_id").notNull().references(() => users.id),
  emoji: text("emoji").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskReactionSchema = createInsertSchema(taskReactions).omit({
  id: true,
  createdAt: true,
});

export type InsertTaskReaction = z.infer<typeof insertTaskReactionSchema>;
export type TaskReaction = typeof taskReactions.$inferSelect;

// Login Activity table to store user login history
export const loginActivities = pgTable("login_activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  deviceInfo: text("device_info"),
  success: boolean("success").default(true).notNull(),
  location: text("location"),
});

export const insertLoginActivitySchema = createInsertSchema(loginActivities).omit({
  id: true,
  timestamp: true,
});

export type InsertLoginActivity = z.infer<typeof insertLoginActivitySchema>;
export type LoginActivity = typeof loginActivities.$inferSelect;

// Notification table to store user notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  actionUrl: text("action_url"),
  metadata: json("metadata"),
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  isRead: true,
}).extend({
  metadata: z.any().optional()
});

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;
