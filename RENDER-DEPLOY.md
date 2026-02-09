# 🚀 Hướng dẫn Deploy lên Render (Full-stack với Redis)

## 📝 Tổng quan

Render sẽ host **cả Frontend và Backend** trong 1 Web Service duy nhất:
- Express server serve React static files từ `/dist`
- API endpoints tại `/api/*`
- **Redis cache** từ Upstash để lưu session
- HTTPS tự động ✅
- FREE tier có sẵn ✅

---

## 🗄️ Bước 1: Setup Redis trên Upstash (FREE)

### 1.1 Tạo Redis Database

1. Truy cập [https://console.upstash.com](https://console.upstash.com)
2. Đăng ký/Đăng nhập (có thể dùng GitHub)
3. Click **"Create Database"**
4. Chọn:
   - **Name**: `student-schedule-cache`
   - **Type**: `Regional`
   - **Region**: `Singapore` (gần Việt Nam)
5. Click **"Create"**

### 1.2 Lấy Connection String

1. Sau khi tạo xong, vào database
2. Copy **Redis URL** (dạng `rediss://default:xxx@xxx.upstash.io:6379`)
3. Lưu lại để dùng ở bước sau

> ⚠️ **LƯU Ý**: Upstash FREE tier cho 10,000 commands/day - đủ cho ứng dụng nhỏ

---

## 🔧 Bước 2: Chuẩn bị code

### 2.1 Kiểm tra các file đã có:

```
✅ render.yaml              - Cấu hình Render (đã cập nhật)
✅ server/src/server.js     - Server mới với Redis
✅ server/src/services/redisService.js - Redis service
✅ .env.example             - Template env vars
✅ package.json             - Scripts đã sẵn sàng
```

### 2.2 Xóa các file debug (quan trọng!):

```bash
# Xóa file debug chứa thông tin nhạy cảm
rm -f server/debug_*.html server/debug_*.json
```

### 2.3 Commit và push lên GitHub:

```bash
git add .
git commit -m "Ready for Render deployment with Redis"
git push origin test-feature
```

---

## 🌐 Bước 3: Tạo Web Service trên Render

### 3.1 Truy cập Render Dashboard

1. Vào [https://dashboard.render.com](https://dashboard.render.com)
2. Đăng ký/Đăng nhập (có thể dùng GitHub)

### 3.2 Tạo Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect với GitHub repo của bạn
3. Chọn repo `student-schedule` (hoặc tên repo của bạn)

### 3.3 Cấu hình Service

| Field | Value |
|-------|-------|
| **Name** | `student-schedule` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `test-feature` ⚠️ |
| **Runtime** | `Node` |
| **Build Command** | `npm install --include=dev && cd server && npm install && cd .. && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 3.4 Environment Variables (QUAN TRỌNG!)

Click **"Add Environment Variable"** và thêm:

| Key | Value | Ghi chú |
|-----|-------|---------|
| `NODE_ENV` | `production` | Bắt buộc |
| `PORT` | `3001` | Bắt buộc |
| `SESSION_SECRET` | *(Generate random)* | Click "Generate" |
| `REDIS_URL` | `rediss://default:xxx@xxx.upstash.io:6379` | ⚠️ Copy từ Upstash |
| `CORS_ORIGIN` | `*` | Cho phép tất cả origin |

> ⚠️ **QUAN TRỌNG**: `REDIS_URL` phải copy chính xác từ Upstash dashboard!

---

## 🚀 Bước 4: Deploy

1. Click **"Create Web Service"**
2. Đợi Render build (khoảng 3-7 phút lần đầu)
3. Khi thấy **"Your service is live"** → Thành công! 🎉

### URL của bạn:
```
https://student-schedule.onrender.com
```
*(Tên sẽ tự động thêm random nếu trùng)*

---

## ⚡ Auto Deploy

Mỗi khi bạn push code lên branch `test-feature`, Render sẽ tự động:
1. Pull code mới
2. Run build command
3. Restart server với code mới

---

## 🔍 Kiểm tra deployment

### Health Check:
```
https://your-app.onrender.com/api/health
```

Kết quả mong đợi:
```json
{"status":"ok","timestamp":"2026-02-09T..."}
```

### Kiểm tra Redis:
```
https://your-app.onrender.com/api/stats
```

Sẽ hiển thị thông tin memory, sessions, và Redis status.

### Truy cập app:
```
https://your-app.onrender.com
```

---

## ⚠️ Lưu ý quan trọng

### 1. Free tier limitations:
- Server sẽ **sleep sau 15 phút không hoạt động**
- Request đầu tiên sau khi sleep sẽ mất **~30-50 giây** để wake up
- Giới hạn 750 giờ/tháng (đủ cho 1 service chạy 24/7)

### 2. Redis limitations (Upstash FREE):
- 10,000 commands/day
- 256MB storage
- Đủ cho caching và sessions

### 3. Để tránh sleep (optional):
- Upgrade lên Starter ($7/tháng)
- Hoặc dùng [UptimeRobot](https://uptimerobot.com) ping mỗi 14 phút

### 4. Sessions:
- **Với Redis**: Sessions được lưu trên Upstash, không mất khi restart
- **Không có Redis**: Fallback về in-memory, mất khi restart

### 5. Logs:
- Xem logs tại: Dashboard → Service → Logs
- Hữu ích để debug lỗi

---

## 🛠️ Troubleshooting

### Build failed:
```
Error: Cannot find module 'xxx'
```
→ Kiểm tra `server/package.json` có đủ dependencies không
→ Chạy `cd server && npm install xxx --save` và push lại

### 502 Bad Gateway:
→ Kiểm tra Logs, có thể server crash
→ Đảm bảo `REDIS_URL` đúng format
→ Kiểm tra Upstash dashboard xem Redis có hoạt động không

### Redis connection failed:
→ Kiểm tra `REDIS_URL` trong Environment Variables
→ Đảm bảo dùng `rediss://` (có 's' - TLS) không phải `redis://`
→ Server sẽ fallback về in-memory nếu Redis fail

### API 404:
→ Đảm bảo đã build frontend (`npm run build`)
→ Kiểm tra folder `dist/` có tồn tại

### Login không hoạt động:
→ Kiểm tra SESSION_SECRET đã set
→ Kiểm tra logs xem có lỗi gì không

---

## 📊 Monitoring

### Render Dashboard:
- **Metrics**: CPU, Memory usage
- **Logs**: Realtime server logs
- **Deploy History**: Rollback nếu cần

### Upstash Dashboard:
- **Commands**: Số lượng Redis commands
- **Memory**: Dung lượng đã dùng
- **Latency**: Thời gian phản hồi

### API Stats Endpoint:
```javascript
GET /api/stats → {memory, sessions, redis, uptime}
```

---

## 🔐 Security Checklist

- [x] HTTPS enabled (tự động)
- [x] Helmet HTTP headers
- [x] Rate limiting login
- [x] Session expiry (15 phút)
- [x] No password storage
- [x] Input sanitization
- [x] Redis sessions (với Upstash)
- [ ] *(Optional)* Custom domain

---

## 🔄 Switching between branches

Nếu muốn deploy branch khác:
1. Vào Render Dashboard → Service → Settings
2. Thay đổi **Branch** thành branch muốn deploy
3. Click **"Save Changes"**
4. Manual deploy hoặc đợi auto-deploy

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra [Render Status](https://status.render.com)
2. Kiểm tra [Upstash Status](https://status.upstash.com)
3. Xem [Render Docs](https://render.com/docs)
4. Tạo issue trên GitHub repo

---

Happy deploying! 🎉
