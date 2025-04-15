# API Documentation

This document provides comprehensive details about all API endpoints available in the Training Session Management Application.

## Base URL

All API endpoints are prefixed with `/api`.

## Authentication

Most endpoints require authentication. After successful login, the server sets a session cookie that is automatically included in subsequent requests.

### Authentication Endpoints

#### POST /api/login

Authenticates a user and creates a session.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "rememberMe": "boolean" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "preferences": "object"
}
```

#### POST /api/logout

Ends the current user session.

**Response:** `200 OK`

#### GET /api/user

Retrieves the current authenticated user's information.

**Response:** `200 OK`
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "preferences": "object"
}
```

**Response:** `401 Unauthorized` (if not authenticated)

#### POST /api/register

Registers a new user in the system. New users require admin approval.

**Request Body:**
```json
{
  "username": "string",
  "password": "string",
  "fullName": "string",
  "email": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "approved": false
}
```

## User Management

### User Endpoints

#### GET /api/users

Retrieves a list of all users. Requires admin role.

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "username": "string",
    "fullName": "string",
    "email": "string",
    "role": "string",
    "approved": "boolean",
    "lastLogin": "string (date)"
  }
]
```

#### GET /api/users/:id

Retrieves a specific user by ID. Requires admin role or self.

**Response:** `200 OK`
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "preferences": "object"
}
```

#### PATCH /api/users/:id

Updates a user. Requires admin role or self.

**Request Body:**
```json
{
  "fullName": "string" (optional),
  "email": "string" (optional),
  "role": "string" (optional, admin only),
  "approved": "boolean" (optional, admin only),
  "preferences": "object" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "username": "string",
  "fullName": "string",
  "email": "string",
  "role": "string",
  "preferences": "object"
}
```

#### DELETE /api/users/:id

Deletes a user. Requires admin role.

**Response:** `204 No Content`

#### POST /api/users/:id/reset-password

Forces a password reset for a user. Requires admin role.

**Response:** `200 OK`

#### POST /api/users/change-password

Changes the current user's password.

**Request Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```

**Response:** `200 OK`

### Login Activity Endpoints

#### GET /api/login-activities

Gets login activity for the current user or all users (admin only).

**Query Parameters:**
- `userId` (optional): Filter by user ID
- `limit` (optional): Limit number of results

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "userId": "number",
    "username": "string",
    "timestamp": "string (date)",
    "ipAddress": "string",
    "userAgent": "string",
    "successful": "boolean"
  }
]
```

## Edition Management

### Edition Endpoints

#### GET /api/editions

Retrieves a list of all editions.

**Query Parameters:**
- `includeArchived` (optional): Include archived editions (default: false)

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "code": "string",
    "trainingType": "string",
    "startDate": "string (date)",
    "endDate": "string (date)",
    "description": "string",
    "status": "string",
    "currentWeek": "number",
    "archived": "boolean"
  }
]
```

#### GET /api/editions/:id

Retrieves a specific edition by ID.

**Response:** `200 OK`
```json
{
  "id": "number",
  "code": "string",
  "trainingType": "string",
  "startDate": "string (date)",
  "endDate": "string (date)",
  "description": "string",
  "status": "string",
  "currentWeek": "number",
  "archived": "boolean"
}
```

#### POST /api/editions

Creates a new edition. Requires editor or admin role.

**Request Body:**
```json
{
  "code": "string (YYMM-[A/B] format)",
  "trainingType": "string ('GLR' or 'SLR')",
  "startDate": "string (date)",
  "endDate": "string (date)",
  "description": "string",
  "useTemplate": "boolean",
  "templateId": "number" (optional),
  "duplicateFrom": "number" (optional, edition ID to duplicate)
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "code": "string",
  "trainingType": "string",
  "startDate": "string (date)",
  "endDate": "string (date)",
  "description": "string",
  "status": "string",
  "currentWeek": "number",
  "archived": "boolean"
}
```

#### PATCH /api/editions/:id

Updates an edition. Requires editor or admin role.

**Request Body:**
```json
{
  "code": "string" (optional),
  "trainingType": "string" (optional),
  "startDate": "string (date)" (optional),
  "endDate": "string (date)" (optional),
  "description": "string" (optional),
  "currentWeek": "number" (optional),
  "archived": "boolean" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "code": "string",
  "trainingType": "string",
  "startDate": "string (date)",
  "endDate": "string (date)",
  "description": "string",
  "status": "string",
  "currentWeek": "number",
  "archived": "boolean"
}
```

#### DELETE /api/editions/:id

Deletes an edition. Requires admin role.

**Response:** `204 No Content`

## Task Management

### Task Endpoints

#### GET /api/tasks

Retrieves a list of all tasks.

**Query Parameters:**
- `editionId` (optional): Filter by edition ID
- `week` (optional): Filter by week
- `status` (optional): Filter by status
- `owner` (optional): Filter by owner

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "editionId": "number",
    "taskCode": "string",
    "week": "string",
    "name": "string",
    "trainingType": "string",
    "duration": "string",
    "dueDate": "string (date)",
    "owner": "string",
    "status": "string",
    "completionDate": "string (date)",
    "notes": "string",
    "links": "string",
    "inflexible": "boolean"
  }
]
```

