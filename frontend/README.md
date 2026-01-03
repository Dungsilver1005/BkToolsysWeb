# Frontend - Hệ thống quản lý dụng cụ

Frontend React cho hệ thống quản lý dụng cụ, kết nối với backend Node.js/Express.

## Cài đặt

```bash
cd frontend
npm install
```

## Cấu hình

Tạo file `.env` trong thư mục `frontend`:

```
VITE_API_BASE_URL=http://localhost:5000/api
```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## Build cho production

```bash
npm run build
```

## Cấu trúc thư mục

```
src/
  components/       # Các component dùng chung (Layout, ProtectedRoute)
  context/          # React Context (AuthContext)
  pages/            # Các trang chính
  services/         # API services (authService, toolService, ...)
  App.jsx           # Component chính với routing
  main.jsx          # Entry point
  index.css         # CSS global
```

## Tính năng

- ✅ Đăng nhập/Đăng xuất với JWT
- ✅ Phân quyền Admin/User
- ✅ Dashboard với thống kê
- ✅ Quản lý dụng cụ (xem danh sách, chi tiết, tìm kiếm, lọc)
- ✅ Phiếu xuất kho (Admin only)
- ✅ Thống kê và báo cáo
- ✅ Quản lý người dùng (Admin only)

## Yêu cầu

- Node.js >= 16
- Backend phải chạy tại http://localhost:5000

// dungnguyen
//oDMAvYVkvUu5ZLDa
