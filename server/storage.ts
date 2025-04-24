import {
  Edition,
  InsertEdition,
  Task,
  InsertTask,
  User,
  InsertUser,
  Trainer,
  InsertTrainer,
  AuditLog,
  InsertAuditLog,
  Notification,
  InsertNotification,
  Resource,
  InsertResource,
  Mention,
  InsertMention,
  TaskComment,
  InsertTaskComment,
  LoginActivity,
  InsertLoginActivity,
  TaskTemplate,
  InsertTaskTemplate
} from "@shared/schema";
import fs from 'fs/promises';
import path from 'path';
import session from 'express-session';
import createMemoryStore from 'memorystore';
import { add, format, parseISO, isBefore, subWeeks } from "date-fns";
import { hashPassword } from './auth'; // Assuming hashPassword function exists elsewhere


// Store data in JSON files
const DATA_DIR = path.join(process.cwd(), 'data');
const FILES = {
  users: path.join(DATA_DIR, 'users.json'),
  trainers: path.join(DATA_DIR, 'trainers.json'),
  editions: path.join(DATA_DIR, 'editions.json'),
  tasks: path.join(DATA_DIR, 'tasks.json'),
  auditLogs: path.join(DATA_DIR, 'auditLogs.json'),
  notifications: path.join(DATA_DIR, 'notifications.json'),
  resources: path.join(DATA_DIR, 'resources.json'),
  mentions: path.join(DATA_DIR, 'mentions.json'),
  taskComments: path.join(DATA_DIR, 'taskComments.json'),
  loginActivities: path.join(DATA_DIR, 'loginActivities.json'),
  taskTemplates: path.join(DATA_DIR, 'taskTemplates.json')
};

// Initialize data directory and files
async function initializeStorage() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });

    for (const file of Object.values(FILES)) {
      try {
        await fs.access(file);
      } catch {
        await fs.writeFile(file, '[]');
      }
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
    throw error;
  }
}

// Helper functions for file operations
async function readData(file: string) {
  const data = await fs.readFile(file, 'utf-8');
  return JSON.parse(data);
}

async function writeData(file: string, data: any) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  deleteUser(id: number): Promise<boolean>;

  // Audit logs methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]>;

  // Task template methods
  getAllTaskTemplates(): Promise<TaskTemplate[]>;
  getTaskTemplate(id: number): Promise<TaskTemplate | undefined>;
  getActiveTaskTemplate(): Promise<TaskTemplate | undefined>;
  createTaskTemplate(template: InsertTaskTemplate): Promise<TaskTemplate>;
  updateTaskTemplate(id: number, template: Partial<TaskTemplate>): Promise<TaskTemplate>;
  setActiveTaskTemplate(id: number): Promise<TaskTemplate>;
  deleteTaskTemplate(id: number): Promise<boolean>;

  // Session storage for authentication
  sessionStore: any;

  // Login activity methods
  createLoginActivity(activity: InsertLoginActivity): Promise<LoginActivity>;
  getUserLoginActivities(userId: number, limit?: number): Promise<LoginActivity[]>;
  updateUserSecuritySettings(userId: number, settings: {
    rememberMe?: boolean;
    sessionTimeoutMinutes?: number;
  }): Promise<User>;

  // Trainer methods
  getAllTrainers(): Promise<Trainer[]>;
  getTrainer(id: number): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer>;
  deleteTrainer(id: number): Promise<boolean>;

  // Edition methods
  getAllEditions(includeArchived?: boolean): Promise<Edition[]>;
  getEdition(id: number): Promise<Edition | undefined>;
  getEditionByCode(code: string): Promise<Edition | undefined>;
  createEdition(edition: InsertEdition): Promise<Edition>;
  updateEdition(id: number, edition: Partial<Edition>): Promise<Edition>;
  deleteEdition(id: number): Promise<boolean>;

  // Task methods
  getAllTasks(): Promise<Task[]>;
  getTasksByEdition(editionId: number): Promise<Task[]>;
  getTasksByEditionAndWeek(editionId: number, week: string): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task>;
  deleteTask(id: number): Promise<boolean>;

  // Notification methods
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: number, limit?: number, includeRead?: boolean): Promise<Notification[]>;
  getNotification(id: number): Promise<Notification | undefined>;
  markNotificationAsRead(id: number): Promise<Notification>;
  markAllNotificationsAsRead(userId: number): Promise<boolean>;
  deleteNotification(id: number): Promise<boolean>;
  getUnreadNotificationCount(userId: number): Promise<number>;

  // Resource methods
  getTaskResources(taskId: number): Promise<Resource[]>;
  getResource(id: number): Promise<Resource | undefined>;
  createResource(resource: InsertResource): Promise<Resource>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource>;
  deleteResource(id: number): Promise<boolean>;

  // Mention methods
  createMention(mention: InsertMention): Promise<Mention>;
  getTaskMentions(taskId: number): Promise<Mention[]>;
  getUserMentions(userId: number, isRead?: boolean): Promise<Mention[]>;
  markMentionAsRead(id: number): Promise<Mention>;

  // Task comments methods
  getTaskComments(taskId: number): Promise<TaskComment[]>;
  createTaskComment(comment: InsertTaskComment): Promise<TaskComment>;
  updateTaskComment(id: number, comment: Partial<TaskComment>): Promise<TaskComment>;
  deleteTaskComment(id: number): Promise<boolean>;

  // Helper method to duplicate edition with tasks
  duplicateEdition(editionId: number, newEditionData: InsertEdition): Promise<Edition>;
}

