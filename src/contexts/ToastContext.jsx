import React, { useState, useCallback } from "react";
import Toast from "../components/common/Toast";
import { ToastContext } from "./ToastContextDefinition";

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    // Check if a toast with the same message and type already exists
    setToasts((prev) => {
      const isDuplicate = prev.some(
        (toast) => toast.message === message && toast.type === type
      );

      // Don't add duplicate toasts
      if (isDuplicate) {
        return prev;
      }

      const id = toastId++;
      return [...prev, { id, message, type, duration }];
    });
  }, []);

  const showSuccess = useCallback(
    (message, duration) => showToast(message, "success", duration),
    [showToast]
  );

  const showError = useCallback(
    (message, duration) => showToast(message, "error", duration),
    [showToast]
  );

  const showWarning = useCallback(
    (message, duration) => showToast(message, "warning", duration),
    [showToast]
  );

  const showInfo = useCallback(
    (message, duration) => showToast(message, "info", duration),
    [showToast]
  );

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
