import api from "./api";

/**
 * Service xử lý API liên quan đến Tools
 */
export const toolService = {
  /**
   * Lấy danh sách tools với filter
   * @param {Object} filters - {status, isInUse, location, search, productCode, category, page, limit}
   * @returns {Promise}
   */
  getTools: async (filters = {}) => {
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
    const response = await api.get(`/tools?${params.toString()}`);
    return response.data;
  },

  /**
   * Lấy thông tin chi tiết một tool
   * @param {string} id - Tool ID
   * @returns {Promise}
   */
  getToolById: async (id) => {
    const response = await api.get(`/tools/${id}`);
    return response.data;
  },

  /**
   * Tạo tool mới
   * @param {Object} toolData - Dữ liệu tool
   * @returns {Promise}
   */
  createTool: async (toolData) => {
    const response = await api.post("/tools", toolData);
    return response.data;
  },

  /**
   * Cập nhật tool
   * @param {string} id - Tool ID
   * @param {Object} toolData - Dữ liệu cập nhật
   * @returns {Promise}
   */
  updateTool: async (id, toolData) => {
    const response = await api.put(`/tools/${id}`, toolData);
    return response.data;
  },

  /**
   * Lấy danh sách tools đang được sử dụng
   * @returns {Promise}
   */
  getToolsInUse: async () => {
    const response = await api.get("/tools/in-use");
    return response.data;
  },

  /**
   * Lấy thống kê tools
   * @returns {Promise}
   */
  getStatistics: async () => {
    const response = await api.get("/tools/statistics");
    return response.data;
  },

  /**
   * Xóa tool
   * @param {string} id - Tool ID
   * @returns {Promise}
   */
  deleteTool: async (id) => {
    const response = await api.delete(`/tools/${id}`);
    return response.data;
  },

  /**
   * Chuyển vị trí tool
   * @param {string} id - Tool ID
   * @param {Object} data - {toLocation, notes}
   * @returns {Promise}
   */
  transferTool: async (id, data) => {
    const response = await api.put(`/tools/${id}/transfer`, data);
    return response.data;
  },
};
