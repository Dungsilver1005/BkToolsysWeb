import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { exportReceiptService } from "../services/exportReceiptService";
import "./ExportReceiptDetail.css";

export const ExportReceiptDetail = () => {
  const { id } = useParams();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReceipt();
  }, [id]);

  const fetchReceipt = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await exportReceiptService.getExportReceiptById(id);
      if (response.success) {
        setReceipt(response.data);
      } else {
        setError("Không tìm thấy phiếu xuất kho");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Đang tải...</div>;
  }

  if (error || !receipt) {
    return (
      <div className="error-container">
        <div className="error-message">
          {error || "Không tìm thấy phiếu xuất kho"}
        </div>
        <Link to="/export-receipts" className="btn-back">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="receipt-detail">
      <Link to="/export-receipts" className="btn-back">
        ← Quay lại danh sách
      </Link>

      <div className="receipt-detail-header">
        <div>
          <h1>Phiếu xuất kho: {receipt.receiptNumber}</h1>
          <span className={`status-badge status-${receipt.status}`}>
            {receipt.status === "pending" && "Chờ xử lý"}
            {receipt.status === "completed" && "Hoàn thành"}
            {receipt.status === "cancelled" && "Đã hủy"}
          </span>
        </div>
      </div>

      <div className="receipt-detail-grid">
        <div className="detail-section">
          <h2>Thông tin phiếu</h2>
          <div className="info-grid">
            <div className="info-item">
              <label>Mã phiếu</label>
              <p>{receipt.receiptNumber}</p>
            </div>
            <div className="info-item">
              <label>Ngày xuất</label>
              <p>{new Date(receipt.exportDate).toLocaleString("vi-VN")}</p>
            </div>
            <div className="info-item">
              <label>Người xuất</label>
              <p>
                {receipt.exportedBy?.fullName ||
                  receipt.exportedBy?.username ||
                  "N/A"}
              </p>
            </div>
            <div className="info-item">
              <label>Mục đích</label>
              <p>{receipt.purpose || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Phòng ban</label>
              <p>{receipt.department || "N/A"}</p>
            </div>
            <div className="info-item">
              <label>Trạng thái</label>
              <p>
                <span className={`status-badge status-${receipt.status}`}>
                  {receipt.status === "pending" && "Chờ xử lý"}
                  {receipt.status === "completed" && "Hoàn thành"}
                  {receipt.status === "cancelled" && "Đã hủy"}
                </span>
              </p>
            </div>
          </div>
          {receipt.notes && (
            <div className="info-item full-width">
              <label>Ghi chú</label>
              <p>{receipt.notes}</p>
            </div>
          )}
        </div>

        <div className="detail-section full-width">
          <h2>Danh sách dụng cụ</h2>
          <div className="tools-list">
            {receipt.tools && receipt.tools.length > 0 ? (
              <table className="tools-table">
                <thead>
                  <tr>
                    <th>Mã sản phẩm</th>
                    <th>Tên dụng cụ</th>
                    <th>Số lượng</th>
                    <th>Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {receipt.tools.map((item, index) => (
                    <tr key={index}>
                      <td>{item.tool?.productCode || "N/A"}</td>
                      <td>
                        <Link to={`/tools/${item.tool?._id}`}>
                          {item.tool?.name || "N/A"}
                        </Link>
                      </td>
                      <td>{item.quantity || 1}</td>
                      <td>{item.notes || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Không có dụng cụ nào</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
