# 🚀 Hướng dẫn Deploy StuSpace

## 📋 Tổng quan

Ứng dụng này bao gồm:
- **Frontend (FE)**: React + Vite (static files)
- **Backend (BE)**: Node.js + Express (API proxy cho MyBK/DKMH)

## 🔐 Yêu cầu bảo mật QUAN TRỌNG

Vì BE xử lý credentials của người dùng (tài khoản MyBK), cần đảm bảo:

### 1. HTTPS bắt buộc
- Cả FE và BE đều PHẢI chạy trên HTTPS
- Không bao giờ truyền credentials qua HTTP

### 2. Không lưu trữ password
- ⚠️ Code hiện tại đang lưu password trong session (line 201-202)
- Cần xóa việc lưu password sau khi login xong

### 3. Environment Variables
- Không hardcode bất kỳ secrets nào
- Sử dụng `.env` cho local, env vars cho production

### 4. Rate Limiting
- Giới hạn số request để tránh brute force
- Khuyến nghị: 5 login attempts / IP / 15 minutes

### 5. CORS Configuration
- Chỉ cho phép origin cụ thể của FE
- Không dùng wildcard (`*`)

---

## 🏗️ Cấu trúc Deploy

### Option 1: Vercel (FE) + Railway/Render (BE) - KHUYẾN NGHỊ

#### Frontend trên Vercel (FREE)
```bash
# 1. Build production
npm run build

# 2. Deploy với Vercel CLI
npx vercel --prod
```

**Cấu hình `vercel.json`:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

#### Backend trên Railway (FREE tier)
```bash
# 1. Tạo repo riêng cho server hoặc dùng monorepo
# 2. Connect Railway với GitHub
# 3. Set environment variables trên Railway dashboard
```

**Environment Variables cần set:**
```
NODE_ENV=production
PORT=3001
ALLOWED_ORIGIN=https://your-frontend.vercel.app
SESSION_SECRET=<random-32-char-string>
```

### Option 2: Render (Full-stack FREE)

Render hỗ trợ cả static sites và web services miễn phí.

---

## 🔧 Cập nhật code cho Production

### 1. Tạo file `.env.example`
```env
NODE_ENV=development
PORT=3001
ALLOWED_ORIGIN=http://localhost:3000
SESSION_SECRET=your-secret-key-here
```

### 2. Cập nhật server/index.js

Xem file `server/index.production.js` để áp dụng các thay đổi bảo mật.

---

## 📦 Scripts cần thêm vào package.json

```json
{
  "scripts": {
    "build": "vite build",
    "start:server": "node server/index.js",
    "start:prod": "NODE_ENV=production node server/index.js"
  }
}
```

---

## 🛡️ Checklist bảo mật trước khi deploy

- [ ] Xóa tất cả `console.log` chứa thông tin nhạy cảm
- [ ] Xóa các file debug trong `server/docs/debug/`
- [ ] Cấu hình CORS chỉ cho phép domain FE
- [ ] Enable HTTPS
- [ ] Thêm rate limiting
- [ ] Thêm helmet.js cho HTTP headers
- [ ] Xóa việc lưu password trong session
- [ ] Set secure cookie options
- [ ] Thêm input validation

---

## 🌐 Cấu hình DNS (nếu dùng domain riêng)

1. **Frontend**: Point domain tới Vercel
2. **Backend**: Dùng subdomain như `api.yourdomain.com`

---

## 💡 Lưu ý quan trọng

1. **Session Storage**: Hiện tại dùng in-memory (`Map`). 
   - Production nên dùng Redis hoặc database
   - In-memory sẽ mất session khi server restart

2. **Scalability**: Với in-memory sessions, không thể scale horizontal
   - Cần migrate sang Redis nếu muốn multiple instances

3. **Monitoring**: Thêm logging service như:
   - Sentry (error tracking)
   - LogTail/Papertrail (logs)

4. **Backup**: Không lưu dữ liệu người dùng trên server
   - Tất cả data đều được fetch từ MyBK
   - Không cần backup database

---

## 📞 Liên hệ hỗ trợ

Nếu gặp vấn đề khi deploy, vui lòng tạo issue trên GitHub repo.
