# BÁO CÁO PHÂN TÍCH HỆ THỐNG - TÍNH NĂNG YÊU CẦU SỬ DỤNG DỤNG CỤ

## BƯỚC 1: PHÂN TÍCH HỆ THỐNG HIỆN TẠI

### 1.1 Backend hiện có

#### Models:
- **Tool.js**: 
  - `isInUse` (Boolean) - Trạng thái đang sử dụng
  - `currentUser` (ObjectId ref User) - Người đang sử dụng
  - `location` (enum: warehouse, in_use, maintenance, disposed)
  - `history[]` - Lịch sử thay đổi

- **User.js**: 
  - `role` (enum: admin, user)
  - `accessHistory[]` - Lịch sử đăng nhập

- **ExportReceipt.js**: 
  - Hệ thống xuất kho hiện tại (chỉ Admin)
  - Tự động gán dụng cụ khi tạo phiếu

#### Routes hiện có:
- `/api/tools` - CRUD tools
- `/api/tools/in-use` - Lấy tools đang sử dụng
- `/api/tools/:id/transfer` - Chuyển vị trí tool
- `/api/export-receipts` - Quản lý phiếu xuất kho (Admin only)
- `/api/users` - Quản lý users (Admin only)

### 1.2 Frontend hiện có

#### Pages:
- `ToolsList.jsx` - Danh sách dụng cụ với filters
- `ToolDetail.jsx` - Chi tiết dụng cụ
- `ToolsInUse.jsx` - Dụng cụ đang sử dụng
- `ExportReceipts.jsx` - Quản lý phiếu xuất kho (Admin)
- `Dashboard.jsx` - Dashboard tổng quan

#### Services:
- `toolService.js` - API calls cho tools
- `exportReceiptService.js` - API calls cho export receipts
- `userService.js` - API calls cho users

### 1.3 Luồng hiện tại

**Xuất kho (Admin):**
1. Admin tạo ExportReceipt
2. Chọn dụng cụ từ kho
3. Hệ thống tự động:
   - Gán `currentUser = admin`
   - Set `isInUse = true`
   - Set `location = "in_use"`
   - Tăng `usageCount`
   - Ghi history

**Vấn đề:** User không thể tự yêu cầu sử dụng dụng cụ

---

## BƯỚC 2: ĐỀ XUẤT LUỒNG & DỮ LIỆU

### 2.1 Model mới cần tạo: ToolRequest

```javascript
{
  tool: ObjectId (ref Tool),
  requestedBy: ObjectId (ref User),
  purpose: String,
  expectedDuration: String, // "1 tuần", "2 tháng", etc.
  notes: String,
  status: enum ["pending", "approved", "rejected", "cancelled"],
  reviewedBy: ObjectId (ref User), // Admin duyệt
  reviewedAt: Date,
  rejectionReason: String, // Lý do từ chối
  approvedAt: Date, // Thời gian được duyệt
  createdAt: Date,
  updatedAt: Date
}
```

### 2.2 Luồng hoạt động

**PHÍA USER:**
1. User xem danh sách dụng cụ trong kho (`location: "warehouse"`, `isInUse: false`)
2. Click "Yêu cầu sử dụng" → Mở modal form
3. Nhập: Mục đích, Thời gian dự kiến, Ghi chú
4. Gửi yêu cầu → Tạo ToolRequest với `status: "pending"`
5. Xem danh sách yêu cầu của mình với trạng thái

**PHÍA ADMIN:**
1. Admin xem danh sách tất cả yêu cầu (`status: "pending"`)
2. Duyệt yêu cầu:
   - Set `status: "approved"`
   - Gán `tool.currentUser = requestedBy`
   - Set `tool.isInUse = true`
   - Set `tool.location = "in_use"`
   - Tăng `tool.usageCount`
   - Ghi `tool.history`
   - Set `reviewedBy`, `reviewedAt`, `approvedAt`
3. Từ chối yêu cầu:
   - Set `status: "rejected"`
   - Nhập `rejectionReason`
   - Set `reviewedBy`, `reviewedAt`

### 2.3 API Backend cần tạo

#### Routes: `/api/tool-requests`

1. **POST /api/tool-requests**
   - User tạo yêu cầu
   - Validate: tool phải có sẵn, user chưa có yêu cầu pending cho tool này
   - Access: Private (User)