export class MemStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Initialize storage
    initializeStorage().catch(console.error);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const users = await readData(FILES.users);
    return users.find((u: User) => u.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await readData(FILES.users);
    return users.find((u: User) => u.username === username);
  }

  async getAllUsers(): Promise<User[]> {
    return readData(FILES.users);
  }

  async createUser(user: InsertUser): Promise<User> {
    const users = await readData(FILES.users);
    const id = users.length > 0 ? Math.max(...users.map((u: User) => u.id)) + 1 : 1;
    const newUser = { ...user, id, createdAt: new Date() };
    users.push(newUser);
    await writeData(FILES.users, users);
    return newUser;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const users = await readData(FILES.users);
    const index = users.findIndex((u: User) => u.id === id);
    if (index === -1) throw new Error(`User with id ${id} not found`);

    users[index] = { ...users[index], ...userData };
    await writeData(FILES.users, users);
    return users[index];
  }

  async deleteUser(id: number): Promise<boolean> {
    const users = await readData(FILES.users);
    const filtered = users.filter((u: User) => u.id !== id);
    await writeData(FILES.users, filtered);
    return filtered.length < users.length;
  }

  // Edition methods
  async getAllEditions(includeArchived: boolean = false): Promise<Edition[]> {
    const editions = await readData(FILES.editions);
    return includeArchived ? editions : editions.filter((e: Edition) => !e.archived);
  }

  async getEdition(id: number): Promise<Edition | undefined> {
    const editions = await readData(FILES.editions);
    return editions.find((e: Edition) => e.id === id);
  }

  async getEditionByCode(code: string): Promise<Edition | undefined> {
    const editions = await readData(FILES.editions);
    return editions.find((e: Edition) => e.code === code);
  }

  async createEdition(edition: InsertEdition): Promise<Edition> {
    const editions = await readData(FILES.editions);
    const id = editions.length > 0 ? Math.max(...editions.map((e: Edition) => e.id)) + 1 : 1;
    const newEdition = { ...edition, id, status: "active", currentWeek: 1, archived: false };
    editions.push(newEdition);
    await writeData(FILES.editions, editions);
    return newEdition;
  }

  async updateEdition(id: number, editionData: Partial<Edition>): Promise<Edition> {
    const editions = await readData(FILES.editions);
    const index = editions.findIndex((e: Edition) => e.id === id);
    if (index === -1) throw new Error(`Edition with id ${id} not found`);

    editions[index] = { ...editions[index], ...editionData };
    await writeData(FILES.editions, editions);
    return editions[index];
  }

  async deleteEdition(id: number): Promise<boolean> {
    const editions = await readData(FILES.editions);
    const filtered = editions.filter((e: Edition) => e.id !== id);
    await writeData(FILES.editions, filtered);
    return filtered.length < editions.length;
  }


  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return readData(FILES.tasks);
  }

  async getTasksByEdition(editionId: number): Promise<Task[]> {
    const tasks = await readData(FILES.tasks);
    return tasks.filter((t: Task) => t.editionId === editionId);
  }

  async getTasksByEditionAndWeek(editionId: number, week: string): Promise<Task[]> {
    const tasks = await readData(FILES.tasks);
    return tasks.filter((t: Task) => t.editionId === editionId && t.week === week);
  }

  async getTask(id: number): Promise<Task | undefined> {
    const tasks = await readData(FILES.tasks);
    return tasks.find((t: Task) => t.id === id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const tasks = await readData(FILES.tasks);
    const id = tasks.length > 0 ? Math.max(...tasks.map((t: Task) => t.id)) + 1 : 1;
    const newTask = { ...task, id };
    tasks.push(newTask);
    await writeData(FILES.tasks, tasks);
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    const tasks = await readData(FILES.tasks);
    const index = tasks.findIndex((t: Task) => t.id === id);
    if (index === -1) throw new Error(`Task with id ${id} not found`);

    tasks[index] = { ...tasks[index], ...taskData };
    await writeData(FILES.tasks, tasks);
    return tasks[index];
  }

  async deleteTask(id: number): Promise<boolean> {
    const tasks = await readData(FILES.tasks);
    const filtered = tasks.filter((t: Task) => t.id !== id);
    await writeData(FILES.tasks, filtered);
    return filtered.length < tasks.length;
  }

  async duplicateEdition(editionId: number, newEditionData: InsertEdition): Promise<Edition> {
    const sourceEdition = await this.getEdition(editionId);
    if (!sourceEdition) {
      throw new Error('Source edition not found');
    }

    const newEdition = await this.createEdition(newEditionData);
    const tasks = await this.getTasksByEdition(editionId);

    for (const task of tasks) {
      const { id, editionId, completionDate, ...taskData } = task;
      await this.createTask({
        ...taskData,
        editionId: newEdition.id,
        status: "Not Started"
      });
    }

    return newEdition;
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const auditLogs = await readData(FILES.auditLogs);
    const id = auditLogs.length > 0 ? Math.max(...auditLogs.map((al: AuditLog) => al.id)) + 1 : 1;
    const newLog = { ...log, id, timestamp: new Date() };
    auditLogs.push(newLog);
    await writeData(FILES.auditLogs, auditLogs);
    return newLog;
  }

  async getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]> {
    const auditLogs = await readData(FILES.auditLogs);
    let filteredLogs = auditLogs;

    if (entityType) {
      filteredLogs = filteredLogs.filter((al: AuditLog) => al.entityType === entityType);
    }
    if (entityId) {
      filteredLogs = filteredLogs.filter((al: AuditLog) => al.entityId === entityId);
    }
    return filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getAllTaskTemplates(): Promise<TaskTemplate[]> {
    return readData(FILES.taskTemplates);
  }

  async getTaskTemplate(id: number): Promise<TaskTemplate | undefined> {
    const taskTemplates = await readData(FILES.taskTemplates);
    return taskTemplates.find((tt: TaskTemplate) => tt.id === id);
  }

  async getActiveTaskTemplate(): Promise<TaskTemplate | undefined> {
    const taskTemplates = await readData(FILES.taskTemplates);
    return taskTemplates.find((tt: TaskTemplate) => tt.isActive);
  }

  async createTaskTemplate(template: InsertTaskTemplate): Promise<TaskTemplate> {
    const taskTemplates = await readData(FILES.taskTemplates);
    const id = taskTemplates.length > 0 ? Math.max(...taskTemplates.map((tt: TaskTemplate) => tt.id)) + 1 : 1;
    const newTemplate = { ...template, id, createdAt: new Date(), updatedAt: null, isActive: template.isActive || false };

    //If this is the first template or isActive is true, make sure all other templates are set to inactive
    if (newTemplate.isActive || taskTemplates.length === 0) {
      const inactiveTemplates = taskTemplates.map(tt => ({...tt, isActive: false}))
      await writeData(FILES.taskTemplates, [...inactiveTemplates, newTemplate]);
    } else {
      taskTemplates.push(newTemplate)
      await writeData(FILES.taskTemplates, taskTemplates);
    }

    return newTemplate;
  }


  async updateTaskTemplate(id: number, templateData: Partial<TaskTemplate>): Promise<TaskTemplate> {
    const taskTemplates = await readData(FILES.taskTemplates);
    const index = taskTemplates.findIndex((tt: TaskTemplate) => tt.id === id);
    if (index === -1) throw new Error(`Task Template with id ${id} not found`);

    const updatedTemplate = { ...taskTemplates[index], ...templateData, updatedAt: new Date() };
    if (templateData.isActive) {
      const inactiveTemplates = taskTemplates.map((tt, i) => i !== index ? {...tt, isActive: false} : tt)
      await writeData(FILES.taskTemplates, inactiveTemplates);
    } else {
      taskTemplates[index] = updatedTemplate;
      await writeData(FILES.taskTemplates, taskTemplates);
    }

    return updatedTemplate;
  }


  async setActiveTaskTemplate(id: number): Promise<TaskTemplate> {
    const taskTemplates = await readData(FILES.taskTemplates);
    const index = taskTemplates.findIndex((tt: TaskTemplate) => tt.id === id);
    if (index === -1) throw new Error(`Task Template with id ${id} not found`);

    const inactiveTemplates = taskTemplates.map((tt, i) => i !== index ? {...tt, isActive: false} : {...tt, isActive: true, updatedAt: new Date()})
    await writeData(FILES.taskTemplates, inactiveTemplates);
    return inactiveTemplates[index];
  }


  async deleteTaskTemplate(id: number): Promise<boolean> {
    const taskTemplates = await readData(FILES.taskTemplates);
    const template = taskTemplates.find((tt: TaskTemplate) => tt.id === id);
    if (!template) return false;

    if (template.isActive) {
      throw new Error(`Cannot delete the active template. Deactivate it first or set another template as active.`);
    }

    const filtered = taskTemplates.filter((tt: TaskTemplate) => tt.id !== id);
    await writeData(FILES.taskTemplates, filtered);
    return filtered.length < taskTemplates.length;
  }

  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const trainers = await readData(FILES.trainers);
    const id = trainers.length > 0 ? Math.max(...trainers.map((t: Trainer) => t.id)) + 1 : 1;
    const newTrainer = { ...trainer, id, createdAt: new Date() };
    trainers.push(newTrainer);
    await writeData(FILES.trainers, trainers);
    return newTrainer;
  }

  async getAllTrainers(): Promise<Trainer[]> {
    return readData(FILES.trainers);
  }

  async getTrainer(id: number): Promise<Trainer | undefined> {
    const trainers = await readData(FILES.trainers);
    return trainers.find((t: Trainer) => t.id === id);
  }

  async updateTrainer(id: number, trainerData: Partial<Trainer>): Promise<Trainer> {
    const trainers = await readData(FILES.trainers);
    const index = trainers.findIndex((t: Trainer) => t.id === id);
    if (index === -1) throw new Error(`Trainer with id ${id} not found`);

    trainers[index] = { ...trainers[index], ...trainerData };
    await writeData(FILES.trainers, trainers);
    return trainers[index];
  }

  async deleteTrainer(id: number): Promise<boolean> {
    const trainers = await readData(FILES.trainers);
    const filtered = trainers.filter((t: Trainer) => t.id !== id);
    await writeData(FILES.trainers, filtered);
    return filtered.length < trainers.length;
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const notifications = await readData(FILES.notifications);
    const id = notifications.length > 0 ? Math.max(...notifications.map((n: Notification) => n.id)) + 1 : 1;
    const newNotification = { ...notification, id, isRead: false, createdAt: new Date() };
    notifications.push(newNotification);
    await writeData(FILES.notifications, notifications);
    return newNotification;
  }

  async getUserNotifications(userId: number, limit: number = 10, includeRead: boolean = false): Promise<Notification[]> {
    const notifications = await readData(FILES.notifications);
    let filteredNotifications = notifications.filter((n: Notification) => n.userId === userId);

    if (!includeRead) {
      filteredNotifications = filteredNotifications.filter((n: Notification) => !n.isRead);
    }
    return filteredNotifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const notifications = await readData(FILES.notifications);
    return notifications.find((n: Notification) => n.id === id);
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notifications = await readData(FILES.notifications);
    const index = notifications.findIndex((n: Notification) => n.id === id);
    if (index === -1) throw new Error(`Notification with id ${id} not found`);

    notifications[index] = { ...notifications[index], isRead: true };
    await writeData(FILES.notifications, notifications);
    return notifications[index];
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const notifications = await readData(FILES.notifications);
    const updatedNotifications = notifications.map((n: Notification) => n.userId === userId ? { ...n, isRead: true } : n);
    await writeData(FILES.notifications, updatedNotifications);
    return true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const notifications = await readData(FILES.notifications);
    const filtered = notifications.filter((n: Notification) => n.id !== id);
    await writeData(FILES.notifications, filtered);
    return filtered.length < notifications.length;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const notifications = await readData(FILES.notifications);
    return notifications.filter((n: Notification) => n.userId === userId && !n.isRead).length;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const resources = await readData(FILES.resources);
    const id = resources.length > 0 ? Math.max(...resources.map((r: Resource) => r.id)) + 1 : 1;
    const newResource = { ...resource, id, createdAt: new Date() };
    resources.push(newResource);
    await writeData(FILES.resources, resources);
    return newResource;
  }

  async getTaskResources(taskId: number): Promise<Resource[]> {
    const resources = await readData(FILES.resources);
    return resources.filter((r: Resource) => r.taskId === taskId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const resources = await readData(FILES.resources);
    return resources.find((r: Resource) => r.id === id);
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource> {
    const resources = await readData(FILES.resources);
    const index = resources.findIndex((r: Resource) => r.id === id);
    if (index === -1) throw new Error(`Resource with id ${id} not found`);

    resources[index] = { ...resources[index], ...resourceData };
    await writeData(FILES.resources, resources);
    return resources[index];
  }

  async deleteResource(id: number): Promise<boolean> {
    const resources = await readData(FILES.resources);
    const filtered = resources.filter((r: Resource) => r.id !== id);
    await writeData(FILES.resources, filtered);
    return filtered.length < resources.length;
  }

  async createMention(mention: InsertMention): Promise<Mention> {
    const mentions = await readData(FILES.mentions);
    const id = mentions.length > 0 ? Math.max(...mentions.map((m: Mention) => m.id)) + 1 : 1;
    const newMention = { ...mention, id, isRead: false, createdAt: new Date() };
    mentions.push(newMention);
    await writeData(FILES.mentions, mentions);

    // Create a notification for the mentioned user
    await this.createNotification({
      userId: mention.userId,
      type: "task_assigned",
      title: "You were mentioned in a task",
      message: `You were mentioned in task`,
      entityType: "task",
      entityId: mention.taskId,
      actionUrl: `/tasks?editionId=${mention.editionId}&taskId=${mention.taskId}`
    });

    return newMention;
  }

  async getTaskMentions(taskId: number): Promise<Mention[]> {
    const mentions = await readData(FILES.mentions);
    return mentions.filter((m: Mention) => m.taskId === taskId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserMentions(userId: number, isRead?: boolean): Promise<Mention[]> {
    const mentions = await readData(FILES.mentions);
    let filteredMentions = mentions.filter((m: Mention) => m.userId === userId);

    if (isRead !== undefined) {
      filteredMentions = filteredMentions.filter((m: Mention) => m.isRead === isRead);
    }
    return filteredMentions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markMentionAsRead(id: number): Promise<Mention> {
    const mentions = await readData(FILES.mentions);
    const index = mentions.findIndex((m: Mention) => m.id === id);
    if (index === -1) throw new Error(`Mention with id ${id} not found`);

    mentions[index] = { ...mentions[index], isRead: true };
    await writeData(FILES.mentions, mentions);
    return mentions[index];
  }

  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const taskComments = await readData(FILES.taskComments);
    const id = taskComments.length > 0 ? Math.max(...taskComments.map((tc: TaskComment) => tc.id)) + 1 : 1;
    const newComment = { ...comment, id, createdAt: new Date(), updatedAt: null };
    taskComments.push(newComment);
    await writeData(FILES.taskComments, taskComments);

    // Process mentions in the comment content
    const mentionRegex = /@(\w+)/g;
    let match;
    const mentionedUsers = new Set();

    while ((match = mentionRegex.exec(comment.content)) !== null) {
      const username = match[1];
      const user = await this.getUserByUsername(username);

      if (user && !mentionedUsers.has(user.id)) {
        mentionedUsers.add(user.id);

        // Create a mention
        await this.createMention({
          taskId: comment.taskId,
          userId: user.id,
          commentId: id,
          createdBy: comment.userId
        });
      }
    }

    return newComment;
  }

  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    const taskComments = await readData(FILES.taskComments);
    return taskComments.filter((tc: TaskComment) => tc.taskId === taskId).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getTaskComment(id: number): Promise<TaskComment | undefined> {
    const taskComments = await readData(FILES.taskComments);
    return taskComments.find((tc: TaskComment) => tc.id === id);
  }

  async updateTaskComment(id: number, commentData: Partial<TaskComment>): Promise<TaskComment> {
    const taskComments = await readData(FILES.taskComments);
    const index = taskComments.findIndex((tc: TaskComment) => tc.id === id);
    if (index === -1) throw new Error(`Comment with id ${id} not found`);

    taskComments[index] = { ...taskComments[index], ...commentData, updatedAt: new Date() };
    await writeData(FILES.taskComments, taskComments);
    return taskComments[index];
  }

  async deleteTaskComment(id: number): Promise<boolean> {
    const taskComments = await readData(FILES.taskComments);
    const filtered = taskComments.filter((tc: TaskComment) => tc.id !== id);
    await writeData(FILES.taskComments, filtered);
    return filtered.length < taskComments.length;
  }

  async createLoginActivity(activity: InsertLoginActivity): Promise<LoginActivity> {
    const loginActivities = await readData(FILES.loginActivities);
    const id = loginActivities.length > 0 ? Math.max(...loginActivities.map((la: LoginActivity) => la.id)) + 1 : 1;
    const newActivity = { ...activity, id, timestamp: new Date(), success: activity.success ?? true };
    loginActivities.push(newActivity);
    await writeData(FILES.loginActivities, loginActivities);
    return newActivity;
  }

  async getUserLoginActivities(userId: number, limit: number = 10): Promise<LoginActivity[]> {
    const loginActivities = await readData(FILES.loginActivities);
    return loginActivities
      .filter((la: LoginActivity) => la.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async updateUserSecuritySettings(userId: number, settings: {
    rememberMe?: boolean;
    sessionTimeoutMinutes?: number;
  }): Promise<User> {
    const users = await readData(FILES.users);
    const index = users.findIndex((u: User) => u.id === userId);
    if (index === -1) throw new Error(`User with id ${userId} not found`);

    users[index] = { ...users[index], ...settings };
    await writeData(FILES.users, users);
    return users[index];
  }
}

// Initialize admin user
async function initializeAdmin() {
  const existingAdmin = await storage.getUserByUsername("admin");
  if (!existingAdmin) {
    const hashedPassword = await hashPassword("admin123");
    await storage.createUser({
      username: "admin",
      password: hashedPassword,
      role: "admin",
      approved: true,
      fullName: "Administrator"
    });
  }
}

// Call initialization
initializeAdmin().catch(console.error);

export const storage = new MemStorage();