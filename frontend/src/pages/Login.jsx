import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { Logo } from "../components/Logo";
import "./Login.css";

const { Title, Text } = Typography;

export const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success) {
        message.success("Đăng nhập thành công");
        navigate("/", { replace: true });
      } else {
        message.error(result.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <Logo size="large" />
          </div>
          <Title level={2}>Đăng nhập</Title>
          <Text type="secondary">Hệ thống Quản lý Dụng cụ</Text>
        </div>
        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
        <div className="login-footer">
          <Text type="secondary">
            Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};
