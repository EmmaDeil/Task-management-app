import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { usersAPI } from "../../services/api";
import { useNavigate } from "react-router-dom";
import InviteMember from "./InviteMember";
import { handleError, successMessages } from "../../utils/errorHandler";

const UserList = () => {
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await usersAPI.getAll();
        setUsers(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((userItem) => {
    const matchesSearch =
      userItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userItem.department?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || userItem.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = async (action) => {
    if (selectedUsers.length === 0) return;

    const confirmMessage =
      action === "deactivate"
        ? "Are you sure you want to deactivate these users?"
        : "Are you sure you want to remove these users?";

    if (!window.confirm(confirmMessage)) return;

    try {
      if (action === "deactivate") {
        // Update user status to inactive
        for (const userId of selectedUsers) {
          await usersAPI.update(userId, { status: "inactive" });
        }
        toast.showSuccess(successMessages.userDeactivated);
      } else if (action === "remove") {
        // Delete users
        for (const userId of selectedUsers) {
          await usersAPI.delete(userId);
        }
        toast.showSuccess(successMessages.userRemoved);
      }

      // Refresh users list
      const data = await usersAPI.getAll();
      setUsers(Array.isArray(data) ? data : []);
      setSelectedUsers([]);
    } catch (error) {
      console.error(`Error performing ${action}:`, error);
      toast.showError(handleError(error, `${action} users`));
    }
  };

  const handleToggleUserStatus = async (userItem) => {
    try {
      const newStatus = userItem.status === "active" ? "inactive" : "active";
      await usersAPI.update(userItem._id || userItem.id, {
        status: newStatus,
      });

      // Update local state
      setUsers(
        users.map((u) =>
          (u._id || u.id) === (userItem._id || userItem.id)
            ? { ...u, status: newStatus }
            : u
        )
      );

      toast.showSuccess(
        `User ${
          newStatus === "active" ? "activated" : "deactivated"
        } successfully!`
      );
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast.showError(handleError(error, "Update User Status"));
    }
  };

  const handleEditUser = () => {
    // Navigate to user profile or settings page
    navigate(`/profile`);
  };

  const handleAssignTasks = (userItem) => {
    // Navigate to tasks page with user filter
    navigate(`/tasks?assignee=${userItem._id || userItem.id}`);
  };

  const canManageUsers = user?.role === "admin" || user?.role === "manager";

  if (loading) {
    return (
      <div className="user-list">
        <div className="loading-container">
          <p>Loading team members...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "Member" : "Members"}
        </h2>
        {canManageUsers && (
          <button
            className="btn primary"
            onClick={() => setShowInviteModal(true)}
          >
            Invite New Member
          </button>
        )}
      </div>

      <div className="user-filters">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          className="role-filter"
        >
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="member">Member</option>
        </select>
      </div>

      {selectedUsers.length > 0 && canManageUsers && (
        <div className="bulk-actions">
          <span>
            {selectedUsers.length}{" "}
            {selectedUsers.length === 1 ? "user" : "users"} selected
          </span>
          <div className="bulk-buttons">
            <button
              onClick={() => handleBulkAction("deactivate")}
              className="btn small secondary"
            >
              Deactivate
            </button>
            <button
              onClick={() => handleBulkAction("remove")}
              className="btn small danger"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="users-grid">
        {filteredUsers.map((userItem) => (
          <div key={userItem._id || userItem.id} className="user-card">
            {canManageUsers && (
              <div className="user-select">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(userItem._id || userItem.id)}
                  onChange={() => handleUserSelect(userItem._id || userItem.id)}
                />
              </div>
            )}

            <div className="user-avatar">
              <div className="avatar-circle">
                {userItem.name?.charAt(0).toUpperCase() || "?"}
              </div>
              <div
                className={`status-indicator ${userItem.status || "active"}`}
              ></div>
            </div>

            <div className="user-info">
              <h3>{userItem.name}</h3>
              <p className="user-email">{userItem.email}</p>
              <p className="user-department">
                {userItem.department || "No department"}
              </p>

              <div className="user-meta">
                <span className={`role-badge ${userItem.role || "member"}`}>
                  {userItem.role || "member"}
                </span>
                <span className="tasks-count">
                  {userItem.tasksCount || 0}{" "}
                  {(userItem.tasksCount || 0) === 1 ? "task" : "tasks"}
                </span>
              </div>

              <div className="user-stats">
                <small>
                  Joined:{" "}
                  {userItem.createdAt
                    ? new Date(userItem.createdAt).toLocaleDateString()
                    : "N/A"}
                </small>
              </div>
            </div>

            <div className="user-actions">
              <button
                className="btn small"
                onClick={() => handleEditUser(userItem)}
              >
                View Profile
              </button>
              {canManageUsers &&
                (userItem._id || userItem.id) !== (user?._id || user?.id) && (
                  <div className="action-menu">
                    <button
                      className="btn small secondary"
                      onClick={() => handleEditUser(userItem)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn small"
                      onClick={() => handleAssignTasks(userItem)}
                    >
                      Assign Tasks
                    </button>
                    {userItem.status === "active" ? (
                      <button
                        className="btn small warning"
                        onClick={() => handleToggleUserStatus(userItem)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="btn small success"
                        onClick={() => handleToggleUserStatus(userItem)}
                      >
                        Activate
                      </button>
                    )}
                  </div>
                )}
            </div>
          </div>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <div className="no-results">
          <p>No users found matching your criteria.</p>
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMember onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};

export default UserList;
