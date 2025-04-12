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
  users,
  trainers,
  editions,
  tasks,
  auditLogs,
  notifications,
  resources,
  mentions,
  taskComments
} from "@shared/schema";
import { add, format, parseISO, isBefore, subWeeks } from "date-fns";
import { and, eq, count } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User>;
  
  // Audit logs methods
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]>;
  
  // Session storage for authentication
  sessionStore: any;

  // Trainer methods
  getAllTrainers(): Promise<Trainer[]>;
  getTrainer(id: number): Promise<Trainer | undefined>;
  createTrainer(trainer: InsertTrainer): Promise<Trainer>;
  updateTrainer(id: number, trainer: Partial<Trainer>): Promise<Trainer>;
  deleteTrainer(id: number): Promise<boolean>;

  // Edition methods
  getAllEditions(): Promise<Edition[]>;
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

import createMemoryStore from "memorystore";
import session from "express-session";

const MemoryStore = createMemoryStore(session);

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private trainers: Map<number, Trainer>;
  private editions: Map<number, Edition>;
  private tasks: Map<number, Task>;
  private auditLogs: Map<number, AuditLog>;
  private notifications: Map<number, Notification>;
  private resources: Map<number, Resource>;
  private mentions: Map<number, Mention>;
  private taskComments: Map<number, TaskComment>;
  private currentUserId: number;
  private currentTrainerId: number;
  private currentEditionId: number;
  private currentTaskId: number;
  private currentAuditLogId: number;
  private currentNotificationId: number;
  private currentResourceId: number;
  private currentMentionId: number;
  private currentTaskCommentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.trainers = new Map();
    this.editions = new Map();
    this.tasks = new Map();
    this.auditLogs = new Map();
    this.notifications = new Map();
    this.resources = new Map();
    this.mentions = new Map();
    this.taskComments = new Map();
    this.currentUserId = 1;
    this.currentTrainerId = 1;
    this.currentEditionId = 1;
    this.currentTaskId = 1;
    this.currentAuditLogId = 1;
    this.currentNotificationId = 1;
    this.currentResourceId = 1;
    this.currentMentionId = 1;
    this.currentTaskCommentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });

    // Initialize with some sample data
    this.seedData();
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id,
      fullName: insertUser.fullName || null,
      email: insertUser.email || null,
      role: insertUser.role || "viewer",
      forcePasswordChange: insertUser.forcePasswordChange !== undefined ? insertUser.forcePasswordChange : false,
      passwordChangeRequired: insertUser.passwordChangeRequired !== undefined ? insertUser.passwordChangeRequired : false,
      approved: insertUser.approved !== undefined ? insertUser.approved : false,
      avatarUrl: insertUser.avatarUrl || null,
      avatarColor: insertUser.avatarColor || null,
      avatarShape: insertUser.avatarShape || null,
      avatarIcon: insertUser.avatarIcon || null,
      avatarBackground: insertUser.avatarBackground || null,
      createdAt: new Date()  
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.currentAuditLogId++;
    const auditLog: AuditLog = {
      ...log,
      id,
      timestamp: new Date(),
      previousState: log.previousState || null,
      newState: log.newState || null,
      notes: log.notes || null
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }
  
  async getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }
    
    if (entityId) {
      logs = logs.filter(log => log.entityId === entityId);
    }
    
    return logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  // Trainer methods
  async getAllTrainers(): Promise<Trainer[]> {
    return Array.from(this.trainers.values());
  }

  async getTrainer(id: number): Promise<Trainer | undefined> {
    return this.trainers.get(id);
  }

  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const id = this.currentTrainerId++;
    const newTrainer: Trainer = { 
      ...trainer, 
      id, 
      name: trainer.name,
      email: trainer.email || null,
      role: trainer.role || null,
      department: trainer.department || null,
      status: trainer.status || "active",
      createdAt: new Date() || null
    };
    this.trainers.set(id, newTrainer);
    return newTrainer;
  }

  async updateTrainer(id: number, trainerData: Partial<Trainer>): Promise<Trainer> {
    const trainer = this.trainers.get(id);
    if (!trainer) {
      throw new Error(`Trainer with id ${id} not found`);
    }
    
    const updatedTrainer = { ...trainer, ...trainerData };
    this.trainers.set(id, updatedTrainer);
    return updatedTrainer;
  }

  async deleteTrainer(id: number): Promise<boolean> {
    return this.trainers.delete(id);
  }

  // Edition methods
  async getAllEditions(): Promise<Edition[]> {
    return Array.from(this.editions.values());
  }

  async getEdition(id: number): Promise<Edition | undefined> {
    return this.editions.get(id);
  }

  async getEditionByCode(code: string): Promise<Edition | undefined> {
    return Array.from(this.editions.values()).find(
      (edition) => edition.code === code,
    );
  }

  async createEdition(edition: InsertEdition): Promise<Edition> {
    const id = this.currentEditionId++;
    const newEdition: Edition = { ...edition, id, status: "active", currentWeek: 1, archived: false };
    this.editions.set(id, newEdition);
    return newEdition;
  }

  async updateEdition(id: number, editionData: Partial<Edition>): Promise<Edition> {
    const edition = this.editions.get(id);
    if (!edition) {
      throw new Error(`Edition with id ${id} not found`);
    }
    
    const updatedEdition = { ...edition, ...editionData };
    this.editions.set(id, updatedEdition);
    return updatedEdition;
  }

  async deleteEdition(id: number): Promise<boolean> {
    if (!this.editions.has(id)) {
      return false;
    }
    
    // Delete all tasks for this edition first
    const editionTasks = await this.getTasksByEdition(id);
    for (const task of editionTasks) {
      await this.deleteTask(task.id);
    }
    
    return this.editions.delete(id);
  }

  // Task methods
  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByEdition(editionId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.editionId === editionId,
    );
  }

  async getTasksByEditionAndWeek(editionId: number, week: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.editionId === editionId && task.week === week,
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.currentTaskId++;
    const newTask: Task = { 
      ...task, 
      id,
      status: task.status || null,
      notes: task.notes || null,
      assignedUserId: task.assignedUserId || null,
      duration: task.duration || null,
      dueDate: task.dueDate || null,
      links: task.links || null,
      assignedTo: task.assignedTo || null,
      owner: task.owner || null,
      inflexible: task.inflexible || false,
      completionDate: task.completionDate || null
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Helper method to duplicate an edition with all its tasks
  async duplicateEdition(editionId: number, newEditionData: InsertEdition): Promise<Edition> {
    const sourceEdition = await this.getEdition(editionId);
    if (!sourceEdition) {
      throw new Error(`Source edition with id ${editionId} not found`);
    }
    
    // Create new edition
    const newEdition = await this.createEdition(newEditionData);
    
    // Get all tasks for the source edition
    const sourceTasks = await this.getTasksByEdition(editionId);
    
    // Create new tasks for the new edition
    for (const task of sourceTasks) {
      const { id, editionId, completionDate, ...taskData } = task;
      await this.createTask({
        ...taskData,
        editionId: newEdition.id,
        status: "Not Started",
        dueDate: task.dueDate ? adjustDate(task.dueDate, sourceEdition.startDate, newEdition.startDate) : undefined,
      });
    }
    
    return newEdition;
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notificationRecord: Notification = {
      ...notification,
      id,
      isRead: false,
      actionUrl: notification.actionUrl || null,
      metadata: notification.metadata || null,
      createdAt: new Date()
    };
    this.notifications.set(id, notificationRecord);
    return notificationRecord;
  }

  async getUserNotifications(userId: number, limit: number = 10, includeRead: boolean = false): Promise<Notification[]> {
    let userNotifications = Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId);
    
    if (!includeRead) {
      userNotifications = userNotifications.filter(notification => !notification.isRead);
    }
    
    return userNotifications
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const notification = this.notifications.get(id);
    if (!notification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    const updatedNotification = { ...notification, isRead: true };
    this.notifications.set(id, updatedNotification);
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    let success = true;
    
    // Use Array.from to avoid downlevelIteration issue
    Array.from(this.notifications.entries()).forEach(([id, notification]) => {
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true });
      }
    });
    
    return success;
  }

  async deleteNotification(id: number): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId && !notification.isRead)
      .length;
  }

  // Resource methods
  async getTaskResources(taskId: number): Promise<Resource[]> {
    return Array.from(this.resources.values())
      .filter(resource => resource.taskId === taskId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getResource(id: number): Promise<Resource | undefined> {
    return this.resources.get(id);
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const id = this.currentResourceId++;
    const newResource: Resource = {
      ...resource,
      id,
      size: resource.size || null,
      format: resource.format || null,
      uploadedBy: resource.uploadedBy || null,
      createdAt: new Date(),
      description: resource.description || null
    };
    this.resources.set(id, newResource);
    return newResource;
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource> {
    const resource = this.resources.get(id);
    if (!resource) {
      throw new Error(`Resource with id ${id} not found`);
    }
    
    const updatedResource = { ...resource, ...resourceData };
    this.resources.set(id, updatedResource);
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    return this.resources.delete(id);
  }
  
  // Mention methods
  async createMention(mention: InsertMention): Promise<Mention> {
    const id = this.currentMentionId++;
    const newMention: Mention = {
      ...mention,
      id,
      commentId: mention.commentId || null,
      createdAt: new Date(),
      createdBy: mention.createdBy || null,
      isRead: false
    };
    this.mentions.set(id, newMention);
    
    // Create a notification for the mentioned user
    await this.createNotification({
      userId: mention.userId,
      type: "task_assigned",
      title: "You were mentioned in a task",
      message: `You were mentioned in task`,
      entityType: "task",
      entityId: mention.taskId,
      actionUrl: `/tasks/${mention.taskId}`
    });
    
    return newMention;
  }

  async getTaskMentions(taskId: number): Promise<Mention[]> {
    return Array.from(this.mentions.values())
      .filter(mention => mention.taskId === taskId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getUserMentions(userId: number, isRead?: boolean): Promise<Mention[]> {
    let mentions = Array.from(this.mentions.values())
      .filter(mention => mention.userId === userId);
    
    if (isRead !== undefined) {
      mentions = mentions.filter(mention => mention.isRead === isRead);
    }
    
    return mentions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markMentionAsRead(id: number): Promise<Mention> {
    const mention = this.mentions.get(id);
    if (!mention) {
      throw new Error(`Mention with id ${id} not found`);
    }
    
    const updatedMention = { ...mention, isRead: true };
    this.mentions.set(id, updatedMention);
    return updatedMention;
  }
  
  // Task comment methods
  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    return Array.from(this.taskComments.values())
      .filter(comment => comment.taskId === taskId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
  
  async getTaskComment(id: number): Promise<TaskComment | undefined> {
    return this.taskComments.get(id);
  }

  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const id = this.currentTaskCommentId++;
    const newComment: TaskComment = {
      ...comment,
      id,
      createdAt: new Date(),
      updatedAt: null
    };
    this.taskComments.set(id, newComment);
    
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

  async updateTaskComment(id: number, commentData: Partial<TaskComment>): Promise<TaskComment> {
    const comment = this.taskComments.get(id);
    if (!comment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    const updatedComment = { 
      ...comment, 
      ...commentData,
      updatedAt: new Date()
    };
    this.taskComments.set(id, updatedComment);
    return updatedComment;
  }

  async deleteTaskComment(id: number): Promise<boolean> {
    return this.taskComments.delete(id);
  }

  // Seed some initial data
  private seedData() {
    // Create sample editions
    const edition1: InsertEdition = {
      code: "2405-A",
      trainingType: "GLR",
      startDate: new Date("2024-05-20"),
      tasksStartDate: new Date("2024-04-15"),
    };
    
    const edition2: InsertEdition = {
      code: "2405-B",
      trainingType: "SLR",
      startDate: new Date("2024-04-22"),
      tasksStartDate: new Date("2024-03-18"),
    };
    
    const edition3: InsertEdition = {
      code: "2406-A",
      trainingType: "GLR",
      startDate: new Date("2024-06-17"),
      tasksStartDate: new Date("2024-05-13"),
    };
    
    this.createEdition(edition1).then(edition => {
      // Create sample tasks for edition 2405-A
      const weekMinus5Tasks = [
        {
          editionId: edition.id,
          taskCode: "WM5T01",
          week: "Week -5",
          name: "Check if the cohort for the edition exists and if not create it",
          duration: "0:10:00",
          dueDate: subWeeks(edition.startDate, 5),
          trainingType: "GLR",
          owner: "Miguel",
          assignedTo: "Organizer",
          status: "Done",
          inflexible: false,
          completionDate: subWeeks(edition.startDate, 4)
        },
        {
          editionId: edition.id,
          taskCode: "WM5T02",
          week: "Week -5",
          name: "Create mailing list (names; groups information; schedule; edition)",
          duration: "0:10:00",
          dueDate: subWeeks(edition.startDate, 5),
          trainingType: "GLR",
          owner: "Telmo",
          assignedTo: "Organizer",
          status: "Done",
          inflexible: false,
          completionDate: subWeeks(edition.startDate, 4)
        },
        {
          editionId: edition.id,
          taskCode: "WM5T03",
          week: "Week -5",
          name: "Copy course's path and update exam and assignments dates and configure cohorts",
          duration: "0:15:00",
          dueDate: subWeeks(edition.startDate, 5),
          trainingType: "GLR",
          owner: "Miguel",
          assignedTo: "Organizer",
          status: "Done",
          inflexible: false,
          completionDate: subWeeks(edition.startDate, 4)
        },
        {
          editionId: edition.id,
          taskCode: "WM5T04",
          week: "Week -5",
          name: "Trainers should send changes in the e-learning assignment to Training Team",
          duration: "0:01:00",
          dueDate: subWeeks(edition.startDate, 5),
          trainingType: "GLR",
          owner: "Trainers",
          assignedTo: "Trainers",
          status: "Done",
          inflexible: false,
          completionDate: subWeeks(edition.startDate, 4)
        }
      ];
      
      const weekMinus4Tasks = [
        {
          editionId: edition.id,
          taskCode: "WM4T01",
          week: "Week -4",
          name: "Send welcome to e-learning email",
          duration: "0:10:00",
          dueDate: subWeeks(edition.startDate, 4),
          trainingType: "GLR",
          owner: "Miguel",
          assignedTo: "Organizer",
          status: "Done",
          inflexible: false,
          completionDate: subWeeks(edition.startDate, 3)
        }
      ];
      
      const week5Tasks = [
        {
          editionId: edition.id,
          taskCode: "W5T01",
          week: "Week 5",
          name: "Q&A 2 - Hands-on",
          duration: "2:15:00",
          dueDate: add(edition.startDate, { days: 7 }),
          trainingType: "GLR",
          owner: "Hands-on Q&A",
          assignedTo: "Hands-on Q&A",
          status: "Done",
          inflexible: true,
          completionDate: add(edition.startDate, { days: 7 })
        },
        {
          editionId: edition.id,
          taskCode: "W5T02",
          week: "Week 5",
          name: "Q&A 3 - Hands-on",
          duration: "2:15:00",
          dueDate: add(edition.startDate, { days: 9 }),
          trainingType: "GLR",
          owner: "Hands-on Q&A",
          assignedTo: "Hands-on Q&A",
          status: "Pending",
          inflexible: true
        },
        {
          editionId: edition.id,
          taskCode: "W5T03",
          week: "Week 5",
          name: "Platform Engineering reset training environments next week (alert)",
          duration: "0:01:00",
          dueDate: add(edition.startDate, { days: 11 }),
          trainingType: "GLR",
          owner: "Platform Engineering",
          assignedTo: "Enviroment",
          status: "Pending",
          inflexible: true
        },
        {
          editionId: edition.id,
          taskCode: "W5T04",
          week: "Week 5",
          name: "Mailing survey Hands-on stage & Download previous edition surveys",
          duration: "0:15:00",
          dueDate: add(edition.startDate, { days: 11 }),
          trainingType: "GLR",
          owner: "Miguel",
          assignedTo: "Organizer",
          status: "In Progress",
          inflexible: true,
          notes: "Send survey to all participants by email. Download previous surveys for comparison. Update mailing list with completion status."
        },
        {
          editionId: edition.id,
          taskCode: "W5T05",
          week: "Week 5",
          name: "Send exam information to trainees",
          duration: "0:10:00",
          dueDate: add(edition.startDate, { days: 11 }),
          trainingType: "GLR",
          owner: "Telmo",
          assignedTo: "Organizer",
          status: "Not Started",
          inflexible: false
        },
        {
          editionId: edition.id,
          taskCode: "W5T06",
          week: "Week 5",
          name: "Send VM's and practice exam information for Administrators",
          duration: "0:10:00",
          dueDate: add(edition.startDate, { days: 11 }),
          trainingType: "GLR",
          owner: "Telmo",
          assignedTo: "Organizer",
          status: "Not Started",
          inflexible: false
        }
      ];
      
      const week6Tasks = [
        {
          editionId: edition.id,
          taskCode: "W6T01",
          week: "Week 6",
          name: "Reset training environments for exam (upload Master Data)",
          duration: "0:01:00",
          dueDate: add(edition.startDate, { days: 14 }),
          trainingType: "GLR",
          owner: "Platform Engineering",
          assignedTo: "Enviroment",
          status: "Not Started",
          inflexible: true
        },
        {
          editionId: edition.id,
          taskCode: "W6T02",
          week: "Week 6",
          name: "Send Modelers environment information - after Platform Engineering it is ok and Training teams checked the environments",
          duration: "0:10:00",
          dueDate: add(edition.startDate, { days: 14 }),
          trainingType: "GLR",
          owner: "Organizer",
          assignedTo: "Organizer",
          status: "Not Started",
          inflexible: false
        },
        {
          editionId: edition.id,
          taskCode: "W6T03",
          week: "Week 6",
          name: "Request Platform Engineering to remove cloud environment and delete training Boxs",
          duration: "0:05:00",
          dueDate: add(edition.startDate, { days: 14 }),
          trainingType: "GLR",
          owner: "Organizer",
          assignedTo: "Organizer",
          status: "Not Started",
          inflexible: false
        }
      ];
      
      // Create all tasks
      [...weekMinus5Tasks, ...weekMinus4Tasks, ...week5Tasks, ...week6Tasks].forEach(task => {
        this.createTask(task);
      });
    });
    
    // Create the other editions
    this.createEdition(edition2);
    this.createEdition(edition3);
  }
}

// Helper function to adjust dates when duplicating editions
function adjustDate(originalDate: Date, originalStartDate: Date, newStartDate: Date): Date {
  const differenceInMs = newStartDate.getTime() - originalStartDate.getTime();
  return new Date(originalDate.getTime() + differenceInMs);
}

// Using dynamic import for PostgresSessionStore
function createPostgresSessionStore(session: any) {
  return async function() {
    const { default: connectPg } = await import('connect-pg-simple');
    return connectPg(session);
  };
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;
  
  constructor() {
    // Use the memory store temporarily for session storage
    // We'll avoid session setup issues in the constructor
    const MemoryStore = createMemoryStore(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }
  
  // Resource methods
  async getTaskResources(taskId: number): Promise<Resource[]> {
    const { db, eq, desc } = await import("./db");
    return db.select()
      .from(resources)
      .where(eq(resources.taskId, taskId))
      .orderBy(desc(resources.createdAt));
  }

  async getResource(id: number): Promise<Resource | undefined> {
    const { db, eq } = await import("./db");
    const [resource] = await db.select().from(resources).where(eq(resources.id, id));
    return resource || undefined;
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const { db } = await import("./db");
    const [newResource] = await db.insert(resources).values(resource).returning();
    return newResource;
  }

  async updateResource(id: number, resourceData: Partial<Resource>): Promise<Resource> {
    const { db } = await import("./db");
    const [updatedResource] = await db
      .update(resources)
      .set(resourceData)
      .where(eq(resources.id, id))
      .returning();
    
    if (!updatedResource) {
      throw new Error(`Resource with id ${id} not found`);
    }
    
    return updatedResource;
  }

  async deleteResource(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  }
  
  // Mention methods
  async createMention(mention: InsertMention): Promise<Mention> {
    const { db } = await import("./db");
    const [newMention] = await db.insert(mentions).values({
      ...mention,
      isRead: false
    }).returning();
    
    // Create a notification for the mentioned user
    await this.createNotification({
      userId: mention.userId,
      type: "task_assigned",
      title: "You were mentioned in a task",
      message: `You were mentioned in task`,
      entityType: "task",
      entityId: mention.taskId,
      actionUrl: `/tasks/${mention.taskId}`
    });
    
    return newMention;
  }

  async getTaskMentions(taskId: number): Promise<Mention[]> {
    const { db, eq, desc } = await import("./db");
    return db.select()
      .from(mentions)
      .where(eq(mentions.taskId, taskId))
      .orderBy(desc(mentions.createdAt));
  }

  async getUserMentions(userId: number, isRead?: boolean): Promise<Mention[]> {
    const { db, eq, and, desc } = await import("./db");
    
    if (isRead !== undefined) {
      return db.select().from(mentions)
        .where(and(
          eq(mentions.userId, userId),
          eq(mentions.isRead, isRead)
        ))
        .orderBy(desc(mentions.createdAt));
    } else {
      return db.select().from(mentions)
        .where(eq(mentions.userId, userId))
        .orderBy(desc(mentions.createdAt));
    }
  }

  async markMentionAsRead(id: number): Promise<Mention> {
    const { db } = await import("./db");
    const [updatedMention] = await db
      .update(mentions)
      .set({ isRead: true })
      .where(eq(mentions.id, id))
      .returning();
    
    if (!updatedMention) {
      throw new Error(`Mention with id ${id} not found`);
    }
    
    return updatedMention;
  }
  
  // Task comment methods
  async getTaskComments(taskId: number): Promise<TaskComment[]> {
    const { db, eq, desc } = await import("./db");
    return db.select()
      .from(taskComments)
      .where(eq(taskComments.taskId, taskId))
      .orderBy(desc(taskComments.createdAt));
  }
  
  async getTaskComment(id: number): Promise<TaskComment | undefined> {
    const { db, eq } = await import("./db");
    const [comment] = await db.select().from(taskComments).where(eq(taskComments.id, id));
    return comment || undefined;
  }

  async createTaskComment(comment: InsertTaskComment): Promise<TaskComment> {
    const { db, eq } = await import("./db");
    const [newComment] = await db.insert(taskComments).values({
      ...comment,
      createdAt: new Date(),
      updatedAt: null
    }).returning();
    
    // Process mentions in the comment content
    const mentionRegex = /@(\w+)/g;
    const mentionedUsers = new Set();
    let match;
    
    while ((match = mentionRegex.exec(comment.content)) !== null) {
      const username = match[1];
      const user = await this.getUserByUsername(username);
      
      if (user && !mentionedUsers.has(user.id)) {
        mentionedUsers.add(user.id);
        
        // Create a mention
        await this.createMention({
          taskId: comment.taskId,
          userId: user.id,
          commentId: newComment.id,
          createdBy: comment.userId
        });
      }
    }
    
    return newComment;
  }

  async updateTaskComment(id: number, commentData: Partial<TaskComment>): Promise<TaskComment> {
    const { db } = await import("./db");
    const [updatedComment] = await db
      .update(taskComments)
      .set({
        ...commentData,
        updatedAt: new Date()
      })
      .where(eq(taskComments.id, id))
      .returning();
    
    if (!updatedComment) {
      throw new Error(`Comment with id ${id} not found`);
    }
    
    return updatedComment;
  }

  async deleteTaskComment(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const result = await db.delete(taskComments).where(eq(taskComments.id, id)).returning();
    return result.length > 0;
  }
  
  async getUser(id: number): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { db } = await import("./db");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getAllUsers(): Promise<User[]> {
    const { db } = await import("./db");
    return db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  async updateUser(id: number, userData: Partial<User>): Promise<User> {
    const { db } = await import("./db");
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    
    return updatedUser;
  }
  
  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const { db } = await import("./db");
    const [auditLog] = await db.insert(auditLogs).values(log).returning();
    return auditLog;
  }
  
  async getAuditLogs(entityType?: string, entityId?: number): Promise<AuditLog[]> {
    const { db, eq, and } = await import("./db");
    
    let conditions = [];
    if (entityType) {
      conditions.push(eq(auditLogs.entityType, entityType));
    }
    
    if (entityId) {
      conditions.push(eq(auditLogs.entityId, entityId));
    }
    
    if (conditions.length > 0) {
      return db.select().from(auditLogs)
        .where(and(...conditions))
        .orderBy(auditLogs.timestamp);
    } else {
      return db.select().from(auditLogs)
        .orderBy(auditLogs.timestamp);
    }
  }
  
  // Trainer methods
  async getAllTrainers(): Promise<Trainer[]> {
    const { db } = await import("./db");
    return db.select().from(trainers);
  }
  
  async getTrainer(id: number): Promise<Trainer | undefined> {
    const { db } = await import("./db");
    const [trainer] = await db.select().from(trainers).where(eq(trainers.id, id));
    return trainer || undefined;
  }
  
  async createTrainer(trainer: InsertTrainer): Promise<Trainer> {
    const { db } = await import("./db");
    const [newTrainer] = await db.insert(trainers).values(trainer).returning();
    return newTrainer;
  }
  
  async updateTrainer(id: number, trainerData: Partial<Trainer>): Promise<Trainer> {
    const { db } = await import("./db");
    const [updatedTrainer] = await db
      .update(trainers)
      .set(trainerData)
      .where(eq(trainers.id, id))
      .returning();
    
    if (!updatedTrainer) {
      throw new Error(`Trainer with id ${id} not found`);
    }
    
    return updatedTrainer;
  }
  
  async deleteTrainer(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const result = await db.delete(trainers).where(eq(trainers.id, id)).returning();
    return result.length > 0;
  }
  
  async getAllEditions(): Promise<Edition[]> {
    const { db } = await import("./db");
    return db.select().from(editions);
  }

  async getEdition(id: number): Promise<Edition | undefined> {
    const { db } = await import("./db");
    const [edition] = await db.select().from(editions).where(eq(editions.id, id));
    return edition || undefined;
  }

  async getEditionByCode(code: string): Promise<Edition | undefined> {
    const { db } = await import("./db");
    const [edition] = await db.select().from(editions).where(eq(editions.code, code));
    return edition || undefined;
  }

  async createEdition(edition: InsertEdition): Promise<Edition> {
    const { db } = await import("./db");
    // Add default values for status and currentWeek
    const editionWithDefaults = {
      ...edition,
      status: "active",
      currentWeek: 1,
      archived: false
    };
    const [newEdition] = await db.insert(editions).values(editionWithDefaults).returning();
    return newEdition;
  }

  async updateEdition(id: number, editionData: Partial<Edition>): Promise<Edition> {
    const { db } = await import("./db");
    const [updatedEdition] = await db
      .update(editions)
      .set(editionData)
      .where(eq(editions.id, id))
      .returning();
    
    if (!updatedEdition) {
      throw new Error(`Edition with id ${id} not found`);
    }
    
    return updatedEdition;
  }

  async deleteEdition(id: number): Promise<boolean> {
    const { db } = await import("./db");
    // First delete all tasks associated with this edition
    await db.delete(tasks).where(eq(tasks.editionId, id));
    
    // Then delete the edition
    const result = await db.delete(editions).where(eq(editions.id, id)).returning();
    return result.length > 0;
  }

  async getAllTasks(): Promise<Task[]> {
    const { db } = await import("./db");
    return db.select().from(tasks);
  }

  async getTasksByEdition(editionId: number): Promise<Task[]> {
    const { db } = await import("./db");
    return db.select().from(tasks).where(eq(tasks.editionId, editionId));
  }

  async getTasksByEditionAndWeek(editionId: number, week: string): Promise<Task[]> {
    const { db } = await import("./db");
    return db
      .select()
      .from(tasks)
      .where(and(
        eq(tasks.editionId, editionId),
        eq(tasks.week, week)
      ));
  }

  async getTask(id: number): Promise<Task | undefined> {
    const { db } = await import("./db");
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task || undefined;
  }

  async createTask(task: InsertTask): Promise<Task> {
    const { db } = await import("./db");
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<Task>): Promise<Task> {
    try {
      const { db } = await import("./db");
      
      // Clean up the data - ensure null values are properly handled
      const cleanedData: any = {};
      for (const [key, value] of Object.entries(taskData)) {
        // Skip undefined values
        if (value === undefined) continue;
        
        // Handle dates
        if (key === 'dueDate' || key === 'completionDate') {
          if (value === null) {
            cleanedData[key] = null;
          } else if (value instanceof Date) {
            cleanedData[key] = value;
          } else if (typeof value === 'string') {
            cleanedData[key] = new Date(value);
          }
        } else {
          cleanedData[key] = value;
        }
      }
      
      console.log(`Cleaning task data for update: ${id}`, { before: taskData, after: cleanedData });
      
      const [updatedTask] = await db
        .update(tasks)
        .set(cleanedData)
        .where(eq(tasks.id, id))
        .returning();
      
      if (!updatedTask) {
        throw new Error(`Task with id ${id} not found`);
      }
      
      return updatedTask;
    } catch (error) {
      console.error(`Error in updateTask: ${id}`, error);
      throw error;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  async duplicateEdition(editionId: number, newEditionData: InsertEdition): Promise<Edition> {
    const { db } = await import("./db");
    const { calculateTaskDueDate, getCurrentWeekFromDate } = await import("../client/src/lib/utils");
    
    // First, get the source edition
    const sourceEdition = await this.getEdition(editionId);
    if (!sourceEdition) {
      throw new Error(`Edition with id ${editionId} not found`);
    }
    
    // Calculate the current week based on today's date relative to the start date
    const today = new Date();
    const newStartDate = new Date(newEditionData.startDate);
    const currentWeek = getCurrentWeekFromDate(today, newStartDate);
    
    // Create the new edition with default values
    const editionWithDefaults = {
      ...newEditionData,
      status: "active",
      currentWeek
    };
    
    // Use a transaction to ensure all operations succeed or fail together
    const newEdition = await db.transaction(async (tx) => {
      // Create new edition
      const [newEdition] = await tx
        .insert(editions)
        .values(editionWithDefaults)
        .returning();
      
      // Get all tasks from the source edition
      const sourceTasks = await tx
        .select()
        .from(tasks)
        .where(eq(tasks.editionId, editionId));
      
      // Create new tasks in the new edition
      const newStartDate = new Date(newEdition.startDate);
      
      // Prepare batch insert for all tasks
      if (sourceTasks.length > 0) {
        const taskValues = sourceTasks.map(sourceTask => {
          const { id, editionId, completionDate, ...taskProps } = sourceTask;
          
          // Calculate the due date based on the week number and new start date
          // Extract just the number from the week string (e.g., "Week -5" -> "-5")
          const weekNumber = taskProps.week.replace(/Week\s+/, "");
          const dueDate = calculateTaskDueDate(weekNumber, newStartDate);
          
          return {
            ...taskProps,
            editionId: newEdition.id,
            dueDate: dueDate,
            status: "Not Started",
            completionDate: null,
          };
        });
        
        await tx.insert(tasks).values(taskValues);
      }
      
      return newEdition;
    });
    
    return newEdition;
  }

  // Notification methods
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const { db } = await import("./db");
    const [newNotification] = await db.insert(notifications).values({
      ...notification,
      isRead: false,
      createdAt: new Date()
    }).returning();
    return newNotification;
  }

  async getUserNotifications(userId: number, limit: number = 10, includeRead: boolean = false): Promise<Notification[]> {
    const { db, and, eq, desc } = await import("./db");
    
    if (includeRead) {
      // All notifications for the user
      return db.select().from(notifications)
        .where(eq(notifications.userId, userId))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    } else {
      // Only unread notifications
      return db.select().from(notifications)
        .where(and(
          eq(notifications.userId, userId),
          eq(notifications.isRead, false)
        ))
        .orderBy(desc(notifications.createdAt))
        .limit(limit);
    }
  }

  async getNotification(id: number): Promise<Notification | undefined> {
    const { db, eq } = await import("./db");
    
    const [notification] = await db.select().from(notifications)
      .where(eq(notifications.id, id));
    
    return notification || undefined;
  }

  async markNotificationAsRead(id: number): Promise<Notification> {
    const { db, eq } = await import("./db");
    
    const [updatedNotification] = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id))
      .returning();
    
    if (!updatedNotification) {
      throw new Error(`Notification with id ${id} not found`);
    }
    
    return updatedNotification;
  }

  async markAllNotificationsAsRead(userId: number): Promise<boolean> {
    const { db, eq } = await import("./db");
    
    const result = await db.update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.userId, userId))
      .returning();
    
    return result.length > 0;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const { db, eq } = await import("./db");
    
    const result = await db.delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    
    return result.length > 0;
  }

  async getUnreadNotificationCount(userId: number): Promise<number> {
    const { db, eq, and, count } = await import("./db");
    
    const [result] = await db.select({ count: count() })
      .from(notifications)
      .where(and(
        eq(notifications.userId, userId),
        eq(notifications.isRead, false)
      ));
    
    return result ? result.count : 0;
  }

  // Method to seed initial data for the database
  async seedInitialData(): Promise<void> {
    const { db } = await import("./db");
    const { scrypt, randomBytes } = await import("crypto");
    const { promisify } = await import("util");
    
    const scryptAsync = promisify(scrypt);
    
    // Helper function to hash passwords
    async function hashPassword(password: string) {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(password, salt, 64)) as Buffer;
      return `${buf.toString("hex")}.${salt}`;
    }
    
    // Check if any users exist
    const existingUsers = await db.select({ count: count() }).from(users);
    
    // Create default users if none exist
    if (existingUsers[0].count === 0) {
      // Create admin users
      await db.insert(users).values([
        {
          username: "admin",
          password: await hashPassword("admin123"),
          fullName: "Administrator",
          email: "admin@example.com",
          role: "admin"
        },
        {
          username: "Telmo",
          password: await hashPassword("telmo123"),
          fullName: "Telmo Silva",
          email: "telmosilva@criticalmanufacturing.com",
          role: "admin" // Set Telmo as admin by default
        }
      ]);
      
      console.log("Default users created.");
    }
    
    // We won't seed any editions by default
    // Users should create their own editions through the UI
    // This way deleted editions will stay deleted
    return;
    
    // Create some sample editions
    const edition1: InsertEdition & { status: string; currentWeek: number } = {
      code: "2405-A",
      trainingType: "GLR",
      startDate: new Date("2024-05-01"),
      tasksStartDate: new Date("2024-03-20"),
      status: "active",
      currentWeek: 5
    };
    
    const edition2: InsertEdition & { status: string; currentWeek: number } = {
      code: "2405-B",
      trainingType: "SLR",
      startDate: new Date("2024-05-15"),
      tasksStartDate: new Date("2024-04-10"),
      status: "active",
      currentWeek: 4
    };
    
    const edition3: InsertEdition & { status: string; currentWeek: number } = {
      code: "2406-A",
      trainingType: "GLR",
      startDate: new Date("2024-06-01"),
      tasksStartDate: new Date("2024-04-20"),
      status: "active",
      currentWeek: 2
    };
    
    // Insert editions and get their IDs
    const [e1, e2, e3] = await db.transaction(async (tx) => {
      const [e1] = await tx.insert(editions).values(edition1).returning();
      const [e2] = await tx.insert(editions).values(edition2).returning();
      const [e3] = await tx.insert(editions).values(edition3).returning();
      return [e1, e2, e3];
    });
    
    // Create sample tasks for the first edition
    const weeks = ["-5", "-4", "-3", "-2", "-1", "1", "2", "3", "4", "5", "6", "7", "8"];
    const owners = ["Training Team", "Solution Expert", "Partner"];
    
    // Prepare tasks for first edition
    const tasks1 = Array.from({ length: 50 }, (_, i) => {
      const i1 = i + 1;
      const weekIndex = Math.floor(Math.random() * weeks.length);
      const week = weeks[weekIndex];
      
      const status = parseInt(week) < (e1.currentWeek || 1)
        ? Math.random() > 0.2 ? "Done" : "In Progress" 
        : parseInt(week) === (e1.currentWeek || 1)
          ? Math.random() > 0.7 ? "Not Started" : "In Progress"
          : "Not Started";
      
      return {
        editionId: e1.id,
        taskCode: `T${i1.toString().padStart(2, '0')}`,
        week,
        name: `Task ${i1} for Week ${week}`,
        trainingType: Math.random() > 0.3 ? "GLR" : "SLR",
        duration: `${Math.floor(Math.random() * 4) + 1}h`,
        // Set some tasks as overdue, some as upcoming, and some further in the future
        dueDate: i1 % 3 === 0 
          ? new Date(Date.now() - 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 5) + 1)) // Overdue (1-5 days ago)
          : i1 % 3 === 1
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 7) + 1)) // Upcoming (next 7 days)
            : new Date("2024-05-15"), // Further in the future
        owner: owners[Math.floor(Math.random() * owners.length)],
        status,
        completionDate: status === "Done" ? new Date("2024-04-20") : null,
        assignedTo: "Training Coordinator",
        notes: `Sample notes for task ${i1}`,
        links: null,
        inflexible: Math.random() > 0.7
      };
    });
    
    // Prepare tasks for second edition
    const tasks2 = Array.from({ length: 20 }, (_, i) => {
      const i1 = i + 1;
      const weekIndex = Math.floor(Math.random() * weeks.length);
      const week = weeks[weekIndex];
      
      const status = parseInt(week) < (e2.currentWeek || 1)
        ? Math.random() > 0.2 ? "Done" : "In Progress" 
        : parseInt(week) === (e2.currentWeek || 1)
          ? Math.random() > 0.7 ? "Not Started" : "In Progress"
          : "Not Started";
      
      return {
        editionId: e2.id,
        taskCode: `B${i1.toString().padStart(2, '0')}`,
        week,
        name: `Task ${i1} for Week ${week} (Edition B)`,
        trainingType: "SLR",
        duration: `${Math.floor(Math.random() * 4) + 1}h`,
        // Set some tasks as overdue, some as upcoming, and some further in the future
        dueDate: i1 % 3 === 0 
          ? new Date(Date.now() - 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 5) + 1)) // Overdue (1-5 days ago)
          : i1 % 3 === 1
            ? new Date(Date.now() + 1000 * 60 * 60 * 24 * (Math.floor(Math.random() * 7) + 1)) // Upcoming (next 7 days)
            : new Date("2024-06-01"), // Further in the future
        owner: owners[Math.floor(Math.random() * owners.length)],
        status,
        completionDate: status === "Done" ? new Date("2024-04-25") : null,
        assignedTo: "Training Coordinator",
        notes: `Sample notes for task ${i1} (Edition B)`,
        links: null,
        inflexible: Math.random() > 0.7
      };
    });
    
    // Insert all tasks in batches 
    await db.insert(tasks).values([...tasks1, ...tasks2]);
  }
}

// Initialize the database and seed data
const dbStorage = new DatabaseStorage();
dbStorage.seedInitialData()
  .catch(error => {
    console.error("Error seeding database:", error);
  });

// Use the database storage implementation
export const storage = dbStorage;
