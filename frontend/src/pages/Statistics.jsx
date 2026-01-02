import { useState, useEffect } from "react";
import { toolService } from "../services/toolService";
import "./Statistics.css";

export const Statistics = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await toolService.getStatistics();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!stats) {
    return <div className="empty-state">Không có dữ liệu thống kê</div>;
  }

  return (
    <div className="statistics">
      <h1>Thống kê</h1>

      <div className="stats-overview">
        <div className="stat-card">
          <h3>Tổng số dụng cụ</h3>
          <p className="stat-number">{stats.totalTools || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Đang sử dụng</h3>
          <p className="stat-number">{stats.toolsInUse || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Có sẵn</h3>
          <p className="stat-number">
            {(stats.totalTools || 0) - (stats.toolsInUse || 0)}
          </p>
        </div>
      </div>

      {stats.toolsByStatus && stats.toolsByStatus.length > 0 && (
        <div className="stat-section">
          <h2>Thống kê theo trạng thái</h2>
          <div className="stat-list">
            {stats.toolsByStatus.map((item) => (
              <div key={item._id} className="stat-item">
                <span className="stat-label">
                  {item._id === "new" && "Mới"}
                  {item._id === "old" && "Cũ"}
                  {item._id === "usable" && "Sử dụng được"}
                  {item._id === "unusable" && "Không sử dụng được"}
                  {!["new", "old", "usable", "unusable"].includes(item._id) &&
                    item._id}
                </span>
                <span className="stat-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.toolsByLocation && stats.toolsByLocation.length > 0 && (
        <div className="stat-section">
          <h2>Thống kê theo vị trí</h2>
          <div className="stat-list">
            {stats.toolsByLocation.map((item) => (
              <div key={item._id} className="stat-item">
                <span className="stat-label">
                  {item._id === "warehouse" && "Kho"}
                  {item._id === "in_use" && "Đang sử dụng"}
                  {item._id === "maintenance" && "Bảo trì"}
                  {item._id === "disposed" && "Đã thanh lý"}
                  {!["warehouse", "in_use", "maintenance", "disposed"].includes(
                    item._id
                  ) && item._id}
                </span>
                <span className="stat-value">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.mostUsedTools && stats.mostUsedTools.length > 0 && (
        <div className="stat-section">
          <h2>Dụng cụ sử dụng nhiều nhất (Top 10)</h2>
          <div className="tools-list-table">
            <table>
              <thead>
                <tr>
                  <th>Mã sản phẩm</th>
                  <th>Tên</th>
                  <th>Số lần sử dụng</th>
                </tr>
              </thead>
              <tbody>
                {stats.mostUsedTools.map((tool) => (
                  <tr key={tool._id}>
                    <td>{tool.productCode}</td>
                    <td>{tool.name}</td>
                    <td>{tool.usageCount || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
