import axios from "axios";

// Tạo axios instance với base URL
const getBaseURL = () => {
  // Ưu tiên 1: Dùng biến môi trường nếu có (đã set trong Vercel)
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Ưu tiên 2: Kiểm tra hostname để xác định môi trường
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    // Nếu đang chạy trên localhost → dùng localhost backend
    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }

  // Mặc định: Dùng Render backend URL (production)
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
