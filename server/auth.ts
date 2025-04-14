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
    secret: process.env.SESSION_SECRET || '6374b9d714b8b3ed22582cdc8e431c80c630c913b3bc1804e510fdbcf0386978',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      maxAge: 2 * 60 * 60 * 1000 // Default to 2 hours
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
      if (user) {
        // Update last active timestamp
        try {
          await storage.updateUser(user.id, { lastActive: new Date() });
        } catch (updateError) {
          console.error('Failed to update last active timestamp:', updateError);
        }
      }
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
        const { password, ...safeUser } = user;
        res.status(201).json(safeUser);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", async (err: any, user: any, info: any) => {
      if (err) return next(err);
      
      // Get client IP and user agent
      const ip = req.ip || req.socket.remoteAddress || 'unknown';
      const userAgent = req.headers['user-agent'] || 'unknown';
      
      // If authentication failed, log the failed attempt and return error
      if (!user) {
        // Log failed login attempt
        try {
          await storage.createLoginActivity({
            userId: 0, // Special user ID for failed logins
            ipAddress: ip,
            userAgent: userAgent,
            success: false,
            location: null,
            deviceInfo: null
          });
        } catch (logError) {
          console.error('Failed to log login attempt:', logError);
        }
        
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // Check if user is approved
      if (user.approved === false && user.role !== 'admin') {
        return res.status(403).json({ message: "Your account is pending approval by an administrator" });
      }
      
      // Use user's session timeout if available, otherwise use default
      const sessionTimeoutMinutes = user.sessionTimeoutMinutes || 120; // Default 2 hours
      
      // Check if "Remember Me" is enabled in user settings or requested in this login
      const rememberMe = req.body.rememberMe || user.rememberMe;
      
      // Set session expiration time
      if (rememberMe) {
        // Set session cookie to expire in 7 days for "Remember Me"
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      } else {
        // Use user's configured timeout
        req.session.cookie.maxAge = sessionTimeoutMinutes * 60 * 1000; // Convert minutes to milliseconds
      }
      
      // Update last active timestamp
      try {
        await storage.updateUser(user.id, { lastActive: new Date() });
      } catch (updateError) {
        console.error('Failed to update last active timestamp:', updateError);
      }
      
      // Log successful login
      try {
        await storage.createLoginActivity({
          userId: user.id,
          ipAddress: ip,
          userAgent: userAgent,
          success: true,
          location: null,
          deviceInfo: null
        });
      } catch (logError) {
        console.error('Failed to log login activity:', logError);
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        const safeUser = { ...user } as Record<string, any>;
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
    const safeUser = { ...req.user } as Record<string, any>;
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
        const safeUser = { ...user } as Record<string, any>;
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
      const safeUser = { ...updatedUser } as Record<string, any>;
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
  
  // Security settings endpoint
  app.post("/api/security-settings", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const { rememberMe, sessionTimeoutMinutes } = req.body;
      
      // Update security settings
      const updatedUser = await storage.updateUserSecuritySettings(req.user.id, {
        rememberMe,
        sessionTimeoutMinutes
      });
      
      // Create audit log
      await storage.createAuditLog({
        userId: req.user.id,
        entityType: "user",
        entityId: req.user.id,
        action: "update",
        previousState: { ...req.user, password: "[REDACTED]" },
        newState: { ...updatedUser, password: "[REDACTED]" },
        notes: "Security settings updated"
      });
      
      // If session timeout was updated, update the current session
      if (sessionTimeoutMinutes && !rememberMe) {
        req.session.cookie.maxAge = sessionTimeoutMinutes * 60 * 1000;
      } else if (rememberMe) {
        // If "Remember Me" was enabled, set long session
        req.session.cookie.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      }
      
      // Return updated user (without password)
      const safeUser = { ...updatedUser } as Record<string, any>;
      delete safeUser.password;
      
      res.json(safeUser);
    } catch (error) {
      console.error("Error updating security settings:", error);
      next(error);
    }
  });
  
  // Get login activity history
  app.get("/api/login-activities", async (req, res, next) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Authentication required" });
      }
      
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      const activities = await storage.getUserLoginActivities(req.user.id, limit);
      
      res.json(activities);
    } catch (error) {
      console.error("Error fetching login activities:", error);
      next(error);
    }
  });
}