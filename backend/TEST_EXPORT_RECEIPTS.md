# Hướng dẫn Test API Export Receipts

## Yêu cầu

- Postman hoặc công cụ API testing khác
- Server đang chạy
- Database đã kết nối

## Bước 1: Đăng nhập để lấy Token

**Endpoint:** `POST /api/auth/login`

**Headers:**

```
Content-Type: application/json
```

**Body (JSON):**

```json
{
  "username": "your_username",
  "password": "your_password"
}
```

**Response sẽ trả về:**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "...",
    ...
  }
}
```

**Lưu ý:** Copy token này để dùng cho các request tiếp theo.

---

## Bước 2: Tạo Tool (nếu chưa có)

**Endpoint:** `POST /api/tools`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "productCode": "DAO-CNC-001",
  "name": "Dao phay CNC 10mm",
  "category": "Dao phay",
  "status": "usable",
  "isInUse": false,
  "location": "warehouse",
  "geometry": {
    "length": 75,
    "width": 10,
    "height": 10,
    "diameter": 10,
    "shape": "Trụ",
    "material": "Hợp kim cứng"
  },
  "characteristics": {
    "hardness": "HRC 60",
    "coating": "TiAlN",
    "brand": "Sandvik",
    "model": "CoroMill 316",
    "specifications": "4 me cắt, góc xoắn 30 độ"
  },
  "cuttingParameters": {
    "speed": 1200,
    "feed": 0.2,
    "depth": 1.5,
    "notes": "Phù hợp gia công thép carbon"
  },
  "catalogInfo": {
    "manufacturer": "Sandvik Coromant",
    "catalogNumber": "SC-316-10",
    "source": "manufacturer",
    "reference": "Catalog Sandvik 2024"
  }
}
```

**Response sẽ trả về:**

```json
{
  "success": true,
  "message": "Thêm dụng cụ thành công",
  "data": {
    "_id": "65f123456789abcdef012345",
    "productCode": "DAO-CNC-001",
    ...
  }
}
```

**Lưu ý:**

- Copy `_id` của tool vừa tạo để dùng ở bước 3. Ví dụ: `"65f123456789abcdef012345"`
- Nếu bạn không chắc tool đã được tạo chưa, hãy làm Bước 2.5 (xem danh sách tools) trước

---

## Bước 2.5: Xem danh sách Tools (Tùy chọn - nếu chưa chắc tool đã tồn tại)

**Endpoint:** `GET /api/tools`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response sẽ trả về:**

```json
{
  "success": true,
  "count": 1,
  "total": 1,
  "data": [
    {
      "_id": "6953f7f0add8e7327a64e56b",
      "productCode": "DAO-CNC-001",
      "name": "Dao phay CNC 10mm",
      "isInUse": false,
      "location": "warehouse",
      ...
    }
  ]
}
```

**Lưu ý:** Copy `_id` từ tool trong danh sách để dùng ở bước 3. Chỉ chọn tool có:

- `isInUse: false`
- `location: "warehouse"`

**Cách lấy ID từ response:**

- Tìm field `"_id"` trong response JSON
- Copy toàn bộ giá trị (ví dụ: `"65f123456789abcdef012345"`)
- ID này sẽ được dùng ở bước 3

---

## Bước 3: Tạo Export Receipt

**Endpoint:** `POST /api/export-receipts`

**Headers:**

```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON):**

```json
{
  "tools": [
    {
      "tool": "65f123456789abcdef012345",
      "quantity": 1,
      "notes": "Xuất cho xưởng CNC số 1"
    }
  ],
  "purpose": "Sử dụng tại xưởng sản xuất",
  "department": "Phòng sản xuất",
  "notes": "Xuất kho dụng cụ cho đơn hàng ABC123"
}
```

**Giải thích các trường:**

- `tools`: Array chứa các tool muốn xuất
  - `tool`: ID của tool (lấy từ bước 2)
  - `quantity`: Số lượng (mặc định là 1)
  - `notes`: Ghi chú cho tool này (tùy chọn)
- `purpose`: Mục đích xuất kho
- `department`: Phòng ban
- `notes`: Ghi chú chung (tùy chọn)

**Response thành công:**

```json
{
  "success": true,
  "message": "Tạo phiếu xuất kho thành công",
  "data": {
    "_id": "...",
    "receiptNumber": "XK-20251220-1234",
    "exportDate": "2025-12-20T10:30:00.000Z",
    "exportedBy": {
      "_id": "...",
      "username": "...",
      "fullName": "..."
    },
    "tools": [
      {
        "tool": {
          "_id": "65f123456789abcdef012345",
          "productCode": "DAO-CNC-001",
          "name": "Dao phay CNC 10mm",
          ...
        },
        "quantity": 1,
        "notes": "Xuất cho xưởng CNC số 1"
      }
    ],
    "purpose": "Sử dụng tại xưởng sản xuất",
    "department": "Phòng sản xuất",
    "status": "completed",
    ...
  }
}
```

---

## Bước 4: Xem danh sách Export Receipts

**Endpoint:** `GET /api/export-receipts`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response:**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "_id": "...",
      "receiptNumber": "XK-20251220-1234",
      ...
    }
  ]
}
```

---

## Bước 5: Xem chi tiết một Export Receipt

**Endpoint:** `GET /api/export-receipts/:id`

**Headers:**

```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Ví dụ:** `GET /api/export-receipts/65f123456789abcdef012345`

---

## Lưu ý quan trọng

1. **Token phải hợp lệ:** Tất cả các API đều yêu cầu authentication
2. **Phải là Admin:** API export receipts chỉ dành cho user có role "admin"
3. **Tool phải tồn tại:** Tool ID phải tồn tại trong database
4. **Tool phải available:** Tool phải có `isInUse: false` và `location: "warehouse"`
5. **Sau khi xuất:** Tool sẽ tự động được cập nhật:
   - `isInUse: true`
   - `currentUser: user_id`
   - `location: "in_use"`
   - `usageCount` tăng lên 1

---

## Ví dụ Test với nhiều Tools

```json
{
  "tools": [
    {
      "tool": "65f123456789abcdef012345",
      "quantity": 1,
      "notes": "Tool số 1"
    },
    {
      "tool": "65f123456789abcdef012346",
      "quantity": 2,
      "notes": "Tool số 2"
    }
  ],
  "purpose": "Xuất nhiều dụng cụ",
  "department": "Phòng sản xuất",
  "notes": "Xuất kho cho dự án XYZ"
}
```

---

## Troubleshooting

### Lỗi 401 Unauthorized

- Kiểm tra token có đúng không
- Kiểm tra token có hết hạn không
- Đảm bảo header có format: `Authorization: Bearer YOUR_TOKEN`

### Lỗi 403 Forbidden

- User phải có role "admin"
- Kiểm tra user đang đăng nhập có quyền admin không

### Lỗi 404 Not Found (Tool)

- Tool ID không tồn tại
- Kiểm tra lại ID tool đã copy đúng chưa

### Lỗi 400 Bad Request (Tool đang được sử dụng)

- Tool đã được xuất kho trước đó (`isInUse: true`)
- Cần trả tool về kho trước khi xuất lại

### Lỗi 400 Validation Error

- Kiểm tra format JSON
- Đảm bảo `tools` là array
- Đảm bảo mỗi item trong `tools` có field `tool` (ID)
