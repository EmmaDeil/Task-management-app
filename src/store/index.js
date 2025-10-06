import { configureStore, createSlice } from "@reduxjs/toolkit";

// Tasks Slice
const tasksSlice = createSlice({
  name: "tasks",
  initialState: {
    items: [],
    filter: "all",
    loading: false,
    error: null,
  },
  reducers: {
    addTask: (state, action) => {
      const newTask = {
        id: Date.now(),
        ...action.payload,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.items.push(newTask);
    },
    updateTask: (state, action) => {
      const { id, ...updates } = action.payload;
      const taskIndex = state.items.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.items[taskIndex] = {
          ...state.items[taskIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        };
      }
    },
    deleteTask: (state, action) => {
      state.items = state.items.filter((task) => task.id !== action.payload);
    },
    moveTask: (state, action) => {
      const { id, newStatus } = action.payload;
      const taskIndex = state.items.findIndex((task) => task.id === id);
      if (taskIndex !== -1) {
        state.items[taskIndex].status = newStatus;
        state.items[taskIndex].updatedAt = new Date().toISOString();
      }
    },
    setFilter: (state, action) => {
      state.filter = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Organizations Slice
const organizationsSlice = createSlice({
  name: "organizations",
  initialState: {
    current: null,
    members: [],
    settings: {},
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentOrganization: (state, action) => {
      state.current = action.payload;
    },
    updateOrganization: (state, action) => {
      if (state.current) {
        state.current = { ...state.current, ...action.payload };
      }
    },
    setMembers: (state, action) => {
      state.members = action.payload;
    },
    addMember: (state, action) => {
      state.members.push(action.payload);
    },
    updateMember: (state, action) => {
      const { id, ...updates } = action.payload;
      const memberIndex = state.members.findIndex((member) => member.id === id);
      if (memberIndex !== -1) {
        state.members[memberIndex] = {
          ...state.members[memberIndex],
          ...updates,
        };
      }
    },
    removeMember: (state, action) => {
      state.members = state.members.filter(
        (member) => member.id !== action.payload
      );
    },
    setSettings: (state, action) => {
      state.settings = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Users Slice
const usersSlice = createSlice({
  name: "users",
  initialState: {
    current: null,
    all: [],
    loading: false,
    error: null,
  },
  reducers: {
    setCurrentUser: (state, action) => {
      state.current = action.payload;
    },
    updateCurrentUser: (state, action) => {
      if (state.current) {
        state.current = { ...state.current, ...action.payload };
      }
    },
    setAllUsers: (state, action) => {
      state.all = action.payload;
    },
    addUser: (state, action) => {
      state.all.push(action.payload);
    },
    updateUser: (state, action) => {
      const { id, ...updates } = action.payload;
      const userIndex = state.all.findIndex((user) => user.id === id);
      if (userIndex !== -1) {
        state.all[userIndex] = { ...state.all[userIndex], ...updates };
      }
    },
    removeUser: (state, action) => {
      state.all = state.all.filter((user) => user.id !== action.payload);
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// Projects Slice
const projectsSlice = createSlice({
  name: "projects",
  initialState: {
    items: [],
    current: null,
    loading: false,
    error: null,
  },
  reducers: {
    setProjects: (state, action) => {
      state.items = action.payload;
    },
    addProject: (state, action) => {
      state.items.push(action.payload);
    },
    updateProject: (state, action) => {
      const { id, ...updates } = action.payload;
      const projectIndex = state.items.findIndex(
        (project) => project.id === id
      );
      if (projectIndex !== -1) {
        state.items[projectIndex] = {
          ...state.items[projectIndex],
          ...updates,
        };
      }
    },
    deleteProject: (state, action) => {
      state.items = state.items.filter(
        (project) => project.id !== action.payload
      );
    },
    setCurrentProject: (state, action) => {
      state.current = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

// UI Slice
const uiSlice = createSlice({
  name: "ui",
  initialState: {
    sidebarOpen: false,
    activeView: "dashboard",
    theme: "light",
    notifications: [],
    modals: {
      taskForm: false,
      taskDetails: false,
      userProfile: false,
    },
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    setActiveView: (state, action) => {
      state.activeView = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        ...action.payload,
        timestamp: new Date().toISOString(),
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
    markNotificationRead: (state, action) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.read = true;
      }
    },
    openModal: (state, action) => {
      state.modals[action.payload] = true;
    },
    closeModal: (state, action) => {
      state.modals[action.payload] = false;
    },
  },
});

// Export actions
export const {
  addTask,
  updateTask,
  deleteTask,
  moveTask,
  setFilter,
  setLoading: setTasksLoading,
  setError: setTasksError,
} = tasksSlice.actions;

export const {
  setCurrentOrganization,
  updateOrganization,
  setMembers,
  addMember,
  updateMember,
  removeMember,
  setSettings: setOrgSettings,
  setLoading: setOrgLoading,
  setError: setOrgError,
} = organizationsSlice.actions;

export const {
  setCurrentUser,
  updateCurrentUser,
  setAllUsers,
  addUser,
  updateUser,
  removeUser,
  setLoading: setUsersLoading,
  setError: setUsersError,
} = usersSlice.actions;

export const {
  setProjects,
  addProject,
  updateProject,
  deleteProject,
  setCurrentProject,
  setLoading: setProjectsLoading,
  setError: setProjectsError,
} = projectsSlice.actions;

export const {
  toggleSidebar,
  setSidebarOpen,
  setActiveView,
  setTheme,
  addNotification,
  removeNotification,
  markNotificationRead,
  openModal,
  closeModal,
} = uiSlice.actions;

// Configure store
export const store = configureStore({
  reducer: {
    tasks: tasksSlice.reducer,
    organizations: organizationsSlice.reducer,
    users: usersSlice.reducer,
    projects: projectsSlice.reducer,
    ui: uiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Selectors
export const selectTasks = (state) => state.tasks.items;
export const selectTasksFilter = (state) => state.tasks.filter;
export const selectTasksLoading = (state) => state.tasks.loading;
export const selectTasksError = (state) => state.tasks.error;

export const selectCurrentOrganization = (state) => state.organizations.current;
export const selectOrgMembers = (state) => state.organizations.members;
export const selectOrgSettings = (state) => state.organizations.settings;

export const selectCurrentUser = (state) => state.users.current;
export const selectAllUsers = (state) => state.users.all;

export const selectProjects = (state) => state.projects.items;
export const selectCurrentProject = (state) => state.projects.current;

export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectActiveView = (state) => state.ui.activeView;
export const selectTheme = (state) => state.ui.theme;
export const selectNotifications = (state) => state.ui.notifications;
export const selectModals = (state) => state.ui.modals;
