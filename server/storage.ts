import {
  Edition,
  InsertEdition,
  Task,
  InsertTask,
  Task as TaskType,
  Edition as EditionType,
  User,
  InsertUser,
} from "@shared/schema";
import { add, format, parseISO, isBefore, subWeeks } from "date-fns";

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

export const storage = new MemStorage();
