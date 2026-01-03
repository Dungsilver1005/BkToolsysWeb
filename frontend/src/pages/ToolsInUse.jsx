import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toolService } from "../services/toolService";
import "./ToolsInUse.css";

export const ToolsInUse = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchToolsInUse();
  }, []);

  const fetchToolsInUse = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await toolService.getToolsInUse();
      if (response.success) {
        setTools(response.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách dụng cụ đang sử dụng"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tools-in-use">
      <div className="tools-header">
        <h1>Dụng cụ đang sử dụng</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : tools.length === 0 ? (
        <div className="empty-state">
          Không có dụng cụ nào đang được sử dụng
        </div>
      ) : (
        <div className="tools-grid">
          {tools.map((tool) => (
            <Link
              key={tool._id}
              to={`/tools/${tool._id}`}
              className="tool-card"
            >
              <div className="tool-card-header">
                <h3>{tool.name}</h3>
                <span className="status-badge status-in-use">Đang sử dụng</span>
              </div>
              <div className="tool-card-body">
                <p className="product-code">Mã: {tool.productCode}</p>
                {tool.category && <p>Danh mục: {tool.category}</p>}
                {tool.currentUser && (
                  <p>
                    Người sử dụng:{" "}
                    {tool.currentUser.fullName || tool.currentUser.username}
                  </p>
                )}
                {tool.usageCount > 0 && (
                  <p>Số lần sử dụng: {tool.usageCount}</p>
                )}
                {tool.lastUsedDate && (
                  <p>
                    Lần sử dụng cuối:{" "}
                    {new Date(tool.lastUsedDate).toLocaleDateString("vi-VN")}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
