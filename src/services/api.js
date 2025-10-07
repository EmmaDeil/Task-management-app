import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    // Try to get token from auth object first
    const auth = localStorage.getItem("auth");
    if (auth) {
      try {
        const { token } = JSON.parse(auth);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          return config;
        }
      } catch (e) {
        console.error("Error parsing auth:", e);
      }
    }

    // Fallback to standalone token
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem("auth");
      localStorage.removeItem("token");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (name, email, password, organizationId) => {
    const response = await api.post("/auth/register", {
      name,
      email,
      password,
      organizationId,
    });
    return response.data;
  },

  registerOrganization: async (
    organizationName,
    domain,
    name,
    email,
    password,
    plan
  ) => {
    const response = await api.post("/auth/organization/register", {
      organizationName,
      domain,
      name,
      email,
      password,
      plan,
    });
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};

// Tasks API
export const tasksAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get("/tasks", { params: filters });
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (taskData) => {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  update: async (id, taskData) => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/tasks/${id}`);
    return response.data;
  },

  addComment: async (id, text) => {
    const response = await api.post(`/tasks/${id}/comments`, { text });
    return response.data;
  },
};

// Organizations API
export const organizationsAPI = {
  getById: async (id) => {
    const response = await api.get(`/organizations/${id}`);
    return response.data;
  },

  update: async (id, orgData) => {
    const response = await api.put(`/organizations/${id}`, orgData);
    return response.data;
  },

  getUsers: async (id) => {
    const response = await api.get(`/organizations/${id}/users`);
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id, userData) => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await api.post("/users/upload-avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};

// Notifications API
export const notificationsAPI = {
  getAll: async (params = {}) => {
    const response = await api.get("/notifications", { params });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await api.get("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.put(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await api.put("/notifications/mark-all-read");
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  create: async (notificationData) => {
    const response = await api.post("/notifications/create", notificationData);
    return response.data;
  },
};

// Invites API
export const invitesAPI = {
  create: async (email, role = "member") => {
    const response = await api.post("/invites/create", { email, role });
    return response.data;
  },

  validate: async (code) => {
    const response = await api.get(`/invites/validate/${code}`);
    return response.data;
  },

  accept: async (code, name, password) => {
    const response = await api.post(`/invites/accept/${code}`, {
      name,
      password,
    });
    return response.data;
  },

  list: async () => {
    const response = await api.get("/invites/list");
    return response.data;
  },

  revoke: async (code) => {
    const response = await api.delete(`/invites/${code}`);
    return response.data;
  },
};

export default api;
