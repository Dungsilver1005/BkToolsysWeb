import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Select,
  Popconfirm,
  message,
} from "antd";
import { CloseOutlined, EyeOutlined, UndoOutlined } from "@ant-design/icons";
import { useToastContext } from "../context/ToastContext";
import { toolRequestService } from "../services/toolRequestService";
import "./MyToolRequests.css";

const { Title } = Typography;
const { Option } = Select;

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
    setReturning({ ...returning, [requestId]: true });
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
      setReturning({ ...returning, [requestId]: false });
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { label: "Chờ duyệt", color: "orange" },
      approved: { label: "Đã duyệt", color: "green" },
      rejected: { label: "Đã từ chối", color: "red" },
      cancelled: { label: "Đã hủy", color: "default" },
      returned: { label: "Đã trả", color: "blue" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "default" };
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  const columns = [
    {
      title: "Dụng cụ",
      key: "tool",
      width: 250,
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
      title: "Ngày duyệt",
      key: "reviewedAt",
      width: 150,
      render: (_, record) =>
        record.reviewedAt
          ? new Date(record.reviewedAt).toLocaleString("vi-VN")
          : "N/A",
    },
    {
      title: "Lý do từ chối",
      dataIndex: "rejectionReason",
      key: "rejectionReason",
      ellipsis: true,
      render: (text) => text || "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        if (record.status === "pending") {
          return (
            <Popconfirm
              title="Hủy yêu cầu này?"
              description="Bạn có chắc chắn muốn hủy yêu cầu?"
              onConfirm={() => handleCancel(record._id)}
              okText="Hủy"
              cancelText="Không"
              okButtonProps={{ danger: true }}
            >
              <Button type="link" danger size="small" icon={<CloseOutlined />}>
                Hủy yêu cầu
              </Button>
            </Popconfirm>
          );
        }
        if (record.status === "approved" && record.tool?.isInUse) {
          return (
            <Popconfirm
              title="Trả dụng cụ này?"
              description="Bạn có chắc chắn muốn trả dụng cụ về kho?"
              onConfirm={() => handleReturn(record._id)}
              okText="Trả"
              cancelText="Hủy"
              okButtonProps={{ loading: returning[record._id] }}
            >
              <Button
                type="primary"
                size="small"
                icon={<UndoOutlined />}
                loading={returning[record._id]}
              >
                Trả dụng cụ
              </Button>
            </Popconfirm>
          );
        }
        return null;
      },
    },
  ];

  return (
    <div className="my-tool-requests">
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
              Yêu cầu của tôi
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
              <Option value="returned">Đã trả</Option>
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
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>
    </div>
  );
};
