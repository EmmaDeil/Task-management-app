import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const Header = ({ onSidebarToggle, isSidebarOpen }) => {
  const { user, organization, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, text: "New task assigned to you", time: "5m ago", unread: true },
    {
      id: 2,
      text: "Project deadline approaching",
      time: "1h ago",
      unread: true,
    },
    {
      id: 3,
      text: "Team meeting tomorrow at 10 AM",
      time: "2h ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

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
          <h1>TaskFlow</h1>
          {organization && (
            <span className="org-name">{organization.name}</span>
          )}
        </div>
      </div>

      <div className="header-center">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search tasks, projects, or people..."
            className="search-input"
          />
          <button className="search-btn">🔍</button>
        </div>
      </div>

      <div className="header-right">
        <div className="header-actions">
          <div className="notification-wrapper">
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
                  <button>View all notifications</button>
                </div>
              </div>
            )}
          </div>

          <div className="user-menu-wrapper">
            <button
              className="user-menu-trigger"
              onClick={() => setShowUserMenu(!showUserMenu)}
              aria-label="User menu"
            >
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <span className="user-name">{user?.name}</span>
              <span className="dropdown-arrow">▼</span>
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
