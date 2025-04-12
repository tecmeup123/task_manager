import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser, InsertUser, users } from "@shared/schema";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'training-app-session-secret',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        if (!user || !(await comparePasswords(password, user.password))) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        const safeUser = { ...user };
        delete safeUser.password;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err);
      if (!user) return res.status(401).json({ message: "Invalid credentials" });
      
      req.login(user, (err) => {
        if (err) return next(err);
        const safeUser = { ...user };
        delete safeUser.password;
        
        // Check if this user needs to change their password
        const passwordChangeRequired = user.forcePasswordChange === true;
        
        // Return information about password change requirement along with user data
        return res.status(200).json({
          ...safeUser,
          passwordChangeRequired
        });
      });
    })(req, res, next);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).send();
    const safeUser = { ...req.user };
    delete safeUser.password;
    
    // Check if this user needs to change their password
    const passwordChangeRequired = req.user.forcePasswordChange === true;
    
    res.json({
      ...safeUser,
      passwordChangeRequired
    });
  });

  app.get("/api/users", async (req, res, next) => {
    try {
      if (!req.isAuthenticated() || req.user.role !== 'admin') {
        return res.status(403).json({ message: "Unauthorized access" });
      }
      
      const users = await storage.getAllUsers();
      const safeUsers = users.map(user => {
        const safeUser = { ...user };
        delete safeUser.password;
        return safeUser;
      });
      
      res.json(safeUsers);
    } catch (error) {
      next(error);
    }
  });
  
  // Change password endpoint
  app.post("/api/change-password", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Verify current password
      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const isPasswordValid = await comparePasswords(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      
      // Hash and update the new password
      const hashedPassword = await hashPassword(newPassword);
      const updatedUser = await storage.updateUser(user.id, { 
        password: hashedPassword,
        forcePasswordChange: false 
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        entityType: "user",
        entityId: req.user.id,
        action: "update",
        previousState: { ...user, password: "[REDACTED]" },
        newState: { ...updatedUser, password: "[REDACTED]" },
        notes: "Password changed by user"
      });
      
      // Return updated user
      const safeUser = { ...updatedUser };
      delete safeUser.password;
      
      res.json({
        ...safeUser,
        passwordChangeRequired: false
      });
    } catch (error) {
      console.error("Error changing password:", error);
      next(error);
    }
  });
}