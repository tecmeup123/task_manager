# Training Session Management Application

A mobile-first training session management application with Progressive Web App (PWA) capabilities, providing intelligent task tracking and advanced performance analytics with enhanced user engagement features.

![Training Session Management App](generated-icon.png)

## Overview

This application streamlines the management of training sessions for both Customers (A-type) and Partners (B-type) with a powerful template-based approach. It helps training coordinators efficiently manage tasks ranging from week -5 to week 8, ensuring all preparation, delivery, and follow-up activities are properly tracked and completed on time.

## Key Features

### Edition Management
- Create and manage training editions with structured format (YYMM-[A/B])
- Archive and restore functionality for completed editions
- Duplicate existing editions to rapidly create new ones with similar configuration

### Task Management
- Template-based task creation for quick session setup
- Automatic task generation for new editions based on templates
- Robust week-based organization from pre-session prep (-5 to -1) through delivery (1-8)
- Task status tracking (Not Started, In Progress, Done)
- Intelligent task due date calculations (accounting for working days)
- Task ownership and assignment workflow

### User Management
- Role-based permissions (Admin, Editor, Viewer)
- Trainer management with customizable profiles and specialties
- First-time login password change enforcement
- Activity and audit logging

### Collaboration Features
- Task commenting system with @mentions
- Real-time notifications for assigned tasks and mentions
- Resource attachment and sharing
- Task history with detailed audit trails

### Multilingual Support
- Full internationalization with support for six languages
- Language persistence using local storage

### Progressive Web App
- Installable on mobile and desktop devices
- Offline functionality for viewing tasks and editions
- Push notifications for approaching deadlines
- Configurable settings (notifications, session timeout)

### Dashboard and Analytics
- Overview of overdue and upcoming tasks
- Task completion statistics by edition
- Performance metrics for training teams

## Technology Stack

- **Frontend**: React, TypeScript, TanStack Query
- **Backend**: Express, Node.js
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based with Passport.js
- **Styling**: Tailwind CSS with shadcn/ui components
- **PWA**: Service Workers
- **Internationalization**: i18next

## Deployment

This application can be deployed as a containerized service, making it ideal for cloud environments. The Progressive Web App features allow for installation on users' devices for quick access.