import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

const TaskBoard = () => {
  const { user } = useAuth();
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("todo");
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Design user interface",
      description: "Create mockups for the new dashboard",
      status: "todo",
      priority: "high",
      assignee: { id: 1, name: "John Doe" },
      dueDate: "2024-10-15",
      tags: ["design", "ui"],
    },
    {
      id: 2,
      title: "Implement authentication",
      description: "Set up user login and registration",
      status: "in-progress",
      priority: "high",
      assignee: { id: 2, name: "Jane Smith" },
      dueDate: "2024-10-12",
      tags: ["backend", "security"],
    },
    {
      id: 3,
      title: "Write unit tests",
      description: "Add test coverage for core components",
      status: "done",
      priority: "medium",
      assignee: { id: 1, name: "John Doe" },
      dueDate: "2024-10-08",
      tags: ["testing"],
    },
  ]);

  const columns = [
    { id: "todo", title: "To Do", color: "#e3f2fd" },
    { id: "in-progress", title: "In Progress", color: "#fff3e0" },
    { id: "review", title: "Review", color: "#f3e5f5" },
    { id: "done", title: "Done", color: "#e8f5e8" },
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  const handleTaskMove = (taskId, newStatus) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
  };

  const handleTaskCreate = (taskData) => {
    const newTask = {
      id: Date.now(),
      ...taskData,
      status: selectedColumn,
      assignee: user,
    };
    setTasks((prevTasks) => [...prevTasks, newTask]);
    setShowTaskForm(false);
  };

  const handleTaskUpdate = (taskId, updates) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const openTaskForm = (columnId) => {
    setSelectedColumn(columnId);
    setShowTaskForm(true);
  };

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
