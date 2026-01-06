import { useState, useEffect } from "react";
import "./ToolForm.css";

export const ToolForm = ({
  tool = null,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    productCode: "",
    name: "",
    category: "",
    status: "new",
    location: "warehouse",
    geometry: {
      length: "",
      width: "",
      height: "",
      diameter: "",
      shape: "",
      material: "",
    },
    characteristics: {
      hardness: "",
      coating: "",
      brand: "",
      model: "",
      specifications: "",
    },
    cuttingParameters: {
      speed: "",
      feed: "",
      depth: "",
      notes: "",
    },
    catalogInfo: {
      manufacturer: "",
      catalogNumber: "",
      source: "manufacturer",
      reference: "",
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (tool) {
      setFormData({
        productCode: tool.productCode || "",
        name: tool.name || "",
        category: tool.category || "",
        status: tool.status || "new",
        location: tool.location || "warehouse",
        geometry: {
          length: tool.geometry?.length || "",
          width: tool.geometry?.width || "",
          height: tool.geometry?.height || "",
          diameter: tool.geometry?.diameter || "",
          shape: tool.geometry?.shape || "",
          material: tool.geometry?.material || "",
        },
        characteristics: {
          hardness: tool.characteristics?.hardness || "",
          coating: tool.characteristics?.coating || "",
          brand: tool.characteristics?.brand || "",
          model: tool.characteristics?.model || "",
          specifications: tool.characteristics?.specifications || "",
        },
        cuttingParameters: {
          speed: tool.cuttingParameters?.speed || "",
          feed: tool.cuttingParameters?.feed || "",
          depth: tool.cuttingParameters?.depth || "",
          notes: tool.cuttingParameters?.notes || "",
        },
        catalogInfo: {
          manufacturer: tool.catalogInfo?.manufacturer || "",
          catalogNumber: tool.catalogInfo?.catalogNumber || "",
          source: tool.catalogInfo?.source || "manufacturer",
          reference: tool.catalogInfo?.reference || "",
        },
      });
    }
  }, [tool]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const checked = e.target.checked;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }

    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.productCode.trim()) {
      newErrors.productCode = "Vui lòng nhập mã sản phẩm";
    }
    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên dụng cụ";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Clean up empty values
      const cleanedData = { ...formData };

      // Clean geometry
      Object.keys(cleanedData.geometry).forEach((key) => {
        if (cleanedData.geometry[key] === "") {
          delete cleanedData.geometry[key];
        } else if (["length", "width", "height", "diameter"].includes(key)) {
          cleanedData.geometry[key] = Number(cleanedData.geometry[key]);
        }
      });
      if (Object.keys(cleanedData.geometry).length === 0) {
        delete cleanedData.geometry;
      }

      // Clean characteristics
      Object.keys(cleanedData.characteristics).forEach((key) => {
        if (cleanedData.characteristics[key] === "") {
          delete cleanedData.characteristics[key];
        }
      });
      if (Object.keys(cleanedData.characteristics).length === 0) {
        delete cleanedData.characteristics;
      }

      // Clean cuttingParameters
      Object.keys(cleanedData.cuttingParameters).forEach((key) => {
        if (cleanedData.cuttingParameters[key] === "") {
          delete cleanedData.cuttingParameters[key];
        } else if (["speed", "feed", "depth"].includes(key)) {
          cleanedData.cuttingParameters[key] = Number(
            cleanedData.cuttingParameters[key]
          );
        }
      });
      if (Object.keys(cleanedData.cuttingParameters).length === 0) {
        delete cleanedData.cuttingParameters;
      }

      // Clean catalogInfo
      Object.keys(cleanedData.catalogInfo).forEach((key) => {
        if (cleanedData.catalogInfo[key] === "") {
          delete cleanedData.catalogInfo[key];
        }
      });
      if (Object.keys(cleanedData.catalogInfo).length === 0) {
        delete cleanedData.catalogInfo;
      }

      onSubmit(cleanedData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tool-form">
      <div className="form-section">
        <h3>Thông tin cơ bản</h3>
        <div className="form-row">
          <div className="form-group">
            <label>
              Mã sản phẩm <span className="required">*</span>
            </label>
            <input
              type="text"
              name="productCode"
              value={formData.productCode}
              onChange={handleChange}
              required
              disabled={!!tool}
            />
            {errors.productCode && (
              <span className="field-error">{errors.productCode}</span>
            )}
          </div>
          <div className="form-group">
            <label>
              Tên dụng cụ <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            {errors.name && <span className="field-error">{errors.name}</span>}
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Trạng thái</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="new">Mới</option>
              <option value="old">Cũ</option>
              <option value="usable">Sử dụng được</option>
              <option value="unusable">Không sử dụng được</option>
            </select>
          </div>
          <div className="form-group">
            <label>Vị trí</label>
            <select
              name="location"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="warehouse">Kho</option>
              <option value="in_use">Đang sử dụng</option>
              <option value="maintenance">Bảo trì</option>
              <option value="disposed">Đã thanh lý</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Thông tin hình học</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Chiều dài (mm)</label>
            <input
              type="number"
              name="geometry.length"
              value={formData.geometry.length}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Chiều rộng (mm)</label>
            <input
              type="number"
              name="geometry.width"
              value={formData.geometry.width}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Chiều cao (mm)</label>
            <input
              type="number"
              name="geometry.height"
              value={formData.geometry.height}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Đường kính (mm)</label>
            <input
              type="number"
              name="geometry.diameter"
              value={formData.geometry.diameter}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Hình dạng</label>
            <input
              type="text"
              name="geometry.shape"
              value={formData.geometry.shape}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Vật liệu</label>
            <input
              type="text"
              name="geometry.material"
              value={formData.geometry.material}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3>Đặc điểm kỹ thuật</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Thương hiệu</label>
            <input
              type="text"
              name="characteristics.brand"
              value={formData.characteristics.brand}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Model</label>
            <input
              type="text"
              name="characteristics.model"
              value={formData.characteristics.model}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Độ cứng</label>
            <input
              type="text"
              name="characteristics.hardness"
              value={formData.characteristics.hardness}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Lớp phủ</label>
            <input
              type="text"
              name="characteristics.coating"
              value={formData.characteristics.coating}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Thông số kỹ thuật</label>
          <textarea
            name="characteristics.specifications"
            value={formData.characteristics.specifications}
            onChange={handleChange}
            rows="3"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Chế độ cắt</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Tốc độ (rpm)</label>
            <input
              type="number"
              name="cuttingParameters.speed"
              value={formData.cuttingParameters.speed}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Bước tiến (mm/rev)</label>
            <input
              type="number"
              step="0.1"
              name="cuttingParameters.feed"
              value={formData.cuttingParameters.feed}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Chiều sâu (mm)</label>
            <input
              type="number"
              step="0.1"
              name="cuttingParameters.depth"
              value={formData.cuttingParameters.depth}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="form-group">
          <label>Ghi chú</label>
          <textarea
            name="cuttingParameters.notes"
            value={formData.cuttingParameters.notes}
            onChange={handleChange}
            rows="2"
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Thông tin catalog</h3>
        <div className="form-row">
          <div className="form-group">
            <label>Nhà sản xuất</label>
            <input
              type="text"
              name="catalogInfo.manufacturer"
              value={formData.catalogInfo.manufacturer}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Mã catalog</label>
            <input
              type="text"
              name="catalogInfo.catalogNumber"
              value={formData.catalogInfo.catalogNumber}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label>Nguồn</label>
            <select
              name="catalogInfo.source"
              value={formData.catalogInfo.source}
              onChange={handleChange}
            >
              <option value="manufacturer">Từ nhà sản xuất</option>
              <option value="experience">Từ kinh nghiệm</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label>Tham khảo</label>
          <input
            type="text"
            name="catalogInfo.reference"
            value={formData.catalogInfo.reference}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancel} className="btn-cancel">
          Hủy
        </button>
        <button type="submit" disabled={loading} className="btn-submit">
          {loading ? "Đang lưu..." : tool ? "Cập nhật" : "Tạo mới"}
        </button>
      </div>
    </form>
  );
};
