import React from "react";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user, organization } = useAuth();

  const mockStats = {
    myTasks: 8,
    completedToday: 3,
    upcomingDeadlines: 2,
    teamTasks: 24,
  };

  const recentTasks = [
    {
      id: 1,
      title: "Review pull request",
      status: "in-progress",
      priority: "high",
    },
    {
      id: 2,
      title: "Update documentation",
      status: "todo",
      priority: "medium",
    },
    { id: 3, title: "Fix login bug", status: "done", priority: "high" },
  ];

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Project proposal",
      dueDate: "2024-10-08",
      assignee: "You",
    },
    {
      id: 2,
      title: "Client presentation",
      dueDate: "2024-10-10",
      assignee: "Team",
    },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{mockStats.myTasks}</div>
          <div className="stat-label">My Tasks</div>
          <div className="stat-change">+2 from yesterday</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mockStats.completedToday}</div>
          <div className="stat-label">Completed Today</div>
          <div className="stat-change">Great progress!</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mockStats.upcomingDeadlines}</div>
          <div className="stat-label">Due Soon</div>
          <div className="stat-change">This week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mockStats.teamTasks}</div>
          <div className="stat-label">Team Tasks</div>
          <div className="stat-change">Active across {organization?.name}</div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Recent Tasks</h2>
          <div className="task-list">
            {recentTasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="task-info">
                  <h3>{task.title}</h3>
                  <span className={`task-status ${task.status}`}>
                    {task.status.replace("-", " ")}
                  </span>
                  <span className={`task-priority ${task.priority}`}>
                    {task.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <button className="btn secondary">View All Tasks</button>
        </div>

        <div className="dashboard-section">
          <h2>Upcoming Deadlines</h2>
          <div className="deadline-list">
            {upcomingDeadlines.map((deadline) => (
              <div key={deadline.id} className="deadline-item">
                <div className="deadline-info">
                  <h3>{deadline.title}</h3>
                  <p>Due: {new Date(deadline.dueDate).toLocaleDateString()}</p>
                  <p>Assigned to: {deadline.assignee}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn primary">Create New Task</button>
        <button className="btn secondary">Start New Project</button>
      </div>
    </div>
  );
};

export default Dashboard;
