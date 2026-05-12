# TaskFlow Pro

TaskFlow Pro is a clean MERN stack project management app with JWT authentication, project membership, role-based access control and task status tracking. It is intentionally intermediate-level: complete enough for placement submission, but simple enough to understand and explain.

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express.js, MongoDB, Mongoose
- Auth: JWT, bcryptjs
- Utilities: dotenv, cors, express-async-handler
- Deployment: Railway for backend, Vercel for frontend

## Features

- Register and login with hashed passwords
- Persistent login using `localStorage`
- Protected frontend routes and protected backend APIs
- Project admin and member roles
- Admin can create projects, manage members and create/assign tasks
- Members can view and update their assigned tasks
- Dashboard stats: total, completed, pending and overdue tasks
- Progress bar based on completed tasks
- Task grouping by status
- Filters by status and assigned user
- Overdue tasks highlighted in red
- Fully responsive UI for mobile and desktop

## Folder Structure

```txt
taskflow-pro/
  client/
    src/
      api/
      components/
      context/
      pages/
  server/
    config/
    controllers/
    middleware/
    models/
    routes/
```

## Local Setup

### 1. Install dependencies

```bash
npm run install-all
```

### 2. Configure backend

Create `server/.env` from `server/.env.example`:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/taskflow-pro
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

### 3. Configure frontend

Create `client/.env` from `client/.env.example`:

```env
VITE_API_URL=http://localhost:5001/api
```

### 4. Run the app

Start backend:

```bash
npm run dev-server
```

Start frontend in another terminal:

```bash
npm run dev-client
```

Open `http://localhost:5173`.

## API Guide

All protected routes require:

```txt
Authorization: Bearer <token>
```

### Auth

`POST /api/auth/register`

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "password123"
}
```

`POST /api/auth/login`

```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

`GET /api/auth/me`

Returns the current authenticated user.

`GET /api/auth/users`

Returns all users for project member selection.

### Projects

`GET /api/projects`

Returns projects where the current user is a member.

`POST /api/projects`

```json
{
  "title": "Website Redesign",
  "description": "Refresh landing pages and dashboard UI",
  "members": ["USER_ID"]
}
```

`GET /api/projects/:id`

Returns one project and visible tasks. Admins see all project tasks; members see assigned tasks.

`POST /api/projects/:id/members`

Admin only.

```json
{
  "userId": "USER_ID"
}
```

`DELETE /api/projects/:id/members/:userId`

Admin only. Removes a member and deletes tasks assigned to that member in the project.

### Tasks

`GET /api/tasks`

Optional query params:

```txt
status=Todo
assignedTo=USER_ID
project=PROJECT_ID
```

`POST /api/tasks`

Admin only.

```json
{
  "title": "Create wireframes",
  "description": "Prepare responsive dashboard wireframes",
  "project": "PROJECT_ID",
  "assignedTo": "USER_ID",
  "status": "Todo",
  "dueDate": "2026-05-15"
}
```

`PUT /api/tasks/:id`

Admins can update task details. Assigned members can update `status`.

```json
{
  "status": "Completed"
}
```

`DELETE /api/tasks/:id`

Admin only.

## Railway Backend Deployment

1. Push the project to GitHub.
2. Create a Railway project and select the GitHub repo.
3. Set the root directory to `server`.
4. Add environment variables:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `CLIENT_URL`
5. Deploy and copy the backend URL.

## Vercel Frontend Deployment

1. Import the same GitHub repo into Vercel.
2. Set the root directory to `client`.
3. Add environment variable:
   - `VITE_API_URL=https://your-railway-backend-url/api`
4. Deploy and copy the frontend URL.
5. Update Railway `CLIENT_URL` to the Vercel frontend URL.

## Submission Links

- Live URL: add your Vercel deployment URL after deployment
- Backend API URL: add your Railway deployment URL after deployment
- GitHub repo: add your GitHub repository URL after pushing


