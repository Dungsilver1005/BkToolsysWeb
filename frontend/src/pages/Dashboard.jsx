import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toolService } from "../services/toolService";
import { toolRequestService } from "../services/toolRequestService";
import "./Dashboard.css";

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTools: 0,
    toolsInUse: 0,
    maintenance: 0,
    lowStock: 0,
    toolsByLocation: [],
    toolsByStatus: [],
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch statistics
      const statsResponse = await toolService.getStatistics();
      let currentStats = {
        totalTools: 0,
        toolsInUse: 0,
        maintenance: 0,
        lowStock: 0,
        toolsByLocation: [],
        toolsByStatus: [],
      };

      if (statsResponse.success) {
        const data = statsResponse.data;
        const maintenanceCount =
          data.toolsByLocation?.find((item) => item._id === "maintenance")
            ?.count || 0;
        const unusableCount =
          data.toolsByStatus?.find((item) => item._id === "unusable")?.count ||
          0;
        const availableCount = (data.totalTools || 0) - (data.toolsInUse || 0);
        const lowStockCount = availableCount < 10 ? availableCount : 0;

        currentStats = {
          totalTools: data.totalTools || 0,
          toolsInUse: data.toolsInUse || 0,
          maintenance: maintenanceCount,
          lowStock: lowStockCount,
          toolsByLocation: data.toolsByLocation || [],
          toolsByStatus: data.toolsByStatus || [],
        };

        setStats(currentStats);
      }

      // Fetch recent activities (tool requests)
      const activitiesResponse = await toolRequestService.getRequests({
        limit: 10,
      });
      if (activitiesResponse.success) {
        setRecentActivities(activitiesResponse.data?.slice(0, 10) || []);
      }

      // Generate alerts from data
      await generateAlerts(currentStats);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = async (currentStatsData) => {
    try {
      const alertsList = [];
      const statsData = currentStatsData || stats;

      // Get overdue tools
      const toolsInUseResponse = await toolService.getToolsInUse();
      if (toolsInUseResponse.success) {
        const tools = toolsInUseResponse.data || [];
        tools.forEach((tool) => {
          if (tool.lastUsedDate) {
            const daysSince = Math.floor(
              (new Date() - new Date(tool.lastUsedDate)) / (1000 * 60 * 60 * 24)
            );
            if (daysSince > 7) {
              alertsList.push({
                type: "error",
                title: `${tool.productCode || tool.name} quá hạn trả`,
                message: `Người mượn: ${
                  tool.currentUser?.fullName ||
                  tool.currentUser?.username ||
                  "N/A"
                }. Quá hạn ${daysSince - 7} ngày.`,
                tool: tool,
              });
            }
          }
        });
      }

      // Get maintenance tools
      if (statsData.maintenance > 0) {
        alertsList.push({
          type: "warning",
          title: "Cần kiểm định dụng cụ",
          message: `Có ${statsData.maintenance} dụng cụ đang bảo trì cần kiểm tra.`,
        });
      }

      // Low stock alert
      const availableCount = statsData.totalTools - statsData.toolsInUse;
      if (availableCount < 10 && statsData.totalTools > 0) {
        alertsList.push({
          type: "warning",
          title: "Kho vật tư tiêu hao thấp",
          message: `Số dụng cụ có sẵn dưới mức tối thiểu (${availableCount}/10).`,
        });
      }

      setAlerts(alertsList.slice(0, 3));
    } catch (error) {
      console.error("Error generating alerts:", error);
    }
  };

  const getStatusDistribution = () => {
    const total = stats.totalTools || 1;
    const available =
      total -
      stats.toolsInUse -
      (stats.toolsByLocation?.find((l) => l._id === "maintenance")?.count ||
        0) -
      (stats.toolsByStatus?.find((s) => s._id === "unusable")?.count || 0);
    const inUse = stats.toolsInUse;
    const maintenance =
      stats.toolsByLocation?.find((l) => l._id === "maintenance")?.count || 0;
    const unusable =
      stats.toolsByStatus?.find((s) => s._id === "unusable")?.count || 0;

    return {
      available: Math.round((available / total) * 100),
      inUse: Math.round((inUse / total) * 100),
      maintenance: Math.round((maintenance / total) * 100),
      unusable: Math.round((unusable / total) * 100),
    };
  };

  const formatTimeAgo = (date) => {
    if (!date) return "N/A";
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    return `${diffDays} ngày trước`;
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      approved: { label: "Mượn", className: "status-badge status-badge-blue" },
      returned: { label: "Trả", className: "status-badge status-badge-green" },
      rejected: {
        label: "Báo lỗi",
        className: "status-badge status-badge-red",
      },
      pending: {
        label: "Chờ duyệt",
        className: "status-badge status-badge-yellow",
      },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={statusInfo.className}>
        <span className="status-dot"></span>
        {statusInfo.label}
      </span>
    );
  };

  const distribution = getStatusDistribution();
  const currentDate = new Date().toLocaleDateString("vi-VN");

  return (
    <div className="dashboard-page">
      <div className="dashboard-content">
        {/* Page Heading */}
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Bảng điều khiển</h1>
            <p className="dashboard-subtitle">
              Cập nhật trạng thái hệ thống ngày {currentDate}
            </p>
          </div>
          <div className="dashboard-actions">
            {isAdmin && (
              <>
                <button className="dashboard-btn-secondary">
                  <span className="material-symbols-outlined">
                    file_download
                  </span>
                  Xuất báo cáo
                </button>
                <button
                  className="dashboard-btn-primary"
                  onClick={() => navigate("/tools")}
                >
                  <span className="material-symbols-outlined">add</span>
                  Thêm dụng cụ
                </button>
              </>
            )}
          </div>
        </div>

        {/* KPI Stats */}
        <div className="dashboard-stats-grid">
          <div className="dashboard-stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Tổng số dụng cụ</p>
                <h3 className="stat-value">
                  {loading ? "..." : stats.totalTools.toLocaleString()}
                </h3>
              </div>
              <div className="stat-icon stat-icon-blue">
                <span className="material-symbols-outlined">inventory</span>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend stat-trend-up">
                <span className="material-symbols-outlined">trending_up</span>
                +5%
              </span>
              <span className="stat-note">so với tháng trước</span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Đang sử dụng</p>
                <h3 className="stat-value">
                  {loading ? "..." : stats.toolsInUse.toLocaleString()}
                </h3>
              </div>
              <div className="stat-icon stat-icon-indigo">
                <span className="material-symbols-outlined">engineering</span>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend stat-trend-up">
                <span className="material-symbols-outlined">trending_up</span>
                +12%
              </span>
              <span className="stat-note">hoạt động cao</span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Cần bảo trì</p>
                <h3 className="stat-value">
                  {loading ? "..." : stats.maintenance.toLocaleString()}
                </h3>
              </div>
              <div className="stat-icon stat-icon-red">
                <span className="material-symbols-outlined">build_circle</span>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend stat-trend-down">
                <span className="material-symbols-outlined">priority_high</span>
                {stats.maintenance > 0
                  ? `${stats.maintenance} cần xử lý`
                  : "0 quá hạn"}
              </span>
              <span className="stat-note">cần xử lý ngay</span>
            </div>
          </div>

          <div className="dashboard-stat-card">
            <div className="stat-header">
              <div>
                <p className="stat-label">Tồn kho</p>
                <h3 className="stat-value">
                  {loading ? "..." : stats.lowStock.toLocaleString()}
                </h3>
              </div>
              <div className="stat-icon stat-icon-orange">
                <span className="material-symbols-outlined">warning</span>
              </div>
            </div>
            <div className="stat-footer">
              <span className="stat-trend stat-trend-down">
                <span className="material-symbols-outlined">
                  arrow_downward
                </span>
                {stats.lowStock > 0 ? `${stats.lowStock} mục` : "Đủ"}
              </span>
              <span className="stat-note">cần nhập thêm</span>
            </div>
          </div>
        </div>

        {/* Main Grid: Charts & Alerts */}
        <div className="dashboard-main-grid">
          {/* Left Column: Charts */}
          <div className="dashboard-charts-column">
            {/* Usage Trends */}
            <div className="dashboard-card">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Xu hướng sử dụng</h2>
                  <p className="card-subtitle">
                    Số lượng mượn/trả trong 7 ngày qua
                  </p>
                </div>
                <select className="card-select">
                  <option>7 ngày qua</option>
                  <option>Tháng này</option>
                  <option>Năm nay</option>
                </select>
              </div>
              <div className="chart-container">
                <svg
                  className="chart-svg"
                  preserveAspectRatio="none"
                  viewBox="0 0 478 150"
                >
                  <defs>
                    <linearGradient
                      id="chartGradient"
                      x1="0"
                      x2="0"
                      y1="0"
                      y2="1"
                    >
                      <stop offset="0%" stopColor="#135bec" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#135bec" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.6 41C90.7 41 90.7 93 108.9 93C127 93 127 33 145.2 33C163.4 33 163.4 101 181.5 101C199.7 101 199.7 61 217.8 61C236 61 236 45 254.1 45C272.3 45 272.3 121 290.4 121C308.6 121 308.6 149 326.7 149C344.9 149 344.9 1 363 1C381.2 1 381.2 81 399.4 81C417.5 81 417.5 129 435.7 129C453.8 129 453.8 25 472 25V150H0V109Z"
                    fill="url(#chartGradient)"
                  />
                  <path
                    d="M0 109C18.15 109 18.15 21 36.3 21C54.46 21 54.46 41 72.6 41C90.7 41 90.7 93 108.9 93C127 93 127 33 145.2 33C163.4 33 163.4 101 181.5 101C199.7 101 199.7 61 217.8 61C236 61 236 45 254.1 45C272.3 45 272.3 121 290.4 121C308.6 121 308.6 149 326.7 149C344.9 149 344.9 1 363 1C381.2 1 381.2 81 399.4 81C417.5 81 417.5 129 435.7 129C453.8 129 453.8 25 472 25"
                    fill="none"
                    stroke="#135bec"
                    strokeLinecap="round"
                    strokeWidth="3"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
              <div className="chart-labels">
                <span>Thứ 2</span>
                <span>Thứ 3</span>
                <span>Thứ 4</span>
                <span>Thứ 5</span>
                <span>Thứ 6</span>
                <span>Thứ 7</span>
                <span>CN</span>
              </div>
            </div>

            {/* Status Distribution */}
            <div className="dashboard-card">
              <div className="card-header">
                <h2 className="card-title">Trạng thái kho</h2>
                <button className="card-link">Chi tiết</button>
              </div>
              <div className="distribution-grid">
                <div className="distribution-item">
                  <span className="distribution-percent">
                    {distribution.available}%
                  </span>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill-green"
                      style={{ height: `${distribution.available}%` }}
                    ></div>
                  </div>
                  <span className="distribution-label">Sẵn sàng</span>
                </div>
                <div className="distribution-item">
                  <span className="distribution-percent">
                    {distribution.inUse}%
                  </span>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill-blue"
                      style={{ height: `${distribution.inUse}%` }}
                    ></div>
                  </div>
                  <span className="distribution-label">Đang dùng</span>
                </div>
                <div className="distribution-item">
                  <span className="distribution-percent">
                    {distribution.maintenance}%
                  </span>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill-orange"
                      style={{ height: `${distribution.maintenance}%` }}
                    ></div>
                  </div>
                  <span className="distribution-label">Bảo trì</span>
                </div>
                <div className="distribution-item">
                  <span className="distribution-percent">
                    {distribution.unusable}%
                  </span>
                  <div className="distribution-bar">
                    <div
                      className="distribution-fill distribution-fill-red"
                      style={{ height: `${distribution.unusable}%` }}
                    ></div>
                  </div>
                  <span className="distribution-label">Hỏng</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Alerts */}
          <div className="dashboard-alerts-column">
            <div className="dashboard-card alerts-card">
              <div className="alerts-header">
                <h2 className="card-title">
                  <span className="material-symbols-outlined alerts-icon">
                    warning
                  </span>
                  Thông báo quan trọng
                </h2>
                {alerts.length > 0 && (
                  <span className="alerts-badge">{alerts.length}</span>
                )}
              </div>
              <div className="alerts-list">
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <div key={index} className="alert-item">
                      <div className="alert-dot alert-dot-red"></div>
                      <div className="alert-content">
                        <h4 className="alert-title">{alert.title}</h4>
                        <p className="alert-message">{alert.message}</p>
                        <div className="alert-actions">
                          <button className="alert-btn">Nhắc nhở</button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="alert-item">
                    <div className="alert-content">
                      <p className="alert-message">
                        Không có thông báo quan trọng
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="alerts-footer">
                <button className="alerts-link">Xem tất cả thông báo</button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="dashboard-card">
          <div className="card-header">
            <h2 className="card-title">Hoạt động gần đây</h2>
            <div className="card-actions">
              <div className="filter-wrapper">
                <span className="material-symbols-outlined filter-icon">
                  filter_list
                </span>
                <select className="card-select">
                  <option>Tất cả trạng thái</option>
                  <option>Mượn</option>
                  <option>Trả</option>
                  <option>Báo lỗi</option>
                </select>
              </div>
            </div>
          </div>
          <div className="table-container">
            <table className="activities-table">
              <thead>
                <tr>
                  <th>Dụng cụ</th>
                  <th>Người thực hiện</th>
                  <th>Trạng thái</th>
                  <th>Thời gian</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Đang tải...
                    </td>
                  </tr>
                ) : recentActivities.length > 0 ? (
                  recentActivities.map((activity) => (
                    <tr key={activity._id}>
                      <td>
                        <div className="tool-info">
                          <div className="tool-icon">
                            <span className="material-symbols-outlined">
                              handyman
                            </span>
                          </div>
                          <div>
                            <p className="tool-name">
                              {activity.tool?.name ||
                                activity.tool?.productCode ||
                                "N/A"}
                            </p>
                            <p className="tool-id">
                              ID:{" "}
                              {activity.tool?.productCode ||
                                activity.tool?._id ||
                                "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar"></div>
                          <span>
                            {activity.requestedBy?.fullName ||
                              activity.requestedBy?.username ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>{getStatusBadge(activity.status)}</td>
                      <td className="text-muted">
                        {formatTimeAgo(activity.createdAt)}
                      </td>
                      <td className="text-right">
                        <button className="action-btn">
                          <span className="material-symbols-outlined">
                            more_vert
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center">
                      Không có hoạt động gần đây
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
