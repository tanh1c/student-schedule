# Student Schedule Manager - React Version 📚⚛️

> Ứng dụng quản lý thời khóa biểu và lịch thi cho sinh viên được xây dựng bằng React và Material-UI

## 🚀 Phiên bản mới

Đây là phiên bản React được nâng cấp từ ứng dụng HTML/CSS/JS gốc, mang lại:
- **Giao diện hiện đại** với Material-UI
- **Responsive design** tối ưu cho mọi thiết bị
- **Hiệu suất cao** với React hooks và state management
- **Trải nghiệm người dùng** mượt mà và trực quan

## ✨ Tính năng chính

### 📅 Quản lý thời khóa biểu
- Nhập và hiển thị thời khóa biểu theo tuần với giao diện Material-UI
- Tự động phân biệt các môn học bằng màu sắc
- Xuất thời khóa biểu sang Google Calendar
- Responsive design cho cả desktop và mobile
- Hiển thị chi tiết thông tin môn học: phòng học, giảng viên, thời gian

### 📋 Quản lý lịch thi
- Giao diện bảng hiện đại với Material-UI Table
- Hiển thị đầy đủ thông tin: môn thi, phòng thi, thời gian
- Sắp xếp và lọc lịch thi theo nhiều tiêu chí
- Chip màu sắc để phân biệt loại thi

### 📚 Tra cứu chương trình đào tạo
- Select dropdown Material-UI để chọn ngành học
- Xem PDF chương trình đào tạo tích hợp
- Giao diện card hiện đại và dễ sử dụng

### 📊 Tính toán GPA
- Giao diện calculator hiện đại với Material-UI
- Bảng quy đổi điểm trực quan
- Thêm/xóa môn học dễ dàng với các nút Material-UI
- Hiển thị kết quả real-time với Card components
- Chip màu sắc cho xếp loại học lực

### 👨‍🏫 Tra cứu lịch giảng dạy
- Tab interface để chuyển đổi giữa tìm theo mã môn và tên môn
- Autocomplete cho tên môn học
- Hiển thị kết quả trong Card layout đẹp mắt
- Table hiển thị lịch học chi tiết

### 📝 Ghi chú & Kế hoạch
- Dialog Material-UI cho thêm/sửa ghi chú và kế hoạch
- Date picker tích hợp cho deadline
- Notification system cho deadline sắp tới
- Toggle view giữa danh sách và lịch
- Chip priority với màu sắc phân biệt

### 🗺️ Bản đồ trường
- Tích hợp React Leaflet cho bản đồ tương tác
- Geolocation API để xác định vị trí người dùng
- Tính toán khoảng cách và thời gian di chuyển
- Card thông tin liên hệ và hướng dẫn đi lại

### 🔍 Preview đăng ký môn
- Giao diện preview hiện đại
- Parsing dữ liệu đăng ký môn thông minh
- Hiển thị danh sách môn học với Chip
- Schedule preview responsive

## 🛠 Công nghệ sử dụng

### Frontend Framework
- **React 18** - Library JavaScript hiện đại
- **Material-UI (MUI) 5** - Component library đẹp và mạnh mẽ
- **React Router** - Routing cho SPA

### UI/UX Components
- **@mui/material** - Core Material-UI components
- **@mui/icons-material** - Material Design icons
- **@mui/x-date-pickers** - Date picker components

### Maps & Location
- **React Leaflet** - Interactive maps
- **Leaflet** - Open-source map library

### Utilities
- **Day.js** - Date manipulation library
- **GSAP** - Animation library
- **Emotion** - CSS-in-JS styling

## 📦 Cài đặt và chạy dự án

### Yêu cầu hệ thống
- Node.js 16+ 
- npm hoặc yarn

### Cài đặt dependencies
```bash
npm install
```

### Chạy ứng dụng development
```bash
npm start
```
Ứng dụng sẽ chạy tại `http://localhost:3000`

### Build cho production
```bash
npm run build
```

### Chạy tests
```bash
npm test
```

