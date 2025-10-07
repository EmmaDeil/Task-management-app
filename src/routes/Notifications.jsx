import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { notificationsAPI } from "../services/api";
import "./Notifications.css";

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // 'all', 'unread'

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = filter === "unread" ? { unreadOnly: true } : {};
      const data = await notificationsAPI.getAll(params);
      setNotifications(data.notifications || []);
      setError("");
    } catch (err) {
      setError("Failed to load notifications");
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationsAPI.markAsRead(notification._id);
      }

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
      setError("Failed to mark all as read");
      console.error("Error marking all as read:", err);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Prevent navigation
    try {
      await notificationsAPI.delete(id);
      fetchNotifications();
    } catch (err) {
      setError("Failed to delete notification");
      console.error("Error deleting notification:", err);
    }
  };

  const getNotificationIcon = (type) => {
    const icons = {
      task_assigned: "📋",
      task_updated: "✏️",
      task_completed: "✅",
      deadline_approaching: "⏰",
      project_created: "📁",
      project_updated: "🔄",
      team_invite: "👥",
      comment_added: "💬",
      mention: "📢",
      system: "🔔",
    };
    return icons[type] || "🔔";
  };

  const getPriorityClass = (priority) => {
    return `notification-priority-${priority}`;
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="notifications-page">
        <div className="notifications-loading">
          <div className="spinner"></div>
          <p>Loading notifications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>
        <div className="notifications-actions">
          <div className="notifications-filter">
            <button
              className={`filter-btn ${filter === "all" ? "active" : ""}`}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${filter === "unread" ? "active" : ""}`}
              onClick={() => setFilter("unread")}
            >
              Unread
            </button>
          </div>
          <button
            className="btn btn-secondary mark-all-btn"
            onClick={handleMarkAllAsRead}
            disabled={notifications.filter((n) => !n.isRead).length === 0}
          >
            Mark all as read
          </button>
        </div>
      </div>

      {error && <div className="notifications-error">{error}</div>}

      {notifications.length === 0 ? (
        <div className="notifications-empty">
          <div className="empty-icon">🔔</div>
          <h2>No notifications</h2>
          <p>
            {filter === "unread"
              ? "You're all caught up! No unread notifications."
              : "You don't have any notifications yet."}
          </p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-card ${
                notification.isRead ? "read" : "unread"
              } ${getPriorityClass(notification.priority)}`}
              onClick={() => handleNotificationClick(notification)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  handleNotificationClick(notification);
                }
              }}
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>

              <div className="notification-content">
                <div className="notification-title">
                  {notification.title}
                  {!notification.isRead && <span className="unread-dot"></span>}
                </div>
                <div className="notification-message">
                  {notification.message}
                </div>
                <div className="notification-meta">
                  <span className="notification-time">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                  {notification.relatedTask && (
                    <span className="notification-tag">📋 Task</span>
                  )}
                  {notification.relatedProject && (
                    <span className="notification-tag">📁 Project</span>
                  )}
                </div>
              </div>

              <button
                className="notification-delete"
                onClick={(e) => handleDelete(notification._id, e)}
                aria-label="Delete notification"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
