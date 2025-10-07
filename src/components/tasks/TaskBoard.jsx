import React, { useState, useEffect } from "react";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import { tasksAPI } from "../../services/api";

const TaskBoard = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    return tasks.filter((task) => task.status === status);
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
        <h2>Task Board</h2>
        <div className="board-actions">
          <button className="btn secondary">Filter</button>
          <button className="btn primary" onClick={() => openTaskForm("todo")}>
            Add Task
          </button>
        </div>
      </div>

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
                onClick={() => openTaskForm(column.id)}
                title="Add task"
              >
                +
              </button>
            </div>

            <div className="column-tasks">
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard
                  key={task.id}
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
