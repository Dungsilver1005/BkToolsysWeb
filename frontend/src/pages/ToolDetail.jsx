import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useToastContext } from "../context/ToastContext";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { ToolForm } from "../components/ToolForm";
import { toolService } from "../services/toolService";
import "./ToolDetail.css";

export const ToolDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [transferData, setTransferData] = useState({
    toLocation: "",
    notes: "",
  });

  useEffect(() => {
    fetchTool();
  }, [id]);

  const fetchTool = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await toolService.getToolById(id);
      if (response.success) {
        setTool(response.data);
      } else {
        setError("Không tìm thấy dụng cụ");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTool = async (formData) => {
    setSubmitting(true);
    try {
      const response = await toolService.updateTool(id, formData);
      if (response.success) {
        showSuccess("Cập nhật dụng cụ thành công");
        setShowEditModal(false);
        fetchTool();
      } else {
        showError(response.message || "Cập nhật dụng cụ thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật dụng cụ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTool = async () => {
    setSubmitting(true);
    try {
      const response = await toolService.deleteTool(id);
      if (response.success) {
        showSuccess("Xóa dụng cụ thành công");
        navigate("/tools");
      } else {
        showError(response.message || "Xóa dụng cụ thất bại");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi xóa dụng cụ");
    } finally {
      setSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleTransferTool = async () => {
    if (!transferData.toLocation) {
      showError("Vui lòng chọn vị trí đích");
      return;
    }
    setSubmitting(true);
    try {
      const response = await toolService.transferTool(id, transferData);
      if (response.success) {
        showSuccess("Chuyển dụng cụ thành công");
        setShowTransferModal(false);
        setTransferData({ toLocation: "", notes: "" });
        fetchTool();
      } else {
        showError(response.message || "Chuyển dụng cụ thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi chuyển dụng cụ"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error || !tool) {
    return (
      <div className="error-container">
        <div className="error-message">{error || "Không tìm thấy dụng cụ"}</div>
        <Link to="/tools" className="btn-back">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="tool-detail">
      <Link to="/tools" className="btn-back">
        ← Quay lại danh sách
      </Link>

      <div className="tool-detail-header">
        <div>
          <h1>{tool.name}</h1>
          <span className={`status-badge status-${tool.status}`}>
            {tool.status === "new" && "Mới"}
            {tool.status === "old" && "Cũ"}
            {tool.status === "usable" && "Sử dụng được"}
            {tool.status === "unusable" && "Không sử dụng được"}
          </span>
        </div>
        {isAdmin && (
          <div className="tool-actions">
            <button className="btn-edit" onClick={() => setShowEditModal(true)}>
              ✏️ Sửa
            </button>
            <button
              className="btn-transfer"
              onClick={() => setShowTransferModal(true)}
            >
              🔄 Chuyển kho
            </button>
            <button
              className="btn-delete"
              onClick={() => setShowDeleteDialog(true)}
            >
              🗑️ Xóa
            </button>
          </div>
        )}
      </div>

      <div className="tool-detail-grid">
        <div className="detail-section">
          <h2>Thông tin cơ bản</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Mã sản phẩm</label>
              <p>{tool.productCode}</p>
            </div>
            <div className="info-item">
              <label>Danh mục</label>
              <p>{tool.category || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Tình trạng</label>
              <p className={tool.isInUse ? "in-use" : "available"}>
                {tool.isInUse ? "🔴 Đang sử dụng" : "🟢 Có sẵn"}
              </p>
            </div>
            <div className="info-item">
              <label>Vị trí</label>
              <p>
                {tool.location === "warehouse" && "Kho"}
                {tool.location === "in_use" && "Đang sử dụng"}
                {tool.location === "maintenance" && "Bảo trì"}
                {tool.location === "disposed" && "Đã thanh lý"}
              </p>
            </div>
            <div className="info-item">
              <label>Số lần sử dụng</label>
              <p>{tool.usageCount || 0}</p>
            </div>
            {tool.currentUser && (
              <div className="info-item">
                <label>Người đang sử dụng</label>
                <p>{tool.currentUser.fullName || tool.currentUser.username}</p>
              </div>
            )}
          </div>
        </div>

        {tool.geometry && (
          <div className="detail-section">
            <h2>Thông tin hình học</h2>
            <div className="info-grid">
              {tool.geometry.length && (
                <div className="info-item">
                  <label>Chiều dài</label>
                  <p>{tool.geometry.length} mm</p>
                </div>
              )}
              {tool.geometry.width && (
                <div className="info-item">
                  <label>Chiều rộng</label>
                  <p>{tool.geometry.width} mm</p>
                </div>
              )}
              {tool.geometry.height && (
                <div className="info-item">
                  <label>Chiều cao</label>
                  <p>{tool.geometry.height} mm</p>
                </div>
              )}
              {tool.geometry.diameter && (
                <div className="info-item">
                  <label>Đường kính</label>
                  <p>{tool.geometry.diameter} mm</p>
                </div>
              )}
              {tool.geometry.shape && (
                <div className="info-item">
                  <label>Hình dạng</label>
                  <p>{tool.geometry.shape}</p>
                </div>
              )}
              {tool.geometry.material && (
                <div className="info-item">
                  <label>Vật liệu</label>
                  <p>{tool.geometry.material}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tool.characteristics && (
          <div className="detail-section">
            <h2>Đặc điểm kỹ thuật</h2>
            <div className="info-grid">
              {tool.characteristics.brand && (
                <div className="info-item">
                  <label>Thương hiệu</label>
                  <p>{tool.characteristics.brand}</p>
                </div>
              )}
              {tool.characteristics.model && (
                <div className="info-item">
                  <label>Model</label>
                  <p>{tool.characteristics.model}</p>
                </div>
              )}
              {tool.characteristics.hardness && (
                <div className="info-item">
                  <label>Độ cứng</label>
                  <p>{tool.characteristics.hardness}</p>
                </div>
              )}
              {tool.characteristics.coating && (
                <div className="info-item">
                  <label>Lớp phủ</label>
                  <p>{tool.characteristics.coating}</p>
                </div>
              )}
              {tool.characteristics.specifications && (
                <div className="info-item full-width">
                  <label>Thông số kỹ thuật</label>
                  <p>{tool.characteristics.specifications}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tool.cuttingParameters && (
          <div className="detail-section">
            <h2>Chế độ cắt</h2>
            <div className="info-grid">
              {tool.cuttingParameters.speed && (
                <div className="info-item">
                  <label>Tốc độ</label>
                  <p>{tool.cuttingParameters.speed} rpm</p>
                </div>
              )}
              {tool.cuttingParameters.feed && (
                <div className="info-item">
                  <label>Bước tiến</label>
                  <p>{tool.cuttingParameters.feed} mm/rev</p>
                </div>
              )}
              {tool.cuttingParameters.depth && (
                <div className="info-item">
                  <label>Chiều sâu</label>
                  <p>{tool.cuttingParameters.depth} mm</p>
                </div>
              )}
              {tool.cuttingParameters.notes && (
                <div className="info-item full-width">
                  <label>Ghi chú</label>
                  <p>{tool.cuttingParameters.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {tool.history && tool.history.length > 0 && (
          <div className="detail-section full-width">
            <h2>Lịch sử sử dụng</h2>
            <div className="history-list">
              {tool.history.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.date).toLocaleString("vi-VN")}
                  </div>
                  <div className="history-action">
                    {entry.action === "import" && "📥 Nhập kho"}
                    {entry.action === "export" && "📤 Xuất kho"}
                    {entry.action === "transfer" && "🔄 Chuyển kho"}
                    {entry.action === "update" && "✏️ Cập nhật"}
                    {entry.action === "maintenance" && "🔧 Bảo trì"}
                  </div>
                  {entry.notes && (
                    <div className="history-notes">{entry.notes}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isAdmin && (
        <>
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Sửa dụng cụ"
            size="large"
          >
            <ToolForm
              tool={tool}
              onSubmit={handleUpdateTool}
              onCancel={() => setShowEditModal(false)}
              loading={submitting}
            />
          </Modal>

          <ConfirmDialog
            isOpen={showDeleteDialog}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={handleDeleteTool}
            title="Xóa dụng cụ"
            message={`Bạn có chắc chắn muốn xóa dụng cụ "${tool.name}" (${tool.productCode})? Hành động này không thể hoàn tác.`}
            confirmText="Xóa"
            cancelText="Hủy"
            type="danger"
          />

          <Modal
            isOpen={showTransferModal}
            onClose={() => setShowTransferModal(false)}
            title="Chuyển dụng cụ"
            size="medium"
          >
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleTransferTool();
              }}
            >
              <div className="form-group">
                <label>
                  Vị trí đích <span className="required">*</span>
                </label>
                <select
                  value={transferData.toLocation}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      toLocation: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Chọn vị trí...</option>
                  <option value="warehouse">Kho</option>
                  <option value="in_use">Đang sử dụng</option>
                  <option value="maintenance">Bảo trì</option>
                  <option value="disposed">Đã thanh lý</option>
                </select>
              </div>
              <div className="form-group">
                <label>Ghi chú</label>
                <textarea
                  value={transferData.notes}
                  onChange={(e) =>
                    setTransferData((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  rows="3"
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="btn-cancel"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-submit"
                >
                  {submitting ? "Đang chuyển..." : "Chuyển"}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </div>
  );
};
