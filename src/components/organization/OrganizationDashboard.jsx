import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const OrganizationDashboard = () => {
  const { user, organization } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const mockStats = {
    totalMembers: 12,
    activeTasks: 45,
    completedTasks: 123,
    projectsCount: 8
  };

  const mockMembers = [
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'member', status: 'active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'member', status: 'pending' }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderOverview = () => (
    <div className="org-overview">
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{mockStats.totalMembers}</h3>
          <p>Team Members</p>
        </div>
        <div className="stat-card">
          <h3>{mockStats.activeTasks}</h3>
          <p>Active Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{mockStats.completedTasks}</h3>
          <p>Completed Tasks</p>
        </div>
        <div className="stat-card">
          <h3>{mockStats.projectsCount}</h3>
          <p>Projects</p>
        </div>
      </div>
      
      <div className="recent-activity">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span>New member John Doe joined the team</span>
            <span className="activity-time">2 hours ago</span>
          </div>
          <div className="activity-item">
            <span>Task "Update homepage" was completed</span>
            <span className="activity-time">4 hours ago</span>
          </div>
          <div className="activity-item">
            <span>New project "Mobile App" created</span>
            <span className="activity-time">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMembers = () => (
    <div className="org-members">
      <div className="members-header">
        <h3>Team Members</h3>
        <button className="btn primary">Invite Members</button>
      </div>
      
      <div className="members-table">
        <div className="table-header">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        
        {mockMembers.map(member => (
          <div key={member.id} className="table-row">
            <span className="member-name">{member.name}</span>
            <span className="member-email">{member.email}</span>
            <span className={`member-role ${member.role}`}>{member.role}</span>
            <span className={`member-status ${member.status}`}>{member.status}</span>
            <div className="member-actions">
              <button className="btn small">Edit</button>
              {member.role !== 'admin' && (
                <button className="btn small danger">Remove</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="org-settings">
      <div className="settings-section">
        <h3>Organization Details</h3>
        <div className="form-group">
          <label>Organization Name</label>
          <input type="text" value={organization?.name || ''} readOnly />
        </div>
        <div className="form-group">
          <label>Plan</label>
          <select value={organization?.plan || 'free'}>
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
            <input type="checkbox" />
            Email notifications for new tasks
          </label>
        </div>
        <div className="form-group">
          <label className="checkbox-label">
            <input type="checkbox" />
            Weekly progress reports
          </label>
        </div>
      </div>
      
      <div className="settings-actions">
        <button className="btn primary">Save Changes</button>
      </div>
    </div>
  );

  if (!organization) {
    return (
      <div className="no-organization">
        <h2>No Organization</h2>
        <p>You need to join an organization or create one to access this page.</p>
      </div>
    );
  }

  return (
    <div className="organization-dashboard">
      <div className="dashboard-header">
        <h1>{organization.name}</h1>
        <p>Welcome back, {user?.name}</p>
      </div>
      
      <div className="dashboard-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'members' && renderMembers()}
        {activeTab === 'settings' && renderSettings()}
      </div>
    </div>
  );
};

export default OrganizationDashboard;