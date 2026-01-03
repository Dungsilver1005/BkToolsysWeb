import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Select,
  Modal,
  Input,
  message,
  Popconfirm,
} from "antd";
import { CheckOutlined, CloseOutlined, EyeOutlined } from "@ant-design/icons";
import { useToastContext } from "../context/ToastContext";
import { toolRequestService } from "../services/toolRequestService";
import { ConfirmDialog } from "../components/ConfirmDialog";
import "./ToolRequests.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

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
      message.error("Vui lòng nhập lý do từ chối");
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

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { label: "Chờ duyệt", color: "orange" },
      approved: { label: "Đã duyệt", color: "green" },
      rejected: { label: "Đã từ chối", color: "red" },
      cancelled: { label: "Đã hủy", color: "default" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "default" };
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  const columns = [
    {
      title: "Người yêu cầu",
      key: "requestedBy",
      width: 150,
      render: (_, record) =>
        record.requestedBy?.fullName || record.requestedBy?.username || "N/A",
    },
    {
      title: "Dụng cụ",
      key: "tool",
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 600 }}>{record.tool?.name || "N/A"}</div>
          <div style={{ fontSize: 12, color: "#999" }}>
            Mã: {record.tool?.productCode || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Mục đích",
      dataIndex: "purpose",
      key: "purpose",
      ellipsis: true,
    },
    {
      title: "Thời gian dự kiến",
      dataIndex: "expectedDuration",
      key: "expectedDuration",
      width: 150,
    },
    {
      title: "Ngày yêu cầu",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 150,
      render: (date) => new Date(date).toLocaleString("vi-VN"),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Người duyệt",
      key: "reviewedBy",
      width: 150,
      render: (_, record) =>
        record.reviewedBy?.fullName || record.reviewedBy?.username || "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        if (record.status !== "pending") {
          return (
            <Button
              type="link"
              icon={<EyeOutlined />}
              onClick={() => {
                Modal.info({
                  title: "Chi tiết yêu cầu",
                  width: 600,
                  content: (
                    <div>
                      <p>
                        <strong>Người yêu cầu:</strong>{" "}
                        {record.requestedBy?.fullName ||
                          record.requestedBy?.username}
                      </p>
                      <p>
                        <strong>Dụng cụ:</strong> {record.tool?.name} (
                        {record.tool?.productCode})
                      </p>
                      <p>
                        <strong>Mục đích:</strong> {record.purpose}
                      </p>
                      <p>
                        <strong>Thời gian dự kiến:</strong>{" "}
                        {record.expectedDuration}
                      </p>
                      {record.notes && (
                        <p>
                          <strong>Ghi chú:</strong> {record.notes}
                        </p>
                      )}
                      {record.rejectionReason && (
                        <p>
                          <strong>Lý do từ chối:</strong>{" "}
                          {record.rejectionReason}
                        </p>
                      )}
                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        {getStatusTag(record.status)}
                      </p>
                    </div>
                  ),
                });
              }}
            >
              Xem chi tiết
            </Button>
          );
        }

        return (
          <Space>
            <Popconfirm
              title="Duyệt yêu cầu này?"
              description="Dụng cụ sẽ được gán cho người yêu cầu."
              onConfirm={() => handleApprove(record)}
              okText="Duyệt"
              cancelText="Hủy"
              okButtonProps={{ loading: processing }}
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                disabled={processing}
              >
                Duyệt
              </Button>
            </Popconfirm>
            <Button
              type="default"
              danger
              size="small"
              icon={<CloseOutlined />}
              onClick={() => {
                setSelectedRequest(record);
                setShowRejectModal(true);
              }}
              disabled={processing}
            >
              Từ chối
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="tool-requests">
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Title level={2} style={{ margin: 0 }}>
              Yêu cầu sử dụng dụng cụ
            </Title>
            <Select
              placeholder="Lọc theo trạng thái"
              value={statusFilter || undefined}
              onChange={(value) => setStatusFilter(value)}
              allowClear
              style={{ width: 200 }}
            >
              <Option value="pending">Chờ duyệt</Option>
              <Option value="approved">Đã duyệt</Option>
              <Option value="rejected">Đã từ chối</Option>
              <Option value="cancelled">Đã hủy</Option>
            </Select>
          </div>

          <Table
            columns={columns}
            dataSource={requests}
            rowKey="_id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} yêu cầu`,
            }}
            scroll={{ x: 1200 }}
          />
        </Space>
      </Card>

      <Modal
        title="Từ chối yêu cầu"
        open={showRejectModal}
        onOk={handleReject}
        onCancel={() => {
          setShowRejectModal(false);
          setRejectionReason("");
          setSelectedRequest(null);
        }}
        okText="Từ chối"
        cancelText="Hủy"
        okButtonProps={{ danger: true, loading: processing }}
      >
        <div style={{ marginBottom: 16 }}>
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
        <div>
          <label style={{ display: "block", marginBottom: 8 }}>
            <strong>Lý do từ chối *</strong>
          </label>
          <TextArea
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Nhập lý do từ chối yêu cầu..."
          />
        </div>
      </Modal>
    </div>
  );
};
