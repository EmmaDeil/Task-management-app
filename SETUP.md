# TaskFlow - Task Management Application

A full-stack task management application built with React, Redux, Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication** - JWT-based auth with role-based access control (Admin, Manager, Member)
- 🏢 **Multi-Organization** - Support for multiple organizations with isolated data
- ✅ **Task Management** - Create, update, delete, and track tasks with priorities and statuses
- 👥 **Team Collaboration** - Assign tasks, add comments, and manage team members
- 🔍 **Advanced Search** - Search tasks by title, description, assignee, project, and more
- 📊 **Dashboard** - Overview of tasks, deadlines, and team activity
- 🎨 **Modern UI** - Responsive design with dark mode support

## Tech Stack

### Frontend
- React 19
- Redux Toolkit
- React Router
- React Hook Form
- Axios
- Vite

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Bcrypt for password hashing

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18 or higher)
- MongoDB (v6 or higher) - [Download here](https://www.mongodb.com/try/download/community)
- npm or yarn

## Installation

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd Task-management-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup MongoDB

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # Windows
   net start MongoDB
   
   # macOS
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string

### 4. Configure Environment Variables

#### Backend (.env in server folder)
Create `server/.env` file:
```bash
cp server/.env.example server/.env
```

Edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/taskflow
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow

JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=30d
```

#### Frontend (.env in root folder)
Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

## Running the Application

### Development Mode

You need to run both frontend and backend servers:

#### Terminal 1 - Backend Server
```bash
npm run server:dev
```
Backend will run on `http://localhost:5000`

#### Terminal 2 - Frontend Dev Server
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

### Production Mode

#### Build Frontend
```bash
npm run build
```

#### Start Backend
```bash
npm run server
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user to existing organization
- `POST /api/auth/login` - Login user
- `POST /api/auth/organization/register` - Register new organization with admin
- `GET /api/auth/me` - Get current user

### Tasks
- `GET /api/tasks` - Get all tasks (with filters)
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/comments` - Add comment to task

### Organizations
- `GET /api/organizations/:id` - Get organization details
- `PUT /api/organizations/:id` - Update organization
- `GET /api/organizations/:id/users` - Get all users in organization

### Users
- `GET /api/users` - Get all users in organization
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Deactivate user

## User Roles

### Admin
- Full access to organization settings
- Can manage users (create, update, delete)
- Can manage all tasks
- Can view all reports

### Manager
- Can create and manage tasks
- Can assign tasks to team members
- Can view team reports
- Cannot manage organization settings

### Member
- Can view and update assigned tasks
- Can create tasks
- Limited access to reports

## Default Demo Accounts

After setting up, you can create test accounts or use the organization registration:

1. **Create Organization**: Use the "Create Organization" option on signup
   - This will create an admin account automatically
   
2. **Join Organization**: Use the regular signup with an organization ID
   - Contact your organization admin for the organization ID

## Project Structure

```
Task-management-app/
├── server/                  # Backend code
│   ├── config/             # Database configuration
│   ├── middleware/         # Auth middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   └── server.js           # Express server
├── src/                    # Frontend code
│   ├── components/         # React components
│   │   ├── auth/          # Authentication components
│   │   ├── layout/        # Layout components
│   │   ├── organization/  # Organization components
│   │   ├── tasks/         # Task components
│   │   └── users/         # User components
│   ├── contexts/          # React contexts
│   ├── hooks/             # Custom hooks
│   ├── routes/            # Route components
│   ├── services/          # API services
│   ├── store/             # Redux store
│   ├── App.jsx            # Main app component
│   └── main.jsx           # Entry point
└── public/                # Static assets
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod --version`
- Check if port 27017 is available
- Verify MONGODB_URI in .env file

### Port Already in Use
- Backend (5000): Change PORT in server/.env
- Frontend (5173): Vite will automatically try another port

### CORS Errors
- Ensure backend is running
- Check VITE_API_URL in .env matches backend URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, email your-email@example.com or open an issue in the repository.
