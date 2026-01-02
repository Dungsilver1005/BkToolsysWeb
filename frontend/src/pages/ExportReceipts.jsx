import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { exportReceiptService } from "../services/exportReceiptService";
import "./ExportReceipts.css";

export const ExportReceipts = () => {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReceipts();
  }, []);

  const fetchReceipts = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await exportReceiptService.getExportReceipts();
      if (response.success) {
        setReceipts(response.data || []);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách phiếu xuất kho"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="export-receipts">
      <div className="receipts-header">
        <h1>Phiếu xuất kho</h1>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : receipts.length === 0 ? (
        <div className="empty-state">Chưa có phiếu xuất kho nào</div>
      ) : (
        <div className="receipts-table-container">
          <table className="receipts-table">
            <thead>
              <tr>
                <th>Mã phiếu</th>
                <th>Ngày xuất</th>
                <th>Người xuất</th>
                <th>Số lượng dụng cụ</th>
                <th>Mục đích</th>
                <th>Phòng ban</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr key={receipt._id}>
                  <td>{receipt.receiptNumber}</td>
                  <td>
                    {new Date(receipt.exportDate).toLocaleDateString("vi-VN")}
                  </td>
                  <td>
                    {receipt.exportedBy?.fullName ||
                      receipt.exportedBy?.username ||
                      "N/A"}
                  </td>
                  <td>{receipt.tools?.length || 0}</td>
                  <td>{receipt.purpose || "N/A"}</td>
                  <td>{receipt.department || "N/A"}</td>
                  <td>
                    <span className={`status-badge status-${receipt.status}`}>
                      {receipt.status === "pending" && "Chờ xử lý"}
                      {receipt.status === "completed" && "Hoàn thành"}
                      {receipt.status === "cancelled" && "Đã hủy"}
                    </span>
                  </td>
                  <td>
                    <Link
                      to={`/export-receipts/${receipt._id}`}
                      className="btn-view"
                    >
                      Xem chi tiết
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
