import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Card,
  Table,
  Input,
  Select,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  message,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { useToastContext } from "../context/ToastContext";
import { Modal } from "../components/Modal";
import { RequestToolModal } from "../components/RequestToolModal";
import { ToolForm } from "../components/ToolForm";
import { toolService } from "../services/toolService";
import { toolRequestService } from "../services/toolRequestService";
import "./ToolsList.css";

const { Title } = Typography;
const { Option } = Select;

export const ToolsList = () => {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin, user } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    isInUse: "",
    location: "",
    category: "",
    page: 1,
    limit: 20,
  });
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    fetchTools();
    if (!isAdmin && user) {
      fetchPendingRequests();
    }
  }, [filters, isAdmin, user]);

  const fetchPendingRequests = async () => {
    try {
      const response = await toolRequestService.getRequests({
        status: "pending",
      });
      if (response.success) {
        setPendingRequests(response.data || []);
      }
    } catch (err) {
      // Silent fail - không ảnh hưởng đến UI chính
      console.error("Error fetching pending requests:", err);
    }
  };

  const fetchTools = async () => {
    setLoading(true);
    try {
      // Map filter status từ UI sang backend
      const backendFilters = { ...filters };
      if (backendFilters.status === "in_use") {
        backendFilters.isInUse = "true";
        delete backendFilters.status;
      } else if (backendFilters.status === "unusable") {
        backendFilters.status = "unusable";
      } else if (backendFilters.status === "disposed") {
        backendFilters.location = "disposed";
        delete backendFilters.status;
      } else if (backendFilters.status === "removed") {
        backendFilters.location = "maintenance";
        delete backendFilters.status;
      }

      const response = await toolService.getTools(backendFilters);
      if (response.success) {
        setTools(response.data || []);
        setPagination({
          total: response.total || 0,
          page: response.page || 1,
          pages: response.pages || 1,
        });
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi tải danh sách dụng cụ"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleTableChange = (pagination) => {
    setFilters((prev) => ({ ...prev, page: pagination.current }));
  };

  const handleCreateTool = async (formData) => {
    setSubmitting(true);
    try {
      const response = await toolService.createTool(formData);
      if (response.success) {
        showSuccess("Tạo dụng cụ thành công");
        setShowCreateModal(false);
        fetchTools();
      } else {
        showError(response.message || "Tạo dụng cụ thất bại");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi tạo dụng cụ");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRequestTool = (tool) => {
    setSelectedTool(tool);
    setShowRequestModal(true);
  };

  const handleRequestSuccess = () => {
    fetchPendingRequests();
    fetchTools();
  };

  const hasPendingRequest = (toolId) => {
    return pendingRequests.some(
      (req) => req.tool._id === toolId || req.tool === toolId
    );
  };

  const canRequestTool = (tool) => {
    if (isAdmin) return false;
    if (tool.isInUse) return false;
    if (tool.location !== "warehouse") return false;
    if (hasPendingRequest(tool._id)) return false;
    return true;
  };

  const getStatusTag = (record) => {
    // Đang được sử dụng: isInUse = true
    if (record.isInUse) {
      return <Tag color="blue">Đang được sử dụng</Tag>;
    }
    // Không sử dụng được: status = unusable
    if (record.status === "unusable") {
      return <Tag color="error">Không sử dụng được</Tag>;
    }
    // Đã thanh lý: location = disposed
    if (record.location === "disposed") {
      return <Tag color="default">Đã thanh lý</Tag>;
    }
    // Đã loại bỏ: location = maintenance hoặc status = old
    if (record.location === "maintenance" || record.status === "old") {
      return <Tag color="orange">Đã loại bỏ</Tag>;
    }
    // Mặc định: Sử dụng được
    return <Tag color="success">Sử dụng được</Tag>;
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 150,
      render: (text, record) => (
        <Link to={`/tools/${record._id}`} style={{ fontWeight: 600 }}>
          {text}
        </Link>
      ),
    },
    {
      title: "Loại dụng cụ",
      dataIndex: "category",
      key: "category",
      width: 200,
      render: (text, record) => (
        <Link to={`/tools/${record._id}`}>{text || "N/A"}</Link>
      ),
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 180,
      render: (_, record) => getStatusTag(record),
    },
    {
      title: "Vị trí",
      dataIndex: "location",
      key: "location",
      width: 120,
      render: (location) => {
        const locationMap = {
          warehouse: "Kho",
          in_use: "Đang sử dụng",
          maintenance: "Bảo trì",
          disposed: "Đã thanh lý",
        };
        return locationMap[location] || location;
      },
    },
    {
      title: "Thương hiệu",
      dataIndex: ["characteristics", "brand"],
      key: "brand",
      width: 150,
      render: (text) => text || "N/A",
    },
  ];

  // Add action column for non-admin users
  if (!isAdmin) {
    columns.push({
      title: "Thao tác",
      key: "action",
      width: 150,
      fixed: "right",
      render: (_, record) => {
        const canRequest = canRequestTool(record);
        const hasPending = hasPendingRequest(record._id);

        if (hasPending) {
          return <Tag color="orange">Đã gửi yêu cầu</Tag>;
        }

        return (
          <Button
            type="primary"
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => handleRequestTool(record)}
            disabled={!canRequest}
          >
            Yêu cầu sử dụng
          </Button>
        );
      },
    });
  }

  return (
    <div className="tools-list">
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
              Danh sách dụng cụ
            </Title>
            {isAdmin && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowCreateModal(true)}
                size="large"
              >
                Thêm dụng cụ
              </Button>
            )}
          </div>

          <Card size="small">
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tìm kiếm theo tên loại dụng cụ..."
                  prefix={<SearchOutlined />}
                  value={filters.category}
                  onChange={(e) => handleFilterChange("category", e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Input
                  placeholder="Tìm kiếm mã sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Trạng thái"
                  value={filters.status || undefined}
                  onChange={(value) => handleFilterChange("status", value)}
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="in_use">Đang được sử dụng</Option>
                  <Option value="unusable">Không sử dụng được</Option>
                  <Option value="disposed">Đã thanh lý</Option>
                  <Option value="removed">Đã loại bỏ</Option>
                </Select>
              </Col>
              <Col xs={24} sm={12} md={8} lg={6}>
                <Select
                  placeholder="Vị trí"
                  value={filters.location || undefined}
                  onChange={(value) => handleFilterChange("location", value)}
                  allowClear
                  style={{ width: "100%" }}
                >
                  <Option value="warehouse">Kho</Option>
                  <Option value="in_use">Đang sử dụng</Option>
                  <Option value="maintenance">Bảo trì</Option>
                  <Option value="disposed">Đã thanh lý</Option>
                </Select>
              </Col>
            </Row>
          </Card>

          <Table
            columns={columns}
            dataSource={tools}
            rowKey="_id"
            loading={loading}
            pagination={{
              current: pagination.page,
              total: pagination.total,
              pageSize: filters.limit,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} dụng cụ`,
            }}
            onChange={handleTableChange}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Thêm dụng cụ mới"
        size="large"
      >
        <ToolForm
          onSubmit={handleCreateTool}
          onCancel={() => setShowCreateModal(false)}
          loading={submitting}
        />
      </Modal>

      {!isAdmin && (
        <RequestToolModal
          open={showRequestModal}
          onClose={() => {
            setShowRequestModal(false);
            setSelectedTool(null);
          }}
          tool={selectedTool}
          onSuccess={handleRequestSuccess}
        />
      )}
    </div>
  );
};
