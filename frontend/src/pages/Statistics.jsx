import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toolService } from "../services/toolService";
import "./Statistics.css";

export const Statistics = () => {
  const [stats, setStats] = useState({
    totalTools: 0,
    inUse: 0,
    maintenance: 0,
    unusable: 0,
    available: 0,
  });
  const [mostUsedTools, setMostUsedTools] = useState([]);
  const [warningTools, setWarningTools] = useState([]);
  const [toolTypeStats, setToolTypeStats] = useState([]);
  const [toolTypeSearch, setToolTypeSearch] = useState("");
  const [toolTypeTools, setToolTypeTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    location: "",
  });

  useEffect(() => {
    fetchStatistics();
    fetchToolTypeStats();
  }, [filters]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      const response = await toolService.getStatistics();
      if (response.success) {
        const data = response.data;

        // Tính toán các thống kê
        const totalTools = data.totalTools || 0;
        const toolsInUse = data.toolsInUse || 0;

        // Đếm các trạng thái
        const unusableCount =
          data.toolsByStatus?.find((item) => item._id === "unusable")?.count ||
          0;

        const maintenanceCount =
          data.toolsByLocation?.find((item) => item._id === "maintenance")
            ?.count || 0;

        const availableCount =
          totalTools - toolsInUse - maintenanceCount - unusableCount;

        setStats({
          totalTools,
          inUse: toolsInUse,
          maintenance: maintenanceCount,
          unusable: unusableCount,
          available: availableCount,
        });

        // Lấy top 5 dụng cụ sử dụng nhiều nhất
        if (data.mostUsedTools) {
          setMostUsedTools(data.mostUsedTools.slice(0, 5));
        }

        // Lấy dụng cụ cần chú ý (maintenance hoặc unusable)
        fetchWarningTools();
      }
    } catch (err) {
      console.error("Error fetching statistics:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarningTools = async () => {
    try {
      // Lấy dụng cụ cần bảo trì hoặc hỏng
      const maintenanceResponse = await toolService.getTools({
        location: "maintenance",
        limit: 5,
      });
      const unusableResponse = await toolService.getTools({
        status: "unusable",
        limit: 5,
      });

      const maintenanceTools = maintenanceResponse.success
        ? maintenanceResponse.data || []
        : [];
      const unusableTools = unusableResponse.success
        ? unusableResponse.data || []
        : [];

      // Kết hợp và sắp xếp
      const allWarningTools = [
        ...maintenanceTools.map((tool) => ({
          ...tool,
          warningType: "maintenance",
        })),
        ...unusableTools.map((tool) => ({ ...tool, warningType: "broken" })),
      ];

      setWarningTools(allWarningTools.slice(0, 5));
    } catch (err) {
      console.error("Error fetching warning tools:", err);
    }
  };

  const fetchToolTypeStats = async () => {
    try {
      // Lấy toàn bộ danh sách dụng cụ, dùng cho phần tìm kiếm theo tên dụng cụ
      const response = await toolService.getTools({ limit: 1000 });
      if (!response.success) return;

      const tools = response.data || [];
      setToolTypeTools(tools);

      // Nếu đang có từ khóa tìm kiếm thì tính lại thống kê sau khi load dữ liệu
      if (toolTypeSearch.trim()) {
        updateToolTypeStatsForSearch(tools, toolTypeSearch);
      }
    } catch (err) {
      console.error("Error fetching tool type stats:", err);
    }
  };

  const updateToolTypeStatsForSearch = (tools, searchText) => {
    const keyword = searchText.trim().toUpperCase();

    if (!keyword) {
      setToolTypeStats([]);
      return;
    }

    // Lọc theo tên dụng cụ
    const matchedTools = tools.filter((tool) =>
      (tool.name || "").toUpperCase().includes(keyword)
    );

    if (matchedTools.length === 0) {
      setToolTypeStats([]);
      return;
    }

    // Nhóm theo tên dụng cụ và thống kê theo vị trí
    const grouped = matchedTools.reduce((acc, tool) => {
      const typeName = (tool.name || "Không tên").trim();
      if (!acc[typeName]) {
        acc[typeName] = {
          name: typeName,
          total: 0,
          warehouse: 0,
          inUse: 0,
          maintenance: 0,
          disposed: 0,
        };
      }

      const group = acc[typeName];
      group.total += 1;

      const location = tool.location || "warehouse";
      if (location === "warehouse") group.warehouse += 1;
      else if (location === "in_use") group.inUse += 1;
      else if (location === "maintenance") group.maintenance += 1;
      else if (location === "disposed") group.disposed += 1;
      else group.warehouse += 1;

      return acc;
    }, {});

    const groupedArray = Object.values(grouped).sort(
      (a, b) => b.total - a.total
    );
    setToolTypeStats(groupedArray);
  };

  const handleSearchToolType = () => {
    updateToolTypeStatsForSearch(toolTypeTools, toolTypeSearch);
  };

  const calculatePercentages = () => {
    const { totalTools, inUse, maintenance, unusable, available } = stats;
    if (totalTools === 0)
      return { inUse: 0, maintenance: 0, unusable: 0, available: 0 };

    return {
      inUse: Math.round((inUse / totalTools) * 100),
      maintenance: Math.round((maintenance / totalTools) * 100),
      unusable: Math.round((unusable / totalTools) * 100),
      available: Math.round((available / totalTools) * 100),
    };
  };

  const getLastMaintenanceDate = (tool) => {
    if (!tool.history || tool.history.length === 0) return "Chưa có";
    const maintenanceEntries = tool.history.filter(
      (entry) => entry.action === "maintenance"
    );
    if (maintenanceEntries.length === 0) return "Chưa có";
    const lastMaintenance = maintenanceEntries.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];
    return new Date(lastMaintenance.date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (tool) => {
    if (tool.warningType === "broken" || tool.status === "unusable") {
      return (
        <span className="status-badge status-badge-red">
          <span className="status-dot"></span>
          Hỏng hóc
        </span>
      );
    }
    if (tool.location === "maintenance" || tool.warningType === "maintenance") {
      return (
        <span className="status-badge status-badge-orange">
          <span className="status-dot"></span>
          Cần bảo trì
        </span>
      );
    }
    return null;
  };

  const percentages = calculatePercentages();
  const maxUsage =
    mostUsedTools.length > 0 ? mostUsedTools[0]?.usageCount || 1 : 1;

  if (loading) {
    return (
      <div className="statistics-page">
        <div className="loading-state">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="statistics-page">
      <div className="statistics-content">
        {/* Page Heading */}
        <div className="page-header">
          <div className="header-info">
            <h1 className="page-title">Thống kê Dụng cụ</h1>
            <p className="page-subtitle">
              Báo cáo tổng hợp tình trạng và hiệu suất sử dụng
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-filter">
              <span className="material-symbols-outlined">calendar_today</span>
              <span>Tháng này</span>
            </button>
            <button className="btn-primary">
              <span className="material-symbols-outlined">download</span>
              <span>Xuất báo cáo</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="filters-grid">
          <div className="filter-group">
            <label>Loại dụng cụ</label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
              >
                <option value="">Tất cả loại</option>
                <option value="Khoan">Khoan</option>
                <option value="Cắt">Cắt</option>
                <option value="Tua vít">Tua vít</option>
              </select>
              <span className="material-symbols-outlined dropdown-icon">
                expand_more
              </span>
            </div>
          </div>
          <div className="filter-group">
            <label>Trạng thái</label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
              >
                <option value="">Tất cả trạng thái</option>
                <option value="in_use">Đang sử dụng</option>
                <option value="available">Sẵn sàng</option>
                <option value="maintenance">Cần bảo trì</option>
              </select>
              <span className="material-symbols-outlined dropdown-icon">
                expand_more
              </span>
            </div>
          </div>
          <div className="filter-group">
            <label>Khu vực</label>
            <div className="select-wrapper">
              <select
                className="filter-select"
                value={filters.location}
                onChange={(e) =>
                  setFilters({ ...filters, location: e.target.value })
                }
              >
                <option value="">Toàn bộ nhà máy</option>
                <option value="warehouse">Kho chính</option>
                <option value="in_use">Xưởng sản xuất</option>
                <option value="maintenance">Khu bảo trì</option>
              </select>
              <span className="material-symbols-outlined dropdown-icon">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-label">Tổng số dụng cụ</p>
              <div className="stat-icon stat-icon-blue">
                <span className="material-symbols-outlined">construction</span>
              </div>
            </div>
            <div className="stat-value-row">
              <p className="stat-value">{stats.totalTools.toLocaleString()}</p>
              <div className="trend-badge trend-up">
                <span className="material-symbols-outlined">trending_up</span>
                <span>5%</span>
              </div>
            </div>
            <p className="stat-description">So với tháng trước</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-label">Đang sử dụng</p>
              <div className="stat-icon stat-icon-green">
                <span className="material-symbols-outlined">
                  precision_manufacturing
                </span>
              </div>
            </div>
            <div className="stat-value-row">
              <p className="stat-value">{stats.inUse.toLocaleString()}</p>
              <div className="trend-badge trend-up">
                <span className="material-symbols-outlined">trending_up</span>
                <span>12%</span>
              </div>
            </div>
            <p className="stat-description">Hiệu suất hoạt động cao</p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-label">Cần bảo trì</p>
              <div className="stat-icon stat-icon-orange">
                <span className="material-symbols-outlined">build_circle</span>
              </div>
            </div>
            <div className="stat-value-row">
              <p className="stat-value">{stats.maintenance.toLocaleString()}</p>
              <div className="trend-badge trend-down">
                <span className="material-symbols-outlined">trending_down</span>
                <span>2%</span>
              </div>
            </div>
            <p className="stat-description">
              {stats.maintenance > 0
                ? `${stats.maintenance} dụng cụ cần xử lý`
                : "Tất cả đều ổn"}
            </p>
          </div>

          <div className="stat-card">
            <div className="stat-header">
              <p className="stat-label">Không sử dụng được</p>
              <div className="stat-icon stat-icon-red">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div className="stat-value-row">
              <p className="stat-value">{stats.unusable.toLocaleString()}</p>
              <div className="trend-badge trend-down">
                <span className="material-symbols-outlined">trending_down</span>
                <span>3%</span>
              </div>
            </div>
            <p className="stat-description">Cần kiểm tra và xử lý</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          {/* Donut Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Tỷ lệ trạng thái</h3>
              <button className="chart-menu">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="donut-chart-container">
              <div
                className="donut-chart"
                style={{
                  background: `conic-gradient(
                    #10b981 0% ${percentages.inUse}%,
                    #f59e0b ${percentages.inUse}% ${
                    percentages.inUse + percentages.maintenance
                  }%,
                    #ef4444 ${percentages.inUse + percentages.maintenance}% ${
                    percentages.inUse +
                    percentages.maintenance +
                    percentages.unusable
                  }%,
                    #e5e7eb ${
                      percentages.inUse +
                      percentages.maintenance +
                      percentages.unusable
                    }% 100%
                  )`,
                }}
              >
                <div className="donut-center">
                  <span className="donut-total">{stats.totalTools}</span>
                  <span className="donut-label">Tổng cộng</span>
                </div>
              </div>
              <div className="chart-legend">
                <div className="legend-item">
                  <div className="legend-color legend-green"></div>
                  <span>Đang dùng</span>
                  <span className="legend-value">{percentages.inUse}%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-orange"></div>
                  <span>Bảo trì</span>
                  <span className="legend-value">
                    {percentages.maintenance}%
                  </span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-red"></div>
                  <span>Hỏng</span>
                  <span className="legend-value">{percentages.unusable}%</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color legend-gray"></div>
                  <span>Tồn kho</span>
                  <span className="legend-value">{percentages.available}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="chart-card">
            <div className="chart-header">
              <h3 className="chart-title">Tần suất sử dụng (Top 5)</h3>
              <button className="chart-menu">
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
            <div className="bar-chart-container">
              {mostUsedTools.length > 0 ? (
                mostUsedTools.map((tool, index) => {
                  const percentage = (tool.usageCount / maxUsage) * 100;
                  return (
                    <div key={tool._id || index} className="bar-item">
                      <div className="bar-header">
                        <span className="bar-label">
                          {tool.category || tool.name || "N/A"}
                        </span>
                        <span className="bar-value">
                          {tool.usageCount || 0} lần
                        </span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${percentage}%`,
                            opacity: 1 - index * 0.15,
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="empty-chart">Chưa có dữ liệu</div>
              )}
            </div>
          </div>
        </div>

        {/* Thống kê theo loại dụng cụ */}
        <div className="chart-card type-chart-card">
          <div className="chart-header type-chart-header">
            <div className="type-chart-text">
              <h3 className="chart-title">
                Thống kê theo loại dụng cụ (nhóm theo tên)
              </h3>
              <span className="chart-subtitle">
                Biểu đồ tròn theo vị trí: Kho / Đang dùng / Bảo trì / Đã thanh lý
              </span>
            </div>
            <div className="type-search">
              <input
                type="text"
                className="type-search-input"
                placeholder="Nhập tên dụng cụ (VD: Dao phay...)"
                value={toolTypeSearch}
                onChange={(e) => setToolTypeSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchToolType();
                  }
                }}
              />
              <button
                type="button"
                className="type-search-button"
                onClick={handleSearchToolType}
              >
                Tìm
              </button>
            </div>
          </div>
          {toolTypeStats.length === 0 ? (
            <div className="empty-chart">
              {toolTypeSearch.trim()
                ? "Không tìm thấy dụng cụ phù hợp"
                : "Nhập tên dụng cụ để xem thống kê"}
            </div>
          ) : (
            <div className="type-charts-grid">
              {toolTypeStats.map((group) => {
                const total = Math.max(group.total, 1);
                const warehousePct = Math.round((group.warehouse / total) * 100);
                const inUsePct = Math.round((group.inUse / total) * 100);
                const maintenancePct = Math.round((group.maintenance / total) * 100);
                const disposedPct = Math.round((group.disposed / total) * 100);

                const segment1 = warehousePct;
                const segment2 = segment1 + inUsePct;
                const segment3 = segment2 + maintenancePct;
                const segment4 = 100; // disposed fills phần còn lại

                return (
                  <div key={group.name} className="type-chart-item">
                    <div
                      className="type-donut"
                      style={{
                        background: `conic-gradient(
                          #22c55e 0% ${segment1}%,
                          #3b82f6 ${segment1}% ${segment2}%,
                          #f59e0b ${segment2}% ${segment3}%,
                          #ef4444 ${segment3}% ${segment4}%
                        )`,
                      }}
                    >
                      <div className="type-donut-center">
                        <span className="type-total">{group.total}</span>
                        <span className="type-label">Tổng</span>
                      </div>
                    </div>
                    <div className="type-info">
                      <p className="type-name">{group.name}</p>
                      <div className="type-legend">
                        <span className="legend-dot legend-green"></span>
                        <span>Kho: {group.warehouse}</span>
                      </div>
                      <div className="type-legend">
                        <span className="legend-dot legend-blue"></span>
                        <span>Đang dùng: {group.inUse}</span>
                      </div>
                      <div className="type-legend">
                        <span className="legend-dot legend-orange"></span>
                        <span>Bảo trì: {group.maintenance}</span>
                      </div>
                      <div className="type-legend">
                        <span className="legend-dot legend-red"></span>
                        <span>Đã thanh lý: {group.disposed}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Bottom Section - Warning Table */}
        <div className="bottom-grid">
          <div className="chart-card warning-table-card">
            <div className="table-header">
              <h3 className="chart-title">Cần chú ý gấp</h3>
              <Link to="/tools" className="table-link">
                Xem tất cả
              </Link>
            </div>
            <div className="table-wrapper">
              <table className="warning-table">
                <thead>
                  <tr>
                    <th>Mã DC</th>
                    <th>Tên dụng cụ</th>
                    <th>Tình trạng</th>
                    <th>Lần bảo trì cuối</th>
                    <th className="text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {warningTools.length > 0 ? (
                    warningTools.map((tool) => (
                      <tr key={tool._id}>
                        <td className="tool-code">
                          {tool.productCode || "N/A"}
                        </td>
                        <td>
                          <div className="tool-name-cell">
                            <div className="tool-icon-small"></div>
                            <span>{tool.category || tool.name || "N/A"}</span>
                          </div>
                        </td>
                        <td>{getStatusBadge(tool)}</td>
                        <td>{getLastMaintenanceDate(tool)}</td>
                        <td className="text-right">
                          <Link
                            to={`/tools/${tool._id}`}
                            className="action-icon"
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined">
                              edit_note
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="empty-table">
                        Không có dụng cụ cần chú ý
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
