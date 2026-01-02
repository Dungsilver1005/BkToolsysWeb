import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toolService } from "../services/toolService";
import "./Dashboard.css";

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTools: 0,
    toolsInUse: 0,
    toolsAvailable: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await toolService.getStatistics();
        if (response.success) {
          const data = response.data;
          setStats({
            totalTools: data.totalTools || 0,
            toolsInUse: data.toolsInUse || 0,
            toolsAvailable: (data.totalTools || 0) - (data.toolsInUse || 0),
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <h1>Dashboard</h1>
      <p className="welcome-text">
        Chào mừng, <strong>{user?.fullName || user?.username}</strong>!
      </p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Tổng số dụng cụ</h3>
          <p className="stat-number">
            {stats.loading ? "..." : stats.totalTools}
          </p>
        </div>
        <div className="stat-card">
          <h3>Đang sử dụng</h3>
          <p className="stat-number">
            {stats.loading ? "..." : stats.toolsInUse}
          </p>
        </div>
        <div className="stat-card">
          <h3>Có sẵn</h3>
          <p className="stat-number">
            {stats.loading ? "..." : stats.toolsAvailable}
          </p>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Thao tác nhanh</h2>
        <div className="actions-grid">
          <Link to="/tools" className="action-card">
            <h3>Quản lý dụng cụ</h3>
            <p>Xem và quản lý danh sách dụng cụ</p>
          </Link>
          {isAdmin && (
            <>
              <Link to="/export-receipts" className="action-card">
                <h3>Phiếu xuất kho</h3>
                <p>Quản lý phiếu xuất kho</p>
              </Link>
              <Link to="/users" className="action-card">
                <h3>Quản lý người dùng</h3>
                <p>Quản lý tài khoản người dùng</p>
              </Link>
            </>
          )}
          <Link to="/statistics" className="action-card">
            <h3>Thống kê</h3>
            <p>Xem báo cáo và thống kê</p>
          </Link>
        </div>
      </div>
    </div>
  );
};
