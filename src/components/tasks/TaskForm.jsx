import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";
import { usersAPI } from "../../services/api";

const TaskForm = ({
  onSubmit,
  onCancel,
  task = null,
  initialStatus = "todo",
}) => {
  const { user } = useAuth();
  const isEditing = !!task;
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Load projects from localStorage
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
  }, []);

  // Fetch users from API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const data = await usersAPI.getAll();
        setUsers(data);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      status: task?.status || initialStatus,
      dueDate: task?.dueDate || "",
      tags: task?.tags?.join(", ") || "",
      assignee: task?.assignee?._id || user?.id || "",
      project: task?.project || "",
    },
  });

  const handleFormSubmit = (data) => {
    const taskData = {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status || initialStatus,
      dueDate: data.dueDate || null,
      project: data.project || null,
      assignee: data.assignee || null, // MongoDB ObjectId
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
    };

    onSubmit(taskData);
  };

  return (
    <div
      className="task-form-overlay"
      onClick={(e) => {
        // Only close if clicking the overlay itself, not the modal content
        if (e.target.className === "task-form-overlay") {
          onCancel();
        }
      }}
    >
      <div className="task-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="form-header">
          <h3>{isEditing ? "Edit Task" : "Create New Task"}</h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCancel();
            }}
            className="close-btn"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="task-form">
          {/* Hidden status field */}
          <input type="hidden" {...register("status")} />

          <div className="form-group">
            <label htmlFor="title">Task Title *</label>
            <input
              type="text"
              id="title"
              {...register("title", {
                required: "Task title is required",
                minLength: {
                  value: 3,
                  message: "Title must be at least 3 characters",
                },
              })}
              className={errors.title ? "error" : ""}
              placeholder="Enter task title"
            />
            {errors.title && (
              <span className="field-error">{errors.title.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Describe the task..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="priority">Priority</label>
              <select id="priority" {...register("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="dueDate">Due Date</label>
              <input
                type="date"
                id="dueDate"
                {...register("dueDate")}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="project">Project</label>
            <select id="project" {...register("project")}>
              <option value="">No Project</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.name}>
                  {proj.name}
                </option>
              ))}
            </select>
            <small>Assign this task to a project</small>
          </div>

          <div className="form-group">
            <label htmlFor="assignee">Assignee</label>
            <select
              id="assignee"
              {...register("assignee", {
                required: "Please select an assignee",
              })}
              className={errors.assignee ? "error" : ""}
              disabled={loadingUsers}
            >
              <option value="">
                {loadingUsers ? "Loading users..." : "Select assignee"}
              </option>
              {users.map((userItem) => (
                <option key={userItem._id} value={userItem._id}>
                  {userItem.name} ({userItem.email})
                </option>
              ))}
            </select>
            {errors.assignee && (
              <span className="field-error">{errors.assignee.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags</label>
            <input
              type="text"
              id="tags"
              {...register("tags")}
              placeholder="Enter tags separated by commas (e.g., frontend, urgent, bug)"
            />
            <small>Separate multiple tags with commas</small>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onCancel();
              }}
              className="btn secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn primary"
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                ? "Update Task"
                : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;
