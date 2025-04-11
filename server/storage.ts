import {
  Edition,
  InsertEdition,
  Task,
  InsertTask,
  User,
  InsertUser,
  users,
  editions,
  tasks
} from "@shared/schema";
import { add, format, parseISO, isBefore, subWeeks } from "date-fns";
import { and, eq, count } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need
export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

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
  
  // Helper method to duplicate edition with tasks
  duplicateEdition(editionId: number, newEditionData: InsertEdition): Promise<Edition>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private editions: Map<number, Edition>;
  private tasks: Map<number, Task>;
  private currentUserId: number;
  private currentEditionId: number;
  private currentTaskId: number;

  constructor() {
    this.users = new Map();
    this.editions = new Map();
    this.tasks = new Map();
    this.currentUserId = 1;
    this.currentEditionId = 1;
    this.currentTaskId = 1;

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

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
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
    const newEdition: Edition = { ...edition, id, status: "active", currentWeek: 1 };
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
    const newTask: Task = { ...task, id };
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

export class DatabaseStorage implements IStorage {
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const { db } = await import("./db");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
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
      currentWeek: 1
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
    const { db } = await import("./db");
    const [updatedTask] = await db
      .update(tasks)
      .set(taskData)
      .where(eq(tasks.id, id))
      .returning();
    
    if (!updatedTask) {
      throw new Error(`Task with id ${id} not found`);
    }
    
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    const { db } = await import("./db");
    const result = await db.delete(tasks).where(eq(tasks.id, id)).returning();
    return result.length > 0;
  }

  async duplicateEdition(editionId: number, newEditionData: InsertEdition): Promise<Edition> {
    const { db } = await import("./db");
    
    // First, get the source edition
    const sourceEdition = await this.getEdition(editionId);
    if (!sourceEdition) {
      throw new Error(`Edition with id ${editionId} not found`);
    }
    
    // Create the new edition with default values
    const editionWithDefaults = {
      ...newEditionData,
      status: "active",
      currentWeek: 1
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
      const originalStartDate = new Date(sourceEdition.startDate);
      const newStartDate = new Date(newEdition.startDate);
      
      // Prepare batch insert for all tasks
      if (sourceTasks.length > 0) {
        const taskValues = sourceTasks.map(sourceTask => {
          const { id, editionId, completionDate, ...taskProps } = sourceTask;
          
          // Adjust dates based on the new start date
          let newDueDate = taskProps.dueDate ? adjustDate(new Date(taskProps.dueDate), originalStartDate, newStartDate) : null;
          let newTaskStartDate = taskProps.startDate ? adjustDate(new Date(taskProps.startDate), originalStartDate, newStartDate) : null;
          let newEndDate = taskProps.endDate ? adjustDate(new Date(taskProps.endDate), originalStartDate, newStartDate) : null;
          
          return {
            ...taskProps,
            editionId: newEdition.id,
            dueDate: newDueDate?.toISOString() || null,
            startDate: newTaskStartDate?.toISOString() || null,
            endDate: newEndDate?.toISOString() || null,
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

  // Method to seed initial data for the database
  async seedInitialData(): Promise<void> {
    const { db } = await import("./db");
    
    // Check if any editions exist
    const existingEditions = await db.select({ count: count() }).from(editions);
    
    // If editions already exist, don't seed
    if (existingEditions[0].count > 0) {
      return;
    }
    
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
        dueDate: new Date("2024-05-15"),
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
        dueDate: new Date("2024-06-01"),
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
