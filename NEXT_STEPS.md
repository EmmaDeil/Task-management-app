# Next Steps - Backend Integration

## ✅ Completed Steps

1. ✅ Installed all dependencies (axios, express, mongoose, bcryptjs, jsonwebtoken, cors, dotenv, nodemon)
2. ✅ Created complete backend structure in `server/` directory
3. ✅ Created environment configuration files (.env)
4. ✅ Updated package.json with backend scripts
5. ✅ Created API service layer in `src/services/api.js`
6. ✅ Updated Login.jsx to use real API

## 🚀 What You Need to Do Now

### Step 1: Setup MongoDB

**Option A: Install MongoDB Locally (Recommended for Development)**
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install MongoDB on your computer
3. MongoDB will run on `mongodb://localhost:27017` by default
4. The .env file is already configured for this

**Option B: Use MongoDB Atlas (Cloud - Free)**
1. Go to: https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 Sandbox - Free)
4. Click "Connect" → "Connect your application"
5. Copy the connection string
6. Update `server/.env` file:
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/task-management-app?retryWrites=true&w=majority
   ```

### Step 2: Start the Backend Server

Open a new terminal and run:
```bash
npm run server:dev
```

You should see:
```
Server running on port 5000
MongoDB connected: <your-connection-info>
```

### Step 3: Start the Frontend

Open another terminal (keep the backend running) and run:
```bash
npm run dev
```

### Step 4: Create Your First Organization

1. Go to http://localhost:5173 (or the port shown in your terminal)
2. You'll see the login page
3. Click "Sign up for an organization" (you'll need to create this link/page)
4. Fill in the organization signup form
5. This will create:
   - A new organization
   - An admin user for that organization
   - A JWT token for authentication

### Step 5: Update Remaining Components

The following components still need to be updated to use the real API:

#### 1. Register.jsx
```javascript
import { authAPI } from '../../services/api';

// In handleSubmit:
const response = await authAPI.register({
  name: data.name,
  email: data.email,
  password: data.password,
  organizationId: currentUser.organization // Get from AuthContext
});
```

#### 2. OrganizationSignup.jsx
```javascript
import { authAPI } from '../../services/api';

// In handleSubmit:
const response = await authAPI.registerOrganization({
  organizationName: data.organizationName,
  domain: data.domain,
  name: data.name,
  email: data.email,
  password: data.password
});
```

#### 3. Dashboard.jsx
- Remove the `useEffect` that generates sample tasks
- Fetch real tasks from API:
```javascript
import { tasksAPI } from '../services/api';

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const data = await tasksAPI.getAll();
      // Update your state with real tasks
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  fetchTasks();
}, []);
```

#### 4. TaskBoard.jsx
- Add `useEffect` to fetch tasks:
```javascript
import { tasksAPI } from '../services/api';

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const data = await tasksAPI.getAll({ status: 'todo' }); // or filter as needed
      // Update your state
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };
  fetchTasks();
}, []);
```

#### 5. TaskForm.jsx
- Update `handleSubmit` to use API:
```javascript
import { tasksAPI } from '../services/api';

const handleSubmit = async (data) => {
  try {
    if (task?._id) {
      // Update existing task
      await tasksAPI.update(task._id, data);
    } else {
      // Create new task
      await tasksAPI.create(data);
    }
    onClose();
  } catch (error) {
    console.error('Error saving task:', error);
  }
};
```

## 📝 Environment Variables

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

### Backend (server/.env)
```
MONGODB_URI=mongodb://localhost:27017/task-management-app
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=30d
PORT=5000
NODE_ENV=development
```

**Important:** Change `JWT_SECRET` to a random, secure string in production!

## 🔧 Troubleshooting

### "Failed to resolve import axios"
- **Solution:** Restart your dev server (`npm run dev`)
- Dependencies need to be re-resolved after installation

### "MongoDB connection failed"
- **Check:** Is MongoDB running? (if using local installation)
- **Check:** Is your connection string correct in `server/.env`?
- **Check:** Network connectivity (if using MongoDB Atlas)

### "Port 5000 already in use"
- **Solution:** Change PORT in `server/.env` to something else (e.g., 5001)
- **Remember:** Also update VITE_API_URL in frontend `.env`

### "Unauthorized" errors
- **Check:** Is the token being stored correctly in localStorage?
- **Check:** Is the JWT_SECRET the same between requests?
- **Try:** Logout and login again

## 🎯 Testing the Backend

### Test with curl:

**Register Organization:**
```bash
curl -X POST http://localhost:5000/api/auth/organization/register \
  -H "Content-Type: application/json" \
  -d '{
    "organizationName": "Test Company",
    "domain": "testcompany.com",
    "name": "Admin User",
    "email": "admin@testcompany.com",
    "password": "password123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@testcompany.com",
    "password": "password123"
  }'
```

## 📚 API Documentation

All API endpoints are available in the backend routes:

- **Auth:** `server/routes/auth.js`
  - POST `/api/auth/register` - Register new user
  - POST `/api/auth/login` - Login
  - GET `/api/auth/me` - Get current user
  - POST `/api/auth/organization/register` - Register new organization

- **Tasks:** `server/routes/tasks.js`
  - GET `/api/tasks` - Get all tasks (with filters)
  - GET `/api/tasks/:id` - Get single task
  - POST `/api/tasks` - Create task
  - PUT `/api/tasks/:id` - Update task
  - DELETE `/api/tasks/:id` - Delete task
  - POST `/api/tasks/:id/comments` - Add comment

- **Organizations:** `server/routes/organizations.js`
  - GET `/api/organizations/:id` - Get organization
  - PUT `/api/organizations/:id` - Update organization
  - GET `/api/organizations/:id/users` - Get organization users

- **Users:** `server/routes/users.js`
  - GET `/api/users` - Get all users in organization
  - GET `/api/users/:id` - Get single user
  - PUT `/api/users/:id` - Update user
  - DELETE `/api/users/:id` - Deactivate user

## 🎉 Success!

Once you complete these steps, your app will be fully connected to a real database with:

- ✅ User authentication with JWT tokens
- ✅ Organization-scoped data
- ✅ Role-based access control (admin/manager/member)
- ✅ Persistent task storage in MongoDB
- ✅ Search and filter functionality
- ✅ Comments on tasks
- ✅ User management

Good luck! If you encounter any issues, check the BACKEND_SETUP_GUIDE.md for more detailed information.
