import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { usersAPI } from "../../services/api";
import {
  handleError,
  successMessages,
  errorMessages,
  warningMessages,
} from "../../utils/errorHandler";

const Settings = () => {
  const { user, organization, login, logout } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("account");
  const [saving, setSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [settings, setSettings] = useState({
    // Account settings
    language: user?.settings?.language || "en",
    timezone: user?.settings?.timezone || "UTC",
    dateFormat: user?.settings?.dateFormat || "MM/DD/YYYY",

    // Notification settings
    emailNotifications: user?.settings?.emailNotifications ?? true,
    taskAssignments: user?.settings?.taskAssignments ?? true,
    taskUpdates: user?.settings?.taskUpdates ?? true,
    projectUpdates: user?.settings?.projectUpdates ?? true,
    weeklyReports: user?.settings?.weeklyReports ?? false,

    // Privacy settings
    profileVisibility: user?.settings?.profileVisibility || "organization",
    showEmail: user?.settings?.showEmail ?? true,
    showPhone: user?.settings?.showPhone ?? false,

    // Appearance settings
    theme: user?.settings?.theme || "light",
    compactView: user?.settings?.compactView ?? false,
  });

  // Load user settings on mount
  useEffect(() => {
    if (user?.settings) {
      setSettings({
        language: user.settings.language || "en",
        timezone: user.settings.timezone || "UTC",
        dateFormat: user.settings.dateFormat || "MM/DD/YYYY",
        emailNotifications: user.settings.emailNotifications ?? true,
        taskAssignments: user.settings.taskAssignments ?? true,
        taskUpdates: user.settings.taskUpdates ?? true,
        projectUpdates: user.settings.projectUpdates ?? true,
        weeklyReports: user.settings.weeklyReports ?? false,
        profileVisibility: user.settings.profileVisibility || "organization",
        showEmail: user.settings.showEmail ?? true,
        showPhone: user.settings.showPhone ?? false,
        theme: user.settings.theme || "light",
        compactView: user.settings.compactView ?? false,
      });
    }
  }, [user]);

  const tabs = [
    { id: "account", label: "Account", icon: "👤" },
    { id: "notifications", label: "Notifications", icon: "🔔" },
    { id: "privacy", label: "Privacy", icon: "🔒" },
    { id: "appearance", label: "Appearance", icon: "🎨" },
    { id: "security", label: "Security", icon: "🛡️" },
  ];

  const handleToggle = (key) => {
    setSettings({ ...settings, [key]: !settings[key] });
  };

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Save settings to backend
      await usersAPI.update(user?.id || user?._id, {
        settings: settings,
      });

      // Update local storage and context
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      authData.user = {
        ...authData.user,
        settings: settings,
      };
      localStorage.setItem("auth", JSON.stringify(authData));
      login(authData.user, organization);

      toast.showSuccess(successMessages.settingsSaved);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.showError(handleError(error, "Save Settings"));
    } finally {
      setSaving(false);
    }
  };

  const handleResetToDefault = () => {
    if (
      confirm(
        "Are you sure you want to reset all settings to default? This cannot be undone."
      )
    ) {
      const defaultSettings = {
        language: "en",
        timezone: "UTC",
        dateFormat: "MM/DD/YYYY",
        emailNotifications: true,
        taskAssignments: true,
        taskUpdates: true,
        projectUpdates: true,
        weeklyReports: false,
        profileVisibility: "organization",
        showEmail: true,
        showPhone: false,
        theme: "light",
        compactView: false,
      };
      setSettings(defaultSettings);
    }
  };

  const handlePasswordChange = async () => {
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        toast.showError(errorMessages.passwordMismatch);
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast.showError(errorMessages.passwordTooShort);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${
          user?.id || user?._id
        }/password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            currentPassword: passwordData.currentPassword,
            newPassword: passwordData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast.showSuccess(successMessages.passwordChanged);
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error changing password:", error);
      toast.showError(handleError(error, "Change Password"));
    }
  };

  const handleToggle2FA = () => {
    if (twoFactorEnabled) {
      if (
        confirm("Are you sure you want to disable Two-Factor Authentication?")
      ) {
        setTwoFactorEnabled(false);
        toast.showInfo("Two-Factor Authentication has been disabled.");
      }
    } else {
      toast.showWarning(warningMessages.twoFactorNotImplemented, 5000);
      // For demo purposes, enable it
      setTwoFactorEnabled(true);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        toast.showError(errorMessages.passwordRequired);
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/users/${
          user?.id || user?._id
        }/delete-account`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ password: deletePassword }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete account");
      }

      toast.showInfo(successMessages.accountDeleted);
      logout();
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.showError(handleError(error, "Delete Account"));
    }
  };

  const renderAccountSettings = () => (
    <div className="settings-section">
      <h3>Account Settings</h3>

      <div className="settings-group">
        <label>Email Address</label>
        <input
          type="email"
          value={user?.email}
          disabled
          className="disabled-input"
        />
        <small className="help-text">
          Contact admin to change your email address
        </small>
      </div>

      <div className="settings-group">
        <label>Language</label>
        <select
          value={settings.language}
          onChange={(e) => handleChange("language", e.target.value)}
        >
          <option value="en">English</option>
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>
      </div>

      <div className="settings-group">
        <label>Timezone</label>
        <select
          value={settings.timezone}
          onChange={(e) => handleChange("timezone", e.target.value)}
        >
          <option value="UTC">UTC</option>
          <option value="America/New_York">Eastern Time</option>
          <option value="America/Chicago">Central Time</option>
          <option value="America/Los_Angeles">Pacific Time</option>
        </select>
      </div>

      <div className="settings-group">
        <label>Date Format</label>
        <select
          value={settings.dateFormat}
          onChange={(e) => handleChange("dateFormat", e.target.value)}
        >
          <option value="MM/DD/YYYY">MM/DD/YYYY</option>
          <option value="DD/MM/YYYY">DD/MM/YYYY</option>
          <option value="YYYY-MM-DD">YYYY-MM-DD</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <h3>Notification Preferences</h3>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Email Notifications</strong>
            <small>Receive notifications via email</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={() => handleToggle("emailNotifications")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Task Assignments</strong>
            <small>Get notified when tasks are assigned to you</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.taskAssignments}
              onChange={() => handleToggle("taskAssignments")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Task Updates</strong>
            <small>Notifications for task status changes</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.taskUpdates}
              onChange={() => handleToggle("taskUpdates")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Project Updates</strong>
            <small>Get notified about project changes</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.projectUpdates}
              onChange={() => handleToggle("projectUpdates")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Weekly Reports</strong>
            <small>Receive weekly summary reports</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.weeklyReports}
              onChange={() => handleToggle("weeklyReports")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <h3>Privacy Settings</h3>

      <div className="settings-group">
        <label>Profile Visibility</label>
        <select
          value={settings.profileVisibility}
          onChange={(e) => handleChange("profileVisibility", e.target.value)}
        >
          <option value="public">Public</option>
          <option value="organization">Organization Only</option>
          <option value="private">Private</option>
        </select>
        <small className="help-text">Control who can see your profile</small>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Show Email Address</strong>
            <small>Make your email visible to team members</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.showEmail}
              onChange={() => handleToggle("showEmail")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Show Phone Number</strong>
            <small>Make your phone number visible to team members</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.showPhone}
              onChange={() => handleToggle("showPhone")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="settings-section">
      <h3>Appearance</h3>

      <div className="settings-group">
        <label>Theme</label>
        <div className="theme-options">
          <button
            className={`theme-option ${
              settings.theme === "light" ? "active" : ""
            }`}
            onClick={() => handleChange("theme", "light")}
          >
            <span className="theme-icon">☀️</span>
            <span>Light</span>
          </button>
          <button
            className={`theme-option ${
              settings.theme === "dark" ? "active" : ""
            }`}
            onClick={() => handleChange("theme", "dark")}
          >
            <span className="theme-icon">🌙</span>
            <span>Dark</span>
          </button>
          <button
            className={`theme-option ${
              settings.theme === "auto" ? "active" : ""
            }`}
            onClick={() => handleChange("theme", "auto")}
          >
            <span className="theme-icon">💻</span>
            <span>Auto</span>
          </button>
        </div>
      </div>

      <div className="settings-group">
        <div className="toggle-item">
          <div className="toggle-info">
            <strong>Compact View</strong>
            <small>Use a more compact layout</small>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.compactView}
              onChange={() => handleToggle("compactView")}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <h3>Security</h3>

      <div className="settings-group">
        <label>Change Password</label>
        <button
          className="btn secondary"
          onClick={() => setShowPasswordModal(true)}
        >
          Update Password
        </button>
        <small className="help-text">Last changed 30 days ago</small>
      </div>

      <div className="settings-group">
        <label>Two-Factor Authentication</label>
        <button className="btn secondary" onClick={handleToggle2FA}>
          {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
        </button>
        <small className="help-text">
          {twoFactorEnabled
            ? "2FA is currently enabled"
            : "Add an extra layer of security"}
        </small>
      </div>

      <div className="settings-group">
        <label>Active Sessions</label>
        <div className="session-list">
          <div className="session-item">
            <div>
              <strong>Current Session</strong>
              <small>Windows • Chrome • {new Date().toLocaleString()}</small>
            </div>
            <span className="session-badge active">Active</span>
          </div>
        </div>
      </div>

      <div className="settings-group danger-zone">
        <h4>Danger Zone</h4>
        <button className="btn danger" onClick={() => setShowDeleteModal(true)}>
          Delete Account
        </button>
        <small className="help-text">This action cannot be undone</small>
      </div>
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

      <div className="settings-container">
        <div className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`settings-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeTab === "account" && renderAccountSettings()}
          {activeTab === "notifications" && renderNotificationSettings()}
          {activeTab === "privacy" && renderPrivacySettings()}
          {activeTab === "appearance" && renderAppearanceSettings()}
          {activeTab === "security" && renderSecuritySettings()}

          <div className="settings-actions">
            <button
              className="btn secondary"
              onClick={handleResetToDefault}
              disabled={saving}
            >
              Reset to Default
            </button>
            <button
              className="btn primary"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPasswordModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Change Password</h2>
              <button
                className="close-btn"
                onClick={() => setShowPasswordModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Current Password</label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  placeholder="Enter current password"
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  placeholder="Enter new password (min 6 characters)"
                />
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  placeholder="Confirm new password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancel
              </button>
              <button className="btn primary" onClick={handlePasswordChange}>
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowDeleteModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Delete Account</h2>
              <button
                className="close-btn"
                onClick={() => setShowDeleteModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-box">
                <strong>⚠️ Warning: This action cannot be undone!</strong>
                <p>Deleting your account will permanently remove:</p>
                <ul>
                  <li>Your profile and personal information</li>
                  <li>All your tasks and comments</li>
                  <li>Your activity history</li>
                </ul>
              </div>
              <div className="form-group">
                <label>Enter your password to confirm</label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="btn danger" onClick={handleDeleteAccount}>
                Delete My Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
