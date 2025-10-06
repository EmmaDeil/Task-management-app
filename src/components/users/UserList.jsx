import React, { useState } from 'react';
import { useAuth } from '../auth/AuthProvider';

const UserList = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const mockUsers = [
    { 
      id: 1, 
      name: 'John Doe', 
      email: 'john@example.com', 
      role: 'admin', 
      department: 'Engineering',
      status: 'active',
      tasksCount: 12,
      joinedDate: '2024-01-15'
    },
    { 
      id: 2, 
      name: 'Jane Smith', 
      email: 'jane@example.com', 
      role: 'member', 
      department: 'Design',
      status: 'active',
      tasksCount: 8,
      joinedDate: '2024-02-20'
    },
    { 
      id: 3, 
      name: 'Bob Johnson', 
      email: 'bob@example.com', 
      role: 'member', 
      department: 'Marketing',
      status: 'inactive',
      tasksCount: 3,
      joinedDate: '2024-03-10'
    },
    { 
      id: 4, 
      name: 'Alice Brown', 
      email: 'alice@example.com', 
      role: 'manager', 
      department: 'Sales',
      status: 'active',
      tasksCount: 15,
      joinedDate: '2024-01-08'
    }
  ];

  const filteredUsers = mockUsers.filter(userItem => {
    const matchesSearch = userItem.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userItem.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || userItem.role === filterRole;
    return matchesSearch && matchesRole;
  });

  const handleUserSelect = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Performing ${action} on users:`, selectedUsers);
    // In a real app, this would make API calls
    setSelectedUsers([]);
  };

  const canManageUsers = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="user-list">
      <div className="user-list-header">
        <h2>Team Members</h2>
        {canManageUsers && (
          <button className="btn primary">Invite New Member</button>
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
          <span>{selectedUsers.length} users selected</span>
          <div className="bulk-buttons">
            <button 
              onClick={() => handleBulkAction('deactivate')}
              className="btn small secondary"
            >
              Deactivate
            </button>
            <button 
              onClick={() => handleBulkAction('remove')}
              className="btn small danger"
            >
              Remove
            </button>
          </div>
        </div>
      )}

      <div className="users-grid">
        {filteredUsers.map(userItem => (
          <div key={userItem.id} className="user-card">
            {canManageUsers && (
              <div className="user-select">
                <input
                  type="checkbox"
                  checked={selectedUsers.includes(userItem.id)}
                  onChange={() => handleUserSelect(userItem.id)}
                />
              </div>
            )}
            
            <div className="user-avatar">
              <div className="avatar-circle">
                {userItem.name.charAt(0).toUpperCase()}
              </div>
              <div className={`status-indicator ${userItem.status}`}></div>
            </div>
            
            <div className="user-info">
              <h3>{userItem.name}</h3>
              <p className="user-email">{userItem.email}</p>
              <p className="user-department">{userItem.department}</p>
              
              <div className="user-meta">
                <span className={`role-badge ${userItem.role}`}>
                  {userItem.role}
                </span>
                <span className="tasks-count">
                  {userItem.tasksCount} tasks
                </span>
              </div>
              
              <div className="user-stats">
                <small>Joined: {new Date(userItem.joinedDate).toLocaleDateString()}</small>
              </div>
            </div>
            
            <div className="user-actions">
              <button className="btn small">View Profile</button>
              {canManageUsers && userItem.id !== user?.id && (
                <div className="action-menu">
                  <button className="btn small secondary">Edit</button>
                  <button className="btn small">Assign Tasks</button>
                  {userItem.status === 'active' ? (
                    <button className="btn small warning">Deactivate</button>
                  ) : (
                    <button className="btn small success">Activate</button>
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
    </div>
  );
};

export default UserList;