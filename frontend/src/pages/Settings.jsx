import { useState } from "react";
import { Card, Form, Input, Button, Typography, message, Space } from "antd";
import { LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { authService } from "../services/authService";
import { useToastContext } from "../context/ToastContext";
import "./Settings.css";

const { Title } = Typography;

export const Settings = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      showError("Mật khẩu mới và xác nhận mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      // Kiểm tra mật khẩu cũ bằng cách đăng nhập lại
      const loginResponse = await authService.login(user.username, values.currentPassword);
      if (!loginResponse.success) {
        showError("Mật khẩu hiện tại không đúng");
        setLoading(false);
        return;
      }

      // Cập nhật mật khẩu mới
      const baseURL = import.meta.env.VITE_API_BASE_URL || 
        (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
          ? "http://localhost:5000/api"
          : "https://bktoolsysweb-1.onrender.com/api");

      const response = await fetch(`${baseURL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showSuccess("Đổi mật khẩu thành công");
        form.resetFields();
      } else {
        showError(data.message || data.errors?.[0]?.msg || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      console.error("Change password error:", error);
      showError("Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-page">
      <Title level={2}>Cài đặt</Title>

      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={4}>
              <LockOutlined /> Đổi mật khẩu
            </Title>
            <p style={{ color: "#8c8c8c" }}>
              Vui lòng nhập mật khẩu hiện tại và mật khẩu mới để thay đổi mật khẩu tài khoản.
            </p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleChangePassword}
            style={{ maxWidth: 500 }}
          >
            <Form.Item
              name="currentPassword"
              label="Mật khẩu hiện tại"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu hiện tại" },
              ]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Nhập mật khẩu hiện tại"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="Mật khẩu mới"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu mới" },
                { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
              ]}
            >
              <Input.Password
                prefix={<SafetyOutlined />}
                placeholder="Nhập mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Xác nhận mật khẩu mới"
              dependencies={["newPassword"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newPassword") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<SafetyOutlined />}
                placeholder="Nhập lại mật khẩu mới"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                icon={<LockOutlined />}
              >
                Đổi mật khẩu
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

