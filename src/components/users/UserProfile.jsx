import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const UserProfile = () => {
  const { user, organization } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
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

  return (
    <div className="user-profile">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
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
