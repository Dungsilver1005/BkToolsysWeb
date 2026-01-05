import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    remember: false,
  });
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);
    try {
      const result = await login(formData.username, formData.password);
      if (result.success) {
        navigate("/", { replace: true });
      } else {
        setError(result.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Side: Hero / Branding */}
      <div className="auth-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-logo-box">
            <svg className="hero-logo" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="hero-title">
            Quản lý hiệu quả,<br />
            Sản xuất tối ưu.
          </h1>
          <p className="hero-description">
            Hệ thống quản lý dụng cụ tập trung giúp theo dõi, kiểm kê và tối ưu hóa quy trình sản xuất của bạn.
          </p>
          <div className="hero-footer">
            <div className="hero-avatars">
              <div className="hero-avatar"></div>
              <div className="hero-avatar"></div>
              <div className="hero-avatar"></div>
            </div>
            <p className="hero-footer-text">Được tin dùng bởi hơn 500+ kỹ sư</p>
          </div>
        </div>
      </div>

      {/* Right Side: Form Container */}
      <div className="auth-form-container">
        {/* Mobile Header */}
        <header className="auth-mobile-header">
          <div className="auth-mobile-logo">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path
                clipRule="evenodd"
                d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z"
                fill="currentColor"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="auth-mobile-title">ToolManager</h2>
        </header>

        {/* Main Form Content */}
        <div className="auth-form-content">
          <div className="auth-form-wrapper">
            {/* Page Heading */}
            <div className="auth-heading">
              <p className="auth-title">Hệ thống Quản lý Dụng cụ</p>
              <p className="auth-subtitle">Đăng nhập để tiếp tục quản lý sản xuất</p>
            </div>

            {/* Tabs */}
            <div className="auth-tabs">
              <div className="auth-tabs-container">
                <button className="auth-tab active">
                  <p className="auth-tab-text">Đăng nhập</p>
                </button>
                <Link to="/register" className="auth-tab">
                  <p className="auth-tab-text">Đăng ký</p>
                </Link>
              </div>
            </div>

            {/* Form Fields */}
            <form className="auth-form" onSubmit={handleSubmit}>
              {error && <div className="auth-error">{error}</div>}

              {/* Username Input */}
              <label className="auth-input-label">
                <span className="auth-label-text">Email hoặc Tên đăng nhập</span>
                <div className="auth-input-wrapper">
                  <span className="material-symbols-outlined auth-input-icon">mail</span>
                  <input
                    className="auth-input"
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="user@factory.com"
                    autoComplete="username"
                  />
                </div>
              </label>

              {/* Password Input */}
              <label className="auth-input-label">
                <div className="auth-label-header">
                  <span className="auth-label-text">Mật khẩu</span>
                  <a className="auth-link" href="#">
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="auth-input-wrapper password-wrapper">
                  <span className="material-symbols-outlined auth-input-icon">lock</span>
                  <input
                    className="auth-input"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="auth-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </label>

              {/* Remember me */}
              <div className="auth-checkbox-wrapper">
                <input
                  className="auth-checkbox"
                  type="checkbox"
                  id="remember"
                  name="remember"
                  checked={formData.remember}
                  onChange={handleChange}
                />
                <label className="auth-checkbox-label" htmlFor="remember">
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="auth-submit-btn"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Đăng nhập"}
              </button>
            </form>

            <div className="auth-footer-link">
              <p className="auth-footer-text">
                Chưa có tài khoản?{" "}
                <Link to="/register" className="auth-link-primary">
                  Đăng ký ngay
                </Link>
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="auth-page-footer">
            <p className="auth-copyright">© 2024 ToolManager System. Bảo lưu mọi quyền.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