2. **GET /api/tool-requests**
   - User: Lấy yêu cầu của chính mình
   - Admin: Lấy tất cả yêu cầu
   - Query params: `status`, `tool`, `user`
   - Access: Private

3. **GET /api/tool-requests/:id**
   - Lấy chi tiết yêu cầu
   - Access: Private

4. **PUT /api/tool-requests/:id/approve**
   - Admin duyệt yêu cầu
   - Cập nhật tool status
   - Access: Private/Admin

5. **PUT /api/tool-requests/:id/reject**
   - Admin từ chối yêu cầu
   - Body: `{ rejectionReason: string }`
   - Access: Private/Admin

6. **PUT /api/tool-requests/:id/cancel**
   - User hủy yêu cầu của mình (chỉ khi pending)
   - Access: Private

### 2.4 Frontend cần tạo

#### Services:
- `toolRequestService.js` - API calls cho tool requests

#### Pages:
- `ToolRequests.jsx` (Admin) - Quản lý yêu cầu
- `MyToolRequests.jsx` (User) - Yêu cầu của tôi (có thể tích hợp vào ToolsList)

#### Components:
- `RequestToolModal.jsx` - Modal form gửi yêu cầu
- Cập nhật `ToolsList.jsx` - Thêm button "Yêu cầu sử dụng"

---

## BƯỚC 3: KẾ HOẠCH TRIỂN KHAI

### Phase 1: Backend (Model + Routes)
1. Tạo `backend/models/ToolRequest.js`
2. Tạo `backend/routes/toolRequests.js`
3. Đăng ký route trong `backend/server.js`

### Phase 2: Frontend - User Side
1. Tạo `toolRequestService.js`
2. Tạo `RequestToolModal.jsx`
3. Cập nhật `ToolsList.jsx`:
   - Thêm button "Yêu cầu sử dụng"
   - Logic disable button
   - Hiển thị trạng thái yêu cầu
4. Tạo `MyToolRequests.jsx` (optional - có thể tích hợp vào ToolsList)

### Phase 3: Frontend - Admin Side
1. Tạo `ToolRequests.jsx` page
2. Table với filters
3. Actions: Duyệt/Từ chối với confirm
4. Thêm route vào `App.jsx`
5. Thêm menu item vào `Layout.jsx`

### Phase 4: Testing & Polish
1. Test luồng đầy đủ
2. Xử lý edge cases
3. UI/UX improvements

---

## LƯU Ý QUAN TRỌNG

1. **Validation:**
   - User không thể yêu cầu dụng cụ đang được sử dụng
   - User không thể có 2 yêu cầu pending cho cùng 1 tool
   - Admin phải kiểm tra tool vẫn còn sẵn trước khi duyệt

2. **Race Condition:**
   - Khi Admin duyệt, phải kiểm tra lại tool status
   - Nếu tool đã được gán cho user khác → Từ chối yêu cầu

3. **Mở rộng tương lai:**
   - Trả dụng cụ: Tạo API `PUT /api/tool-requests/:id/return`
   - Gia hạn: Tạo API `PUT /api/tool-requests/:id/extend`
   - Model đã hỗ trợ với `expectedDuration` và `approvedAt`

---

## DANH SÁCH API CẦN TẠO (Backend)

✅ **Cần implement:**
1. `POST /api/tool-requests` - Tạo yêu cầu
2. `GET /api/tool-requests` - Lấy danh sách (với filters)
3. `GET /api/tool-requests/:id` - Chi tiết yêu cầu
4. `PUT /api/tool-requests/:id/approve` - Duyệt yêu cầu
5. `PUT /api/tool-requests/:id/reject` - Từ chối yêu cầu
6. `PUT /api/tool-requests/:id/cancel` - Hủy yêu cầu

✅ **Model cần tạo:**
- `backend/models/ToolRequest.js`

✅ **Route file cần tạo:**
- `backend/routes/toolRequests.js`

---

## SẴN SÀNG TRIỂN KHAI

Sau khi xác nhận, sẽ bắt đầu implement theo thứ tự:
1. Backend Model + Routes
2. Frontend Service
3. Frontend User Side
4. Frontend Admin Side

