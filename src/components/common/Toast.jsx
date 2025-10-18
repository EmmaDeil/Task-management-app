import React, { useEffect, useState } from "react";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit animation before actual removal
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
      // Actually remove after animation completes
      setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(exitTimer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 300);
  };

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  return (
    <div className={`toast toast-${type} ${isExiting ? "toast-exit" : ""}`}>
      <div className="toast-icon">{icons[type]}</div>
      <div className="toast-message">{message}</div>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        ×
      </button>
    </div>
  );
};

export default Toast;
