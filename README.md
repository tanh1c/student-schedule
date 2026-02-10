# MyBK Student Portal (TKB Smart)

Ứng dụng quản lý thời khóa biểu, lịch thi, tính GPA, đăng ký môn học và nhắn tin LMS cho sinh viên Đại học Bách Khoa TP.HCM.

> 🔐 **Open Source** — Mã nguồn mở để cộng đồng có thể kiểm tra và đóng góp.

## Tính năng

### Core Features
- **Thời khóa biểu**: Tạo và quản lý thời khóa biểu từ dữ liệu MyBK
- **Lịch thi**: Theo dõi lịch thi cả kỳ
- **Chương trình đào tạo**: Xem CTĐT theo ngành (CSV + PDF)
- **Tính GPA**: Tính điểm trung bình tích lũy (tích hợp API MyBK)
- **Lịch giảng dạy**: Tra cứu lịch dạy của giảng viên
- **Ghi chú & Kế hoạch**: Quản lý ghi chú và deadline
- **Bản đồ trường**: Xem vị trí các tòa nhà trong trường (Leaflet)
- **Preview đăng ký**: Xem trước thời khóa biểu khi đăng ký môn
- **Export Google Calendar**: Xuất lịch học sang file `.ics`

### DKMH Integration
- **Đăng nhập MyBK**: Xác thực tự động qua CAS SSO
- **Đợt đăng ký**: Xem danh sách đợt đăng ký môn học
- **Chi tiết môn học**: Xem danh sách môn đã đăng ký trong từng đợt
- **Điểm tích lũy**: Xem chi tiết GPA theo học kỳ và môn học

### LMS Messaging (v2.1+)
- **Tin nhắn LMS**: Gửi/nhận tin nhắn tích hợp BK E-Learning
- **Offline Cache**: Xem lại tin nhắn cũ (7 ngày) khi mất kết nối
- **Pinned Messages**: Tổng hợp tin nhắn quan trọng đã ghim

### Security & Privacy (v2.2+)
- **AES-256-GCM Encryption**: Toàn bộ dữ liệu trong Redis được mã hóa
- **Cryptographic Tokens**: Session/refresh tokens tạo bằng `crypto.randomBytes(32)` — không chứa MSSV
- **Encrypted Refresh Tokens**: "Ghi nhớ đăng nhập" mã hóa credentials server-side (7 ngày TTL)
- **MSSV Masking**: Log files ẩn MSSV (221***34), không log password
- **DDoS Protection**: 3 tầng rate limiting (Global + Per-session + Login)
- **Upstash Budget Guard**: Circuit breaker khi Redis commands đạt 80% quota hàng ngày

## Kiến trúc

```
Frontend (React/Vite)  ──►  Backend (Node/Express)  ──►  MyBK API (HCMUT)
                                    │                         SSO BK
                                    │                         DKMH
                                    ▼                         LMS (Moodle)
                              Redis (Upstash)
                              ├── SESSION:*   (encrypted, 15 min TTL)
                              ├── REFRESH:*   (encrypted, 7 day TTL)
                              └── SWR:*       (cached API, 4 hour TTL)
```

### Security Architecture

```
3 tầng bảo vệ dữ liệu:

┌─────────────────────────────────────────────┐
│  Tầng 1: Application Encryption             │
│  AES-256-GCM — mã hóa trước khi lưu Redis  │
├─────────────────────────────────────────────┤
│  Tầng 2: Transport Encryption               │
│  Upstash TLS — mã hóa đường truyền          │
├─────────────────────────────────────────────┤
│  Tầng 3: Auto-Expiry                        │
│  Redis TTL — tự động xóa (15 phút – 7 ngày)│
└─────────────────────────────────────────────┘

3 tầng chống DDoS:

┌─────────────────────────────────────────────┐
│  Tầng 1: Global Rate Limiter                │
│  200 req/phút per IP (in-memory)            │
├─────────────────────────────────────────────┤
│  Tầng 2: Per-Session API Limiter            │
│  60 req/phút per user token                 │
├─────────────────────────────────────────────┤
│  Tầng 3: Endpoint Rate Limiters             │
│  Login: 10/15 phút, Refresh: 20/15 phút    │
└─────────────────────────────────────────────┘
```

## Tech Stack

### Frontend
- React 18 + Vite
- Tailwind CSS + Radix UI (shadcn/ui)
- Lucide React (icons)
- GSAP (animations)
- Leaflet + React Leaflet (maps)
- Day.js (date handling)

