# Project Name
PROFILE BASED TASK MANAGER CRUD APP(#Task04)

## 1. Overview
A backend Task Manager system with:
- MySQL database integration
- JWT-based authentication
- Role-based access control (RBAC)
- User-specific task ownership

---

Note: Please use git repo for version controlling. Both the task manager crud app should be maintained in two different repos.

## 2. Basic Requirements

### Authentication
- User registration & login
- Password hashing (bcrypt)
- JWT token issuance

### Authorization
- Role-based access (admin / user)
- Users can ONLY access their own tasks
- Admin can view all tasks (optional)

### Task Management
- Create, read, update, delete tasks
- Filter tasks by status

---

### Additional Features (Optional):
- Implement password reset functionality with email verification.
- Add validation to ensure unique usernames and email addresses during user registration.
- Implement logging and error-handling middleware to track and handle server-side errors effectively.

## 3. Tech Stack
- Node.js
- Express
- MySQL
- Raw SQL queries
- JWT
- bcrypt

## 4. Product Rules (Non-Negotiable)

- Each task belongs to ONE user
- Users cannot access others' tasks
- All task routes require authentication
- Passwords must NEVER be stored in plain text
- JWT must be sent in headers: Authorization: Bearer <token>

---

## 5. API Specification

### 🔐 Auth Routes

#### Register  
POST /api/auth/register

Request:
```json
{
  "username": "orny",
  "email": "orny@example.com",
  "password": "123456"
}
Response:

{
  "message": "User registered successfully"
}

Login
POST /api/auth/login

Request:

{
  "email": "orny@example.com",
  "password": "123456"
}

Response:

{
  "token": "JWT_TOKEN"
}

📋 Task Routes (Protected)

Get All Tasks
GET /api/tasks

Get Single Task
GET /api/tasks/:id

Create Task
POST /api/tasks

Request (JSON):

{
  "title": "Learn JWT",
  "description": "Understand authentication",
  "status": "to-do"
}

Update Task
PUT /api/tasks/:id

Delete Task
DELETE /api/tasks/:id

Filter Tasks
GET /api/tasks?status=to-do

````

## 6. Database Schema
Users table:
- id (PK, auto increment)
- username (unique, not null)
- email (unique, not null)
- password (hashed, not null)
- role (enum: 'admin', 'user')
- created_at (timestamp)

Tasks table:
- id (PK, auto increment)
- title (not null)
- description (nullable)
- status (enum: 'to-do', 'in-progress', 'completed')
- user_id (FK → users.id)
- created_at (timestamp)
- isDeleted (tinyint(1))

## 7. Relationship Overview

One User → has many Tasks

One Task → belongs to one User

One-to-many relationship.

## 8. Authentication Flow

1. User registers
2. Password is hashed
3. User logs in
4. Server returns JWT
5. Client sends JWT in headers
6. Middleware verifies token
7. Access granted to protected routes

````
# 🔐 Key Rule (VERY IMPORTANT)

👉 Users can ONLY access their own tasks

This is enforced in:

controller + middleware

## 9. 🧱 Backend Folder Structure (Task04)

````

server.js
/config/db.js
/routes/authRoutes.js
/routes/taskRoutes.js
/controllers/authController.js
/controllers/taskController.js
/middleware/authMiddleware.js
/middleware/errorHandler.js
/middleware/notFoundHandler.js
````

## 10. Future Improvements
Refresh tokens
Password reset via email
Task pagination
Logging system

6. Additional Features (Optional):
   - Implement password reset functionality with email verification.
   - Add validation to ensure unique usernames and email addresses during user registration.
   - Implement logging and error-handling middleware to track and handle server-side errors effectively.
