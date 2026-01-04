# 🚀 Hướng Dẫn Deploy Nhanh

## Deploy Backend (VPS/Server)

### 1. Cài đặt PM2

```bash
npm install -g pm2
```

### 2. Tạo file `.env` trong `backend/`

```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/tool_management
JWT_SECRET=your_super_secret_key_here
JWT_EXPIRE=30d
```

### 3. Khởi động với PM2

```bash
cd backend
mkdir -p logs
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## Deploy Frontend

### 1. Tạo file `.env.production` trong `frontend/`

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 2. Build

```bash
cd frontend
npm run build
```

### 3. Copy `dist/` lên server và cấu hình Nginx

## Deploy với Docker

### 1. Tạo file `.env` ở root

```env
JWT_SECRET=your_super_secret_key_here
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Chạy

```bash
docker-compose up -d
```

Xem chi tiết trong file `DEPLOY.md`
