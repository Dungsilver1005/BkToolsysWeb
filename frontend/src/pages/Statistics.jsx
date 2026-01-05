import { useState, useEffect } from "react";
import { Card, Row, Col, Statistic, Spin, Typography } from "antd";
import {
  ToolOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { toolService } from "../services/toolService";
import "./Statistics.css";

const { Title } = Typography;

export const Statistics = () => {
  const [stats, setStats] = useState({
    totalTools: 0,
    inUse: 0,
    unusable: 0,
    disposed: 0,
    removed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await toolService.getStatistics();
      if (response.success) {
        const data = response.data;
        
        // Tính toán các thống kê
        const totalTools = data.totalTools || 0;
        const toolsInUse = data.toolsInUse || 0;
        
        // Đếm không sử dụng được (status = unusable)
        const unusableCount = data.toolsByStatus?.find(
          (item) => item._id === "unusable"
        )?.count || 0;
        
        // Đếm đã thanh lý (location = disposed)
        const disposedCount = data.toolsByLocation?.find(
          (item) => item._id === "disposed"
        )?.count || 0;
        
        // Đếm đã loại bỏ (location = maintenance hoặc status = old)
        const maintenanceCount = data.toolsByLocation?.find(
          (item) => item._id === "maintenance"
        )?.count || 0;
        const oldCount = data.toolsByStatus?.find(
          (item) => item._id === "old"
        )?.count || 0;
        const removedCount = maintenanceCount + oldCount;

        setStats({
          totalTools,
          inUse: toolsInUse,
          unusable: unusableCount,
          disposed: disposedCount,
          removed: removedCount,
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tải thống kê");
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

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="statistics">
      <Title level={2}>Thống kê dụng cụ</Title>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Tổng số dụng cụ"
              value={stats.totalTools}
              prefix={<ToolOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đang được sử dụng"
              value={stats.inUse}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: "#52c41a" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Không sử dụng được"
              value={stats.unusable}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: "#ff4d4f" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đã thanh lý"
              value={stats.disposed}
              prefix={<DeleteOutlined />}
              valueStyle={{ color: "#8c8c8c" }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đã loại bỏ"
              value={stats.removed}
              prefix={<StopOutlined />}
              valueStyle={{ color: "#faad14" }}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};
