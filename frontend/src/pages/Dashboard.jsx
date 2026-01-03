import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, Row, Col, Statistic, Typography, Space, Spin } from "antd";
import {
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useAuth } from "../context/AuthContext";
import { toolService } from "../services/toolService";
import "./Dashboard.css";

const { Title, Text } = Typography;

export const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalTools: 0,
    toolsInUse: 0,
    toolsAvailable: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await toolService.getStatistics();
        if (response.success) {
          const data = response.data;
          setStats({
            totalTools: data.totalTools || 0,
            toolsInUse: data.toolsInUse || 0,
            toolsAvailable: (data.totalTools || 0) - (data.toolsInUse || 0),
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="dashboard">
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={2}>Dashboard</Title>
          <Text type="secondary">
            Chào mừng, <Text strong>{user?.fullName || user?.username}</Text>!
          </Text>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Tổng số dụng cụ"
                value={stats.loading ? 0 : stats.totalTools}
                prefix={<ToolOutlined />}
                valueStyle={{ color: "#1890ff" }}
                loading={stats.loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Đang sử dụng"
                value={stats.loading ? 0 : stats.toolsInUse}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: "#faad14" }}
                loading={stats.loading}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Card>
              <Statistic
                title="Có sẵn"
                value={stats.loading ? 0 : stats.toolsAvailable}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: "#52c41a" }}
                loading={stats.loading}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Thao tác nhanh">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={8}>
              <Link to="/tools">
                <Card
                  hoverable
                  className="action-card"
                  style={{ textAlign: "center" }}
                >
                  <ToolOutlined style={{ fontSize: 32, color: "#1890ff" }} />
                  <Title level={4} style={{ marginTop: 16 }}>
                    Quản lý dụng cụ
                  </Title>
                  <Text type="secondary">Xem và quản lý danh sách dụng cụ</Text>
                </Card>
              </Link>
            </Col>
            {isAdmin && (
              <>
                <Col xs={24} sm={12} lg={8}>
                  <Link to="/export-receipts">
                    <Card
                      hoverable
                      className="action-card"
                      style={{ textAlign: "center" }}
                    >
                      <FileTextOutlined
                        style={{ fontSize: 32, color: "#52c41a" }}
                      />
                      <Title level={4} style={{ marginTop: 16 }}>
                        Phiếu xuất kho
                      </Title>
                      <Text type="secondary">Quản lý phiếu xuất kho</Text>
                    </Card>
                  </Link>
                </Col>
                <Col xs={24} sm={12} lg={8}>
                  <Link to="/users">
                    <Card
                      hoverable
                      className="action-card"
                      style={{ textAlign: "center" }}
                    >
                      <UserOutlined
                        style={{ fontSize: 32, color: "#faad14" }}
                      />
                      <Title level={4} style={{ marginTop: 16 }}>
                        Quản lý người dùng
                      </Title>
                      <Text type="secondary">Quản lý tài khoản người dùng</Text>
                    </Card>
                  </Link>
                </Col>
              </>
            )}
            <Col xs={24} sm={12} lg={8}>
              <Link to="/statistics">
                <Card
                  hoverable
                  className="action-card"
                  style={{ textAlign: "center" }}
                >
                  <BarChartOutlined
                    style={{ fontSize: 32, color: "#722ed1" }}
                  />
                  <Title level={4} style={{ marginTop: 16 }}>
                    Thống kê
                  </Title>
                  <Text type="secondary">Xem báo cáo và thống kê</Text>
                </Card>
              </Link>
            </Col>
          </Row>
        </Card>
      </Space>
    </div>
  );
};
