import { createContext, useContext } from "react";
import { message } from "antd";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const showToast = (msg, type = "info", duration = 3) => {
    message[type](msg, duration);
  };

  const showSuccess = (msg) => message.success(msg);
  const showError = (msg) => message.error(msg);
  const showInfo = (msg) => message.info(msg);
  const showWarning = (msg) => message.warning(msg);

  return (
    <ToastContext.Provider
      value={{
        showToast,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        toasts: [],
        removeToast: () => {},
      }}
    >
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToastContext must be used within ToastProvider");
  }
  return context;
};
