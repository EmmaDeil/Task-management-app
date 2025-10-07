import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store/index.js";
import { AuthProvider } from "./components/auth/AuthProvider";
import { ToastProvider } from "./contexts/ToastContext";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AuthPage from "./routes/AuthPage";
import Dashboard from "./routes/Dashboard";
import TaskBoard from "./components/tasks/TaskBoard";
import UserProfile from "./components/users/UserProfile";
import UserList from "./components/users/UserList";
import InviteMember from "./components/users/InviteMember";
import Settings from "./components/users/Settings";
import HelpSupport from "./components/support/HelpSupport";
import OrganizationDashboard from "./components/organization/OrganizationDashboard";
import Calendar from "./components/common/Calendar";
import Projects from "./components/projects/Projects";
import ProjectDetails from "./components/projects/ProjectDetails";
import Notifications from "./routes/Notifications";
import "./styles.css";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <ToastProvider>
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
                      <Layout>
                        <Routes>
                          <Route
                            path="/"
                            element={<Navigate to="/dashboard" replace />}
                          />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/tasks" element={<TaskBoard />} />
                          <Route
                            path="/projects/:projectId"
                            element={<ProjectDetails />}
                          />
                          <Route path="/projects" element={<Projects />} />
                          <Route path="/team" element={<UserList />} />
                          <Route path="/calendar" element={<Calendar />} />
                          <Route
                            path="/notifications"
                            element={<Notifications />}
                          />
                          <Route
                            path="/reports"
                            element={
                              <ProtectedRoute requiredRole="admin">
                                <div className="placeholder-content">
                                  <h2>Reports</h2>
                                  <p>
                                    Analytics and reporting features coming
                                    soon!
                                  </p>
                                </div>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/organization"
                            element={
                              <ProtectedRoute requiredRole="admin">
                                <OrganizationDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/profile" element={<UserProfile />} />
                          <Route path="/settings" element={<Settings />} />
                          <Route path="/help" element={<HelpSupport />} />

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
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </Provider>
  );
}

export default App;
