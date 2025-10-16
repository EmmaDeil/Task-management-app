import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { tasksAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import { handleError, successMessages } from "../../utils/errorHandler";

const TaskBoard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilter, setShowFilter] = useState(false);
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterAssignee, setFilterAssignee] = useState("all");
  const [draggedTask, setDraggedTask] = useState(null);
  const [viewMode, setViewMode] = useState(() => {
    // Load saved view preference from localStorage
    return localStorage.getItem("taskViewMode") || "grid";
  });

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
        prevTasks.map((task) =>
          (task._id || task.id).toString() === taskId.toString()
            ? updatedTask
            : task
        )
      );
    } catch (err) {
      console.error("Error moving task:", err);
      toast.showError(handleError(err, "Move Task"));
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
      toast.showSuccess(successMessages.taskCreated);
    } catch (err) {
      console.error("Error creating task:", err);
      toast.showError(handleError(err, "Create Task"));
    }
  };

  const handleTaskUpdate = async (taskId, updates) => {
    try {
      console.log("TaskBoard handleTaskUpdate called");
      console.log("Task ID:", taskId);
      console.log("Updates:", updates);
      const updatedTask = await tasksAPI.update(taskId, updates);
      console.log("Updated task from API:", updatedTask);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          (task._id || task.id).toString() === taskId.toString()
            ? updatedTask
            : task
        )
      );
    } catch (err) {
      console.error("Error updating task:", err);
      toast.showError(handleError(err, "Update Task"));
    }
  };

  const handleTaskDelete = async (taskId) => {
    try {
      await tasksAPI.delete(taskId);
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== taskId));
      toast.showSuccess(successMessages.taskDeleted);
    } catch (err) {
      console.error("Error deleting task:", err);
      toast.showError(handleError(err, "Delete Task"));
    }
  };

  const openTaskForm = (columnId) => {
    setSelectedColumn(columnId);
    setShowTaskForm(true);
  };

  const toggleViewMode = () => {
    const newMode = viewMode === "grid" ? "list" : "grid";
    setViewMode(newMode);
    localStorage.setItem("taskViewMode", newMode);
  };

  // Drag and drop handlers
  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", e.target);
    e.target.style.opacity = "0.4";
  };

  const handleDragEnd = (e) => {
    e.target.style.opacity = "1";
    setDraggedTask(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    return false;
  };

  const handleDrop = async (e, newStatus) => {
    e.stopPropagation();
    e.preventDefault();

    if (draggedTask && draggedTask.status !== newStatus) {
      await handleTaskMove(draggedTask._id, newStatus);
    }

    return false;
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
              toggleViewMode();
            }}
            title={`Switch to ${viewMode === "grid" ? "list" : "grid"} view`}
          >
            {viewMode === "grid" ? "☰ List View" : "⊞ Grid View"}
          </button>
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

      <div
        className={`board-columns ${
          viewMode === "list" ? "list-view" : "grid-view"
        }`}
      >
        {viewMode === "grid" ? (
          // Grid View (Kanban Board)
          columns.map((column) => (
            <div
              key={column.id}
              className="board-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
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
                  <div
                    key={task._id}
                    draggable="true"
                    onDragStart={(e) => handleDragStart(e, task)}
                    onDragEnd={handleDragEnd}
                    style={{ cursor: "move" }}
                  >
                    <TaskCard
                      task={task}
                      onMove={handleTaskMove}
                      onUpdate={handleTaskUpdate}
                      onDelete={handleTaskDelete}
                      columns={columns}
                    />
                  </div>
                ))}

                {getTasksByStatus(column.id).length === 0 && (
                  <div className="empty-column">
                    <p>No tasks in {column.title.toLowerCase()}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          // List View (All tasks in one column)
          <div className="task-list-container">
            <div className="list-view-header">
              <h3>All Tasks ({tasks.length})</h3>
            </div>
            <div className="task-list">
              {tasks
                .filter((task) => {
                  // Apply same filters
                  if (
                    filterPriority !== "all" &&
                    task.priority !== filterPriority
                  ) {
                    return false;
                  }
                  if (
                    filterAssignee !== "all" &&
                    task.assignee?._id !== filterAssignee
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((task) => (
                  <div key={task._id} className="list-task-item">
                    <TaskCard
                      task={task}
                      onMove={handleTaskMove}
                      onUpdate={handleTaskUpdate}
                      onDelete={handleTaskDelete}
                      columns={columns}
                      viewMode="list"
                    />
                  </div>
                ))}

              {tasks.length === 0 && (
                <div className="empty-list">
                  <p>No tasks found</p>
                </div>
              )}
            </div>
          </div>
        )}
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
