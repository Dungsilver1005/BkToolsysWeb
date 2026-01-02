import api from "./api";

/**
 * Service xử lý authentication
 */
export const authService = {
  /**
   * Đăng nhập
   * @param {string} username
   * @param {string} password
   * @returns {Promise} Response từ API
   */
  login: async (username, password) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
  },

  /**
   * Lấy thông tin user hiện tại
   * @returns {Promise} User info
   */
  getCurrentUser: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  /**
   * Đăng xuất (chỉ xóa token ở client)
   */
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  /**
   * Kiểm tra xem user đã đăng nhập chưa
   * @returns {boolean}
   */
  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};
