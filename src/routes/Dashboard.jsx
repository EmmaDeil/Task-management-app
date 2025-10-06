import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useAuth } from "../hooks/useAuth";

const Dashboard = () => {
  const { user, organization } = useAuth();
  const dispatch = useDispatch();

  // Add sample tasks on first load for demo purposes
  useEffect(() => {
    const sampleTasks = [
      {
        title: "Review pull request #234",
        description:
          "Review the authentication refactoring PR and provide feedback",
        status: "in-progress",
        priority: "high",
        assignee: user?.name || "John Doe",
        project: "Authentication Module",
        dueDate: "2025-10-10",
      },
      {
        title: "Update API documentation",
        description:
          "Update REST API docs with new endpoints and authentication flow",
        status: "todo",
        priority: "medium",
        assignee: "Sarah Johnson",
        project: "Documentation",
        dueDate: "2025-10-12",
      },
      {
        title: "Fix login bug",
        description:
          "Users are experiencing issues with SSO login on mobile devices",
        status: "review",
        priority: "urgent",
        assignee: "Mike Chen",
        project: "Bug Fixes",
        dueDate: "2025-10-08",
      },
      {
        title: "Design new dashboard layout",
        description: "Create mockups for the redesigned admin dashboard",
        status: "todo",
        priority: "low",
        assignee: "Emily Davis",
        project: "UI/UX Design",
        dueDate: "2025-10-15",
      },
      {
        title: "Implement dark mode",
        description: "Add dark mode toggle and theme switching functionality",
        status: "in-progress",
        priority: "medium",
        assignee: user?.name || "John Doe",
        project: "Features",
        dueDate: "2025-10-14",
      },
      {
        title: "Optimize database queries",
        description: "Improve performance of user search and filtering queries",
        status: "done",
        priority: "high",
        assignee: "Alex Turner",
        project: "Performance",
        dueDate: "2025-10-05",
      },
      {
        title: "Setup CI/CD pipeline",
        description: "Configure automated testing and deployment pipeline",
        status: "todo",
        priority: "high",
        assignee: "DevOps Team",
        project: "Infrastructure",
        dueDate: "2025-10-20",
      },
      {
        title: "Client presentation preparation",
        description:
          "Prepare slides and demo for the quarterly client review meeting",
        status: "in-progress",
        priority: "urgent",
        assignee: "Marketing Team",
        project: "Client Relations",
        dueDate: "2025-10-09",
      },
    ];

    // Only add tasks if there are none in the store
    const existingTasks = localStorage.getItem("redux_tasks");
    if (!existingTasks || JSON.parse(existingTasks).length === 0) {
      sampleTasks.forEach((task) => {
        dispatch({ type: "tasks/addTask", payload: task });
      });
    }
  }, [dispatch, user]);

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
