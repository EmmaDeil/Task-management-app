import React from "react";
import { useForm } from "react-hook-form";

const ProjectForm = ({ onSubmit, onCancel, project = null }) => {
  const isEditing = !!project;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: project?.name || "",
      description: project?.description || "",
      status: project?.status || "active",
      startDate: project?.startDate || "",
      endDate: project?.endDate || "",
      color: project?.color || "#3b82f6",
    },
  });

  const handleFormSubmit = (data) => {
    onSubmit(data);
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
          <h3>{isEditing ? "Edit Project" : "Create New Project"}</h3>
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
          <div className="form-group">
            <label htmlFor="name">Project Name *</label>
            <input
              type="text"
              id="name"
              {...register("name", {
                required: "Project name is required",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
              className={errors.name ? "error" : ""}
              placeholder="Enter project name"
            />
            {errors.name && (
              <span className="field-error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              {...register("description")}
              placeholder="Describe the project..."
              rows="4"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Status</label>
              <select id="status" {...register("status")}>
                <option value="planning">Planning</option>
                <option value="active">Active</option>
                <option value="on-hold">On Hold</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="color">Project Color</label>
              <input
                type="color"
                id="color"
                {...register("color")}
                style={{ height: "40px", cursor: "pointer" }}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input type="date" id="startDate" {...register("startDate")} />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input type="date" id="endDate" {...register("endDate")} />
            </div>
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
                ? "Update Project"
                : "Create Project"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectForm;
