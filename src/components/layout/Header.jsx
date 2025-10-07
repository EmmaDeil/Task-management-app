import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../../services/api";

const Header = ({ onSidebarToggle, isSidebarOpen }) => {
  const { user, organization, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [projectResults, setProjectResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const notificationRef = useRef(null);
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);

  // Get tasks from Redux store
  const tasks = useSelector((state) => state.tasks.items);

  // Fetch notifications from API
  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await notificationsAPI.getAll({ limit: 5 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      // Set empty array on error to avoid showing sample data
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Handle search
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setProjectResults([]);
      setShowSearchResults(false);
      return;
    }

    const query = searchQuery.toLowerCase();

    // Search tasks
    const filteredTasks = tasks.filter((task) => {
      return (
        task.title?.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.assignee?.toLowerCase().includes(query) ||
        task.priority?.toLowerCase().includes(query) ||
        task.status?.toLowerCase().includes(query) ||
        task.project?.toLowerCase().includes(query)
      );
    });

    // Search projects from localStorage
    const storedProjects = localStorage.getItem("projects");
    let filteredProjects = [];

    if (storedProjects) {
      const projects = JSON.parse(storedProjects);
      filteredProjects = projects.filter((project) => {
        return (
          project.name?.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.status?.toLowerCase().includes(query)
        );
      });
    }

    setSearchResults(filteredTasks);
    setProjectResults(filteredProjects);
    setShowSearchResults(true);
  }, [searchQuery, tasks]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (showNotifications || showUserMenu || showSearchResults) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications, showUserMenu, showSearchResults]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleSearchClear = () => {
    setSearchQuery("");
    setSearchResults([]);
    setProjectResults([]);
    setShowSearchResults(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      todo: "#6b7280",
      "in-progress": "#f59e0b",
      review: "#8b5cf6",
      done: "#10b981",
    };
    return colors[status] || "#6b7280";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: "🟢",
      medium: "🟡",
      high: "🟠",
      urgent: "🔴",
    };
    return icons[priority] || "⚪";
  };

  const handleSearchResultClick = (task) => {
    // Navigate to tasks page
    navigate("/tasks");

    // Close search dropdown
    setShowSearchResults(false);
    setSearchQuery("");

    // Optional: Store selected task ID to highlight it
    sessionStorage.setItem("selectedTaskId", task.id);
  };

  const handleProjectResultClick = (project) => {
    // Navigate to projects page
    navigate("/projects");

    // Close search dropdown
    setShowSearchResults(false);
    setSearchQuery("");

    // Optional: Store selected project ID
    sessionStorage.setItem("selectedProjectId", project.id);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationsAPI.markAsRead(notification._id);
      }

      // Close dropdown
      setShowNotifications(false);

      // Navigate to the related content
      if (notification.link) {
        navigate(notification.link);
      } else if (notification.relatedTask) {
        navigate("/tasks");
      } else if (notification.relatedProject) {
        navigate("/projects");
      }

      // Refresh notifications
      fetchNotifications();
    } catch (err) {
      console.error("Error handling notification click:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Error marking all as read:", err);
    }
  };

  const handleViewAllNotifications = () => {
    setShowNotifications(false);
    navigate("/notifications");
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          className="sidebar-toggle"
          onClick={onSidebarToggle}
          aria-label="Toggle sidebar"
        >
          <span className={`hamburger ${isSidebarOpen ? "open" : ""}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        <div className="header-logo">
          <h1>Org Manager</h1>
          {organization && (
            <span className="org-name">{organization.name}</span>
          )}
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search tasks, projects, or people..."
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery && setShowSearchResults(true)}
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={handleSearchClear}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
            <button type="submit" className="search-btn" aria-label="Search">
              🔍
            </button>
          </form>

          {showSearchResults && (
            <div className="search-dropdown">
              <div className="search-dropdown-header">
                <h3>Search Results</h3>
                <span className="search-count">
                  {searchResults.length + projectResults.length} result
                  {searchResults.length + projectResults.length !== 1
                    ? "s"
                    : ""}{" "}
                  found
                </span>
              </div>

              {/* Projects Section */}
              {projectResults.length > 0 && (
                <>
                  <div className="search-section-header">
                    <h4>📁 Projects ({projectResults.length})</h4>
                  </div>
                  <div className="search-results-list">
                    {projectResults.map((project) => (
                      <div
                        key={project.id}
                        className="search-result-item"
                        onClick={() => handleProjectResultClick(project)}
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleProjectResultClick(project);
                          }
                        }}
                      >
                        <div className="search-result-header">
                          <span className="search-result-priority">📁</span>
                          <h4 className="search-result-title">
                            {project.name}
                          </h4>
                        </div>

                        {project.description && (
                          <p className="search-result-description">
                            {project.description}
                          </p>
                        )}

                        <div className="search-result-meta">
                          <span
                            className="search-result-status"
                            style={{
                              backgroundColor: project.color || "#6b7280",
                              color: "white",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {project.status || "active"}
                          </span>

                          {project.startDate && (
                            <span className="search-result-date">
                              📅{" "}
                              {new Date(project.startDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Tasks Section */}
              {searchResults.length > 0 && (
                <>
                  <div className="search-section-header">
                    <h4>✓ Tasks ({searchResults.length})</h4>
                  </div>
                  <div className="search-results-list">
                    {searchResults.map((task) => (
                      <div
                        key={task.id}
                        className="search-result-item"
                        onClick={() => handleSearchResultClick(task)}
                        style={{ cursor: "pointer" }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleSearchResultClick(task);
                          }
                        }}
                      >
                        <div className="search-result-header">
                          <span className="search-result-priority">
                            {getPriorityIcon(task.priority)}
                          </span>
                          <h4 className="search-result-title">{task.title}</h4>
                        </div>

                        {task.description && (
                          <p className="search-result-description">
                            {task.description}
                          </p>
                        )}

                        <div className="search-result-meta">
                          <span
                            className="search-result-status"
                            style={{
                              backgroundColor: getStatusColor(task.status),
                              color: "white",
                              padding: "0.2rem 0.5rem",
                              borderRadius: "4px",
                              fontSize: "0.75rem",
                            }}
                          >
                            {task.status?.replace("-", " ")}
                          </span>

                          {task.assignee && (
                            <span className="search-result-assignee">
                              👤 {task.assignee}
                            </span>
                          )}

                          {task.project && (
                            <span className="search-result-project">
                              📁 {task.project}
                            </span>
                          )}

                          {task.dueDate && (
                            <span className="search-result-date">
                              📅 {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* No results message */}
              {searchResults.length === 0 && projectResults.length === 0 && (
                <div className="search-no-results">
                  {tasks.length === 0 ? (
                    <>
                      <p>No tasks or projects available yet</p>
                      <small>
                        Create your first task or project to get started!
                      </small>
                    </>
                  ) : (
                    <>
                      <p>No results found matching "{searchQuery}"</p>
                      <small>
                        Try different keywords or check your spelling
                      </small>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="notification-wrapper" ref={notificationRef}>
            <button
              className="notification-btn"
              onClick={() => setShowNotifications(!showNotifications)}
              aria-label="Notifications"
            >
              🔔
              {unreadCount > 0 && (
                <span className="notification-badge">{unreadCount}</span>
              )}
            </button>

            {showNotifications && (
              <div className="notification-dropdown">
                <div className="notification-header">
                  <h3>Notifications</h3>
                  <button className="mark-all-read">Mark all as read</button>
                </div>
                <div className="notification-list">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`notification-item ${
                        notification.unread ? "unread" : ""
                      }`}
                    >
                      <p>{notification.text}</p>
                      <small>{notification.time}</small>
                    </div>
                  ))}
                </div>
                <div className="notification-footer">
                  <button className="view-all-notifications btn btn-secondary">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="user-menu-wrapper" ref={userMenuRef}>
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user?.name}</span>
              {/* <span className="dropdown-arrow">▼</span> */}
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <div className="user-info">
                  <div className="user-avatar large">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="user-name">{user?.name}</p>
                    <p className="user-email">{user?.email}</p>
                    <p className="user-role">{user?.role}</p>
                  </div>
                </div>

                <div className="user-menu-divider"></div>

                <div className="user-menu-items">
                  <button className="user-menu-item">👤 Profile</button>
                  <button className="user-menu-item">⚙️ Settings</button>
                  <button className="user-menu-item">🏢 Organization</button>
                  <button className="user-menu-item">❓ Help & Support</button>
                </div>

                <div className="user-menu-divider"></div>

                <button
                  className="user-menu-item logout"
                  onClick={handleLogout}
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
