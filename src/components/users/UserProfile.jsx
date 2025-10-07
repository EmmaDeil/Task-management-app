import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { usersAPI, authAPI } from "../../services/api";
import { getImageUrl } from "../../utils/imageUtils";

const UserProfile = () => {
  const { user, organization, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    bio: "",
    department: "",
    phoneNumber: "",
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // In a real app, this would make an API call
    console.log("Saving user profile:", formData);
    setIsEditing(false);
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
      alert("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
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

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Error uploading avatar:", error);
      alert("Failed to upload profile picture. Please try again.");
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
          <div className="activity-stats">
            <div className="stat-item">
              <span className="stat-value">24</span>
              <span className="stat-label">Tasks Completed</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">8</span>
              <span className="stat-label">Active Tasks</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">3</span>
              <span className="stat-label">Projects</span>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h3>Recent Tasks</h3>
          <div className="recent-tasks">
            <div className="task-item">
              <span className="task-name">Update user interface</span>
              <span className="task-status completed">Completed</span>
            </div>
            <div className="task-item">
              <span className="task-name">Review code changes</span>
              <span className="task-status in-progress">In Progress</span>
            </div>
            <div className="task-item">
              <span className="task-name">Write documentation</span>
              <span className="task-status pending">Pending</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
