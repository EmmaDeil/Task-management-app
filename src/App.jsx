import React, { useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { AuthProvider } from "./components/auth/AuthProvider";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthPage from "./routes/AuthPage";
import Dashboard from "./routes/Dashboard";
import TaskBoard from "./components/tasks/TaskBoard";
import UserProfile from "./components/users/UserProfile";
import UserList from "./components/users/UserList";
import OrganizationDashboard from "./components/organization/OrganizationDashboard";
import Calendar from "./components/common/Calendar";
import Projects from "./components/projects/Projects";
import TaskForm from "./components/tasks/TaskForm";
import ProjectForm from "./components/projects/ProjectForm";
import "./styles.css";

function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editingProject, setEditingProject] = useState(null);

  const renderMainContent = () => {
    const handleNewTask = () => {
      setEditingTask(null);
      setShowTaskForm(true);
    };

    const handleNewProject = () => {
      setEditingProject(null);
      setShowProjectForm(true);
    };

    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard
            onNewTask={handleNewTask}
            onNewProject={handleNewProject}
          />
        );
      case "tasks":
        return <TaskBoard />;
      case "projects":
        return <Projects />;
      case "team":
        return <UserList />;
      case "calendar":
        return <Calendar />;
      case "reports":
        return (
          <div className="placeholder-content">
            <h2>Reports</h2>
            <p>Analytics and reporting features coming soon!</p>
          </div>
        );
      case "organization":
        return <OrganizationDashboard />;
      case "profile":
        return <UserProfile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Redirect root to auth */}
              <Route path="/" element={<Navigate to="/auth" replace />} />

              {/* Public Routes */}
              <Route path="/auth" element={<AuthPage />} />

              {/* Protected Routes */}
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout
                      activeView={activeView}
                      onViewChange={setActiveView}
                      onNewTask={() => {
                        setEditingTask(null);
                        setShowTaskForm(true);
                      }}
                      onNewProject={() => {
                        setEditingProject(null);
                        setShowProjectForm(true);
                      }}
                    >
                      <Routes>
                        <Route
                          path="/"
                          element={<Navigate to="/dashboard" replace />}
                        />
                        <Route
                          path="/dashboard"
                          element={
                            <div onClick={() => setActiveView("dashboard")}>
                              {renderMainContent()}
                            </div>
                          }
                        />
                        <Route
                          path="/tasks"
                          element={
                            <div onClick={() => setActiveView("tasks")}>
                              {renderMainContent()}
                            </div>
                          }
                        />
                        <Route
                          path="/projects"
                          element={
                            <div onClick={() => setActiveView("projects")}>
                              {renderMainContent()}
                            </div>
                          }
                        />
                        <Route
                          path="/team"
                          element={
                            <div onClick={() => setActiveView("team")}>
                              {renderMainContent()}
                            </div>
                          }
                        />
                        <Route
                          path="/calendar"
                          element={
                            <div onClick={() => setActiveView("calendar")}>
                              {renderMainContent()}
                            </div>
                          }
                        />
                        <Route
                          path="/reports"
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <div onClick={() => setActiveView("reports")}>
                                {renderMainContent()}
                              </div>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/organization"
                          element={
                            <ProtectedRoute requiredRole="admin">
                              <div
                                onClick={() => setActiveView("organization")}
                              >
                                {renderMainContent()}
                              </div>
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <div onClick={() => setActiveView("profile")}>
                              {renderMainContent()}
                            </div>
                          }
                        />

                        {/* Fallback */}
                        <Route
                          path="*"
                          element={<Navigate to="/dashboard" replace />}
                        />
                      </Routes>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>

            {/* Global Modals */}
            {showTaskForm && (
              <TaskForm
                task={editingTask}
                onSubmit={(taskData) => {
                  // Handle task creation/update
                  console.log("Task submitted:", taskData);
                  setShowTaskForm(false);
                  setEditingTask(null);
                  // Trigger a refresh or update Redux state
                  window.location.reload(); // Temporary solution
                }}
                onCancel={() => {
                  setShowTaskForm(false);
                  setEditingTask(null);
                }}
              />
            )}
            {showProjectForm && (
              <ProjectForm
                project={editingProject}
                onSubmit={(projectData) => {
                  // Handle project creation/update
                  const projects = JSON.parse(
                    localStorage.getItem("projects") || "[]"
                  );

                  if (editingProject) {
                    // Update existing project
                    const updatedProjects = projects.map((p) =>
                      p.id === editingProject.id ? { ...p, ...projectData } : p
                    );
                    localStorage.setItem(
                      "projects",
                      JSON.stringify(updatedProjects)
                    );
                  } else {
                    // Create new project
                    const newProject = {
                      id: Date.now().toString(),
                      ...projectData,
                      tasks: [],
                      createdAt: new Date().toISOString(),
                    };
                    localStorage.setItem(
                      "projects",
                      JSON.stringify([...projects, newProject])
                    );
                  }

                  setShowProjectForm(false);
                  setEditingProject(null);
                  // Trigger a refresh
                  window.location.reload(); // Temporary solution
                }}
                onCancel={() => {
                  setShowProjectForm(false);
                  setEditingProject(null);
                }}
              />
            )}
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
