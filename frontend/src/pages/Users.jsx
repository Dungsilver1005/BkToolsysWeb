import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, Table, Typography, Tag, Button } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import { useToastContext } from "../context/ToastContext";
import { userService } from "../services/userService";
import "./Users.css";

const { Title } = Typography;

export const Users = () => {
  const { showError } = useToastContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách người dùng"
      );
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: "Tên đăng nhập",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Họ tên",
      dataIndex: "fullName",
      key: "fullName",
      render: (text) => text || "N/A",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Phòng ban",
      dataIndex: "department",
      key: "department",
      render: (text) => text || "N/A",
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      render: (role) => (
        <Tag color={role === "admin" ? "red" : "blue"}>
          {role === "admin" ? "Quản trị viên" : "Người dùng"}
        </Tag>
      ),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Link to={`/users/${record._id}`}>
          <Button type="link" icon={<EyeOutlined />}>
            Xem chi tiết
          </Button>
        </Link>
      ),
    },
  ];

  return (
    <div className="users">
      <Card>
        <Title level={2} style={{ marginBottom: 24 }}>
          Quản lý người dùng
        </Title>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={{
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} người dùng`,
          }}
        />
      </Card>
    </div>
  );
};