#### GET /api/tasks/:id

Retrieves a specific task by ID.

**Response:** `200 OK`
```json
{
  "id": "number",
  "editionId": "number",
  "taskCode": "string",
  "week": "string",
  "name": "string",
  "trainingType": "string",
  "duration": "string",
  "dueDate": "string (date)",
  "owner": "string",
  "status": "string",
  "completionDate": "string (date)",
  "notes": "string",
  "links": "string",
  "inflexible": "boolean"
}
```

#### POST /api/tasks

Creates a new task. Requires editor or admin role.

**Request Body:**
```json
{
  "editionId": "number",
  "taskCode": "string",
  "week": "string",
  "name": "string",
  "trainingType": "string",
  "duration": "string",
  "dueDate": "string (date)",
  "owner": "string",
  "notes": "string" (optional),
  "links": "string" (optional),
  "inflexible": "boolean" (optional)
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "editionId": "number",
  "taskCode": "string",
  "week": "string",
  "name": "string",
  "trainingType": "string",
  "duration": "string",
  "dueDate": "string (date)",
  "owner": "string",
  "status": "string",
  "completionDate": "string (date)",
  "notes": "string",
  "links": "string",
  "inflexible": "boolean"
}
```

#### PATCH /api/tasks/:id

Updates a task. Requires editor or admin role.

**Request Body:**
```json
{
  "taskCode": "string" (optional),
  "week": "string" (optional),
  "name": "string" (optional),
  "trainingType": "string" (optional),
  "duration": "string" (optional),
  "dueDate": "string (date)" (optional),
  "owner": "string" (optional),
  "status": "string" (optional),
  "completionDate": "string (date)" (optional),
  "notes": "string" (optional),
  "links": "string" (optional),
  "inflexible": "boolean" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "editionId": "number",
  "taskCode": "string",
  "week": "string",
  "name": "string",
  "trainingType": "string",
  "duration": "string",
  "dueDate": "string (date)",
  "owner": "string",
  "status": "string",
  "completionDate": "string (date)",
  "notes": "string",
  "links": "string",
  "inflexible": "boolean"
}
```

#### DELETE /api/tasks/:id

Deletes a task. Requires admin role.

**Response:** `204 No Content`

## Task Templates

### Task Template Endpoints

#### GET /api/task-templates

Retrieves all task templates.

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string",
    "data": "object",
    "createdAt": "string (date)",
    "isActive": "boolean",
    "updatedAt": "string (date)",
    "createdBy": "number"
  }
]
```

#### GET /api/task-templates/active

Retrieves the currently active task template.

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "data": "object",
  "createdAt": "string (date)",
  "isActive": "boolean",
  "updatedAt": "string (date)",
  "createdBy": "number"
}
```

#### GET /api/task-templates/:id

