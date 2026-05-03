# Warehouse Inventory Manager (Hệ Thống Quản Lý Kho)

Đây là hệ thống Quản lý Phiếu Nhập Kho (Inventory Receipt Manager) được xây dựng với kiến trúc theo chuẩn RESTful API, tập trung vào thiết kế phân quyền mạnh mẽ (Role-Based Access Control) và bảo mật dữ liệu.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)
- **Backend:** Node.js, Express.js, TypeScript.
- **Frontend/Template Engine:** Handlebars (HBS), Vanilla CSS/TailwindCSS.
- **Database:** PostgreSQL (với thư viện `pg`).
- **Bảo mật:** JSON Web Token (JWT) lưu trữ qua HTTP-only Cookies, Bcrypt (mã hóa mật khẩu).
- **Testing:** Jest, Supertest.

## ✨ Tính Năng Nổi Bật (Key Features)
- **Quản lý Hóa Đơn Nhập Kho (Receipt Management):** Thêm, sửa, xem chi tiết các phiếu nhập kho cùng chi tiết sản phẩm đi kèm (Sử dụng SQL Transaction an toàn).
- **Phân Quyền Chi Tiết (Granular RBAC):** Hệ thống phân quyền động cấp độ chức năng (`create_receipts`, `view_receipts`, `manage_users`, v.v.). Menu và giao diện tự động ẩn/hiện dựa trên quyền hạn của người dùng.
- **Xác Thực An Toàn (Authentication):** Đăng nhập bằng JWT an toàn thông qua Cookie, bảo vệ các endpoint API và giao diện bằng Middleware chuyên dụng.
- **Unit Testing:** 100% Pass rate cho các luồng tạo và xử lý lỗi của hóa đơn.

---

## 🚀 Hướng Dẫn Cài Đặt (Setup Instructions)

### 1. Yêu cầu hệ thống (Prerequisites)
- [Node.js](https://nodejs.org/en/) (phiên bản 16.x trở lên)
- [PostgreSQL](https://www.postgresql.org/) (đang chạy ở port 5432)

### 2. Cài đặt thư viện
Clone dự án về máy và cài đặt các thư viện cần thiết:
```bash
git clone https://github.com/tranduygioi1/test_dev_inventory_manager.git
cd test_dev_inventory_manager
npm install
```

### 3. Cấu hình biến môi trường
Tạo một file `.env` tại thư mục gốc của dự án, copy nội dung từ file `.env.example` và điền thông tin kết nối Database của bạn:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres        # Sửa thành user DB của bạn
DB_PASSWORD=123456      # Sửa thành mật khẩu DB của bạn
DB_NAME=inventory_db
JWT_SECRET=mot_chuoi_ky_tu_bi_mat_bat_ky
```

### 4. Khởi tạo Cơ Sở Dữ Liệu Tự Động
Đảm bảo service PostgreSQL của bạn đang chạy. Sau đó gõ lệnh dưới đây, hệ thống sẽ tự động tạo Database, tạo bảng và nạp dữ liệu phân quyền mẫu:
```bash
npm run setup:db
```

---

## 💻 Hướng Dẫn Chạy Dự Án

### Môi trường Phát triển (Development)
Chạy server sử dụng `ts-node` (tự động load không cần build):
```bash
npm run dev
```

### Môi trường Môi trường Sản xuất (Production)
Dọn dẹp code cũ, biên dịch toàn bộ code TypeScript sang JavaScript và chạy server:
```bash
npm run build
npm start
```

Sau khi chạy thành công, truy cập trình duyệt theo địa chỉ:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 🔑 Tài Khoản Đăng Nhập Mẫu (Mock Accounts)

Sau khi chạy lệnh `npm run setup:db`, hệ thống đã có sẵn tài khoản quản trị viên tối cao:
- **Username:** `admin`
- **Password:** `123456`

*(Tài khoản `admin` có quyền truy cập vào Cài đặt để thêm mới Người dùng hoặc Vai trò khác).*

---

## 🧪 Chạy Bài Kiểm Tra (Unit Tests)

Dự án có tích hợp Unit Test để kiểm tra độ tin cậy của luồng tạo hóa đơn và khả năng Rollback khi Database có lỗi. Để chạy test:
```bash
npm test
```
