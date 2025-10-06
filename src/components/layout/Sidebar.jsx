import React from "react";
import { useAuth } from "../../hooks/useAuth";

const Sidebar = ({ isOpen, onClose, activeView, onViewChange }) => {
  const { user } = useAuth();

  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: "📊",
      roles: ["admin", "manager", "member"],
    },
    {
      id: "tasks",
      label: "Task Board",
      icon: "📋",
      roles: ["admin", "manager", "member"],
    },
    {
      id: "projects",
      label: "Projects",
      icon: "📁",
      roles: ["admin", "manager", "member"],
    },
    {
      id: "team",
      label: "Team",
      icon: "👥",
      roles: ["admin", "manager", "member"],
    },
    {
      id: "calendar",
      label: "Calendar",
      icon: "📅",
      roles: ["admin", "manager", "member"],
    },
    {
      id: "reports",
      label: "Reports",
      icon: "📈",
      roles: ["admin", "manager"],
    },
    {
      id: "organization",
      label: "Organization",
      icon: "🏢",
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role)
  );

  const handleItemClick = (itemId) => {
    onViewChange(itemId);
    // Close sidebar on mobile after selection
    if (window.innerWidth <= 768) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose}></div>}

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-content">
          <nav className="sidebar-nav">
            <div className="nav-section">
              <h3 className="nav-section-title">Main</h3>
              <ul className="nav-list">
                {filteredMenuItems.slice(0, 5).map((item) => (
                  <li key={item.id} className="nav-item">
                    <button
                      className={`nav-link ${
                        activeView === item.id ? "active" : ""
                      }`}
                      onClick={() => handleItemClick(item.id)}
                    >
                      <span className="nav-icon">{item.icon}</span>
                      <span className="nav-label">{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {user?.role === "admin" && (
              <div className="nav-section">
                <h3 className="nav-section-title">Administration</h3>
                <ul className="nav-list">
                  {filteredMenuItems.slice(5).map((item) => (
                    <li key={item.id} className="nav-item">
                      <button
                        className={`nav-link ${
                          activeView === item.id ? "active" : ""
                        }`}
                        onClick={() => handleItemClick(item.id)}
                      >
                        <span className="nav-icon">{item.icon}</span>
                        <span className="nav-label">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="nav-section">
              <h3 className="nav-section-title">Quick Actions</h3>
              <ul className="nav-list">
                <li className="nav-item">
                  <button className="nav-link quick-action">
                    <span className="nav-icon">➕</span>
                    <span className="nav-label">New Task</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link quick-action">
                    <span className="nav-icon">📁</span>
                    <span className="nav-label">New Project</span>
                  </button>
                </li>
                <li className="nav-item">
                  <button className="nav-link quick-action">
                    <span className="nav-icon">👤</span>
                    <span className="nav-label">Invite Member</span>
                  </button>
                </li>
              </ul>
            </div>
          </nav>

          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar small">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <p className="user-role">{user?.role}</p>
              </div>
            </div>

            <div className="sidebar-actions">
              <button className="sidebar-action" title="Settings">
                ⚙️
              </button>
              <button className="sidebar-action" title="Help">
                ❓
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
