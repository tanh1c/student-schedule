# Hướng Dẫn Cài Đặt và Chạy Dự Án React 🚀

## 📋 Yêu cầu hệ thống

Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:

- **Node.js** phiên bản 16.0 trở lên
- **npm** (đi kèm với Node.js) hoặc **yarn**
- **Git** (tùy chọn, để clone repository)

### Kiểm tra phiên bản hiện tại:
```bash
node --version
npm --version
```

## 🔧 Cài đặt Node.js (nếu chưa có)

1. Truy cập [nodejs.org](https://nodejs.org/)
2. Tải phiên bản LTS (Long Term Support)
3. Cài đặt theo hướng dẫn của hệ điều hành
4. Khởi động lại terminal/command prompt

## 📦 Cài đặt dự án

### Bước 1: Mở Terminal/Command Prompt
- **Windows**: Nhấn `Win + R`, gõ `cmd` hoặc `powershell`
- **Mac**: Nhấn `Cmd + Space`, gõ `Terminal`
- **Linux**: Nhấn `Ctrl + Alt + T`

### Bước 2: Di chuyển đến thư mục dự án
```bash
cd "C:\Users\LG\Desktop\Study Material\AI\TKBSV"
```

### Bước 3: Cài đặt dependencies
```bash
npm install
```

**Lưu ý**: Quá trình này có thể mất 2-5 phút tùy thuộc vào tốc độ internet.

### Bước 4: Chờ cài đặt hoàn tất
Bạn sẽ thấy thông báo tương tự:
```
added 1500 packages in 3m
```

## 🚀 Chạy ứng dụng

### Chế độ Development (Phát triển)
```bash
npm start
```

Sau khi chạy lệnh này:
1. Ứng dụng sẽ tự động mở tại `http://localhost:3000`
2. Nếu không tự động mở, hãy mở trình duyệt và truy cập địa chỉ trên
3. Ứng dụng sẽ tự động reload khi bạn thay đổi code

### Build cho Production (Sản xuất)
```bash
npm run build
```

Lệnh này sẽ tạo thư mục `build` chứa các file đã được tối ưu hóa.

## 🔍 Kiểm tra cài đặt

### Nếu gặp lỗi "npm not found":
1. Cài đặt lại Node.js
2. Khởi động lại terminal
3. Thử lại lệnh `npm --version`

### Nếu gặp lỗi "permission denied":
**Windows**: Chạy Command Prompt với quyền Administrator
**Mac/Linux**: Thêm `sudo` trước lệnh:
```bash
sudo npm install
```

### Nếu gặp lỗi "port 3000 already in use":
1. Đóng các ứng dụng đang chạy trên port 3000
2. Hoặc chạy trên port khác:
```bash
PORT=3001 npm start
```

## 📱 Truy cập ứng dụng

### Trên máy tính:
- Mở trình duyệt (Chrome, Firefox, Safari, Edge)
- Truy cập: `http://localhost:3000`

### Trên điện thoại (cùng mạng WiFi):
1. Tìm IP của máy tính:
   - **Windows**: `ipconfig`
   - **Mac/Linux**: `ifconfig`
2. Truy cập: `http://[IP-ADDRESS]:3000`
   - Ví dụ: `http://192.168.1.100:3000`

## 🛠 Các lệnh hữu ích

### Dừng ứng dụng:
Nhấn `Ctrl + C` trong terminal

### Xóa cache và cài đặt lại:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Kiểm tra lỗi:
```bash
npm run test
```

### Xem cấu trúc dự án:
```bash
npm run eject
```
**⚠️ Cảnh báo**: Lệnh này không thể hoàn tác!

## 📂 Cấu trúc thư mục sau khi cài đặt

```
TKBSV/
├── node_modules/          # Dependencies (tự động tạo)
├── public/               # Static files
│   ├── index.html
│   └── manifest.json
├── src/                  # Source code
│   ├── components/       # React components
│   ├── hooks/           # Custom hooks
│   ├── utils/           # Utility functions
│   ├── App.js           # Main app
│   └── index.js         # Entry point
├── package.json         # Project configuration
├── package-lock.json    # Dependency lock (tự động tạo)
└── README-React.md      # Documentation
```

## 🎯 Tính năng chính

Sau khi chạy thành công, bạn có thể sử dụng:

1. **📅 Thời Khóa Biểu**: Nhập và quản lý lịch học
2. **📋 Lịch Thi**: Theo dõi lịch thi
3. **📚 Chương Trình Đào Tạo**: Xem CTDT theo ngành
4. **📊 Tính GPA**: Tính điểm trung bình
5. **👨‍🏫 Lịch Giảng Dạy**: Tra cứu lịch giảng viên
6. **📝 Ghi Chú & Kế Hoạch**: Quản lý công việc
7. **🗺️ Bản Đồ Trường**: Xem vị trí trường học
8. **🔍 Preview Đăng Ký**: Xem trước lịch đăng ký

## 🆘 Hỗ trợ

### Nếu gặp vấn đề:

1. **Kiểm tra console**: Nhấn F12 trong trình duyệt
2. **Xem log terminal**: Đọc thông báo lỗi trong terminal
3. **Restart ứng dụng**: Dừng (Ctrl+C) và chạy lại `npm start`
4. **Clear cache**: Xóa cache trình duyệt (Ctrl+Shift+Delete)

### Các lỗi thường gặp:

| Lỗi | Nguyên nhân | Giải pháp |
|-----|-------------|-----------|
| `Module not found` | Thiếu dependency | `npm install` |
| `Port already in use` | Port 3000 đang được sử dụng | Đổi port hoặc tắt app khác |
| `Permission denied` | Không có quyền | Chạy với quyền admin |
| `Network error` | Vấn đề mạng | Kiểm tra kết nối internet |

## 🎉 Chúc mừng!

Bạn đã cài đặt thành công ứng dụng Student Schedule Manager phiên bản React!

Hãy khám phá các tính năng và tận hưởng trải nghiệm quản lý thời khóa biểu hiện đại với Material-UI.

---

**Lưu ý**: Đây là phiên bản React được nâng cấp từ HTML/CSS/JS gốc. Tất cả dữ liệu sẽ được lưu trong localStorage của trình duyệt.
