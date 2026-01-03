import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, message } from "antd";
import { toolRequestService } from "../services/toolRequestService";

const { TextArea } = Input;

export const RequestToolModal = ({ open, onClose, tool, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const response = await toolRequestService.createRequest({
        tool: tool._id,
        purpose: values.purpose,
        expectedDuration: values.expectedDuration,
        notes: values.notes || "",
      });

      if (response.success) {
        message.success("Gửi yêu cầu thành công");
        form.resetFields();
        onSuccess();
        onClose();
      } else {
        message.error(response.message || "Gửi yêu cầu thất bại");
      }
    } catch (err) {
      if (err.response?.data?.errors) {
        // Validation errors
        const errors = err.response.data.errors;
        errors.forEach((error) => {
          const field = error.path || error.param;
          if (field) {
            form.setFields([
              {
                name: field,
                errors: [error.msg],
              },
            ]);
          }
        });
      } else {
        message.error(
          err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Yêu cầu sử dụng dụng cụ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {tool && (
        <div style={{ marginBottom: 16 }}>
          <p>
            <strong>Dụng cụ:</strong> {tool.name} ({tool.productCode})
          </p>
        </div>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="purpose"
          label="Mục đích sử dụng"
          rules={[
            { required: true, message: "Vui lòng nhập mục đích sử dụng!" },
          ]}
        >
          <TextArea rows={3} placeholder="Nhập mục đích sử dụng dụng cụ..." />
        </Form.Item>

        <Form.Item
          name="expectedDuration"
          label="Thời gian dự kiến"
          rules={[
            { required: true, message: "Vui lòng nhập thời gian dự kiến!" },
          ]}
        >
          <Input placeholder="Ví dụ: 1 tuần, 2 tháng, 3 ngày..." />
        </Form.Item>

        <Form.Item name="notes" label="Ghi chú (tùy chọn)">
          <TextArea rows={2} placeholder="Nhập ghi chú nếu có..." />
        </Form.Item>

        <Form.Item>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
            <Button onClick={onClose}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Gửi yêu cầu
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};
