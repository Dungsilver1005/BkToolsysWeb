import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useToastContext } from "../context/ToastContext";
import { Modal } from "../components/Modal";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { userService } from "../services/userService";
import "./UserDetail.css";

export const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToastContext();
  const [user, setUser] = useState(null);
  const [accessHistory, setAccessHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    department: "",
    role: "user",
  });

  useEffect(() => {
    fetchUser();
    fetchAccessHistory();
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await userService.getUserById(id);
      if (response.success) {
        setUser(response.data);
        setFormData({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          department: response.data.department || "",
          role: response.data.role || "user",
        });
      } else {
        setError("Không tìm thấy người dùng");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const fetchAccessHistory = async () => {
    try {
      const response = await userService.getUserAccessHistory(id);
      if (response.success) {
        setAccessHistory(response.data || []);
      }
    } catch (err) {
      console.error("Error fetching access history:", err);
    }
  };

  const handleUpdateUser = async () => {
    setSubmitting(true);
    try {
      const response = await userService.updateUser(id, formData);
      if (response.success) {
        showSuccess("Cập nhật người dùng thành công");
        setShowEditModal(false);
        fetchUser();
      } else {
        showError(response.message || "Cập nhật người dùng thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi cập nhật người dùng"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    setSubmitting(true);
    try {
      const response = await userService.deleteUser(id);
      if (response.success) {
        showSuccess("Xóa người dùng thành công");
        navigate("/users");
      } else {
        showError(response.message || "Xóa người dùng thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi xóa người dùng"
      );
    } finally {
      setSubmitting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error || !user) {
    return (
      <div className="error-container">
        <div className="error-message">
          {error || "Không tìm thấy người dùng"}
        </div>
        <Link to="/users" className="btn-back">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="user-detail">
      <Link to="/users" className="btn-back">
        ← Quay lại danh sách
      </Link>

      <div className="user-detail-header">
        <div>
          <h1>{user.fullName || user.username}</h1>
          <span className={`role-badge role-${user.role}`}>
            {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
          </span>
        </div>
        <div className="user-actions">
          <button className="btn-edit" onClick={() => setShowEditModal(true)}>
            ✏️ Sửa
          </button>
          <button
            className="btn-delete"
            onClick={() => setShowDeleteDialog(true)}
          >
            🗑️ Xóa
          </button>
        </div>
      </div>

      <div className="user-detail-grid">
        <div className="detail-section">
          <h2>Thông tin cơ bản</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Tên đăng nhập</label>
              <p>{user.username}</p>
            </div>
            <div className="info-item">
              <label>Họ và tên</label>
              <p>{user.fullName || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Email</label>
              <p>{user.email}</p>
            </div>
            <div className="info-item">
              <label>Phòng ban</label>
              <p>{user.department || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Vai trò</label>
              <p>
                <span className={`role-badge role-${user.role}`}>
                  {user.role === "admin" ? "Quản trị viên" : "Người dùng"}
                </span>
              </p>
            </div>
            <div className="info-item">
              <label>Ngày tạo</label>
              <p>{new Date(user.createdAt).toLocaleString("vi-VN")}</p>
            </div>
          </div>
        </div>

        {accessHistory.length > 0 && (
          <div className="detail-section full-width">
            <h2>Lịch sử truy cập</h2>
            <div className="history-list">
              {accessHistory.map((entry, index) => (
                <div key={index} className="history-item">
                  <div className="history-date">
                    {new Date(entry.loginTime).toLocaleString("vi-VN")}
                  </div>
                  <div className="history-info">
                    IP: {entry.ipAddress || "N/A"} | User Agent:{" "}
                    {entry.userAgent || "N/A"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Sửa thông tin người dùng"
        size="medium"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdateUser();
          }}
        >
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, fullName: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, email: e.target.value }))
              }
            />
          </div>
          <div className="form-group">
            <label>Phòng ban</label>
            <input
              type="text"
              value={formData.department}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  department: e.target.value,
                }))
              }
            />
          </div>
          <div className="form-group">
            <label>Vai trò</label>
            <select
              value={formData.role}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, role: e.target.value }))
              }
            >
              <option value="user">Người dùng</option>
              <option value="admin">Quản trị viên</option>
            </select>
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="btn-cancel"
            >
              Hủy
            </button>
            <button type="submit" disabled={submitting} className="btn-submit">
              {submitting ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDeleteUser}
        title="Xóa người dùng"
        message={`Bạn có chắc chắn muốn xóa người dùng "${
          user.fullName || user.username
        }"? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};
