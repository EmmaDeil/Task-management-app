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
import "./styles.css";

function App() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderMainContent = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "tasks":
        return <TaskBoard />;
      case "projects":
        return (
          <div className="placeholder-content">
            <h2>Projects</h2>
            <p>Project management features coming soon!</p>
          </div>
        );
      case "team":
        return <UserList />;
      case "calendar":
        return (
          <div className="placeholder-content">
            <h2>Calendar</h2>
            <p>Calendar view coming soon!</p>
          </div>
        );
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
          </div>
        </Router>
      </AuthProvider>
    </Provider>
  );
}

export default App;
