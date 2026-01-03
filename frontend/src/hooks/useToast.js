import { useState, useCallback } from "react";

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = "info", duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = useCallback(
    (message) => showToast(message, "success"),
    [showToast]
  );
  const showError = useCallback(
    (message) => showToast(message, "error"),
    [showToast]
  );
  const showInfo = useCallback(
    (message) => showToast(message, "info"),
    [showToast]
  );
  const showWarning = useCallback(
    (message) => showToast(message, "warning"),
    [showToast]
  );

  return {
    toasts,
    showToast,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    removeToast,
  };
};
