import React, { useState, useEffect } from "react";
import ProjectForm from "./ProjectForm";
import ProjectDetailsModal from "./ProjectDetailsModal";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [viewingProject, setViewingProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load projects from localStorage (you can integrate with API later)
  useEffect(() => {
    const storedProjects = localStorage.getItem("projects");
    if (storedProjects) {
      setProjects(JSON.parse(storedProjects));
    }
    setLoading(false);
  }, []);

  // Save projects to localStorage
  const saveProjects = (updatedProjects) => {
    localStorage.setItem("projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const handleCreateProject = (projectData) => {
    const newProject = {
      id: Date.now(),
      ...projectData,
      createdAt: new Date().toISOString(),
      tasksCount: 0,
      completedTasks: 0,
    };
    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setShowProjectForm(false);
  };

  const handleUpdateProject = (projectData) => {
    const updatedProjects = projects.map((p) =>
      p.id === selectedProject.id ? { ...p, ...projectData } : p
    );
    saveProjects(updatedProjects);
    setSelectedProject(null);
    setShowProjectForm(false);
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm("Are you sure you want to delete this project?")) {
      const updatedProjects = projects.filter((p) => p.id !== projectId);
      saveProjects(updatedProjects);
    }
  };

  const openEditForm = (project) => {
    setSelectedProject(project);
    setShowProjectForm(true);
  };

  const handleProjectClick = (project) => {
    setViewingProject(project);
  };

  const closeForm = () => {
    setSelectedProject(null);
    setShowProjectForm(false);
  };

  const getStatusColor = (status) => {
    const colors = {
      planning: "#6b7280",
      active: "#10b981",
      "on-hold": "#f59e0b",
      completed: "#3b82f6",
    };
    return colors[status] || "#6b7280";
  };

  const getStatusLabel = (status) => {
    const labels = {
      planning: "Planning",
      active: "Active",
      "on-hold": "On Hold",
      completed: "Completed",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="projects-container">
        <div className="loading-container">
          <p>Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="projects-container">
      <div className="projects-header">
        <div>
          <h2>Projects</h2>
          <p>Manage and track all your team's projects</p>
        </div>
        <button
          className="btn primary"
          onClick={() => setShowProjectForm(true)}
        >
          + New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <h3>No projects yet</h3>
          <p>Create your first project to get started organizing tasks</p>
          <button
            className="btn primary"
            onClick={() => setShowProjectForm(true)}
          >
            Create Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div
              key={project.id}
              className="project-card"
              style={{ borderLeft: `4px solid ${project.color}` }}
              onClick={() => handleProjectClick(project)}
            >
              <div className="project-header">
                <div>
                  <h3>{project.name}</h3>
                  <span
                    className="project-status"
                    style={{
                      background: getStatusColor(project.status),
                      color: "white",
                    }}
                  >
                    {getStatusLabel(project.status)}
                  </span>
                </div>
                <div className="project-actions">
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProjectClick(project);
                    }}
                    title="View details"
                  >
                    ℹ️
                  </button>
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      openEditForm(project);
                    }}
                    title="Edit project"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id);
                    }}
                    title="Delete project"
                  >
                    🗑️
                  </button>
                </div>
              </div>

              {project.description && (
                <p className="project-description">{project.description}</p>
              )}

              <div className="project-meta">
                {project.startDate && (
                  <div className="meta-item">
                    <span className="meta-label">Start:</span>
                    <span className="meta-value">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div className="meta-item">
                    <span className="meta-label">End:</span>
                    <span className="meta-value">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="project-progress">
                <div className="progress-info">
                  <span>Project Progress</span>
                  <span>
                    {project.completedTasks}/{project.tasksCount}
                  </span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${
                        project.tasksCount > 0
                          ? (project.completedTasks / project.tasksCount) * 100
                          : 0
                      }%`,
                      backgroundColor: project.color,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showProjectForm && (
        <ProjectForm
          onSubmit={selectedProject ? handleUpdateProject : handleCreateProject}
          onCancel={closeForm}
          project={selectedProject}
        />
      )}

      {viewingProject && (
        <ProjectDetailsModal
          project={viewingProject}
          onClose={() => setViewingProject(null)}
          onUpdate={(projectData) => {
            const updatedProjects = projects.map((p) =>
              p.id === viewingProject.id ? { ...p, ...projectData } : p
            );
            saveProjects(updatedProjects);
            setViewingProject({ ...viewingProject, ...projectData });
          }}
          onDelete={(projectId) => {
            const updatedProjects = projects.filter((p) => p.id !== projectId);
            saveProjects(updatedProjects);
          }}
        />
      )}
    </div>
  );
};

export default Projects;
