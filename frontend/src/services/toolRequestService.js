import api from "./api";

/**
 * Service xử lý API liên quan đến Tool Requests
 */
export const toolRequestService = {
  /**
   * Tạo yêu cầu sử dụng dụng cụ
   * @param {Object} data - {tool, purpose, expectedDuration, notes}
   * @returns {Promise}
   */
  createRequest: async (data) => {
    const response = await api.post("/tool-requests", data);
    return response.data;
  },

  /**
   * Lấy danh sách yêu cầu
   * @param {Object} filters - {status, tool, user}
   * @returns {Promise}
   */
  getRequests: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ""
      ) {
        params.append(key, filters[key]);
      }
    });
    const response = await api.get(`/tool-requests?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy chi tiết một yêu cầu
   * @param {string} id - Request ID
   * @returns {Promise}
   */
  getRequestById: async (id) => {
    const response = await api.get(`/tool-requests/${id}`);
    return response.data;
  },

  /**
   * Duyệt yêu cầu (Admin only)
   * @param {string} id - Request ID
   * @returns {Promise}
   */
  approveRequest: async (id) => {
    const response = await api.put(`/tool-requests/${id}/approve`);
    return response.data;
  },

  /**
   * Từ chối yêu cầu (Admin only)
   * @param {string} id - Request ID
   * @param {string} rejectionReason - Lý do từ chối
   * @returns {Promise}
   */
  rejectRequest: async (id, rejectionReason) => {
    const response = await api.put(`/tool-requests/${id}/reject`, {
      rejectionReason,
    });
    return response.data;
  },

  /**
   * Hủy yêu cầu (User only, their own requests)
   * @param {string} id - Request ID
   * @returns {Promise}
   */
  cancelRequest: async (id) => {
    const response = await api.put(`/tool-requests/${id}/cancel`);
    return response.data;
  },
};

