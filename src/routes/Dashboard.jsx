import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { tasksAPI } from "../services/api";
import { useToast } from "../hooks/useToast";
import { handleError } from "../utils/errorHandler";

const Dashboard = () => {
  const { user, organization } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  // Get tasks from Redux store
  const tasks = useSelector((state) => state.tasks.items);
  const [loading, setLoading] = useState(true);

  // Fetch tasks from database on mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        const tasksData = await tasksAPI.getAll();

        // Ensure tasksData is an array
        const tasks = Array.isArray(tasksData) ? tasksData : [];

        // Update Redux store with fetched tasks
        dispatch({ type: "tasks/setTasks", payload: tasks });
      } catch (error) {
        console.error("Error fetching tasks:", error);
        // Only show error toast for non-401 errors
        // 401 errors are handled by the axios interceptor (token refresh)
        if (error.response?.status !== 401) {
          toast.showError(handleError(error, "Fetch Tasks"));
        }
        // Set empty array on error so the app doesn't crash
        dispatch({ type: "tasks/setTasks", payload: [] });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [dispatch, toast]);

  // Calculate real statistics from tasks
  const myTasks = tasks.filter((task) => {
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

  const completedToday = tasks.filter((task) => {
    const today = new Date().toDateString();
    return (
      task.status === "done" &&
      task.updatedAt &&
      new Date(task.updatedAt).toDateString() === today
    );
  });

  const upcomingDeadlines = tasks.filter((task) => {
    if (!task.dueDate) return false;
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return dueDate >= today && dueDate <= weekFromNow && task.status !== "done";
  });

  const teamTasks = tasks.length;

  // Get recent tasks (last 3 tasks, sorted by update time)
  const recentTasks = [...tasks]
    .sort(
      (a, b) =>
        new Date(b.updatedAt || b.createdAt) -
        new Date(a.updatedAt || a.createdAt)
    )
    .slice(0, 3);

  // Get upcoming deadlines (next 2 tasks with due dates)
  const upcomingDeadlinesList = [...tasks]
    .filter((task) => task.dueDate && task.status !== "done")
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 2);

  // Helper function to get assignee name safely
  const getAssigneeName = (task) => {
    if (!task) return "Unassigned";

    // Handle string assignee
    if (task.assignee && typeof task.assignee === "string") {
      return task.assignee;
    }

    // Handle object assignedTo
    if (typeof task.assignedTo === "object" && task.assignedTo !== null) {
      return String(
        task.assignedTo.name || task.assignedTo.email || "Assigned"
      );
    }

    // Handle string assignedTo
    if (typeof task.assignedTo === "string") {
      return task.assignedTo;
    }

    return "Unassigned";
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-container">
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {user?.name}</h1>
        <p>Here's what's happening with your projects today.</p>
      </div>

      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">{myTasks.length}</div>
          <div className="stat-label">My Tasks</div>
          <div className="stat-change">
            {myTasks.filter((task) => task.status !== "done").length} active
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completedToday.length}</div>
          <div className="stat-label">Completed Today</div>
          <div className="stat-change">
            {completedToday.length > 0 ? "Great progress!" : "Keep going!"}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{upcomingDeadlines.length}</div>
          <div className="stat-label">Due Soon</div>
          <div className="stat-change">This week</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{teamTasks}</div>
          <div className="stat-label">Team Tasks</div>
          <div className="stat-change">
            Active across {organization?.name || "organization"}
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <h2>Recent Tasks</h2>
          <div className="task-list">
            {recentTasks.length > 0 ? (
              recentTasks.map((task, index) => (
                <div
                  key={task._id || task.id || `task-${index}`}
                  className="task-item"
                >
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
              ))
            ) : (
              <p className="no-tasks">
                No tasks yet. Create your first task to get started!
              </p>
            )}
          </div>
          <button className="btn secondary" onClick={() => navigate("/tasks")}>
            View All Tasks
          </button>
        </div>

        <div className="dashboard-section">
          <h2>Upcoming Deadlines</h2>
          <div className="deadline-list">
            {upcomingDeadlinesList.length > 0 ? (
              upcomingDeadlinesList.map((deadline, index) => (
                <div
                  key={deadline._id || deadline.id || `deadline-${index}`}
                  className="deadline-item"
                >
                  <div className="deadline-info">
                    <h3>{deadline.title}</h3>
                    <p>
                      Due: {new Date(deadline.dueDate).toLocaleDateString()}
                    </p>
                    <p>Assigned to: {getAssigneeName(deadline)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="no-deadlines">No upcoming deadlines this week.</p>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <button className="btn primary" onClick={() => navigate("/tasks")}>
          Create New Task
        </button>
        <button className="btn secondary" onClick={() => navigate("/projects")}>
          Start New Project
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
