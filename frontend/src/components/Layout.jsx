import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  Layout as AntLayout,
  Menu,
  Avatar,
  Dropdown,
  Space,
  Typography,
  Badge,
} from "antd";
import {
  DashboardOutlined,
  ToolOutlined,
  InboxOutlined,
  UserOutlined,
  BarChartOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SettingOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { Logo } from "./Logo";
import "./Layout.css";

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;

export const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: "/tools",
      icon: <ToolOutlined />,
      label: <Link to="/tools">Dụng cụ</Link>,
    },
    ...(!isAdmin
      ? [
          {
            key: "/tools-in-use",
            icon: <InboxOutlined />,
            label: <Link to="/tools-in-use">Dụng cụ đang sử dụng</Link>,
          },
          {
            key: "/my-requests",
            icon: <FileTextOutlined />,
            label: <Link to="/my-requests">Yêu cầu của tôi</Link>,
          },
        ]
      : [
          {
            key: "/export-receipts",
            icon: <InboxOutlined />,
            label: <Link to="/export-receipts">Phiếu xuất kho</Link>,
          },
          {
            key: "/tool-requests",
            icon: <FileTextOutlined />,
            label: <Link to="/tool-requests">Yêu cầu sử dụng</Link>,
          },
          {
            key: "/users",
            icon: <UserOutlined />,
            label: <Link to="/users">Người dùng</Link>,
          },
        ]),
    {
      key: "/statistics",
      icon: <BarChartOutlined />,
      label: <Link to="/statistics">Thống kê</Link>,
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      disabled: true,
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const selectedKeys = [location.pathname];
  if (location.pathname.startsWith("/tools/")) {
    selectedKeys[0] = "/tools";
  }
  if (location.pathname.startsWith("/users/")) {
    selectedKeys[0] = "/users";
  }
  if (location.pathname.startsWith("/export-receipts/")) {
    selectedKeys[0] = "/export-receipts";
  }
  if (location.pathname.startsWith("/tool-requests")) {
    selectedKeys[0] = "/tool-requests";
  }
  if (location.pathname.startsWith("/my-requests")) {
    selectedKeys[0] = "/my-requests";
  }

  return (
    <AntLayout className="admin-layout" style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        className="admin-sidebar"
        style={{
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="logo">
          <Logo collapsed={collapsed} size="medium" />
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          className="admin-menu"
        />
      </Sider>
      <AntLayout
        className="site-layout"
        style={{ marginLeft: collapsed ? 80 : 250 }}
      >
        <Header
          className="admin-header"
          style={{
            padding: "0 24px",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {React.createElement(
              collapsed ? MenuUnfoldOutlined : MenuFoldOutlined,
              {
                className: "trigger",
                onClick: () => setCollapsed(!collapsed),
                style: { fontSize: 18, cursor: "pointer" },
              }
            )}
            <Text strong style={{ fontSize: 18, color: "#1890ff" }}>
              Hệ thống Quản lý Dụng cụ
            </Text>
          </div>
          <Space size="middle">
            <Badge count={0} showZero>
              <Avatar
                style={{ backgroundColor: "#1890ff", cursor: "pointer" }}
                icon={<UserOutlined />}
              />
            </Badge>
            <Dropdown
              menu={{ items: userMenuItems }}
              placement="bottomRight"
              arrow
            >
              <Space style={{ cursor: "pointer" }}>
                <div style={{ textAlign: "right" }}>
                  <Text strong>{user?.fullName || user?.username}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {isAdmin ? "Quản trị viên" : "Người dùng"}
                  </Text>
                </div>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          className="admin-content"
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#f0f2f5",
          }}
        >
          {children}
        </Content>
      </AntLayout>
    </AntLayout>
  );
};
