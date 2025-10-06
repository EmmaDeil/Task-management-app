import React from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "../../hooks/useAuth";

const TaskForm = ({
  onSubmit,
  onCancel,
  task = null,
}) => {
  const { user } = useAuth();
  const isEditing = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      title: task?.title || "",
      description: task?.description || "",
      priority: task?.priority || "medium",
      dueDate: task?.dueDate || "",
      tags: task?.tags?.join(", ") || "",
      assigneeId: task?.assignee?.id || user?.id,
    },
  });

  const mockUsers = [
    { id: 1, name: "John Doe" },
    { id: 2, name: "Jane Smith" },
    { id: 3, name: "Bob Johnson" },
  ];

  const handleFormSubmit = (data) => {
    const taskData = {
      ...data,
      tags: data.tags
        ? data.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter((tag) => tag)
        : [],
      assignee: mockUsers.find((u) => u.id === parseInt(data.assigneeId)),
    };

    onSubmit(taskData);
  };

  return (
    <div className="task-form-overlay">
      <div className="task-form-modal">
        <div className="form-header">
          <h3>{isEditing ? "Edit Task" : "Create New Task"}</h3>
          <button onClick={onCancel} className="close-btn">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="task-form">
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
            <label htmlFor="assigneeId">Assignee</label>
            <select
              id="assigneeId"
              {...register("assigneeId", {
                required: "Please select an assignee",
              })}
              className={errors.assigneeId ? "error" : ""}
            >
              <option value="">Select assignee</option>
              {mockUsers.map((userItem) => (
                <option key={userItem.id} value={userItem.id}>
                  {userItem.name}
                </option>
              ))}
            </select>
            {errors.assigneeId && (
              <span className="field-error">{errors.assigneeId.message}</span>
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
              onClick={onCancel}
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
