import React, { useState, useEffect } from "react";
import "./Calendar.css";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

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

  // Fetch events from local storage or API (you can integrate with tasksAPI later)
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
          <span>Tasks</span>
        </div>
        <div className="legend-item">
          <span
            className="legend-color"
            style={{ backgroundColor: "#dc2626" }}
          ></span>
          <span>Holidays</span>
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
          <h3>
            Events for {monthNames[currentDate.getMonth()]} {selectedDate}
          </h3>
          <div className="sidebar-events">
            {getEventsForDate(selectedDate).length > 0 ? (
              getEventsForDate(selectedDate).map((event, idx) => (
                <div key={idx} className="sidebar-event">
                  <div
                    className="event-color"
                    style={{ backgroundColor: event.color || "#3b82f6" }}
                  ></div>
                  <div className="event-details">
                    <h4>{event.title}</h4>
                    {event.description && <p>{event.description}</p>}
                  </div>
                </div>
              ))
            ) : (
              <p className="no-events">No events on this day</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
