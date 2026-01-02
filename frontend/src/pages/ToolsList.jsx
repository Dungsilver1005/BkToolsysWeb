import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toolService } from "../services/toolService";
import "./ToolsList.css";

export const ToolsList = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    isInUse: "",
    location: "",
    category: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    fetchTools();
  }, [filters]);

  const fetchTools = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await toolService.getTools(filters);
      if (response.success) {
        setTools(response.data || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách dụng cụ"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: "Mới", class: "status-new" },
      old: { label: "Cũ", class: "status-old" },
      usable: { label: "Sử dụng được", class: "status-usable" },
      unusable: { label: "Không sử dụng được", class: "status-unusable" },
    };
    const statusInfo = statusMap[status] || { label: status, class: "" };
    return (
      <span className={`status-badge ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="tools-list">
      <div className="tools-header">
        <h1>Danh sách dụng cụ</h1>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Tìm kiếm</label>
          <input
            type="text"
            placeholder="Tên, mã sản phẩm, thương hiệu..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Trạng thái</label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="new">Mới</option>
            <option value="old">Cũ</option>
            <option value="usable">Sử dụng được</option>
            <option value="unusable">Không sử dụng được</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Tình trạng sử dụng</label>
          <select
            value={filters.isInUse}
            onChange={(e) => handleFilterChange("isInUse", e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="true">Đang sử dụng</option>
            <option value="false">Chưa sử dụng</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Vị trí</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange("location", e.target.value)}
          >
            <option value="">Tất cả</option>
            <option value="warehouse">Kho</option>
            <option value="in_use">Đang sử dụng</option>
            <option value="maintenance">Bảo trì</option>
            <option value="disposed">Đã thanh lý</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Danh mục</label>
          <input
            type="text"
            placeholder="Danh mục..."
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : tools.length === 0 ? (
        <div className="empty-state">Không tìm thấy dụng cụ nào</div>
      ) : (
        <>
          <div className="tools-grid">
            {tools.map((tool) => (
              <Link
                key={tool._id}
                to={`/tools/${tool._id}`}
                className="tool-card"
              >
                <div className="tool-card-header">
                  <h3>{tool.name}</h3>
                  {getStatusBadge(tool.status)}
                </div>
                <div className="tool-card-body">
                  <p className="product-code">Mã: {tool.productCode}</p>
                  {tool.category && <p>Danh mục: {tool.category}</p>}
                  <p className={tool.isInUse ? "in-use" : "available"}>
                    {tool.isInUse ? "🔴 Đang sử dụng" : "🟢 Có sẵn"}
                  </p>
                  {tool.characteristics?.brand && (
                    <p>Thương hiệu: {tool.characteristics.brand}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {pagination.pages > 1 && (
            <div className="pagination">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Trước
              </button>
              <span>
                Trang {pagination.page} / {pagination.pages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Sau
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