### Backend
- Node.js + Express.js
- Redis (`redis` npm package) — Upstash for production
- `node-fetch`, `tough-cookie`, `fetch-cookie` (CAS SSO proxy)
- `helmet`, `express-rate-limit` (security)
- `winston` + `winston-daily-rotate-file` (logging)
- `zod` (validation)
- `crypto` (AES-256-GCM encryption, secure token generation)

## Cài đặt

### Yêu cầu
- Node.js 18+
- npm
- Redis (local hoặc Upstash)

### Setup

```bash
# Clone repository
git clone <repo-url>
cd TKBSV

# Cài đặt Frontend
npm install

# Cài đặt Backend
cd server
npm install
cd ..
```

### Environment Variables

Tạo file `server/.env`:

```env
# Required
NODE_ENV=development
PORT=3001
REDIS_URL=redis://localhost:6379

# Security (PHẢI đổi khi deploy production)
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex-string>

# Upstash Budget Protection (optional)
UPSTASH_DAILY_COMMAND_LIMIT=10000
```

> ⚠️ **Quan trọng**: Trong production, `CREDENTIALS_ENCRYPTION_KEY` PHẢI là một chuỗi hex 64 ký tự ngẫu nhiên. Tạo bằng: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### Chạy ứng dụng

**Development** (cần 2 terminal):

```bash
# Terminal 1 - Backend (modular server)
cd server
npm run dev
# Server chạy tại http://localhost:3001

# Terminal 2 - Frontend
npm run dev
# App chạy tại http://localhost:5173
```

## Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy frontend development server (Vite) |
| `npm run build` | Build production bundle |
| `npm run preview` | Preview production build |
| `cd server && npm run dev` | Chạy backend server (modular, với Redis) |

## Cấu trúc thư mục

```
├── public/                    # Static assets
│   ├── data.json              # Dữ liệu lịch giảng dạy
│   └── CTDT/                  # PDF + CSV chương trình đào tạo
├── server/
│   ├── config/
│   │   └── default.js         # Configuration (ports, TTLs, encryption key)
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   │   ├── authController.js      # Login, logout, refresh
│   │   │   ├── studentController.js   # MyBK API proxy
│   │   │   ├── dkmhController.js      # DKMH registration
│   │   │   └── lmsController.js       # LMS messaging
│   │   ├── middlewares/
│   │   │   ├── authMiddleware.js      # Token validation
│   │   │   └── errorMiddleware.js     # Global error handler
│   │   ├── routes/
│   │   │   └── apiRoutes.js           # All API routes + rate limiters
│   │   ├── services/
│   │   │   ├── redisService.js        # Redis client + SWR cache + budget tracker
│   │   │   └── sessionStore.js        # Session CRUD + AES encryption + refresh tokens
│   │   ├── utils/
│   │   │   ├── logger.js              # Winston logger (auto-mask sensitive data)
│   │   │   ├── masking.js             # MSSV, cookie, URL masking helpers
│   │   │   └── validation.js          # Zod schemas
│   │   └── app.js                     # Express app (rate limiters, CORS, routes)
│   ├── index.js               # Dev server entry point
│   └── index.production.js    # Legacy production server (standalone)
├── src/
│   ├── components/            # React components
│   │   ├── ui/                # Reusable UI (shadcn)
│   │   ├── ScheduleTab.jsx
│   │   ├── ExamTab.jsx
│   │   ├── GpaTab.jsx
│   │   ├── RegistrationTab.jsx
│   │   ├── MyBKLoginCard.jsx
│   │   ├── SecurityPage.jsx
│   │   └── ChangelogPage.jsx
│   ├── services/
│   │   ├── mybkApi.js         # MyBK API client (auth, refresh tokens, caching)
│   │   └── lmsApi.js          # LMS API client (messaging, offline cache)
│   ├── contexts/              # React contexts (Theme, etc.)
│   ├── hooks/                 # Custom hooks (useLocalStorage, etc.)
│   └── App.jsx
├── vite.config.js
└── package.json
```

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `POST` | `/api/auth/login` | ❌ | Đăng nhập MyBK + DKMH (rate limited: 10/15min) |
| `POST` | `/api/auth/refresh` | ❌ | Auto-login bằng refresh token (rate limited: 20/15min) |
| `POST` | `/api/auth/logout` | ✅ | Đăng xuất + xóa refresh token |

### Student Data (MyBK Proxy)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/api/student/info` | ✅ | Thông tin sinh viên |
| `GET` | `/api/student/schedule` | ✅ | Thời khóa biểu |
| `GET` | `/api/student/exam-schedule` | ✅ | Lịch thi |
| `POST` | `/api/student/gpa/summary` | ✅ | Tổng hợp GPA |
| `POST` | `/api/student/gpa/detail` | ✅ | Chi tiết GPA theo môn |

