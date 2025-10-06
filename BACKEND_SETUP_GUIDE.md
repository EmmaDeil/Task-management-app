# Backend Setup & Frontend Integration Guide

## Step 1: Install Dependencies

Open your terminal and run:

```bash
npm install
```

This will install all the new backend dependencies including:
- express
- mongoose  
- bcryptjs
- jsonwebtoken
- cors
- dotenv
- axios (frontend)
- nodemon (dev dependency)

## Step 2: Setup MongoDB

### Option A: Local MongoDB (Recommended for Development)

1. **Install MongoDB:**
   - Windows: Download from https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB:**
   ```bash
   # Windows (run as administrator)
   net start MongoDB
   
   # Mac
   brew services start mongodb-community
   
   # Linux
   sudo systemctl start mongod
   ```

3. **Verify it's running:**
   ```bash
   mongosh
   # Should connect successfully
   ```

### Option B: MongoDB Atlas (Cloud - Free Tier)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free account
3. Create a new cluster (M0 free tier)
4. Click "Connect" → "Connect your application"
5. Copy the connection string

## Step 3: Configure Environment Variables

### Backend Environment (.env in server folder)

Create `server/.env` file:

```env
PORT=5000
NODE_ENV=development

# For Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/taskflow

# For MongoDB Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/taskflow?retryWrites=true&w=majority

# Change this to a random secure string in production!
JWT_SECRET=your_super_secret_jwt_key_12345
JWT_EXPIRE=30d
```

### Frontend Environment (.env in root folder)

Create `.env` file in the root:

```env
VITE_API_URL=http://localhost:5000/api
```

## Step 4: Update Remaining Frontend Components

The following files need to be updated to use the real API instead of mock data:

### 1. Register.jsx
Replace the mock registration with:

```javascript
import { authAPI } from "../../services/api";

const onSubmit = async (data) => {
  setIsLoading(true);
  setError("");

  try {
    const response = await authAPI.register(
      data.name,
      data.email,
      data.password,
      data.organizationId // User needs to enter their organization ID
    );
    
    localStorage.setItem('token', response.token);
    login(response.user, response.user.organization);
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Registration failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};
```

### 2. OrganizationSignup.jsx
Replace the mock organization signup with:

```javascript
import { authAPI } from "../../services/api";

const onSubmit = async (data) => {
  setIsLoading(true);
  setError("");

  try {
    const response = await authAPI.registerOrganization(
      data.organizationName,
      data.domain,
      data.name,
      data.email,
      data.password
    );
    
    localStorage.setItem('token', response.token);
    login(response.user, response.user.organization);
    navigate("/dashboard");
  } catch (err) {
    setError(err.response?.data?.message || "Organization registration failed.");
  } finally {
    setIsLoading(false);
  }
};
```

### 3. Dashboard.jsx
Remove all the sample data generation code. The useEffect that adds tasks should be removed completely.

### 4. TaskBoard.jsx
Update to fetch tasks from API:

```javascript
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tasksAPI } from '../../services/api';

useEffect(() => {
  const fetchTasks = async () => {
    try {
      const tasks = await tasksAPI.getAll();
      // Dispatch to Redux store
      tasks.forEach(task => {
        dispatch({ type: 'tasks/addTask', payload: task });
      });
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  };
  
  fetchTasks();
}, [dispatch]);
```

### 5. TaskForm.jsx
Update to use API for creating/updating tasks:

```javascript
import { tasksAPI } from '../../services/api';

const handleSubmit = async (taskData) => {
  try {
    if (task) {
      // Update existing task
      const updated = await tasksAPI.update(task.id, taskData);
      dispatch({ type: 'tasks/updateTask', payload: updated });
    } else {
      // Create new task
      const newTask = await tasksAPI.create(taskData);
      dispatch({ type: 'tasks/addTask', payload: newTask });
    }
    onSubmit();
  } catch (error) {
    console.error('Failed to save task:', error);
  }
};
```

## Step 5: Running the Application

You need TWO terminals open:

### Terminal 1 - Backend Server
```bash
npm run server:dev
```

You should see:
```
Server running on port 5000
MongoDB Connected: localhost
```

### Terminal 2 - Frontend Dev Server
```bash
npm run dev
```

You should see:
```
VITE v7.0.5 ready in XXX ms
➜  Local: http://localhost:5173/
```

## Step 6: Create Your First Organization

1. Open http://localhost:5173/auth
2. Click "Need to create an organization? Sign up here"
3. Fill in the form:
   - Organization Name: Your Company Name
   - Domain: yourcompany (unique identifier)
   - Your Name: Your Full Name
   - Email: your@email.com
   - Password: (minimum 6 characters)
4. Click "Create Organization"

You'll be logged in as an admin!

## Step 7: Testing

### Create Some Tasks:
1. Go to Tasks view
2. Click "Add Task"
3. Fill in task details
4. Save

### Search Tasks:
1. Use the search bar in header
2. Type any keyword
3. See real-time results

### Invite Team Members:
1. Go to Organization settings
2. Share your organization ID with team members
3. They can register using the ID

## Troubleshooting

### "Cannot connect to MongoDB"
- Check if MongoDB is running: `mongosh`
- Verify MONGODB_URI in server/.env
- Check firewall settings

### "CORS Error"
- Make sure backend server is running on port 5000
- Check VITE_API_URL in .env file
- Restart both servers

### "401 Unauthorized"
- Check if token is being stored in localStorage
- Try logging out and logging in again
- Clear browser localStorage

### Port Already in Use
- Backend: Change PORT in server/.env
- Frontend: Vite will automatically use next available port

## Production Deployment

### Backend:
```bash
# Set environment variables on your hosting platform
NODE_ENV=production
MONGODB_URI=<your-production-mongodb-uri>
JWT_SECRET=<generate-strong-secret>

# Build and start
npm run server
```

### Frontend:
```bash
# Update .env with production API URL
VITE_API_URL=https://your-api.com/api

# Build
npm run build

# Deploy 'dist' folder to your hosting (Vercel, Netlify, etc.)
```

## Need Help?

Check SETUP.md for more detailed documentation or open an issue on GitHub.
