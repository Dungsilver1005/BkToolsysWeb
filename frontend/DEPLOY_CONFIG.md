# Cấu Hình Deploy Frontend

## Thông tin cấu hình cho các platform deploy (Vercel, Netlify, etc.)

### 📦 Install Command

```bash
npm install
```

### 🔨 Build Command

```bash
npm run build
```

### 📂 Output Directory

```
dist
```

---

## Chi tiết

### Install Command

- **Command:** `npm install`
- **Mô tả:** Cài đặt tất cả dependencies từ `package.json`

### Build Command

- **Command:** `npm run build`
- **Mô tả:** Build ứng dụng React với Vite, tạo các file tĩnh trong thư mục `dist/`
- **Tương đương:** `vite build`

### Output Directory

- **Directory:** `dist`
- **Mô tả:** Thư mục chứa các file đã build (HTML, CSS, JS)
- **Vị trí:** `frontend/dist/`

---

## Biến môi trường cần thiết

Tạo file `.env.production` hoặc set trong platform:

```env
VITE_API_BASE_URL=https://api.yourdomain.com
```

**Lưu ý:** Vite yêu cầu prefix `VITE_` cho biến môi trường.

---

## Ví dụ cấu hình cho các platform

### Vercel

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Netlify

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Install command:** `npm install`

### Render

- **Build Command:** `npm run build`
- **Publish Directory:** `dist`
- **Install Command:** `npm install`

---

## Kiểm tra build local

```bash
cd frontend
npm install
npm run build

# Kiểm tra thư mục dist đã được tạo
ls -la dist/
```
