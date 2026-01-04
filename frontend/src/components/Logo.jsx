import { useState } from "react";
import "./Logo.css";

/**
 * Component Logo
 * Hiển thị logo BKTOOLSYS
 * @param {boolean} collapsed - Trạng thái sidebar collapsed
 * @param {string} size - Kích thước: 'small', 'medium', 'large'
 */
export const Logo = ({ collapsed = false, size = "medium" }) => {
  const [imageError, setImageError] = useState(false);
  const logoPath = "/assets/logo.png"; // Đường dẫn logo trong public folder

  if (collapsed) {
    // Khi sidebar collapsed, chỉ hiển thị icon đơn giản
    return (
      <div className="logo-container logo-collapsed">
        <div className="logo-icon-simple">🔧</div>
      </div>
    );
  }

  return (
    <div className={`logo-container logo-${size}`}>
      <div className="logo-wrapper">
        {!imageError ? (
          // Thử load logo từ file trước
          <img
            src={logoPath}
            alt="BKTOOLSYS Logo"
            className="logo-image"
            onError={() => setImageError(true)}
          />
        ) : (
          // Logo CSS fallback dựa trên mô tả
          <div className="logo-css-fallback">
            <div className="logo-tools">
              <div className="tool tool-1">
                <div className="tool-stripes"></div>
              </div>
              <div className="tool tool-2">
                <div className="tool-stripes"></div>
              </div>
              <div className="tool tool-3">
                <div className="tool-stripes"></div>
              </div>
            </div>
            <div className="logo-base">
              <span className="logo-text">BKTOOLSYS</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
