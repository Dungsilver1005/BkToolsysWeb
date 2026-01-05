import { useState, useEffect } from "react";
import { Card, Row, Col, Descriptions, Statistic, Avatar, Typography, Spin } from "antd";
import {
  UserOutlined,
  MailOutlined,
  IdcardOutlined,
  BankOutlined,
  CrownOutlined,
  ToolOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { toolService } from "../services/toolService";
import { toolRequestService } from "../services/toolRequestService";
import "./Profile.css";

const { Title } = Typography;

export const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    toolsInUse: 0,
    totalRequests: 0,
    approvedRequests: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Lấy dụng cụ đang sử dụng
      const toolsResponse = await toolService.getToolsInUse();
      if (toolsResponse.success) {
        const myTools = toolsResponse.data?.filter(
          (tool) => {
            const userId = user?.id || user?._id;
            return (
              tool.currentUser?._id?.toString() === userId?.toString() ||
              tool.currentUser?.toString() === userId?.toString() ||
              tool.currentUser === userId
            );
          }
        ) || [];
        setStats((prev) => ({ ...prev, toolsInUse: myTools.length }));
      }

      // Lấy yêu cầu của user
      const requestsResponse = await toolRequestService.getRequests();
      if (requestsResponse.success) {
        const requests = requestsResponse.data || [];
        setStats((prev) => ({
          ...prev,
          totalRequests: requests.length,
          approvedRequests: requests.filter((r) => r.status === "approved").length,
          pendingRequests: requests.filter((r) => r.status === "pending").length,
        }));
      }
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Title level={2}>Thông tin cá nhân</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card>
            <div style={{ textAlign: "center", marginBottom: 24 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                style={{ backgroundColor: "#1890ff", marginBottom: 16 }}
              />
              <Title level={4} style={{ margin: 0 }}>
                {user?.fullName || user?.username}
              </Title>
              <p style={{ color: "#8c8c8c", marginTop: 8 }}>
                {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </p>
            </div>

            <Descriptions column={1} bordered>
              <Descriptions.Item
                label={
                  <span>
                    <IdcardOutlined /> Tên đăng nhập
                  </span>
                }
              >
                {user?.username}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <MailOutlined /> Email
                  </span>
                }
              >
                {user?.email || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <UserOutlined /> Họ và tên
                  </span>
                }
              >
                {user?.fullName || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <BankOutlined /> Phòng ban
                  </span>
                }
              >
                {user?.department || "N/A"}
              </Descriptions.Item>
              <Descriptions.Item
                label={
                  <span>
                    <CrownOutlined /> Vai trò
                  </span>
                }
              >
                {user?.role === "admin" ? "Quản trị viên" : "Người dùng"}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card>
            <Title level={4}>Thống kê hoạt động</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Card>
                  <Statistic
                    title="Dụng cụ đang sử dụng"
                    value={stats.toolsInUse}
                    prefix={<ToolOutlined />}
                    valueStyle={{ color: "#1890ff" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card>
                  <Statistic
                    title="Tổng yêu cầu"
                    value={stats.totalRequests}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card>
                  <Statistic
                    title="Yêu cầu đã duyệt"
                    value={stats.approvedRequests}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#52c41a" }}
                  />
                </Card>
              </Col>
              <Col xs={24} sm={12}>
                <Card>
                  <Statistic
                    title="Yêu cầu chờ duyệt"
                    value={stats.pendingRequests}
                    prefix={<FileTextOutlined />}
                    valueStyle={{ color: "#faad14" }}
                  />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

