# MyBK Sync Feature

## Tổng quan

Tính năng này cho phép bạn đăng nhập bằng tài khoản MyBK (SSO BKU) và tự động lấy thời khóa biểu từ hệ thống.

## Cách sử dụng

### Bước 1: Khởi động Backend Server

Mở terminal mới và chạy:

```bash
cd server
npm install
npm start
```

Server sẽ chạy tại `http://localhost:3001`

### Bước 2: Khởi động Frontend

Mở terminal khác và chạy:

```bash
npm run dev
```

Frontend sẽ chạy tại `http://localhost:3000`

### Bước 3: Đăng nhập và Đồng bộ

1. Truy cập `http://localhost:3000`
2. Vào tab **Thời khóa biểu**
3. Chọn tab **🔄 Đồng bộ MyBK**
4. Nhập **MSSV** và **Mật khẩu** MyBK
5. Nhấn **Đăng nhập & Đồng bộ**

## Cách hoạt động

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Frontend      │ ──── │  Backend Proxy  │ ──── │     MyBK API    │
│  (localhost:3000)│      │ (localhost:3001) │      │ (mybk.hcmut.edu.vn) │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

1. **Frontend** gửi credentials đến **Backend Proxy**
2. **Backend** thực hiện CAS authentication với SSO BKU
3. **Backend** lưu session cookies và gọi MyBK API
4. **Backend** trả về dữ liệu cho **Frontend**

## API Endpoints

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/api/health` | GET | Kiểm tra server status |
| `/api/auth/login` | POST | Đăng nhập CAS |
| `/api/auth/logout` | POST | Đăng xuất |
| `/api/student/info` | GET | Lấy thông tin sinh viên |
| `/api/student/schedule` | GET | Lấy thời khóa biểu |

## Bảo mật

- Mật khẩu **không được lưu trữ** - chỉ được gửi một lần đến SSO
- Session được lưu trong memory của server, sẽ mất khi restart
- Tất cả requests đến MyBK đều qua HTTPS
- Frontend không bao giờ truy cập trực tiếp đến MyBK

## Troubleshooting

### Server offline
- Đảm bảo đã chạy `npm install` trong thư mục `server/`
- Kiểm tra port 3001 có bị chiếm không

### Đăng nhập thất bại
- Kiểm tra lại MSSV và mật khẩu
- Thử đăng nhập trực tiếp tại mybk.hcmut.edu.vn để xác nhận thông tin

### Không lấy được lịch
- Server có thể bị timeout - thử lại
- MyBK có thể đang bảo trì
