# Training Session Management Application - User Guide

This guide provides step-by-step instructions on how to use the Training Session Management Application efficiently.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Dashboard Navigation](#dashboard-navigation)
3. [Managing Editions](#managing-editions)
4. [Working with Tasks](#working-with-tasks)
5. [User and Permission Management](#user-and-permission-management)
6. [Collaboration Features](#collaboration-features)
7. [PWA Features](#pwa-features)
8. [Settings and Preferences](#settings-and-preferences)
9. [Tips and Best Practices](#tips-and-best-practices)

## Getting Started

### First-Time Login

1. Use the default credentials provided by your administrator:
   - Default admin: `admin`/`admin123`
   - New users: Username provided by admin / `ChangeMe123!`

2. You'll be prompted to change your password on first login.

3. After successful login, you'll land on the dashboard showing your current active editions and pending tasks.

### Installing as a PWA

1. On Chrome or Edge, look for the install icon (⊕) in the URL bar.
2. On Safari (iOS), tap the Share icon, then "Add to Home Screen."
3. This allows you to access the application like a native app without opening a browser.

## Dashboard Navigation

The dashboard provides a quick overview of:

- **Upcoming Editions**: Sessions with future start dates
- **Overdue Tasks**: Tasks past their due date requiring attention
- **Upcoming Tasks**: Tasks due within the next 7 days
- **Recent Activity**: Latest actions within the system

Use the sidebar or bottom navigation (on mobile) to access:

- Editions
- Tasks
- Trainers
- Users (Admins only)
- Settings

## Managing Editions

### Creating a New Edition

1. Navigate to **Editions** in the sidebar.
2. Click the **Create Edition** button.
3. Fill in the required details:
   - **Edition Code**: Follow the format YYMM-[A/B] (e.g., 2405-A for May 2024 Customer training)
   - **Training Type**: Choose GLR (Guided Learning Route) or SLR (Self Learning Route)
   - **Start Date**: When the training begins (Week 1)
   - **End Date**: When the training ends
   - **Description**: Optional additional details

4. Choose to either:
   - **Create Empty Edition**: No pre-populated tasks
   - **Use Template**: Populate with tasks from the active template or a specific template
   - **Duplicate Existing**: Copy all tasks from another edition

5. Click **Create** to finalize.

### Managing Edition Status

1. From the **Editions** list, click the three-dot menu for an edition.
2. Options include:
   - **Edit**: Modify edition details
   - **Archive/Unarchive**: Hide/show edition from active lists
   - **Delete**: Permanently remove the edition and all its tasks

### Viewing Edition Details

Click on any edition to see:
- Task breakdown by week
- Overall completion status
- Assigned trainers
- Resource materials

## Working with Tasks

### Task Organization

Tasks are organized by weeks:
- **Pre-session weeks**: -5 to -1 (preparation activities)
- **Session weeks**: 1 to 8 (delivery activities)

### Adding a New Task

1. From a specific edition, click **Add Task**.
2. Fill in the task details:
   - **Week**: Which week this task belongs to
   - **Task Name**: Clear, descriptive name
   - **Training Type**: GLR, SLR, or All
   - **Duration**: Estimated time needed
   - **Due Date**: When the task must be completed
   - **Owner**: Person/role responsible
   - **Notes**: Any additional information
   - **Inflexible**: Toggle if the task has a fixed date that cannot be moved

3. Click **Save** to add the task.

### Task Actions

For each task, you can:
- **Update Status**: Click the status badge to cycle through states (Not Started → In Progress → Done)
- **View Details**: Click the task row to see full information
- **Add Comment**: Share information with team members
- **Mention Others**: Use @username to notify specific people
- **Attach Resources**: Add links, documents, or other materials
- **View History**: See all changes and activities related to the task

## User and Permission Management

### User Roles

- **Admin**: Full access to all features, including user management
- **Editor**: Can modify editions and tasks, but not manage users
- **Viewer**: Read-only access to all content

### Managing Users (Admin Only)

1. Navigate to **Users** in the sidebar.
2. From here you can:
   - **Create User**: Add new system users
   - **Edit User**: Update existing user details
   - **Approve User**: New users require admin approval
   - **Reset Password**: Force password reset for users
   - **Delete User**: Remove users from the system

### Trainer Management

1. Go to **Trainers** in the sidebar.
2. Here you can:
   - Add trainer profiles with specialties and contact information
   - Assign trainers to specific editions
   - Track trainer performance across editions

## Collaboration Features

### Task Comments and Mentions

1. Open any task and scroll to the comments section.
2. Type your message, using @ followed by a username to mention someone.
3. Mentioned users will receive a notification.

### Resource Sharing

1. From task details, click **Add Resource**.
2. You can:
   - Upload files (documents, presentations)
   - Add links to external resources
   - Provide descriptive notes for the resources

### Notifications

1. Check the bell icon in the top navigation bar for notifications.
2. You'll be notified when:
   - You're mentioned in a comment
   - A task is assigned to you
   - A task deadline is approaching
   - A task you own changes status

## PWA Features

### Offline Access

1. Once installed as a PWA, the application caches your most recent data.
2. You can view editions and tasks without an internet connection.
3. Changes made offline will sync when you reconnect.

### Notifications

1. Enable push notifications in settings to receive alerts even when the application isn't open.
2. Task due date reminders will appear as system notifications.

## Settings and Preferences

Access the settings page to configure:

1. **Language**: Choose from six available languages
2. **Notification Preferences**: 
   - Email notifications
   - Push notifications
   - Notification frequency
3. **Session Timeout**: How long until automatic logout
4. **Remember Me**: Enable/disable persistent login
5. **Default View**: Which page loads on login
6. **Theme Preferences**: Light/Dark mode, accent colors

## Tips and Best Practices

### Efficient Edition Management

- Use templates for recurring training sessions
- Create task templates for common activities
- Archive completed editions to keep your active list clean

### Task Organization

- Assign clear owners for accountability
- Use consistent naming conventions
- Set realistic due dates, factoring in dependencies
- Use the notes field to document requirements and expectations

### Collaboration

- Use @mentions sparingly to avoid notification fatigue
- Add detailed comments to provide context for task status changes
- Regularly check the dashboard for overdue and upcoming tasks

### Mobile Usage

- Install as a PWA for better mobile experience
- Use the bottom navigation for quicker access on mobile devices
- Set notification preferences appropriate for mobile usage

For additional help or to report issues, contact your system administrator.