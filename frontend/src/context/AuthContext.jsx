import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Kiểm tra user đã đăng nhập chưa khi component mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      const savedUser = localStorage.getItem("user");

      if (token && savedUser) {
        try {
          // Verify token bằng cách lấy thông tin user từ API
          const response = await authService.getCurrentUser();
          if (response.success) {
            setUser(response.user);
            localStorage.setItem("user", JSON.stringify(response.user));
          } else {
            // Token không hợp lệ
            authService.logout();
          }
        } catch (error) {
          // Token không hợp lệ, xóa token
          authService.logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Đăng nhập
   */
  const login = async (username, password) => {
    try {
      const response = await authService.login(username, password);
      if (response.success) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("user", JSON.stringify(response.user));
        setUser(response.user);
        return { success: true };
      }
      return {
        success: false,
        message: response.message || "Đăng nhập thất bại",
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Đăng nhập thất bại",
        errors: error.response?.data?.errors,
      };
    }
  };

  /**
   * Đăng xuất
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
