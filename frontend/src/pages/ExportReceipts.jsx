import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToastContext } from "../context/ToastContext";
import { exportReceiptService } from "../services/exportReceiptService";
import { toolService } from "../services/toolService";
import { Modal } from "../components/Modal";
import "./ExportReceipts.css";

export const ExportReceipts = () => {
  const { showSuccess, showError } = useToastContext();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableTools, setAvailableTools] = useState([]);
  const [formData, setFormData] = useState({
    purpose: "",
    department: "",
    notes: "",
    tools: [{ tool: "", quantity: 1, notes: "" }],
  });

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableTools();
      setFormData({
        purpose: "",
        department: "",
        notes: "",
        tools: [{ tool: "", quantity: 1, notes: "" }],
      });
    }
  }, [showCreateModal]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await exportReceiptService.getExportReceipts();
      if (response.success) {
        setReceipts(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách phiếu xuất kho"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTools = async () => {
    try {
      const response = await toolService.getTools({
        isInUse: "false",
        location: "warehouse",
        limit: 1000,
      });
      if (response.success) {
        setAvailableTools(response.data || []);
      }
    } catch (err) {
      showError("Không thể tải danh sách dụng cụ");
    }
  };

  const handleCreateReceipt = async (e) => {
    e.preventDefault();
    if (!formData.purpose || !formData.department) {
      showError("Vui lòng điền đầy đủ thông tin");
      return;
    }
    if (formData.tools.some((t) => !t.tool || !t.quantity)) {
      showError("Vui lòng chọn dụng cụ và số lượng");
      return;
    }

    setSubmitting(true);
    try {
      const response = await exportReceiptService.createExportReceipt(formData);
      if (response.success) {
        showSuccess("Tạo phiếu xuất kho thành công");
        setShowCreateModal(false);
        fetchReceipts();
      } else {
        showError(response.message || "Tạo phiếu xuất kho thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu xuất kho"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const addToolRow = () => {
    setFormData({
      ...formData,
      tools: [...formData.tools, { tool: "", quantity: 1, notes: "" }],
    });
  };

  const removeToolRow = (index) => {
    if (formData.tools.length > 1) {
      setFormData({
        ...formData,
        tools: formData.tools.filter((_, i) => i !== index),
      });
    }
  };

  const updateToolRow = (index, field, value) => {
    const newTools = [...formData.tools];
    newTools[index] = { ...newTools[index], [field]: value };
    setFormData({ ...formData, tools: newTools });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", className: "status-badge status-badge-yellow" },
      completed: { label: "Hoàn thành", className: "status-badge status-badge-green" },
      cancelled: { label: "Đã hủy", className: "status-badge status-badge-red" },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={statusInfo.className}>
        <span className="status-dot"></span>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="export-receipts-page">
      <div className="export-receipts-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Phiếu xuất kho</h1>
            <p className="page-subtitle">Quản lý các phiếu xuất kho dụng cụ</p>
          </div>
          <button
            className="btn-add-tool"
            onClick={() => setShowCreateModal(true)}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Tạo phiếu xuất kho</span>
          </button>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="receipts-table">
              <thead>
                <tr>
                  <th>Mã phiếu</th>
                  <th>Ngày xuất</th>
                  <th>Người xuất</th>
                  <th>Số lượng dụng cụ</th>
                  <th>Mục đích</th>
                  <th>Phòng ban</th>
                  <th>Trạng thái</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center loading-cell">
                      Đang tải...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center empty-cell">
                      Không có phiếu xuất kho nào
                    </td>
                  </tr>
                ) : (
                  receipts.map((receipt) => (
                    <tr key={receipt._id} className="table-row">
                      <td className="receipt-code">{receipt.receiptNumber || "N/A"}</td>
                      <td>
                        {receipt.exportDate
                          ? new Date(receipt.exportDate).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </td>
                      <td>
                        {receipt.exportedBy?.fullName ||
                          receipt.exportedBy?.username ||
                          "N/A"}
                      </td>
                      <td>{receipt.tools?.length || 0}</td>
                      <td className="text-muted">{receipt.purpose || "N/A"}</td>
                      <td>{receipt.department || "N/A"}</td>
                      <td>{getStatusBadge(receipt.status)}</td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <Link
                            to={`/export-receipts/${receipt._id}`}
                            className="action-btn"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined">visibility</span>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo phiếu xuất kho"
        size="large"
      >
        <form onSubmit={handleCreateReceipt} className="create-receipt-form">
          <div className="form-group">
            <label>
              Mục đích <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.purpose}
              onChange={(e) =>
                setFormData({ ...formData, purpose: e.target.value })
              }
              placeholder="Nhập mục đích xuất kho"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Phòng ban <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData({ ...formData, department: e.target.value })
              }
              placeholder="Nhập phòng ban"
              required
            />
          </div>

          <div className="form-group">
            <label>Dụng cụ <span className="required">*</span></label>
            {formData.tools.map((toolRow, index) => (
              <div key={index} className="tool-row">
                <select
                  value={toolRow.tool}
                  onChange={(e) => updateToolRow(index, "tool", e.target.value)}
                  required
                  className="tool-select"
                >
                  <option value="">Chọn dụng cụ</option>
                  {availableTools.map((tool) => (
                    <option key={tool._id} value={tool._id}>
                      {tool.productCode} - {tool.category || tool.name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={toolRow.quantity}
                  onChange={(e) =>
                    updateToolRow(index, "quantity", parseInt(e.target.value) || 1)
                  }
                  placeholder="SL"
                  required
                  className="quantity-input"
                />
                <input
                  type="text"
                  value={toolRow.notes}
                  onChange={(e) => updateToolRow(index, "notes", e.target.value)}
                  placeholder="Ghi chú"
                  className="notes-input"
                />
                {formData.tools.length > 1 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => removeToolRow(index)}
                  >
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-add-row"
              onClick={addToolRow}
            >
              <span className="material-symbols-outlined">add</span>
              Thêm dụng cụ
            </button>
          </div>

          <div className="form-group">
            <label>Ghi chú</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows="3"
              placeholder="Nhập ghi chú (nếu có)"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn-cancel"
              onClick={() => setShowCreateModal(false)}
            >
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? "Đang tạo..." : "Tạo phiếu"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
