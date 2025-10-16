import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { organizationsAPI } from "../../services/api";
import { handleError, successMessages } from "../../utils/errorHandler";

const OrganizationDashboard = ({ onNavigate }) => {
  const { user, organization, login } = useAuth();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState("members");
  const [saving, setSaving] = useState(false);
  const [orgSettings, setOrgSettings] = useState({
    name: organization?.name || "",
    plan: organization?.plan || "free",
    emailNotifications: organization?.settings?.emailNotifications ?? true,
    weeklyReports: organization?.settings?.weeklyReports ?? false,
  });

  // Replace mockMembers with real organization members if available
  const members = organization?.members || [];

  const tabs = [
    { id: "members", label: "Members" },
    { id: "settings", label: "Settings" }
  ];

  const renderMembers = () => (
    <div className="org-members" style={{}}>
      <div className="members-header">
        <h3>Team Members</h3>
        <button className="btn primary" onClick={() => onNavigate("invite")}>
          Manage Team
        </button>
      </div>

      <div className="members-table">
        <div className="table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {members.map((member) => (
          <div key={member.id} className="table-row">
            <span className="member-name">{member.name}</span>
            <span className="member-email">{member.email}</span>
            <span className={`member-role ${member.role}`}>{member.role}</span>
            <span className={`member-status ${member.status}`}>
              {member.status}
            </span>
            <div className="member-actions">
              <button className="btn small">Edit</button>
              {member.role !== "admin" && (
                <button className="btn small danger">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const handleOrgSettingChange = (key, value) => {
    setOrgSettings({ ...orgSettings, [key]: value });
  };

  const handleSaveOrgSettings = async () => {
    try {
      setSaving(true);

      // Save organization settings to backend
      await organizationsAPI.update(organization?._id || organization?.id, {
        name: orgSettings.name,
        plan: orgSettings.plan,
        settings: {
          emailNotifications: orgSettings.emailNotifications,
          weeklyReports: orgSettings.weeklyReports,
        },
      });

      // Update local storage
      const authData = JSON.parse(localStorage.getItem("auth") || "{}");
      authData.organization = {
        ...authData.organization,
        name: orgSettings.name,
        plan: orgSettings.plan,
        settings: {
          emailNotifications: orgSettings.emailNotifications,
          weeklyReports: orgSettings.weeklyReports,
        },
      };
      localStorage.setItem("auth", JSON.stringify(authData));
      login(user, authData.organization);

      toast.showSuccess(successMessages.organizationUpdated);
    } catch (error) {
      console.error("Error saving organization settings:", error);
      toast.showError(handleError(error, "Save Organization Settings"));
    } finally {
      setSaving(false);
    }
  };

  const renderSettings = () => (
    <div className="org-settings">
      <div className="settings-section">
        <h3>Organization Details</h3>
        <div className="form-group">
          <label>Organization Name</label>
          <input
            type="text"
            value={orgSettings.name}
            onChange={(e) => handleOrgSettingChange("name", e.target.value)}
            placeholder="Enter organization name"
          />
        </div>
        <div className="form-group">
          <label>Plan</label>
          <select
            value={orgSettings.plan}
            onChange={(e) => handleOrgSettingChange("plan", e.target.value)}
          >
            <option value="free">Free</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      <div className="settings-section">
        <h3>Preferences</h3>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={orgSettings.emailNotifications}
              onChange={(e) =>
                handleOrgSettingChange("emailNotifications", e.target.checked)
              }
            />
            Email notifications for new tasks
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={orgSettings.weeklyReports}
              onChange={(e) =>
                handleOrgSettingChange("weeklyReports", e.target.checked)
              }
            />
            Weekly progress reports
          </label>
        </div>
      </div>

      <div className="settings-actions">
        <button
          className="btn primary"
          onClick={handleSaveOrgSettings}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>
    </div>
  );

  if (!organization) {
    return (
      <div className="no-organization">
        <h2>No Organization</h2>
        <p>
          You need to join an organization or create one to access this page.
        </p>
      </div>
    );
  }

  return (
    <div className="organization-dashboard">
      <div className="dashboard-header">
        <h1>{organization.name}</h1>
        <p>Welcome, {user?.name}</p>
      </div>

      <div className="dashboard-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="dashboard-content">
        {activeTab === "members" && renderMembers()}
        {activeTab === "settings" && renderSettings()}
      </div>
    </div>
  );
};

export default OrganizationDashboard;
