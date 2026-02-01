# MyBK Student Portal (TKB Smart)

Ứng dụng quản lý thời khóa biểu, lịch thi, tính GPA và đăng ký môn học cho sinh viên Đại học Bách Khoa TP.HCM.

## Tính năng

### Core Features
- **Thời khóa biểu**: Tạo và quản lý thời khóa biểu từ dữ liệu MyBK
- **Lịch thi**: Theo dõi lịch thi cả kỳ
- **Chương trình đào tạo**: Xem chương trình đào tạo theo ngành
- **Tính GPA**: Tính điểm trung bình tích lũy (tích hợp API MyBK)
- **Lịch giảng dạy**: Tra cứu lịch dạy của giảng viên
- **Ghi chú & Kế hoạch**: Quản lý ghi chú và deadline
- **Bản đồ trường**: Xem vị trí các tòa nhà trong trường
- **Preview đăng ký**: Xem trước thời khóa biểu khi đăng ký môn
- **Export Google Calendar**: Xuất lịch học sang file .ics để import vào Google Calendar

### DKMH Integration
- **Đăng nhập MyBK**: Xác thực tự động qua CAS SSO
- **Đợt đăng ký**: Xem danh sách đợt đăng ký môn học
- **Chi tiết môn học**: Xem danh sách môn đã đăng ký trong từng đợt
- **Điểm tích lũy**: Xem chi tiết GPA theo học kỳ và môn học

### Session Management (Render Free Plan Optimized)
- **Max Sessions**: 40 sessions đồng thời
- **Session Timeout**: 15 phút không hoạt động = tự động logout
- **Auto Cleanup**: Dọn dẹp session hết hạn mỗi 3 phút
- **Server Busy UI**: Hiển thị thông báo khi server đạt giới hạn, tự động retry sau 30s
- **Memory Tracking**: Theo dõi sử dụng RAM qua endpoint /api/stats

### Security & Privacy
- **Trang Bảo mật**: Giải thích chi tiết cách dữ liệu được xử lý
- **Không lưu mật khẩu**: Password chỉ dùng để xác thực, không lưu trữ
- **Session-only Storage**: Dữ liệu chỉ lưu tạm trong RAM, tự động xóa khi logout
- **HTTPS**: Tất cả requests đều mã hóa

### Performance Optimizations
- **API Caching**: Cache student info (5 phút), registration periods (2 phút)
- **Request Deduplication**: Tránh gọi API lặp lại khi có request đang pending
- **localStorage Cache**: Lưu TKB, lịch thi offline

## Kiến trúc

```
Frontend (React/Vite) --> Backend (Node/Express) --> MyBK API (HCMUT)
    Port: 3000              Port: 3001
```

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + Radix UI
- Lucide React (icons)
- GSAP (animations)
- Leaflet + React Leaflet (maps)
- Day.js (date handling)

### Backend
- Node.js + Express.js
- node-fetch, tough-cookie, fetch-cookie
- helmet, express-rate-limit (security)

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Setup

```bash
# Cài đặt Frontend
npm install

# Cài đặt Backend
cd server
npm install
cd ..
```

### Chạy ứng dụng

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
# Server chạy tại http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
# App chạy tại http://localhost:3000
```

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy frontend development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `cd server && npm run dev` | Chạy backend proxy server |

## Cấu trúc thư mục

```
├── public/              # Static assets
│   ├── data.json        # Dữ liệu lịch giảng dạy
│   └── CTDT/            # PDF chương trình đào tạo
├── server/              # Backend proxy server
│   ├── index.js         # Express server (development)
│   ├── index.production.js  # Express server (production)
│   └── package.json
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── ScheduleTab.jsx
│   │   ├── ExamTab.jsx
│   │   ├── GpaTab.jsx
│   │   ├── RegistrationTab.jsx
│   │   └── SecurityPage.jsx
│   ├── services/        # API services
│   │   └── mybkApi.js   # MyBK API client with caching
│   ├── utils/           # Utility functions
│   │   └── calendarExport.js  # Export to Google Calendar
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   └── App.jsx
├── vite.config.js
└── package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập MyBK + DKMH
- `POST /api/auth/logout` - Đăng xuất

### MyBK Proxy
- `POST /api/mybk/proxy` - Proxy request đến MyBK API
- `GET /api/dkmh/registration-periods` - Lấy danh sách đợt đăng ký
- `POST /api/dkmh/period-details` - Lấy chi tiết môn học đã đăng ký

### Monitoring
- `GET /api/health` - Health check
- `GET /api/stats` - Server statistics (memory, sessions, config)

## Bảo mật

- Không lưu mật khẩu dạng plaintext. Backend chỉ duy trì session tokens.
- Tokens được lưu trong memory của server, tự động hết hạn sau 15 phút.
- Session tự động xóa khi không hoạt động.
- CORS chỉ cho phép requests từ localhost trong development.
- Rate limiting: 1000 requests / 15 phút.
- Helmet.js bảo vệ các HTTP headers.

## Deployment

### Render (Production)
1. Tạo Web Service mới trên Render
2. Connect repository GitHub
3. Build Command: `npm install && npm run build && cd server && npm install`
4. Start Command: `cd server && node index.production.js`
5. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=10000`

### Lưu ý khi deploy
1. Không share backend URL công khai
2. Sử dụng HTTPS (Render tự động cung cấp)
3. Cập nhật CORS cho domain production
4. Kiểm tra `npm run build` trước khi push

## Tính năng tương lai

### Ưu tiên cao
- Quản lý bài tập & deadline
- Smart notifications
- Theo dõi điểm số chi tiết
- Data sync & backup

### Ưu tiên trung bình
- Ghi chú bài giảng
- Campus services
- Analytics & insights
- Customization

### Ưu tiên thấp
- AI study assistant
- Study groups
- Career planning

## Xử lý lỗi

| Lỗi | Giải pháp |
|-----|-----------|
| Module not found | `npm install` |
| Port already in use | Đổi port hoặc tắt app khác |
| Permission denied | Chạy với quyền admin |
| MAX_SESSIONS_REACHED | Chờ 30s để tự động retry hoặc click "Thử ngay" |

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License
