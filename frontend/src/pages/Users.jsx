import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useToastContext } from "../context/ToastContext";
import { userService } from "../services/userService";
import "./Users.css";

export const Users = () => {
  const { showError } = useToastContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      user.username?.toLowerCase().includes(searchLower) ||
      user.fullName?.toLowerCase().includes(searchLower) ||
      user.email?.toLowerCase().includes(searchLower) ||
      user.department?.toLowerCase().includes(searchLower)
    );
  });

  const getRoleBadge = (role) => {
    if (role === "admin") {
      return (
        <span className="role-badge role-badge-admin">
          <span className="role-dot role-dot-red"></span>
          Quản trị viên
        </span>
      );
    }
    return (
      <span className="role-badge role-badge-user">
        <span className="role-dot role-dot-blue"></span>
        Người dùng
      </span>
    );
  };

  return (
    <div className="users-page">
      <div className="users-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Quản lý người dùng</h1>
            <p className="page-subtitle">Quản lý tài khoản và quyền truy cập của người dùng</p>
          </div>
        </div>

        <div className="filters-card">
          <div className="search-wrapper">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              className="search-input"
              type="text"
              placeholder="Tìm kiếm theo tên, email, phòng ban..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Tên đăng nhập</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Phòng ban</th>
                  <th>Vai trò</th>
                  <th>Ngày tạo</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center loading-cell">
                      Đang tải...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center empty-cell">
                      Không tìm thấy người dùng nào
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="table-row">
                      <td>
                        <div className="user-info-cell">
                          <div className="user-avatar-small"></div>
                          <span className="user-username">{user.username}</span>
                        </div>
                      </td>
                      <td>{user.fullName || "N/A"}</td>
                      <td>{user.email}</td>
                      <td>{user.department || "N/A"}</td>
                      <td>{getRoleBadge(user.role)}</td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="text-right">
                        <div className="action-buttons">
                          <Link
                            to={`/users/${user._id}`}
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
    </div>
  );
};
