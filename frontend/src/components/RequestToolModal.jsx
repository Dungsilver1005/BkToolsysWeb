import { useState, useEffect } from "react";
import { Modal, Form, Input, Button, InputNumber, message } from "antd";
import { toolRequestService } from "../services/toolRequestService";

const { TextArea } = Input;

export const RequestToolModal = ({ open, onClose, tool, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && tool) {
      form.setFieldsValue({
        toolName: tool.category || tool.name || "",
        toolCode: tool.productCode || "",
        quantity: 1,
        purpose: "",
        expectedDuration: "",
        notes: "",
      });
    } else if (open) {
      form.resetFields();
    }
  }, [open, tool, form]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const requestData = {
        toolName: values.toolName.trim(),
        toolCode: values.toolCode.trim().toUpperCase(),
        quantity: parseInt(values.quantity) || 1,
        purpose: values.purpose.trim(),
        expectedDuration: values.expectedDuration.trim(),
        notes: values.notes?.trim() || "",
      };

      const response = await toolRequestService.createRequest(requestData);

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
      title="Tạo yêu cầu sử dụng dụng cụ"
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        autoComplete="off"
      >
        <Form.Item
          name="toolName"
          label="Tên dụng cụ"
          rules={[{ required: true, message: "Vui lòng nhập tên dụng cụ!" }]}
        >
          <Input placeholder="Nhập tên dụng cụ" />
        </Form.Item>

        <Form.Item
          name="toolCode"
          label="Mã dụng cụ"
          rules={[{ required: true, message: "Vui lòng nhập mã dụng cụ!" }]}
        >
          <Input
            placeholder="Nhập mã dụng cụ"
            onChange={(e) => {
              form.setFieldsValue({
                toolCode: e.target.value.toUpperCase(),
              });
            }}
          />
        </Form.Item>

        <Form.Item
          name="quantity"
          label="Số lượng cần thiết"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng!" },
            { type: "number", min: 1, message: "Số lượng phải lớn hơn 0!" },
          ]}
        >
          <InputNumber
            min={1}
            style={{ width: "100%" }}
            placeholder="Nhập số lượng"
          />
        </Form.Item>

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
