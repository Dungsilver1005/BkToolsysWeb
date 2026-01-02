import api from "./api";

/**
 * Service xử lý API liên quan đến Export Receipts (chỉ Admin)
 */
export const exportReceiptService = {
  /**
   * Lấy danh sách export receipts
   * @returns {Promise}
   */
  getExportReceipts: async () => {
    const response = await api.get("/export-receipts");
    return response.data;
  },

  /**
   * Lấy chi tiết một export receipt
   * @param {string} id - Receipt ID
   * @returns {Promise}
   */
  getExportReceiptById: async (id) => {
    const response = await api.get(`/export-receipts/${id}`);
    return response.data;
  },

  /**
   * Tạo export receipt mới
   * @param {Object} receiptData - {tools: [{tool: id, quantity, notes}], purpose, department, notes}
   * @returns {Promise}
   */
  createExportReceipt: async (receiptData) => {
    const response = await api.post("/export-receipts", receiptData);
    return response.data;
  },
};