### DKMH (Đăng ký môn học)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/api/dkmh/status` | ✅ | Kiểm tra trạng thái DKMH |
| `GET` | `/api/dkmh/registration-periods` | ✅ | Danh sách đợt đăng ký |
| `POST` | `/api/dkmh/period-details` | ✅ | Chi tiết đợt đăng ký |
| `POST` | `/api/dkmh/search-courses` | ✅ | Tìm kiếm môn học |
| `POST` | `/api/dkmh/register` | ✅ | Đăng ký môn |
| `POST` | `/api/dkmh/cancel` | ✅ | Hủy đăng ký |

### LMS (BK E-Learning)
| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `POST` | `/api/lms/init` | ✅ | Khởi tạo LMS session |
| `GET` | `/api/lms/messages` | ✅ | Danh sách hội thoại |
| `GET` | `/api/lms/messages/:id` | ✅ | Chi tiết hội thoại |
| `GET` | `/api/lms/unread` | ✅ | Đếm tin chưa đọc |

### Monitoring
| Method | Endpoint | Auth | Mô tả |
|--------|----------|:----:|-------|
| `GET` | `/api/health` | ❌ | Health check |
| `GET` | `/api/stats` | ❌ | Server stats (memory, sessions, Redis budget) |
| `GET` | `/api/github/contributors` | ❌ | Contributors list (cached) |

## Redis Data (Upstash)

| Key Pattern | TTL | Nội dung | Mã hóa |
|-------------|-----|----------|:------:|
| `SESSION:<token>` | 15 phút | Session cookies, MSSV, JWT, DKMH token | ✅ AES-256-GCM |
| `REFRESH:<token>` | 7 ngày | Username + password (encrypted) | ✅ AES-256-GCM |
| `SWR:*` | 4 giờ | Cached API responses (schedule, GPA...) | Plaintext |

> 📝 SWR cache không chứa sensitive data (chỉ data đã public qua API), nên không cần encrypt.

## Bảo mật

### Những gì được bảo vệ
- ✅ **Mật khẩu**: Mã hóa AES-256-GCM server-side (nếu bật "Ghi nhớ"), KHÔNG BAO GIỜ lưu plaintext
- ✅ **Session data**: Mã hóa trước khi lưu Redis, tự xóa sau 15 phút
- ✅ **Tokens**: Random hex (32 bytes), không chứa MSSV
- ✅ **Logs**: MSSV masked (221***34), password/cookie không bao giờ log
- ✅ **Rate limiting**: 3 tầng (Global, Per-session, Per-endpoint)
- ✅ **Upstash quota**: Circuit breaker tự bật khi dùng 80% commands/ngày
- ✅ **HTTP headers**: Helmet.js bảo vệ
- ✅ **CORS**: Chỉ cho phép origins được cấu hình

### Những gì KHÔNG thu thập
- ❌ Không tracking, analytics, hoặc cookies theo dõi
- ❌ Không database lưu trữ lâu dài (không MySQL, MongoDB)
- ❌ Không chia sẻ dữ liệu với bên thứ ba
- ❌ Không lưu lịch sử đăng nhập

## Deployment

### Render + Upstash (Production)

1. **Render Web Service**:
   - Build Command: `npm install && npm run build && cd server && npm install`
   - Start Command: `cd server && node index.production.js`

2. **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=10000
   REDIS_URL=rediss://<your-upstash-url>
   CREDENTIALS_ENCRYPTION_KEY=<64-char-hex>
   UPSTASH_DAILY_COMMAND_LIMIT=10000
   ```

3. **Upstash Redis**:
   - Tạo database tại [upstash.com](https://upstash.com)
   - Copy Redis URL (bắt đầu bằng `rediss://` — có TLS)
   - Free tier: 10,000 commands/ngày

### Lưu ý khi deploy
1. **BẮT BUỘC** đổi `CREDENTIALS_ENCRYPTION_KEY` (tạo bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
2. Sử dụng HTTPS (Render tự động cung cấp)
3. Kiểm tra `npm run build` trước khi push
4. Monitor Redis usage qua `/api/stats`

## Xử lý lỗi

| Lỗi | Giải pháp |
|-----|-----------|
| Module not found | `npm install` |
| Port already in use | Đổi port hoặc tắt app khác |
| `ECONNREFUSED` Redis | Kiểm tra `REDIS_URL` hoặc chạy Redis local |
| MAX_SESSIONS_REACHED | Chờ 30s để tự động retry |
| Circuit breaker OPEN | Redis commands gần hết quota — chờ reset midnight UTC |
| Session decrypt error | Key thay đổi — users cần re-login |

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add some amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License
