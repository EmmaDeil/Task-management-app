import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { tasksAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";

const TaskBoard = () => {
  const { user } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await tasksAPI.getAll();
        setTasks(data);
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setError("Failed to load tasks. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const columns = [
    { id: "todo", title: "To Do", color: "#e3f2fd" },
    { id: "in-progress", title: "In Progress", color: "#fff3e0" },
    { id: "review", title: "Review", color: "#f3e5f5" },
    { id: "done", title: "Done", color: "#e8f5e8" },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => {
      // Filter by status
      if (task.status !== status) return false;

      // Filter by priority
      if (filterPriority !== "all" && task.priority !== filterPriority) {
        return false;
      }

      // Filter by assignee
      if (filterAssignee !== "all" && task.assignee?._id !== filterAssignee) {
        return false;
      }

      return true;
    });
  };

  const handleTaskMove = async (taskId, newStatus) => {
    try {
      const updatedTask = await tasksAPI.update(taskId, { status: newStatus });
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (err) {
      console.error("Error moving task:", err);
      alert("Failed to move task. Please try again.");
    }
  };

  const handleTaskCreate = async (taskData) => {
    try {
      const newTask = await tasksAPI.create({
        ...taskData,
        status: selectedColumn,
      });
      setTasks((prevTasks) => [...prevTasks, newTask]);
      setShowTaskForm(false);
    } catch (err) {
      console.error("Error creating task:", err);
      alert("Failed to create task. Please try again.");
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      const updatedTask = await tasksAPI.update(taskId, updates);
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === taskId ? updatedTask : task))
      );
    } catch (err) {
      console.error("Error updating task:", err);
      alert("Failed to update task. Please try again.");
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
    } catch (err) {
      console.error("Error deleting task:", err);
      alert("Failed to delete task. Please try again.");
    }
  };

  const openTaskForm = (columnId) => {
    setSelectedColumn(columnId);
    setShowTaskForm(true);
  };

  if (loading) {
    return (
      <div className="task-board">
        <div className="loading-container">
          <p>Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="task-board">
        <div className="error-container">
          <p>{error}</p>
          <button
            className="btn primary"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="task-board">
      <div className="board-header">
        <h2>{user?.name ? `${user.name}'s Task Board` : "Task Board"}</h2>
        <div className="board-actions">
          <button
            className="btn secondary"
            onClick={(e) => {
              e.stopPropagation();
              setShowFilter(!showFilter);
            }}
          >
            Filter{" "}
            {(filterPriority !== "all" || filterAssignee !== "all") &&
              "(Active)"}
          </button>
          <button
            className="btn primary"
            onClick={(e) => {
              e.stopPropagation();
              openTaskForm("todo");
            }}
          >
            ➕ Add Task
          </button>
        </div>
      </div>

      {showFilter && (
        <div className="board-filters" onClick={(e) => e.stopPropagation()}>
          <div className="filter-group">
            <label>Priority:</label>
            <select
              value={filterPriority}
              onChange={(e) => {
                e.stopPropagation();
                setFilterPriority(e.target.value);
              }}
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div className="filter-group">
            <label>Assignee:</label>
            <select
              value={filterAssignee}
              onChange={(e) => {
                e.stopPropagation();
                setFilterAssignee(e.target.value);
              }}
            >
              <option value="all">All Assignees</option>
              {/* Get unique assignees from tasks */}
              {[
                ...new Set(tasks.map((t) => t.assignee?._id).filter(Boolean)),
              ].map((assigneeId) => {
                const task = tasks.find((t) => t.assignee?._id === assigneeId);
                return (
                  <option key={assigneeId} value={assigneeId}>
                    {task?.assignee?.name || "Unknown"}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            className="btn secondary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              setFilterPriority("all");
              setFilterAssignee("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      <div className="board-columns">
        {columns.map((column) => (
          <div key={column.id} className="board-column">
            <div
              className="column-header"
              style={{ backgroundColor: column.color }}
            >
              <h3>{column.title}</h3>
              <span className="task-count">
                {getTasksByStatus(column.id).length}
              </span>
              <button
                className="add-task-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  openTaskForm(column.id);
                }}
                title="Add task"
              >
                +
              </button>
            </div>

            <div className="column-tasks">
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onMove={handleTaskMove}
                  onUpdate={handleTaskUpdate}
                  onDelete={handleTaskDelete}
                  columns={columns}
                />
              ))}

              {getTasksByStatus(column.id).length === 0 && (
                <div className="empty-column">
                  <p>No tasks in {column.title.toLowerCase()}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {showTaskForm && (
        <TaskForm
          onSubmit={handleTaskCreate}
          onCancel={() => setShowTaskForm(false)}
          initialStatus={selectedColumn}
        />
      )}
    </div>
  );
};

export default TaskBoard;
