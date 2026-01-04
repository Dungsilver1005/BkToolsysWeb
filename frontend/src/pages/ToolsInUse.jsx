import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Popconfirm,
  message,
} from "antd";
import { UndoOutlined } from "@ant-design/icons";
import { toolService } from "../services/toolService";
import { toolRequestService } from "../services/toolRequestService";
import { useAuth } from "../context/AuthContext";
import { useToastContext } from "../context/ToastContext";
import "./ToolsInUse.css";

const { Title } = Typography;

export const ToolsInUse = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState({});

  useEffect(() => {
    fetchToolsInUse();
  }, []);

  const fetchToolsInUse = async () => {
    setLoading(true);
    try {
      const response = await toolService.getToolsInUse();
      if (response.success) {
        setTools(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách dụng cụ đang sử dụng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReturnTool = async (tool) => {
    setReturning({ ...returning, [tool._id]: true });
    try {
      // Tìm yêu cầu đã approved cho tool này của user hiện tại
      const requestsResponse = await toolRequestService.getRequests({
        tool: tool._id,
        status: "approved",
      });

      if (requestsResponse.success && requestsResponse.data?.length > 0) {
        // Lấy yêu cầu đầu tiên (nên chỉ có 1 yêu cầu approved cho 1 tool)
        const request = requestsResponse.data[0];
        const response = await toolRequestService.returnTool(request._id);
        if (response.success) {
          showSuccess("Trả dụng cụ thành công");
          fetchToolsInUse();
        } else {
          showError(response.message || "Trả dụng cụ thất bại");
        }
      } else {
        // Nếu không tìm thấy request, vẫn cho phép trả dụng cụ trực tiếp
        // (trường hợp dụng cụ được gán qua export receipt)
        showError("Không tìm thấy yêu cầu liên quan. Vui lòng liên hệ admin.");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi trả dụng cụ");
    } finally {
      setReturning({ ...returning, [tool._id]: false });
    }
  };

  const isMyTool = (tool) => {
    return (
      tool.currentUser?._id === user?._id || tool.currentUser === user?._id
    );
  };

  const columns = [
    {
      title: "Tên dụng cụ",
      key: "name",
      width: 200,
      render: (_, record) => (
        <Link to={`/tools/${record._id}`} style={{ fontWeight: 600 }}>
          {record.name}
        </Link>
      ),
    },
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 150,
    },
    {
      title: "Danh mục",
      dataIndex: "category",
      key: "category",
      width: 150,
    },
    {
      title: "Người sử dụng",
      key: "currentUser",
      width: 150,
      render: (_, record) =>
        record.currentUser?.fullName || record.currentUser?.username || "N/A",
    },
    {
      title: "Số lần sử dụng",
      dataIndex: "usageCount",
      key: "usageCount",
      width: 120,
    },
    {
      title: "Lần sử dụng cuối",
      key: "lastUsedDate",
      width: 150,
      render: (_, record) =>
        record.lastUsedDate
          ? new Date(record.lastUsedDate).toLocaleString("vi-VN")
          : "N/A",
    },
    {
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        if (isMyTool(record)) {
          return (
            <Popconfirm
              title="Trả dụng cụ này?"
              description="Bạn có chắc chắn muốn trả dụng cụ về kho?"
              onConfirm={() => handleReturnTool(record)}
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
    <div className="tools-in-use">
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          Dụng cụ đang sử dụng
        </Title>

        <Table
          columns={columns}
          dataSource={tools}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} dụng cụ`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};
