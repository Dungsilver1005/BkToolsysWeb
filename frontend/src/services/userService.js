import api from "./api";

/**
 * Service xử lý API liên quan đến Users (chỉ Admin)
 */
export const userService = {
  /**
   * Lấy danh sách users
   * @returns {Promise}
   */
  getUsers: async () => {
    const response = await api.get("/users");
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một user
   * @param {string} id - User ID
   * @returns {Promise}
   */
  getUserById: async (id) => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * Cập nhật user
   * @param {string} id - User ID
   * @param {Object} data - User data
   * @returns {Promise}
   */
  updateUser: async (id, data) => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  /**
   * Xóa user
   * @param {string} id - User ID
   * @returns {Promise}
   */
  deleteUser: async (id) => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  /**
   * Lấy lịch sử truy cập của user
   * @param {string} id - User ID
   * @returns {Promise}
   */
  getUserAccessHistory: async (id) => {
    const response = await api.get(`/users/${id}/access-history`);
    return response.data;
  },
};
