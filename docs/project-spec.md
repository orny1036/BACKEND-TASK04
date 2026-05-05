# Project Name
PROFILE-BASED TASK MANAGER API (Task04)

## 1. Overview
A RESTful backend API for a task management system built with Node.js and Express. Each user owns their tasks — no cross-user access. Admins can view and manage all tasks.

Features implemented:
- JWT-based authentication with access + refresh token flow
- Role-based access control (admin / user)
- User-specific task ownership enforcement
- Password reset via email (token-based, expires in 10 minutes)
- Unique username and email validation on registration
- Request logging middleware (Winston)
- Centralized error handling middleware
- Soft delete for tasks (`isDeleted` flag)

---

## 2. Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL (raw SQL via `mysql2/promise`)
- **Auth:** JWT (access token) + crypto random (refresh token)
- **Password Hashing:** bcrypt
- **Email:** Nodemailer (Gmail)
- **Logging:** Winston
- **Validation:** validator.js

---

## 3. Product Rules (Non-Negotiable)
- Each task belongs to ONE user
- Users cannot access or modify another user's tasks
- All task routes require a valid JWT in headers: `Authorization: Bearer <token>`
- Passwords are never stored in plain text
- Deleted tasks use soft delete (`isDeleted = 1`), not hard delete

---

## 4. API Specification

### Auth Routes — `/api/auth`

| Method | Endpoint              | Auth Required | Description                        |
|--------|-----------------------|---------------|------------------------------------|
| POST   | `/register`           | No            | Register a new user                |
| POST   | `/login`              | No            | Login, returns access + refresh token |
| POST   | `/refresh`            | No            | Get new access token via refresh token |
| POST   | `/logout`             | Yes           | Invalidate current refresh token   |
| POST   | `/logout-all`         | Yes           | Invalidate all refresh tokens for user |
| POST   | `/forgot-password`    | No            | Send password reset email          |
| POST   | `/reset-password`     | No            | Reset password using token from email |

#### Register
```json
POST /api/auth/register
Body: { "username": "orny", "email": "orny@example.com", "password": "123456" }
Response: { "success": true, "message": "User registered successfully", "data": { "id": 1, "username": "orny", "email": "orny@example.com" } }
```

#### Login
```json
POST /api/auth/login
Body: { "email": "orny@example.com", "password": "123456" }
Response: { "success": true, "accessToken": "...", "refreshToken": "..." }
```

#### Reset Password
```json
POST /api/auth/reset-password
Body: { "resetToken": "...", "new_password": "newpass123" }
```

---

### Task Routes — `/api/tasks` (all protected)

| Method | Endpoint       | Role       | Description                          |
|--------|----------------|------------|--------------------------------------|
| GET    | `/`            | user/admin | Get all tasks (user: own, admin: all) |
| GET    | `/?status=`    | user/admin | Filter tasks by status               |
| GET    | `/:id`         | user/admin | Get single task                      |
| POST   | `/`            | user/admin | Create task                          |
| PUT    | `/:id`         | user/admin | Update task                          |
| DELETE | `/:id`         | user/admin | Soft delete task                     |

#### Create Task
```json
POST /api/tasks
Body: { "title": "Learn JWT", "description": "Understand auth flows", "status": "to-do" }
```

Status values: `to-do` | `in-progress` | `completed`

---

## 5. Database Schema

### `users`
| Column     | Type                        | Notes              |
|------------|-----------------------------|--------------------|
| id         | INT, PK, AUTO_INCREMENT     |                    |
| username   | VARCHAR, UNIQUE, NOT NULL   |                    |
| email      | VARCHAR, UNIQUE, NOT NULL   |                    |
| password   | VARCHAR, NOT NULL           | bcrypt hashed      |
| role       | ENUM('admin', 'user')       | default: 'user'    |
| created_at | TIMESTAMP                   | auto                |

### `tasks`
| Column      | Type                                      | Notes              |
|-------------|-------------------------------------------|--------------------|
| id          | INT, PK, AUTO_INCREMENT                   |                    |
| title       | VARCHAR, NOT NULL                         |                    |
| description | TEXT, NULLABLE                            |                    |
| status      | ENUM('to-do','in-progress','completed')   | default: 'to-do'   |
| user_id     | INT, FK → users.id                        |                    |
| created_at  | TIMESTAMP                                 | auto               |
| isDeleted   | TINYINT(1)                                | default: 0         |

### `refresh_tokens`
| Column     | Type        | Notes               |
|------------|-------------|---------------------|
| id         | INT, PK     |                     |
| user_id    | INT, FK     | → users.id          |
| token      | VARCHAR     | random hex string   |
| expires_at | DATETIME    | 7 days from login   |

### `password_reset_tokens`
| Column     | Type        | Notes                        |
|------------|-------------|------------------------------|
| id         | INT, PK     |                              |
| user_id    | INT, FK     | → users.id                   |
| token      | VARCHAR     | random hex string            |
| expires_at | DATETIME    | 10 minutes from request      |

---

## 6. Folder Structure
```
BACKEND-TASK04/
├── config/
│   ├── db.js               # MySQL connection pool
│   ├── logger.js           # Winston logger
│   └── mailer.js           # Nodemailer transporter
├── controllers/
│   ├── authController.js   # Auth logic
│   └── taskController.js   # Task CRUD logic
├── middleware/
│   ├── authMiddleware.js   # JWT verification + RBAC
│   ├── errorHandler.js     # Global error handler
│   ├── notFoundHandler.js  # 404 handler
│   └── requestLogger.js    # Per-request logging
├── models/
│   ├── userModel.js        # User DB queries
│   └── taskModel.js        # Task DB queries
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── utils/
│   └── validate.js         # Input validation helpers
├── docs/
│   └── project-spec.md
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## 7. Authentication Flow
1. User registers → password hashed with bcrypt → stored in DB
2. User logs in → access token (JWT, 15min) + refresh token (random hex, 7 days) returned
3. Client sends `Authorization: Bearer <accessToken>` on every protected request
4. `authMiddleware` verifies JWT → attaches `req.user` → request proceeds
5. When access token expires → client calls `/refresh` with refresh token → gets new access token
6. Logout → refresh token deleted from DB (access token expires naturally)

## 9. Environment Variables
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```
