import { useState, useEffect } from "react";
import { useToastContext } from "../context/ToastContext";
import { toolRequestService } from "../services/toolRequestService";
import "./MyToolRequests.css";

export const MyToolRequests = () => {
  const { showSuccess, showError } = useToastContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [returning, setReturning] = useState({});

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const filters = statusFilter ? { status: statusFilter } : {};
      const response = await toolRequestService.getRequests(filters);
      if (response.success) {
        setRequests(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const response = await toolRequestService.cancelRequest(requestId);
      if (response.success) {
        showSuccess("Hủy yêu cầu thành công");
        fetchRequests();
      } else {
        showError(response.message || "Hủy yêu cầu thất bại");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi hủy yêu cầu");
    }
  };

  const handleReturn = async (requestId) => {
    setReturning((prev) => ({ ...prev, [requestId]: true }));
    try {
      const response = await toolRequestService.returnTool(requestId);
      if (response.success) {
        showSuccess("Trả dụng cụ thành công");
        fetchRequests();
      } else {
        showError(response.message || "Trả dụng cụ thất bại");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi trả dụng cụ");
    } finally {
      setReturning((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: "Chờ duyệt", className: "status-badge status-badge-yellow" },
      approved: { label: "Đã duyệt", className: "status-badge status-badge-green" },
      rejected: { label: "Đã từ chối", className: "status-badge status-badge-red" },
      cancelled: { label: "Đã hủy", className: "status-badge status-badge-gray" },
      returned: { label: "Đã trả", className: "status-badge status-badge-blue" },
    };
    const statusInfo = statusMap[status] || statusMap.pending;
    return (
      <span className={statusInfo.className}>
        <span className="status-dot"></span>
        {statusInfo.label}
      </span>
    );
  };

  return (
    <div className="my-tool-requests-page">
      <div className="my-tool-requests-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Yêu cầu của tôi</h1>
            <p className="page-subtitle">Theo dõi trạng thái các yêu cầu sử dụng dụng cụ của bạn</p>
          </div>
          <div className="filter-select-wrapper">
            <span className="material-symbols-outlined filter-icon">filter_alt</span>
            <select
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Đã từ chối</option>
              <option value="cancelled">Đã hủy</option>
              <option value="returned">Đã trả</option>
            </select>
            <span className="material-symbols-outlined dropdown-icon">expand_more</span>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Dụng cụ</th>
                  <th>Mục đích</th>
                  <th>Thời gian dự kiến</th>
                  <th>Ngày yêu cầu</th>
                  <th>Trạng thái</th>
                  <th>Ngày duyệt</th>
                  <th>Lý do từ chối</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center loading-cell">
                      Đang tải...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center empty-cell">
                      Không có yêu cầu nào
                    </td>
                  </tr>
                ) : (
                  requests.map((request) => (
                    <tr key={request._id} className="table-row">
                      <td>
                        <div>
                          <div className="tool-name-cell">
                            {request.toolName ||
                              request.tool?.category ||
                              request.tool?.name ||
                              "N/A"}
                          </div>
                          <div className="tool-code-cell">
                            Mã: {request.toolCode || request.tool?.productCode || "N/A"}
                          </div>
                          {request.quantity && (
                            <div className="tool-quantity-cell">
                              Số lượng: {request.quantity}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="text-muted">{request.purpose || "N/A"}</td>
                      <td>{request.expectedDuration || "N/A"}</td>
                      <td>
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td>{getStatusBadge(request.status)}</td>
                      <td>
                        {request.reviewedAt
                          ? new Date(request.reviewedAt).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="text-muted">
                        {request.rejectionReason || "N/A"}
                      </td>
                      <td className="text-right">
                        {request.status === "pending" && (
                          <button
                            className="action-btn action-btn-cancel"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Bạn có chắc chắn muốn hủy yêu cầu này?"
                                )
                              ) {
                                handleCancel(request._id);
                              }
                            }}
                          >
                            <span className="material-symbols-outlined">close</span>
                            Hủy yêu cầu
                          </button>
                        )}
                        {request.status === "approved" && (
                          <button
                            className="action-btn action-btn-return"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Bạn có chắc chắn muốn trả dụng cụ về kho?"
                                )
                              ) {
                                handleReturn(request._id);
                              }
                            }}
                            disabled={returning[request._id]}
                          >
                            <span className="material-symbols-outlined">undo</span>
                            {returning[request._id] ? "Đang trả..." : "Trả dụng cụ"}
                          </button>
                        )}
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
