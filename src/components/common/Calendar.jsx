import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useToast } from "../../hooks/useToast";
import { addTask } from "../../store/index.js";
import { errorMessages } from "../../utils/errorHandler";
import "./Calendar.css";

const Calendar = () => {
  const toast = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Get tasks from Redux store
  const tasks = useSelector((state) => state.tasks.items);
  const dispatch = useDispatch();

  // Fetch holidays from Calendarific API (free tier)
  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const year = currentDate.getFullYear();
        const country = "US"; // You can make this configurable

        // Using a public holiday API
        const response = await fetch(
          `https://date.nager.at/api/v3/PublicHolidays/${year}/${country}`
        );

        if (response.ok) {
          const data = await response.json();
          const formattedHolidays = data.map((holiday) => ({
            id: holiday.date,
            title: holiday.name,
            date: new Date(holiday.date),
            type: "holiday",
            color: "#dc2626",
          }));
          setHolidays(formattedHolidays);
        }
      } catch (error) {
        console.error("Error fetching holidays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHolidays();
  }, [currentDate]);

  // Fetch events from local storage or API
  useEffect(() => {
    const storedEvents = localStorage.getItem("calendar_events");
    if (storedEvents) {
      setEvents(
        JSON.parse(storedEvents).map((e) => ({
          ...e,
          date: new Date(e.date),
        }))
      );
    }
  }, []);

  // Convert tasks to calendar events
  useEffect(() => {
    const taskEvents = tasks
      .filter((task) => task.dueDate) // Only tasks with due dates
      .map((task) => ({
        id: `task-${task._id || task.id}`,
        title: task.title,
        date: new Date(task.dueDate),
        type: "task",
        taskData: task,
        color:
          task.priority === "high"
            ? "#ef4444"
            : task.priority === "medium"
            ? "#f59e0b"
            : "#10b981",
        description: task.description,
      }));

    // Merge task events with custom events
    setEvents((prevEvents) => {
      // Filter out old task events
      const customEvents = prevEvents.filter((e) => e.type !== "task");
      return [...customEvents, ...taskEvents];
    });
  }, [tasks]);

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);

  // Get events for a specific date
  const getEventsForDate = (date) => {
    const allEvents = [...events, ...holidays];
    return allEvents.filter((event) => {
      return (
        event.date.getDate() === date &&
        event.date.getMonth() === currentDate.getMonth() &&
        event.date.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Navigation
  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Event form state
  const [eventForm, setEventForm] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "event", // event, meeting, task
  });

  const handleEventFormChange = (e) => {
    setEventForm({
      ...eventForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleCreateEvent = () => {
    if (selectedDate) {
      const eventDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        selectedDate
      );

      if (eventForm.time) {
        const [hours, minutes] = eventForm.time.split(":");
        eventDate.setHours(parseInt(hours), parseInt(minutes));
      }

      setEventForm({
        ...eventForm,
        date: eventDate.toISOString().split("T")[0],
      });
      setShowEventModal(true);
    }
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();

    if (!eventForm.title || !eventForm.date) {
      toast.showWarning(errorMessages.fieldsRequired);
      return;
    }

    const newEvent = {
      id: Date.now(),
      title: eventForm.title,
      description: eventForm.description,
      date: new Date(
        eventForm.date + (eventForm.time ? `T${eventForm.time}` : "")
      ),
      type: eventForm.type,
      color:
        eventForm.type === "meeting"
          ? "#8b5cf6"
          : eventForm.type === "event"
          ? "#3b82f6"
          : "#10b981",
    };

    // If type is task, also create in Redux
    if (eventForm.type === "task") {
      dispatch(
        addTask({
          title: eventForm.title,
          description: eventForm.description,
          dueDate: newEvent.date.toISOString(),
          status: "todo",
          priority: "medium",
        })
      );
    } else {
      // For non-task events, save to localStorage
      const customEvents = events.filter((e) => e.type !== "task");
      const updatedEvents = [...customEvents, newEvent];
      localStorage.setItem(
        "calendar_events",
        JSON.stringify(
          updatedEvents.map((e) => ({
            ...e,
            date: e.date.toISOString(),
          }))
        )
      );
      setEvents((prev) => [...prev, newEvent]);
    }

    // Reset form
    setEventForm({
      title: "",
      description: "",
      date: "",
      time: "",
      type: "event",
    });
    setShowEventModal(false);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
  };

  const closeEventDetails = () => {
    setSelectedEvent(null);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Render calendar days
  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = getEventsForDate(day);
      const isCurrentDay = isToday(day);

      days.push(
        <div
          key={day}
          className={`calendar-day ${isCurrentDay ? "today" : ""} ${
            dayEvents.length > 0 ? "has-events" : ""
          }`}
          onClick={() => setSelectedDate(day)}
        >
          <div className="day-number">{day}</div>
          {dayEvents.length > 0 && (
            <div className="day-events">
              {dayEvents.slice(0, 3).map((event, idx) => (
                <div
                  key={idx}
                  className="event-indicator"
                  style={{ backgroundColor: event.color || "#3b82f6" }}
                  title={event.title}
                >
                  {event.title.substring(0, 15)}
                  {event.title.length > 15 ? "..." : ""}
                </div>
              ))}
              {dayEvents.length > 3 && (
                <div className="more-events">+{dayEvents.length - 3} more</div>
              )}
            </div>
          )}
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="calendar-container">
        <div className="loading-container">
          <p>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div className="calendar-title">
          <h2>
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>
        <div className="calendar-controls">
          <button className="btn secondary" onClick={goToToday}>
            Today
          </button>
          <div className="month-navigation">
            <button className="btn icon" onClick={previousMonth}>
              ←
            </button>
            <button className="btn icon" onClick={nextMonth}>
              →
            </button>
          </div>
        </div>
      </div>

      <div className="calendar-legend">
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#3b82f6" }}
          ></span>
          <span>Events</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#8b5cf6" }}
          ></span>
          <span>Meetings</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#10b981" }}
          ></span>
          <span>Tasks (Low)</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#f59e0b" }}
          ></span>
          <span>Tasks (Medium)</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#ef4444" }}
          ></span>
          <span>Tasks (High) / Holidays</span>
        </div>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="weekday">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">{renderCalendarDays()}</div>
      </div>

      {selectedDate && (
        <div className="calendar-sidebar">
          <div className="sidebar-header">
            <h3>
              {monthNames[currentDate.getMonth()]} {selectedDate}
            </h3>
            <button className="btn primary small" onClick={handleCreateEvent}>
              + Create Event
            </button>
          </div>
          <div className="sidebar-events">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event, idx) => (
                <div
                  key={idx}
                  className="sidebar-event"
                  onClick={() => handleEventClick(event)}
                  style={{ cursor: "pointer" }}
                >
                  <div
                    className="event-color"
                    style={{ backgroundColor: event.color || "#3b82f6" }}
                  ></div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    {event.description && <p>{event.description}</p>}
                    {event.taskData && (
                      <div className="event-meta">
                        <span
                          className={`task-status ${event.taskData.status}`}
                        >
                          {event.taskData.status}
                        </span>
                        <span
                          className={`task-priority ${event.taskData.priority}`}
                        >
                          {event.taskData.priority}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-events">No events on this day</p>
            )}
          </div>
        </div>
      )}

      {/* Event Creation Modal */}
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Event</h3>
              <button
                className="close-btn"
                onClick={() => setShowEventModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmitEvent} className="event-form">
              <div className="form-group">
                <label>Event Type</label>
                <select
                  name="type"
                  value={eventForm.type}
                  onChange={handleEventFormChange}
                  required
                >
                  <option value="event">Event</option>
                  <option value="meeting">Meeting</option>
                  <option value="task">Task</option>
                </select>
              </div>

              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  placeholder="Enter event title"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  placeholder="Enter event description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={eventForm.date}
                    onChange={handleEventFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Time</label>
                  <input
                    type="time"
                    name="time"
                    value={eventForm.time}
                    onChange={handleEventFormChange}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary"
                  onClick={() => setShowEventModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="modal-overlay" onClick={closeEventDetails}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedEvent.title}</h3>
              <button className="close-btn" onClick={closeEventDetails}>
                ×
              </button>
            </div>
            <div className="event-details-body">
              <div className="detail-row">
                <strong>Type:</strong>
                <span
                  className="event-type-badge"
                  style={{
                    backgroundColor: selectedEvent.color,
                    color: "white",
                    padding: "0.25rem 0.75rem",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                  }}
                >
                  {selectedEvent.type}
                </span>
              </div>

              <div className="detail-row">
                <strong>Date:</strong>
                <span>{selectedEvent.date.toLocaleDateString()}</span>
              </div>

              {selectedEvent.description && (
                <div className="detail-row">
                  <strong>Description:</strong>
                  <p>{selectedEvent.description}</p>
                </div>
              )}

              {selectedEvent.taskData && (
                <>
                  <div className="detail-row">
                    <strong>Status:</strong>
                    <span
                      className={`task-status ${selectedEvent.taskData.status}`}
                    >
                      {selectedEvent.taskData.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <strong>Priority:</strong>
                    <span
                      className={`task-priority ${selectedEvent.taskData.priority}`}
                    >
                      {selectedEvent.taskData.priority}
                    </span>
                  </div>
                  {selectedEvent.taskData.assignedTo && (
                    <div className="detail-row">
                      <strong>Assigned To:</strong>
                      <span>{selectedEvent.taskData.assignedTo}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
