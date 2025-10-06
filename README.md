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

- **Frontend**: React 19, Redux Toolkit, React Router
- **Styling**: Custom CSS with CSS Variables, Responsive Design
- **Forms**: React Hook Form for efficient form handling
- **State Management**: Redux Toolkit with organized slices
- **Build Tool**: Vite for fast development and building
- **Code Quality**: ESLint for code linting

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/                    # Authentication components
│   │   ├── AuthProvider.jsx     # Authentication context
│   │   ├── Login.jsx           # Login form
│   │   ├── Register.jsx        # User registration
│   │   └── OrganizationSignup.jsx # Organization creation
│   ├── layout/                 # Layout components
│   │   ├── Header.jsx          # Application header
│   │   ├── Sidebar.jsx         # Navigation sidebar
│   │   └── Layout.jsx          # Main layout wrapper
│   ├── organization/           # Organization management
│   │   └── OrganizationDashboard.jsx # Org admin panel
│   ├── tasks/                  # Task management components
│   │   ├── TaskBoard.jsx       # Kanban board
│   │   ├── TaskCard.jsx        # Individual task cards
│   │   ├── TaskForm.jsx        # Task creation/editing
│   │   └── TaskDetails.jsx     # Task detail modal
│   └── users/                  # User management
│       ├── UserProfile.jsx     # User profile page
│       └── UserList.jsx        # Team member list
├── routes/                     # Route components
│   ├── AuthPage.jsx           # Authentication page
│   ├── Dashboard.jsx          # Main dashboard
│   └── ProtectedRoute.jsx     # Route protection
├── store/                      # Redux store
│   └── index.js               # Store configuration
├── App.jsx                     # Main application component
├── main.jsx                    # Application entry point
└── styles.css                  # Global styles
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
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

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

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