import axios from "axios";

// Tạo axios instance với base URL
// Lưu ý: Trong production, phải set VITE_API_BASE_URL trong biến môi trường
const getBaseURL = () => {
  // Nếu có biến môi trường, dùng nó (ưu tiên cao nhất)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Production: luôn dùng Render backend URL
  // Kiểm tra PROD mode hoặc không phải DEV mode
  if (import.meta.env.PROD || !import.meta.env.DEV) {
    return "https://bktoolsysweb-1.onrender.com/api";
  }

  // Development local: chỉ dùng localhost khi thực sự chạy local
  // Kiểm tra hostname để đảm bảo đang chạy trên localhost
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return "http://localhost:5000/api";
  }

  // Fallback: dùng Render backend URL (an toàn hơn)
  return "https://bktoolsysweb-1.onrender.com/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor: Tự động thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Xử lý lỗi chung
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Nếu token không hợp lệ hoặc hết hạn, xóa token và redirect về login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
