import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { toolService } from "../services/toolService";
import "./ToolDetail.css";

export const ToolDetail = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        <h1>{tool.name}</h1>
        <span className={`status-badge status-${tool.status}`}>
          {tool.status === "new" && "Mới"}
          {tool.status === "old" && "Cũ"}
          {tool.status === "usable" && "Sử dụng được"}
          {tool.status === "unusable" && "Không sử dụng được"}
        </span>
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
    </div>
  );
};
