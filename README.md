# Hệ Thống Quản Lý Kho (Inventory Manager)

Bài test xây dựng hệ thống quản lý phiếu nhập kho bằng **Node.js**, **Express**, **TypeScript**, **PostgreSQL** và giao diện **Handlebars**.

## 🚀 Hướng Dẫn Chạy Dự Án (Quick Start)

### 1. Cài đặt thư viện
```bash
git clone https://github.com/tranduygioi1/test_dev_inventory_manager.git
cd test_dev_inventory_manager
npm install
```

### 2. Cấu hình Database
Tạo file `.env` (từ file `.env.example` có sẵn) và sửa lại cấu hình kết nối PostgreSQL của bạn:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=123456
DB_NAME=inventory_db
JWT_SECRET=TEST_DEV
```

### 3. Tự động Khởi tạo Database
Chạy lệnh sau để tự động tạo Database, các bảng và dữ liệu mẫu:
```bash
npm run setup:db
```

### 4. Khởi động Server
```bash
npm run dev
```
Truy cập ứng dụng tại: **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Tài Khoản Đăng Nhập Test

- **Quản trị viên (Admin):** `admin` / `123456`
- **Nhân viên (User):** `nguyenvana` / `123456`

*(Tài khoản admin có quyền cấu hình Role-Based Access Control).*

---

## 🧪 Chạy Unit Test
```bash
npm test
```
