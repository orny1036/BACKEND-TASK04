# Task Manager API

A RESTful backend API for managing personal tasks — built with Node.js, Express, and MySQL. Users can only access their own tasks. Admins can manage everything.

---

## Features

- JWT authentication with access + refresh token rotation
- Role-based access control (admin / user)
- Password reset via email (time-limited token)
- Soft delete for tasks
- Request logging with Winston
- Centralized error handling
- Input validation with unique username/email enforcement

---

## Tech Stack

| Layer        | Tool                        |
|--------------|-----------------------------|
| Runtime      | Node.js                     |
| Framework    | Express.js                  |
| Database     | MySQL (`mysql2/promise`)    |
| Auth         | JWT + crypto refresh tokens |
| Hashing      | bcrypt                      |
| Email        | Nodemailer (Gmail)          |
| Logging      | Winston                     |
| Validation   | validator.js                |

---

## Getting Started

### Prerequisites
- Node.js v18+
- MySQL running locally

### Installation

```bash
git clone https://github.com/your-username/backend-task04.git
cd backend-task04
npm install
```

### Environment Setup

Create a `.env` file in the root:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=task_manager
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password
```

> For `EMAIL_PASS`, use a [Gmail App Password](https://support.google.com/accounts/answer/185833), not your regular Gmail password.

### Database Setup

Run these in MySQL:

```sql
CREATE DATABASE task_manager;
USE task_manager;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('to-do', 'in-progress', 'completed') DEFAULT 'to-do',
  user_id INT NOT NULL,
  isDeleted TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE password_reset_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### Run the Server

```bash
node server.js
```

Server runs at `http://localhost:5000`

---

## API Reference

### Auth — `/api/auth`

| Method | Endpoint           | Auth | Description                          |
|--------|--------------------|------|--------------------------------------|
| POST   | `/register`        | No   | Register new user                    |
| POST   | `/login`           | No   | Login — returns access + refresh token |
| POST   | `/refresh`         | No   | Get new access token                 |
| POST   | `/logout`          | Yes  | Invalidate current refresh token     |
| POST   | `/logout-all`      | Yes  | Logout from all devices              |
| POST   | `/forgot-password` | No   | Send reset link to email             |
| POST   | `/reset-password`  | No   | Reset password using token           |

**Register**
```json
POST /api/auth/register
{
  "username": "orny",
  "email": "orny@example.com",
  "password": "yourpassword"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "orny@example.com",
  "password": "yourpassword"
}
```

**Reset Password**
```json
POST /api/auth/reset-password
{
  "resetToken": "token_from_email",
  "new_password": "newpassword123"
}
```

---

### Tasks — `/api/tasks` (all require `Authorization: Bearer <token>`)

| Method | Endpoint      | Description                              |
|--------|---------------|------------------------------------------|
| GET    | `/`           | Get all tasks (user: own, admin: all)    |
| GET    | `/?status=`   | Filter by `to-do`, `in-progress`, `completed` |
| GET    | `/:id`        | Get single task                          |
| POST   | `/`           | Create a task                            |
| PUT    | `/:id`        | Update a task                            |
| DELETE | `/:id`        | Soft delete a task                       |

**Create Task**
```json
POST /api/tasks
{
  "title": "Learn JWT",
  "description": "Understand token-based auth",
  "status": "to-do"
}
```

---

## Project Structure

```
BACKEND-TASK04/
├── config/
│   ├── db.js
│   ├── logger.js
│   └── mailer.js
├── controllers/
│   ├── authController.js
│   └── taskController.js
├── middleware/
│   ├── authMiddleware.js
│   ├── errorHandler.js
│   ├── notFoundHandler.js
│   └── requestLogger.js
├── models/
│   ├── userModel.js
│   └── taskModel.js
├── routes/
│   ├── authRoutes.js
│   └── taskRoutes.js
├── utils/
│   └── validate.js
├── logs/               # auto-generated by Winston
├── .env
├── .gitignore
├── package.json
└── server.js
```

---

## Security Notes

- Passwords are hashed with bcrypt (10 salt rounds)
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days and are stored in the database
- Password reset tokens expire in 10 minutes and are single-use
- Users cannot access other users' tasks — enforced at both middleware and query level

---

## .gitignore

Make sure your `.gitignore` includes at minimum:

```
node_modules/
.env
logs/
```

---

## Author

Orny Nabila — [LinkedIn](https://linkedin.com/in/orny-nabila)
