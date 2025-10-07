import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { usersAPI, authAPI, tasksAPI } from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";
import {
  handleError,
  successMessages,
  errorMessages,
} from "../../utils/errorHandler";

const UserProfile = () => {
  const { user, organization, login } = useAuth();
  const toast = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userTasks, setUserTasks] = useState([]);
  const [userStats, setUserStats] = useState({
    completedTasks: 0,
    activeTasks: 0,
    totalProjects: 0,
  });
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: user?.bio || "",
    department: user?.department || "",
    phoneNumber: user?.phoneNumber || "",
  });

  // Fetch user tasks and calculate statistics
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch all tasks
        const tasks = await tasksAPI.getAll();
        const tasksArray = Array.isArray(tasks) ? tasks : [];

        // Filter tasks for current user
        const myTasks = tasksArray.filter((task) => {
          const taskAssignee =
            typeof task.assignedTo === "object"
              ? task.assignedTo?._id
              : task.assignedTo;
          return (
            task.assignee === user?.name ||
            taskAssignee === user?.id ||
            taskAssignee === user?._id
          );
        });

        // Calculate statistics
        const completed = myTasks.filter((task) => task.status === "done");
        const active = myTasks.filter((task) => task.status !== "done");

        // Get unique project IDs
        const projectIds = new Set(
          myTasks.map((task) => task.projectId).filter(Boolean)
        );

        setUserStats({
          completedTasks: completed.length,
          activeTasks: active.length,
          totalProjects: projectIds.size,
        });

        // Get recent tasks (last 3)
        const recentTasks = [...myTasks]
          .sort(
            (a, b) =>
              new Date(b.updatedAt || b.createdAt) -
              new Date(a.updatedAt || a.createdAt)
          )
          .slice(0, 3);

        setUserTasks(recentTasks);

        // Update form data with user info
        setFormData({
          name: user?.name || "",
          email: user?.email || "",
          bio: user?.bio || "",
          department: user?.department || "",
          phoneNumber: user?.phoneNumber || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      // Update user profile via API
      await usersAPI.update(user?.id || user?._id, {
        name: formData.name,
        bio: formData.bio,
        department: formData.department,
        phoneNumber: formData.phoneNumber,
      });

      // Update local storage and context
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      authData.user = {
        ...authData.user,
        name: formData.name,
        bio: formData.bio,
        department: formData.department,
        phoneNumber: formData.phoneNumber,
      };
      localStorage.setItem("auth", JSON.stringify(authData));
      login(authData.user, organization);

      setIsEditing(false);
      toast.showSuccess(successMessages.profileUpdated);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.showError(handleError(error, "Update Profile"));
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
      bio: "",
      department: "",
      phoneNumber: "",
    });
    setIsEditing(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.showError(errorMessages.fileTooLarge);
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.showError(errorMessages.invalidFileType);
      return;
    }

    try {
      setUploading(true);

      // Upload avatar to server (stores file and updates MongoDB)
      await usersAPI.uploadAvatar(file);

      // Fetch updated user data from server
      const updatedUserData = await authAPI.getMe();

      // Update auth context and localStorage with fresh data from MongoDB
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      authData.user = {
        ...authData.user,
        avatar: updatedUserData.avatar,
      };
      localStorage.setItem("auth", JSON.stringify(authData));

      // Update context
      login({ ...user, avatar: updatedUserData.avatar }, organization);

      toast.showSuccess(successMessages.profilePictureUpdated);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.showError(handleError(error, "Upload Profile Picture"));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          {uploading ? (
            <div className="avatar-circle loading">
              <span>Uploading...</span>
            </div>
          ) : user?.avatar ? (
            <img
              src={getImageUrl(user.avatar)}
              alt={user.name}
              className="avatar-image"
            />
          ) : (
            <div className="avatar-circle">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <label htmlFor="avatar-upload" className="avatar-upload-btn">
            📷
            <input
              type="file"
              id="avatar-upload"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ display: "none" }}
            />
          </label>
        </div>
        <div className="profile-info">
          <h2>{user?.name}</h2>
          <p className="user-role">{user?.role}</p>
          <p className="user-organization">{organization?.name}</p>
        </div>
        <div className="profile-actions">
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="btn primary">
              Edit Profile
            </button>
          ) : (
            <div className="edit-actions">
              <button onClick={handleSave} className="btn primary">
                Save
              </button>
              <button onClick={handleCancel} className="btn secondary">
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-section">
          <h3>Personal Information</h3>

          <div className="form-group">
            <label>Full Name</label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            ) : (
              <p>{formData.name || "Not specified"}</p>
            )}
          </div>

          <div className="form-group">
            <label>Email</label>
            {isEditing ? (
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            ) : (
              <p>{formData.email}</p>
            )}
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            {isEditing ? (
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
              />
            ) : (
              <p>{formData.phoneNumber || "Not specified"}</p>
            )}
          </div>

          <div className="form-group">
            <label>Department</label>
            {isEditing ? (
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g., Engineering, Marketing, Sales"
              />
            ) : (
              <p>{formData.department || "Not specified"}</p>
            )}
          </div>

          <div className="form-group">
            <label>Bio</label>
            {isEditing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell us about yourself..."
                rows="4"
              />
            ) : (
              <p>{formData.bio || "No bio provided"}</p>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h3>Activity Summary</h3>
          {loading ? (
            <p>Loading statistics...</p>
          ) : (
            <div className="activity-stats">
              <div className="stat-item">
                <span className="stat-value">{userStats.completedTasks}</span>
                <span className="stat-label">Tasks Completed</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.activeTasks}</span>
                <span className="stat-label">Active Tasks</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{userStats.totalProjects}</span>
                <span className="stat-label">Projects</span>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section">
          <h3>Recent Tasks</h3>
          {loading ? (
            <p>Loading tasks...</p>
          ) : userTasks.length > 0 ? (
            <div className="recent-tasks">
              {userTasks.map((task, index) => (
                <div
                  key={task._id || task.id || `task-${index}`}
                  className="task-item"
                >
                  <span className="task-name">{task.title}</span>
                  <span className={`task-status ${task.status}`}>
                    {task.status === "done"
                      ? "Completed"
                      : task.status === "in-progress"
                      ? "In Progress"
                      : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p>No recent tasks found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