Retrieves a specific task template by ID.

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "data": "object",
  "createdAt": "string (date)",
  "isActive": "boolean",
  "updatedAt": "string (date)",
  "createdBy": "number"
}
```

#### POST /api/task-templates

Creates a new task template. Requires admin role.

**Request Body:**
```json
{
  "name": "string",
  "data": "object",
  "isActive": "boolean" (optional)
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "name": "string",
  "data": "object",
  "createdAt": "string (date)",
  "isActive": "boolean",
  "updatedAt": "string (date)",
  "createdBy": "number"
}
```

#### PATCH /api/task-templates/:id

Updates a task template. Requires admin role.

**Request Body:**
```json
{
  "name": "string" (optional),
  "data": "object" (optional),
  "isActive": "boolean" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "data": "object",
  "createdAt": "string (date)",
  "isActive": "boolean",
  "updatedAt": "string (date)",
  "createdBy": "number"
}
```

#### POST /api/task-templates/:id/set-active

Sets a template as the active template. Requires admin role.

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "data": "object",
  "createdAt": "string (date)",
  "isActive": true,
  "updatedAt": "string (date)",
  "createdBy": "number"
}
```

#### DELETE /api/task-templates/:id

Deletes a task template. Requires admin role.

**Response:** `204 No Content`

## Trainers

### Trainer Endpoints

#### GET /api/trainers

Retrieves all trainers.

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "name": "string",
    "email": "string",
    "specialty": "string",
    "bio": "string",
    "active": "boolean"
  }
]
```

#### GET /api/trainers/:id

Retrieves a specific trainer by ID.

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "specialty": "string",
  "bio": "string",
  "active": "boolean"
}
```

#### POST /api/trainers

Creates a new trainer. Requires editor or admin role.

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "specialty": "string",
  "bio": "string" (optional),
  "active": "boolean" (optional)
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "specialty": "string",
  "bio": "string",
  "active": "boolean"
}
```

#### PATCH /api/trainers/:id

Updates a trainer. Requires editor or admin role.

**Request Body:**
```json
{
  "name": "string" (optional),
  "email": "string" (optional),
  "specialty": "string" (optional),
  "bio": "string" (optional),
  "active": "boolean" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "name": "string",
  "email": "string",
  "specialty": "string",
  "bio": "string",
  "active": "boolean"
}
```

#### DELETE /api/trainers/:id

Deletes a trainer. Requires admin role.

**Response:** `204 No Content`

## Resources

### Resource Endpoints

#### GET /api/tasks/:taskId/resources

Retrieves resources for a specific task.

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "taskId": "number",
    "name": "string",
    "type": "string",
    "url": "string",
    "notes": "string",
    "createdAt": "string (date)",
    "createdBy": "number",
    "createdByUsername": "string"
  }
]
```

#### POST /api/resources

Creates a new resource. Requires editor or admin role.

**Request Body:**
```json
{
  "taskId": "number",
  "name": "string",
  "type": "string",
  "url": "string",
  "notes": "string" (optional)
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "taskId": "number",
  "name": "string",
  "type": "string",
  "url": "string",
  "notes": "string",
  "createdAt": "string (date)",
  "createdBy": "number",
  "createdByUsername": "string"
}
```

#### PATCH /api/resources/:id

Updates a resource. Requires editor or admin role.

**Request Body:**
```json
{
  "name": "string" (optional),
  "type": "string" (optional),
  "url": "string" (optional),
  "notes": "string" (optional)
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "taskId": "number",
  "name": "string",
  "type": "string",
  "url": "string",
  "notes": "string",
  "createdAt": "string (date)",
  "createdBy": "number",
  "createdByUsername": "string"
}
```

#### DELETE /api/resources/:id

Deletes a resource. Requires editor or admin role.

**Response:** `204 No Content`

## Task Comments

### Task Comment Endpoints

#### GET /api/tasks/:taskId/comments