## 🎨 Tính năng Material-UI

### Theme System
- Primary color: Blue (#1976d2)
- Secondary color: Pink (#dc004e)
- Typography: Roboto font family
- Responsive breakpoints tự động

### Components được sử dụng
- **Navigation**: AppBar, Drawer, Tabs
- **Layout**: Grid, Box, Container, Paper
- **Input**: TextField, Select, Autocomplete, DatePicker
- **Display**: Card, Table, Chip, Typography
- **Feedback**: Dialog, Alert, Snackbar
- **Actions**: Button, IconButton, Fab

### Responsive Design
- Mobile-first approach
- Breakpoints: xs, sm, md, lg, xl
- Adaptive navigation (Drawer cho desktop, FAB cho mobile)
- Responsive tables và grids

## 📱 Tương thích thiết bị

- ✅ Desktop (1200px+)
- ✅ Tablet (768px - 1199px)
- ✅ Mobile (320px - 767px)
- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)

## 🔧 Cấu trúc dự án

```
src/
├── components/           # React components cho từng tab
│   ├── ScheduleTab.js   # Quản lý thời khóa biểu
│   ├── ExamTab.js       # Quản lý lịch thi
│   ├── CurriculumTab.js # Chương trình đào tạo
│   ├── GpaTab.js        # Tính GPA
│   ├── TeachingScheduleTab.js # Lịch giảng dạy
│   ├── NotesPlansTab.js # Ghi chú & kế hoạch
│   ├── CampusMapTab.js  # Bản đồ trường
│   └── PreviewRegistrationTab.js # Preview đăng ký môn
├── App.js               # Main app component
├── index.js            # Entry point
public/
├── index.html          # HTML template
├── manifest.json       # PWA manifest
package.json            # Dependencies và scripts
```

## 🚀 Hướng dẫn sử dụng

1. **Khởi động ứng dụng**: `npm start`
2. **Chọn tính năng**: Sử dụng menu bên trái hoặc FAB trên mobile
3. **Nhập dữ liệu**: Dán dữ liệu từ MyBK vào các form tương ứng
4. **Tương tác**: Sử dụng các nút và controls Material-UI
5. **Responsive**: Ứng dụng tự động adapt theo kích thước màn hình

## 🔜 Tính năng sắp tới

- [ ] **PWA Support** - Cài đặt như app native
- [ ] **Dark Mode** - Theme tối cho Material-UI
- [ ] **Offline Support** - Service Worker caching
- [ ] **Push Notifications** - Thông báo deadline
- [ ] **Data Sync** - Đồng bộ với cloud storage
- [ ] **Export Features** - Xuất PDF, Excel
- [ ] **Calendar Integration** - Sync với Google Calendar
- [ ] **Multi-language** - Hỗ trợ tiếng Anh

## 🎯 So sánh với phiên bản cũ

| Tính năng | Phiên bản cũ (HTML/CSS/JS) | Phiên bản mới (React + MUI) |
|-----------|----------------------------|------------------------------|
| **Giao diện** | Custom CSS | Material-UI components |
| **Responsive** | Media queries thủ công | MUI responsive system |
| **State Management** | DOM manipulation | React hooks & state |
| **Performance** | Vanilla JS | React optimization |
| **Maintainability** | Monolithic files | Component-based |
| **Accessibility** | Limited | MUI accessibility built-in |
| **Theming** | Hard-coded styles | MUI theme system |
| **Mobile UX** | Basic responsive | Native mobile feel |

## 🤝 Đóng góp

Mọi đóng góp để cải thiện ứng dụng đều được chào đón:

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📞 Liên hệ

- **Developer**: Student Schedule Manager Team
- **Email**: contact@schedulemanager.edu.vn
- **GitHub**: [Repository Link]

---

**Lưu ý**: Đây là phiên bản React được nâng cấp hoàn toàn từ ứng dụng HTML/CSS/JS gốc. Tất cả tính năng đã được chuyển đổi sang React components với Material-UI để mang lại trải nghiệm người dùng tốt nhất.
