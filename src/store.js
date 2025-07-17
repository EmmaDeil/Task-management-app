import React, { useState } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { store, addTask, toggleTask, editTask, setFilter } from './store';
import './App.css'; // Import the CSS file

function AddTask() {
  const [description, setDescription] = useState('');
  const dispatch = useDispatch();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) return;
    dispatch(addTask(description.trim()));
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} className="form">
      <input
        type="text"
        placeholder="Add a new task"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="input"
      />
      <button type="submit" className="button">
        Add
      </button>
    </form>
  );
}

function Task({ task }) {
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [editDescription, setEditDescription] = useState(task.description);

  const handleToggle = () => {
    dispatch(toggleTask(task.id));
  };

  const handleEdit = () => {
    if (isEditing && editDescription.trim()) {
      dispatch(editTask(task.id, editDescription.trim()));
    }
    setIsEditing(!isEditing);
  };

  return (
    <div className="task-container">
      <input type="checkbox" checked={task.isDone} onChange={handleToggle} />
      {isEditing ? (
        <input
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="input"
          style={{ margin: 0, flexGrow: 1 }}
        />
      ) : (
        <span
          className={`task-description ${task.isDone ? 'done' : ''}`}
        >
          {task.description}
        </span>
      )}
      <button onClick={handleEdit} className="button">
        {isEditing ? 'Save' : 'Edit'}
      </button>
    </div>
  );
}

function ListTask() {
  const tasks = useSelector((state) => state.tasks);
  const filter = useSelector((state) => state.filter);
  const dispatch = useDispatch();

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'done') return task.isDone;
    if (filter === 'not_done') return !task.isDone;
    return true;
  });

  return (
    <div>
      <div className="filter-container">
        <label>
          Filter tasks:{' '}
          <select
            value={filter}
            onChange={(e) => dispatch(setFilter(e.target.value))}
            className="select"
          >
            <option value="all">All</option>
            <option value="done">Done</option>
            <option value="not_done">Not done</option>
          </select>
        </label>
      </div>

      {filteredTasks.length === 0 ? (
        <p className="no-tasks">No tasks to show</p>
      ) : (
        filteredTasks.map((task) => <Task key={task.id} task={task} />)
      )}
    </div>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <div className="container">
        <h1 className="header">Redux ToDo Application</h1>
        <AddTask />
        <ListTask />
      </div>
    </Provider>
  );
}
