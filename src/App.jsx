// store.js
import { createStore } from 'redux';

// Action Types
const ADD_TASK = 'ADD_TASK';
const TOGGLE_TASK = 'TOGGLE_TASK';
const EDIT_TASK = 'EDIT_TASK';
const SET_FILTER = 'SET_FILTER';

// Action Creators
export const addTask = (description) => ({
  type: ADD_TASK,
  payload: { description },
});

export const toggleTask = (id) => ({
  type: TOGGLE_TASK,
  payload: { id },
});

export const editTask = (id, description) => ({
  type: EDIT_TASK,
  payload: { id, description },
});

export const setFilter = (filter) => ({
  type: SET_FILTER,
  payload: { filter }, // 'all', 'done', 'not_done'
});

// Initial state
const initialState = {
  tasks: [],
  filter: 'all',
};

// Reducer
function todoReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_TASK: {
      const newTask = {
        id: Date.now(),
        description: action.payload.description,
        isDone: false,
      };
      return { ...state, tasks: [...state.tasks, newTask] };
    }
    case TOGGLE_TASK: {
      const tasks = state.tasks.map((task) =>
        task.id === action.payload.id ? { ...task, isDone: !task.isDone } : task
      );
      return { ...state, tasks };
    }
    case EDIT_TASK: {
      const tasks = state.tasks.map((task) =>
        task.id === action.payload.id
          ? { ...task, description: action.payload.description }
          : task
      );
      return { ...state, tasks };
    }
    case SET_FILTER: {
      return { ...state, filter: action.payload.filter };
    }
    default:
      return state;
  }
}

export const store = createStore(todoReducer);
