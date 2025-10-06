# TaskFlow - Organization Task Management Application

A comprehensive task management application designed for organizations to efficiently manage tasks, teams, and projects across desktop and mobile platforms.

## 🚀 Features

### Authentication & Organization Management
- **Multi-organization support**: Organizations can sign up and manage their teams
- **Role-based access control**: Admin, Manager, and Member roles with different permissions
- **Secure authentication**: Login, registration, and organization creation flows
- **User profiles**: Customizable user profiles with activity tracking

### Task Management
- **Kanban board**: Drag-and-drop task board with customizable columns (To Do, In Progress, Review, Done)
- **Task assignment**: Assign tasks to team members with priority levels and due dates
- **Task details**: Rich task details with descriptions, tags, attachments, and activity timeline
- **Status tracking**: Real-time task status updates and progress monitoring

### Team Collaboration
- **User management**: Add, edit, and manage team members
- **Permission system**: Role-based permissions for different organizational levels
- **Activity feeds**: Track team activities and task updates
- **Member profiles**: View team member profiles and task assignments

### Dashboard & Analytics
- **Overview dashboard**: Get insights into team productivity and task completion
- **Statistics**: View task completion rates, team performance, and project progress
- **Notifications**: Real-time notifications for task assignments and updates
- **Recent activity**: Track recent tasks and team activities

### Responsive Design
- **Mobile-first**: Optimized for both desktop and mobile devices
- **Modern UI**: Clean, intuitive interface with dark/light mode support
- **Accessible**: Built with accessibility best practices

## 🛠️ Technology Stack

### Frontend
- **React 19**: Modern React with hooks and functional components
- **Redux Toolkit**: State management with organized slices
- **React Router**: Client-side routing with protected routes
- **React Hook Form**: Efficient form handling with validation
- **Vite**: Fast development server and build tool
- **Custom CSS**: Responsive design with CSS Variables

### Backend
- **Node.js & Express**: RESTful API server
- **MongoDB & Mongoose**: NoSQL database with schema validation
- **JWT**: Secure token-based authentication
- **Bcryptjs**: Password hashing and security
- **CORS**: Cross-origin resource sharing support

### Development Tools
- **ESLint**: Code quality and linting
- **Nodemon**: Auto-restart backend server during development

## 📁 Project Structure

```
Task-management-app/
├── src/                        # Frontend source code
│   ├── components/
│   │   ├── auth/              # Authentication components
│   │   │   ├── AuthProvider.jsx     # Authentication context
│   │   │   ├── Login.jsx           # Login form
│   │   │   ├── Register.jsx        # User registration
│   │   │   └── OrganizationSignup.jsx # Organization creation
│   │   ├── layout/            # Layout components
│   │   │   ├── Header.jsx          # Application header
│   │   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   │   └── Layout.jsx          # Main layout wrapper
│   │   ├── organization/      # Organization management
│   │   │   └── OrganizationDashboard.jsx # Org admin panel
│   │   ├── tasks/             # Task management components
│   │   │   ├── TaskBoard.jsx       # Kanban board
│   │   │   ├── TaskCard.jsx        # Individual task cards
│   │   │   ├── TaskForm.jsx        # Task creation/editing
│   │   │   └── TaskDetails.jsx     # Task detail modal
│   │   └── users/             # User management
│   │       ├── UserProfile.jsx     # User profile page
│   │       └── UserList.jsx        # Team member list
│   ├── routes/                # Route components
│   │   ├── AuthPage.jsx       # Authentication page
│   │   ├── Dashboard.jsx      # Main dashboard
│   │   └── ProtectedRoute.jsx # Route protection
│   ├── services/              # API service layer
│   │   └── api.js             # Axios instance & API methods
│   ├── slices/                # Redux slices
│   ├── store.js               # Redux store configuration
│   ├── App.jsx                # Main application component
│   ├── main.jsx               # Application entry point
│   └── styles.css             # Global styles
├── server/                     # Backend source code
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT authentication middleware
│   ├── models/                # Mongoose schemas
│   │   ├── Organization.js    # Organization model
│   │   ├── Task.js            # Task model
│   │   └── User.js            # User model with bcrypt
│   ├── routes/                # Express routes
│   │   ├── auth.js            # Authentication endpoints
│   │   ├── organizations.js   # Organization management
│   │   ├── tasks.js           # Task CRUD & comments
│   │   └── users.js           # User management
│   ├── .env                   # Backend environment variables
│   └── server.js              # Express server setup
├── public/                     # Static assets
├── .env                        # Frontend environment variables
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies & scripts
├── vite.config.js             # Vite configuration
├── README.md                  # This file
├── NEXT_STEPS.md              # Setup instructions
└── BACKEND_SETUP_GUIDE.md     # Detailed backend guide
```

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+** and npm
- **MongoDB** (local installation or MongoDB Atlas account)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Task-management-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup MongoDB**
   - **Option A:** Install MongoDB locally from https://www.mongodb.com/try/download/community
   - **Option B:** Create free MongoDB Atlas account at https://www.mongodb.com/cloud/atlas

4. **Configure environment variables**
   
   Environment files are already created:
   - Frontend: `.env`
   - Backend: `server/.env`
   
   ⚠️ **Important:** Update `JWT_SECRET` in `server/.env` to a secure random string!

5. **Start the backend server** (in one terminal)
   ```bash
   npm run server:dev
   ```

6. **Start the frontend** (in another terminal)
   ```bash
   npm run dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

8. **Create your first organization**
   - Sign up for an organization through the app
   - This creates your organization and admin account
   - Start creating tasks and inviting team members!

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 🎯 Usage

### Getting Started
1. **Create an Organization**: Use the "Create Organization" option to set up your team workspace
2. **Sign In**: Existing users can sign in with their credentials
3. **Invite Team Members**: Admins can invite users to join the organization
4. **Create Tasks**: Use the task board to create and manage tasks
5. **Assign Work**: Assign tasks to team members with priorities and deadlines

### User Roles
- **Admin**: Full access to organization settings, user management, and all features
- **Manager**: Access to team management and task oversight
- **Member**: Access to assigned tasks and team collaboration features

### Key Features to Explore
- **Dashboard**: Overview of your tasks and team activity
- **Task Board**: Drag-and-drop interface for task management
- **Team**: View and manage team members
- **Profile**: Customize your user profile and track your activity

## 🔧 Configuration

### Environment Variables
Create a `.env` file for environment-specific configurations:

```env
VITE_API_URL=your_api_endpoint
VITE_APP_NAME=TaskFlow
```

### Customization
- **Themes**: Modify CSS variables in `styles.css` for custom branding
- **Features**: Enable/disable features by modifying component exports
- **Roles**: Extend the role system in the authentication provider

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🛣️ Roadmap

- [ ] Real-time collaboration with WebSocket integration
- [ ] File attachments for tasks
- [ ] Advanced reporting and analytics
- [ ] Calendar integration
- [ ] Mobile app (React Native)
- [ ] API integration for backend services
- [ ] Team chat and messaging
- [ ] Time tracking functionality
- [ ] Project templates
- [ ] Advanced user permissions

## 📧 Support

For support and questions, please open an issue in the GitHub repository.

---

Built with ❤️ for modern team collaboration and productivity.