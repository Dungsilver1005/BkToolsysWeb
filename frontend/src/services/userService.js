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
};
