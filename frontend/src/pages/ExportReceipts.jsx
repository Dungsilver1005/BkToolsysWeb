import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Table,
  Button,
  Typography,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
} from "antd";
import { PlusOutlined, EyeOutlined, DeleteOutlined } from "@ant-design/icons";
import { useToastContext } from "../context/ToastContext";
import { exportReceiptService } from "../services/exportReceiptService";
import { toolService } from "../services/toolService";
import "./ExportReceipts.css";

const { Title } = Typography;
const { Option } = Select;
const { TextArea } = Input;

export const ExportReceipts = () => {
  const { showSuccess, showError } = useToastContext();
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [availableTools, setAvailableTools] = useState([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchReceipts();
  }, []);

  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableTools();
      form.resetFields();
      form.setFieldsValue({
        tools: [{ tool: undefined, quantity: 1, notes: "" }],
      });
    }
  }, [showCreateModal]);

  const fetchReceipts = async () => {
    setLoading(true);
    try {
      const response = await exportReceiptService.getExportReceipts();
      if (response.success) {
        setReceipts(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách phiếu xuất kho"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableTools = async () => {
    try {
      const response = await toolService.getTools({
        isInUse: "false",
        location: "warehouse",
        limit: 1000,
      });
      if (response.success) {
        setAvailableTools(response.data || []);
      }
    } catch (err) {
      showError("Không thể tải danh sách dụng cụ");
    }
  };

  const handleCreateReceipt = async (values) => {
    setSubmitting(true);
    try {
      const response = await exportReceiptService.createExportReceipt(values);
      if (response.success) {
        showSuccess("Tạo phiếu xuất kho thành công");
        setShowCreateModal(false);
        form.resetFields();
        fetchReceipts();
      } else {
        showError(response.message || "Tạo phiếu xuất kho thất bại");
      }
    } catch (err) {
      showError(
        err.response?.data?.message || "Có lỗi xảy ra khi tạo phiếu xuất kho"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusTag = (status) => {
    const statusMap = {
      pending: { label: "Chờ xử lý", color: "orange" },
      completed: { label: "Hoàn thành", color: "green" },
      cancelled: { label: "Đã hủy", color: "red" },
    };
    const statusInfo = statusMap[status] || { label: status, color: "default" };
    return <Tag color={statusInfo.color}>{statusInfo.label}</Tag>;
  };

  const columns = [
    {
      title: "Mã phiếu",
      dataIndex: "receiptNumber",
      key: "receiptNumber",
      width: 150,
    },
    {
      title: "Ngày xuất",
      dataIndex: "exportDate",
      key: "exportDate",
      width: 120,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Người xuất",
      key: "exportedBy",
      render: (_, record) =>
        record.exportedBy?.fullName || record.exportedBy?.username || "N/A",
    },
    {
      title: "Số lượng dụng cụ",
      key: "toolsCount",
      width: 150,
      render: (_, record) => record.tools?.length || 0,
    },
    {
      title: "Mục đích",
      dataIndex: "purpose",
      key: "purpose",
      render: (text) => text || "N/A",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      render: (text) => text || "N/A",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => getStatusTag(status),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Link to={`/export-receipts/${record._id}`}>
          <Button type="link" icon={<EyeOutlined />}>
            Xem chi tiết
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="export-receipts">
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
              Phiếu xuất kho
            </Title>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setShowCreateModal(true)}
              size="large"
            >
              Tạo phiếu xuất kho
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={receipts}
            rowKey="_id"
            loading={loading}
            pagination={{
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} phiếu`,
            }}
            scroll={{ x: 1000 }}
          />
        </Space>
      </Card>

      <Modal
        title="Tạo phiếu xuất kho"
        open={showCreateModal}
        onCancel={() => setShowCreateModal(false)}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateReceipt}
          initialValues={{
            tools: [{ tool: undefined, quantity: 1, notes: "" }],
          }}
        >
          <Form.Item name="purpose" label="Mục đích">
            <Input placeholder="Nhập mục đích xuất kho" />
          </Form.Item>

          <Form.Item name="department" label="Phòng ban">
            <Input placeholder="Nhập phòng ban" />
          </Form.Item>

          <Form.List name="tools">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space
                    key={key}
                    style={{ display: "flex", marginBottom: 8 }}
                    align="baseline"
                  >
                    <Form.Item
                      {...restField}
                      name={[name, "tool"]}
                      rules={[
                        { required: true, message: "Vui lòng chọn dụng cụ!" },
                      ]}
                      style={{ width: 300 }}
                    >
                      <Select placeholder="Chọn dụng cụ">
                        {availableTools.map((tool) => (
                          <Option key={tool._id} value={tool._id}>
                            {tool.productCode} - {tool.name}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                    <Form.Item
                      {...restField}
                      name={[name, "quantity"]}
                      rules={[{ required: true, message: "Nhập số lượng!" }]}
                      style={{ width: 100 }}
                    >
                      <InputNumber min={1} placeholder="SL" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "notes"]}>
                      <Input placeholder="Ghi chú" style={{ width: 200 }} />
                    </Form.Item>
                    {fields.length > 1 && (
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => remove(name)}
                      />
                    )}
                  </Space>
                ))}
                <Form.Item>
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm dụng cụ
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>

          <Form.Item name="notes" label="Ghi chú">
            <TextArea rows={3} placeholder="Nhập ghi chú (nếu có)" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => setShowCreateModal(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Tạo phiếu
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};
