# MyBK Student Portal (TKB Smart)

Ứng dụng quản lý thời khóa biểu, lịch thi, tính GPA và đăng ký môn học cho sinh viên Đại học Bách Khoa TP.HCM.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## ✨ Tính năng

### 📱 Core Features
- 📅 **Thời khóa biểu**: Tạo và quản lý thời khóa biểu từ dữ liệu MyBK
- 📝 **Lịch thi**: Theo dõi lịch thi cả kỳ
- 🎓 **Chương trình đào tạo**: Xem chương trình đào tạo theo ngành
- 📊 **Tính GPA**: Tính điểm trung bình tích lũy (tích hợp API MyBK)
- 👨‍🏫 **Lịch giảng dạy**: Tra cứu lịch dạy của giảng viên
- 📋 **Ghi chú & Kế hoạch**: Quản lý ghi chú và deadline
- 🗺️ **Bản đồ trường**: Xem vị trí các tòa nhà trong trường
- 👁️ **Preview đăng ký**: Xem trước thời khóa biểu khi đăng ký môn

### 🆕 DKMH Integration
- 🔐 **Đăng nhập MyBK**: Xác thực tự động qua CAS SSO
- 📑 **Đợt đăng ký**: Xem danh sách đợt đăng ký môn học (DKMH)
- 📚 **Chi tiết môn học**: Xem danh sách môn đã đăng ký trong từng đợt
- 📈 **Điểm tích lũy**: Xem chi tiết GPA theo học kỳ và môn học

## 🏗️ Kiến trúc

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│   Backend       │────▶│   MyBK API      │
│   (React/Vite)  │     │   (Node/Express)│     │   (HCMUT)       │
│   Port: 3000    │     │   Port: 3001    │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: React 18 + Vite - UI hiện đại, responsive
- **Backend**: Node.js + Express - Proxy server xử lý SSO authentication

## 🚀 Tech Stack

### Frontend
- **Framework**: [Vite](https://vite.dev/) + [React 18](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + CSS Variables
- **UI Components**: [Radix UI](https://www.radix-ui.com/) + Custom shadcn/ui
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [GSAP](https://gsap.com/)
- **Maps**: [Leaflet](https://leafletjs.com/) + [React Leaflet](https://react-leaflet.js.org/)
- **Date Handling**: [Day.js](https://day.js.org/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **HTTP Client**: [node-fetch](https://www.npmjs.com/package/node-fetch)
- **Cookie Management**: [tough-cookie](https://www.npmjs.com/package/tough-cookie) + [fetch-cookie](https://www.npmjs.com/package/fetch-cookie)

## 📦 Cài đặt

### Yêu cầu
- Node.js 18+ 
- npm hoặc yarn

### Development Setup

```bash
# Clone repository
git clone <repo-url>
cd student-schedule-manager

# Cài đặt dependencies cho Frontend
npm install

# Cài đặt dependencies cho Backend
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

## 🔧 Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy frontend development server |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `cd server && npm run dev` | Chạy backend proxy server |

## 📁 Cấu trúc thư mục

```
├── public/              # Static assets
│   ├── data.json        # Dữ liệu lịch giảng dạy
│   ├── images/          # Hình ảnh, favicon
│   └── CTDT/            # PDF chương trình đào tạo
├── server/              # Backend proxy server
│   ├── index.js         # Express server + API endpoints
│   └── package.json     # Backend dependencies
├── src/
│   ├── components/      # React components
│   │   ├── ui/          # Reusable UI components
│   │   ├── ScheduleTab.jsx
│   │   ├── ExamTab.jsx
│   │   ├── GpaTab.jsx
│   │   ├── RegistrationTab.jsx   # 🆕 DKMH tab
│   │   └── ...
│   ├── services/        # API services
│   │   └── mybkApi.js   # MyBK API wrapper
│   ├── contexts/        # React contexts
│   ├── hooks/           # Custom hooks
│   └── App.jsx          # Main App component
├── vite.config.js       # Vite configuration
└── package.json
```

## 🔐 Bảo mật

- ⚠️ **Credentials**: Không lưu mật khẩu dưới dạng plaintext. Backend chỉ duy trì session tokens.
- 🔒 **Session**: Tokens được lưu trong memory của server, tự động hết hạn.
- 🚫 **CORS**: Chỉ cho phép requests từ localhost trong development.

## 🚀 Deployment

### Frontend (Static Hosting)
- **Vercel**: Recommended - Auto deploy từ GitHub
- **Netlify**: Alternative option
- **GitHub Pages**: Free hosting

### Backend (Node.js Hosting)

Do backend xử lý thông tin đăng nhập, nên host trên các nền tảng bảo mật:

| Platform | Free Tier | Notes |
|----------|-----------|-------|
| **Railway** | $5 credit/month | ✅ Recommended - Dễ setup |
| **Render** | 750 hours/month | ✅ Tốt cho small projects |
| **Fly.io** | 3 shared VMs | ✅ Global edge deployment |
| **Cyclic** | Serverless | ✅ Free, no cold starts |
| **DigitalOcean** | $4/month | 💰 VPS tùy chỉnh |

#### Deploy lên Railway (Recommended)

1. Tạo repo riêng cho backend hoặc dùng monorepo
2. Kết nối Railway với GitHub repo
3. Set root directory = `server`
4. Railway tự động detect Node.js và deploy

#### Environment Variables
```env
PORT=3001
NODE_ENV=production
```

### ⚠️ Lưu ý bảo mật khi deploy

1. **Không share backend URL công khai** - Backend xử lý credentials
2. **Thêm rate limiting** cho production
3. **Sử dụng HTTPS** (các platform trên đều hỗ trợ)
4. **Cập nhật CORS** cho domain production

## 🎨 Theme

Ứng dụng hỗ trợ chế độ sáng/tối (Light/Dark mode) với CSS variables. Theme được lưu vào localStorage.

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập MyBK + DKMH
- `POST /api/auth/logout` - Đăng xuất

### MyBK Proxy
- `POST /api/mybk/proxy` - Proxy request đến MyBK API
- `GET /api/dkmh/registration-periods` - Lấy danh sách đợt đăng ký
- `POST /api/dkmh/period-details` - Lấy chi tiết môn học đã đăng ký

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 👨‍💻 Author

Made with ❤️ for HCMUT students
