import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Layout.css";

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-brand">
          <h2>Quản lý dụng cụ</h2>
        </div>
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={isActive("/")}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/tools" className={isActive("/tools")}>
              Dụng cụ
            </Link>
          </li>
          {isAdmin && (
            <>
              <li>
                <Link
                  to="/export-receipts"
                  className={isActive("/export-receipts")}
                >
                  Phiếu xuất kho
                </Link>
              </li>
              <li>
                <Link to="/users" className={isActive("/users")}>
                  Người dùng
                </Link>
              </li>
            </>
          )}
          <li>
            <Link to="/statistics" className={isActive("/statistics")}>
              Thống kê
            </Link>
          </li>
        </ul>
        <div className="navbar-user">
          <span>{user?.fullName || user?.username}</span>
          <span className="user-role">({user?.role})</span>
          <button onClick={handleLogout} className="btn-logout">
            Đăng xuất
          </button>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
};
