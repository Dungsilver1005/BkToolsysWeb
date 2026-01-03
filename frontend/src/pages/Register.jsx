import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, Form, Input, Button, Typography, message } from "antd";
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  IdcardOutlined,
  BankOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import "./Register.css";

const { Title, Text } = Typography;

export const Register = () => {
  const [loading, setLoading] = useState(false);
  const { register, login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onFinish = async (values) => {
    if (values.password !== values.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp");
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = values;
      const result = await register(registerData);

      if (result.success) {
        message.success("Đăng ký thành công");
        // Tự động đăng nhập
        const loginResult = await login(values.username, values.password);
        if (loginResult.success) {
          navigate("/", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      } else {
        if (result.errors) {
          result.errors.forEach((error) => {
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
          message.error(result.message || "Đăng ký thất bại");
        }
      }
    } catch (err) {
      message.error("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <Card className="register-card">
        <div className="register-header">
          <Title level={2}>Đăng ký tài khoản</Title>
          <Text type="secondary">Hệ thống Quản lý Dụng cụ</Text>
        </div>
        <Form
          form={form}
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[
              { required: true, message: "Vui lòng nhập tên đăng nhập!" },
              { min: 3, message: "Tên đăng nhập phải có ít nhất 3 ký tự!" },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Tên đăng nhập"
              autoFocus
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không hợp lệ!" },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự!" },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu!" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error("Mật khẩu xác nhận không khớp!")
                  );
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Xác nhận mật khẩu"
            />
          </Form.Item>

          <Form.Item name="fullName">
            <Input prefix={<IdcardOutlined />} placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item name="department">
            <Input prefix={<BankOutlined />} placeholder="Phòng ban" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Đăng ký
            </Button>
          </Form.Item>
        </Form>
        <div className="register-footer">
          <Text type="secondary">
            Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};
