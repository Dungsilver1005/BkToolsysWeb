import { useState, useEffect } from "react";
import { useToastContext } from "../context/ToastContext";
import { toolRequestService } from "../services/toolRequestService";
import { Modal } from "../components/Modal";
import "./ToolRequests.css";

export const ToolRequests = () => {
  const { showSuccess, showError } = useToastContext();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [processing, setProcessing] = useState(false);

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

  const handleApprove = async (request) => {
    setProcessing(true);
    try {
      const response = await toolRequestService.approveRequest(request._id);
      if (response.success) {
        showSuccess("Duyệt yêu cầu thành công");
        fetchRequests();
      } else {
        showError(response.message || "Duyệt yêu cầu thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi duyệt yêu cầu"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showError("Vui lòng nhập lý do từ chối");
      return;
    }

    setProcessing(true);
    toolRequestService
      .rejectRequest(selectedRequest._id, rejectionReason)
      .then((response) => {
        if (response.success) {
          showSuccess("Từ chối yêu cầu thành công");
          setShowRejectModal(false);
          setRejectionReason("");
          setSelectedRequest(null);
          fetchRequests();
        } else {
          showError(response.message || "Từ chối yêu cầu thất bại");
        }
      })
      .catch((err) => {
        showError(
          err.response?.data?.message || "Có lỗi xảy ra khi từ chối yêu cầu"
        );
      })
      .finally(() => {
        setProcessing(false);
      });
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
    <div className="tool-requests-page">
      <div className="tool-requests-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Yêu cầu sử dụng dụng cụ</h1>
            <p className="page-subtitle">Duyệt và quản lý các yêu cầu sử dụng dụng cụ</p>
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
            </select>
            <span className="material-symbols-outlined dropdown-icon">expand_more</span>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="requests-table">
              <thead>
                <tr>
                  <th>Người yêu cầu</th>
                  <th>Dụng cụ</th>
                  <th>Mục đích</th>
                  <th>Thời gian dự kiến</th>
                  <th>Ngày yêu cầu</th>
                  <th>Trạng thái</th>
                  <th>Người duyệt</th>
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
                        <div className="user-info-cell">
                          <div className="user-avatar-small"></div>
                          <span>
                            {request.requestedBy?.fullName ||
                              request.requestedBy?.username ||
                              "N/A"}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div className="tool-name-cell">
                            {request.tool?.category || request.tool?.name || "N/A"}
                          </div>
                          <div className="tool-code-cell">
                            Mã: {request.tool?.productCode || "N/A"}
                          </div>
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
                        {request.reviewedBy?.fullName ||
                          request.reviewedBy?.username ||
                          "N/A"}
                      </td>
                      <td className="text-right">
                        {request.status === "pending" ? (
                          <div className="action-buttons">
                            <button
                              className="action-btn action-btn-approve"
                              onClick={() => {
                                if (
                                  window.confirm(
                                    "Bạn có chắc chắn muốn duyệt yêu cầu này?"
                                  )
                                ) {
                                  handleApprove(request);
                                }
                              }}
                              disabled={processing}
                            >
                              <span className="material-symbols-outlined">check</span>
                              Duyệt
                            </button>
                            <button
                              className="action-btn action-btn-reject"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowRejectModal(true);
                              }}
                              disabled={processing}
                            >
                              <span className="material-symbols-outlined">close</span>
                              Từ chối
                            </button>
                          </div>
                        ) : (
                          <button
                            className="action-btn"
                            onClick={() => {
                              alert(
                                `Chi tiết yêu cầu:\n\nNgười yêu cầu: ${
                                  request.requestedBy?.fullName ||
                                  request.requestedBy?.username
                                }\nDụng cụ: ${request.tool?.name} (${
                                  request.tool?.productCode
                                })\nMục đích: ${request.purpose}\nThời gian: ${
                                  request.expectedDuration
                                }${request.rejectionReason ? `\nLý do từ chối: ${request.rejectionReason}` : ""}`
                              );
                            }}
                            title="Xem chi tiết"
                          >
                            <span className="material-symbols-outlined">visibility</span>
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

      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectionReason("");
          setSelectedRequest(null);
        }}
        title="Từ chối yêu cầu"
        size="medium"
      >
        <div className="reject-modal-content">
          <div className="reject-info">
            <p>
              <strong>Người yêu cầu:</strong>{" "}
              {selectedRequest?.requestedBy?.fullName ||
                selectedRequest?.requestedBy?.username}
            </p>
            <p>
              <strong>Dụng cụ:</strong> {selectedRequest?.tool?.name} (
              {selectedRequest?.tool?.productCode})
            </p>
          </div>
          <div className="form-group">
            <label>
              <strong>Lý do từ chối *</strong>
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Nhập lý do từ chối yêu cầu..."
            />
          </div>
          <div className="form-actions">
            <button
              className="btn-cancel"
              onClick={() => {
                setShowRejectModal(false);
                setRejectionReason("");
                setSelectedRequest(null);
              }}
            >
              Hủy
            </button>
            <button
              className="btn-submit btn-danger"
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
            >
              {processing ? "Đang xử lý..." : "Từ chối"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