Retrieves comments for a specific task.

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "taskId": "number",
    "userId": "number",
    "username": "string",
    "text": "string",
    "createdAt": "string (date)",
    "updatedAt": "string (date)"
  }
]
```

#### POST /api/task-comments

Creates a new task comment.

**Request Body:**
```json
{
  "taskId": "number",
  "text": "string"
}
```

**Response:** `201 Created`
```json
{
  "id": "number",
  "taskId": "number",
  "userId": "number",
  "username": "string",
  "text": "string",
  "createdAt": "string (date)",
  "updatedAt": "string (date)"
}
```

#### PATCH /api/task-comments/:id

Updates a task comment. Limited to comment creator or admin.

**Request Body:**
```json
{
  "text": "string"
}
```

**Response:** `200 OK`
```json
{
  "id": "number",
  "taskId": "number",
  "userId": "number",
  "username": "string",
  "text": "string",
  "createdAt": "string (date)",
  "updatedAt": "string (date)"
}
```

#### DELETE /api/task-comments/:id

Deletes a task comment. Limited to comment creator or admin.

**Response:** `204 No Content`

## Mentions

### Mention Endpoints

#### GET /api/mentions

Retrieves mentions for the current user.

**Query Parameters:**
- `isRead` (optional): Filter by read status

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "taskId": "number",
    "userId": "number",
    "commentId": "number",
    "isRead": "boolean",
    "createdAt": "string (date)",
    "taskName": "string",
    "editionCode": "string",
    "mentionedBy": "string"
  }
]
```

#### PATCH /api/mentions/:id/read

Marks a mention as read.

**Response:** `200 OK`
```json
{
  "id": "number",
  "taskId": "number",
  "userId": "number",
  "commentId": "number",
  "isRead": true,
  "createdAt": "string (date)",
  "taskName": "string",
  "editionCode": "string",
  "mentionedBy": "string"
}
```

## Notifications

### Notification Endpoints

#### GET /api/notifications

Retrieves notifications for the current user.

**Query Parameters:**
- `limit` (optional): Limit number of results
- `includeRead` (optional): Include read notifications

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "userId": "number",
    "title": "string",
    "message": "string",
    "type": "string",
    "read": "boolean",
    "createdAt": "string (date)",
    "link": "string"
  }
]
```

#### GET /api/notifications/count

Gets the count of unread notifications for the current user.

**Response:** `200 OK`
```json
{
  "count": "number"
}
```

#### PATCH /api/notifications/:id/read

Marks a notification as read.

**Response:** `200 OK`
```json
{
  "id": "number",
  "userId": "number",
  "title": "string",
  "message": "string",
  "type": "string",
  "read": true,
  "createdAt": "string (date)",
  "link": "string"
}
```

#### POST /api/notifications/read-all

Marks all notifications as read for the current user.

**Response:** `200 OK`

#### DELETE /api/notifications/:id

Deletes a notification. Limited to notification owner.

**Response:** `204 No Content`

## Audit Logs

### Audit Log Endpoints

#### GET /api/audit-logs

Retrieves audit logs. Requires admin role.

**Query Parameters:**
- `entityType` (optional): Filter by entity type (e.g., "task", "edition")
- `entityId` (optional): Filter by entity ID

**Response:** `200 OK`
```json
[
  {
    "id": "number",
    "userId": "number",
    "username": "string",
    "entityType": "string",
    "entityId": "number",
    "action": "string",
    "timestamp": "string (date)",
    "previousState": "object",
    "newState": "object",
    "notes": "string"
  }
]
```

## Error Responses

All API endpoints may return the following error responses:

### 400 Bad Request

Returned when the request is malformed or validation fails.

```json
{
  "error": "string (error message)"
}
```

### 401 Unauthorized

Returned when authentication is required but missing or invalid.

```json
{
  "error": "Authentication required"
}
```

### 403 Forbidden

Returned when the authenticated user does not have sufficient permissions.

```json
{
  "error": "Permission denied"
}
```

### 404 Not Found

Returned when the requested resource does not exist.

```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error

Returned when an unexpected error occurs on the server.

```json
{
  "error": "Internal server error"
}
```