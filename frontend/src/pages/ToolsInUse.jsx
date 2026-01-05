import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toolService } from "../services/toolService";
import { toolRequestService } from "../services/toolRequestService";
import { useAuth } from "../context/AuthContext";
import { useToastContext } from "../context/ToastContext";
import "./ToolsInUse.css";

export const ToolsInUse = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToastContext();
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [returning, setReturning] = useState({});

  useEffect(() => {
    fetchToolsInUse();
  }, []);

  const fetchToolsInUse = async () => {
    setLoading(true);
    try {
      const response = await toolService.getToolsInUse();
      if (response.success) {
        setTools(response.data || []);
      }
    } catch (err) {
      showError(
        err.response?.data?.message ||
          "Có lỗi xảy ra khi tải danh sách dụng cụ đang sử dụng"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReturnTool = async (tool) => {
    setReturning({ ...returning, [tool._id]: true });
    try {
      const requestsResponse = await toolRequestService.getRequests({
        tool: tool._id,
        status: "approved",
      });

      if (requestsResponse.success && requestsResponse.data?.length > 0) {
        const request = requestsResponse.data[0];
        const response = await toolRequestService.returnTool(request._id);
        if (response.success) {
          showSuccess("Trả dụng cụ thành công");
          fetchToolsInUse();
        } else {
          showError(response.message || "Trả dụng cụ thất bại");
        }
      } else {
        showError("Không tìm thấy yêu cầu liên quan. Vui lòng liên hệ admin.");
      }
    } catch (err) {
      showError(err.response?.data?.message || "Có lỗi xảy ra khi trả dụng cụ");
    } finally {
      setReturning({ ...returning, [tool._id]: false });
    }
  };

  const isMyTool = (tool) => {
    const userId = user?.id || user?._id;
    return (
      tool.currentUser?._id?.toString() === userId?.toString() ||
      tool.currentUser?.toString() === userId?.toString() ||
      tool.currentUser === userId
    );
  };

  const getToolIcon = (category) => {
    if (category?.toLowerCase().includes("khoan")) return "handyman";
    if (category?.toLowerCase().includes("cnc")) return "precision_manufacturing";
    if (category?.toLowerCase().includes("cờ lê") || category?.toLowerCase().includes("bộ")) return "build";
    if (category?.toLowerCase().includes("hàn")) return "flash_on";
    if (category?.toLowerCase().includes("thước")) return "square_foot";
    return "handyman";
  };

  return (
    <div className="tools-in-use-page">
      <div className="tools-in-use-content">
        <div className="page-header">
          <div>
            <h1 className="page-title">Dụng cụ đang sử dụng</h1>
            <p className="page-subtitle">Danh sách dụng cụ đang được sử dụng bởi người dùng</p>
          </div>
        </div>

        <div className="table-card">
          <div className="table-wrapper">
            <table className="tools-table">
              <thead>
                <tr>
                  <th>Tên dụng cụ</th>
                  <th>Mã số</th>
                  <th>Loại dụng cụ</th>
                  <th>Người sử dụng</th>
                  <th>Số lần sử dụng</th>
                  <th>Lần sử dụng cuối</th>
                  <th className="text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center loading-cell">
                      Đang tải...
                    </td>
                  </tr>
                ) : tools.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center empty-cell">
                      Không có dụng cụ nào đang sử dụng
                    </td>
                  </tr>
                ) : (
                  tools.map((tool) => (
                    <tr key={tool._id} className="table-row">
                      <td>
                        <div className="tool-info-cell">
                          <div className="tool-icon-wrapper">
                            <span className="material-symbols-outlined">
                              {getToolIcon(tool.category)}
                            </span>
                          </div>
                          <div>
                            <Link to={`/tools/${tool._id}`} className="tool-name">
                              {tool.category || tool.name || "N/A"}
                            </Link>
                            <p className="tool-model">
                              {tool.characteristics?.model
                                ? `Model: ${tool.characteristics.model}`
                                : tool.name || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="tool-code">{tool.productCode || "N/A"}</td>
                      <td>{tool.category || "N/A"}</td>
                      <td>
                        {tool.currentUser?.fullName ||
                          tool.currentUser?.username ||
                          "N/A"}
                      </td>
                      <td>{tool.usageCount || 0}</td>
                      <td>
                        {tool.lastUsedDate
                          ? new Date(tool.lastUsedDate).toLocaleString("vi-VN")
                          : "N/A"}
                      </td>
                      <td className="text-right">
                        {isMyTool(tool) && (
                          <button
                            className="btn-return"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Bạn có chắc chắn muốn trả dụng cụ về kho?"
                                )
                              ) {
                                handleReturnTool(tool);
                              }
                            }}
                            disabled={returning[tool._id]}
                          >
                            {returning[tool._id] ? "Đang trả..." : "Trả dụng cụ"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
