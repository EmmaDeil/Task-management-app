import React, { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import Toast from "../components/common/Toast";
import { ToastContext } from "./ToastContextDefinition";

let toastId = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [portalRoot, setPortalRoot] = useState(null);

  // Create a portal container in the body on mount
  useEffect(() => {
    const portalDiv = document.createElement("div");
    portalDiv.id = "toast-portal";
    document.body.appendChild(portalDiv);
    setPortalRoot(portalDiv);
    console.log("Toast portal created and added to body");

    return () => {
      if (document.body.contains(portalDiv)) {
        document.body.removeChild(portalDiv);
        console.log("Toast portal removed from body");
      }
    };
  }, []);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    console.log("showToast called:", { message, type, duration });
    // Check if a toast with the same message and type already exists
    setToasts((prev) => {
      const isDuplicate = prev.some(
        (toast) => toast.message === message && toast.type === type
      );

      // Don't add duplicate toasts
      if (isDuplicate) {
        console.log("Duplicate toast prevented:", message);
        return prev;
      }

      const id = toastId++;
      console.log("Adding new toast:", { id, message, type });
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

  // Render toast container in portal (outside the normal DOM hierarchy)
  const toastContainer = portalRoot
    ? createPortal(
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
        </div>,
        portalRoot
      )
    : null;

  return (
    <ToastContext.Provider
      value={{ showToast, showSuccess, showError, showWarning, showInfo }}
    >
      {children}
      {toastContainer}
    </ToastContext.Provider>
  );
};
