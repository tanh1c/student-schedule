# 🚀 Hướng dẫn Deploy lên Render (Full-stack)

## 📝 Tổng quan

Render sẽ host **cả Frontend và Backend** trong 1 Web Service duy nhất:
- Express server serve React static files từ `/dist`
- API endpoints tại `/api/*`
- HTTPS tự động ✅
- FREE tier có sẵn ✅

---

## 🔧 Bước 1: Chuẩn bị code

### 1.1 Kiểm tra các file đã có:

```
✅ render.yaml              - Cấu hình Render
✅ server/index.production.js - Server production
✅ .env.example             - Template env vars
✅ package.json             - Scripts đã sẵn sàng
```

### 1.2 Xóa các file debug (quan trọng!):

```bash
# Xóa file debug chứa thông tin nhạy cảm
rm -f server/debug_*.html server/debug_*.json
```

### 1.3 Commit và push lên GitHub:

```bash
git add .
git commit -m "Ready for Render deployment"
git push origin main
```

---

## 🌐 Bước 2: Tạo Web Service trên Render

### 2.1 Truy cập Render Dashboard

1. Vào [https://dashboard.render.com](https://dashboard.render.com)
2. Đăng ký/Đăng nhập (có thể dùng GitHub)

### 2.2 Tạo Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect với GitHub repo của bạn
3. Chọn repo `student-schedule` (hoặc tên repo của bạn)

### 2.3 Cấu hình Service

| Field | Value |
|-------|-------|
| **Name** | `student-schedule` |
| **Region** | `Singapore (Southeast Asia)` |
| **Branch** | `main` |
| **Runtime** | `Node` |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm start` |
| **Instance Type** | `Free` |

### 2.4 Environment Variables

Click **"Add Environment Variable"** và thêm:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `SESSION_SECRET` | *(Click "Generate" để tạo random)* |

> ⚠️ **LƯU Ý**: Không cần set `ALLOWED_ORIGIN` vì FE và BE cùng domain.

---

## 🚀 Bước 3: Deploy

1. Click **"Create Web Service"**
2. Đợi Render build (khoảng 2-5 phút lần đầu)
3. Khi thấy **"Your service is live"** → Thành công! 🎉

### URL của bạn:
```
https://student-schedule.onrender.com
```
*(Tên sẽ tự động thêm random nếu trùng)*

---

## ⚡ Auto Deploy

Mỗi khi bạn push code lên GitHub, Render sẽ tự động:
1. Pull code mới
2. Run `npm install && npm run build`
3. Restart server với code mới

---

## 🔍 Kiểm tra deployment

### Health Check:
```
https://your-app.onrender.com/api/health
```

Kết quả mong đợi:
```json
{"status":"ok","timestamp":"2026-01-12T..."}
```

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

### 2. Để tránh sleep (optional):
- Upgrade lên Starter ($7/tháng)
- Hoặc dùng [UptimeRobot](https://uptimerobot.com) ping mỗi 14 phút

### 3. Sessions:
- Hiện tại dùng in-memory sessions
- Khi server restart, tất cả sessions sẽ bị xóa
- Users cần đăng nhập lại

### 4. Logs:
- Xem logs tại: Dashboard → Service → Logs
- Hữu ích để debug lỗi

---

## 🛠️ Troubleshooting

### Build failed:
```
Error: Cannot find module 'xxx'
```
→ Chạy `npm install xxx --save` và push lại

### 502 Bad Gateway:
→ Kiểm tra Logs, có thể server crash
→ Đảm bảo `npm start` chạy được local

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

### Health Endpoint:
```javascript
// Tự động ping mỗi phút
GET /api/health → {"status":"ok"}
```

---

## 🔐 Security Checklist

- [x] HTTPS enabled (tự động)
- [x] Helmet HTTP headers
- [x] Rate limiting login
- [x] Session expiry (1 giờ)
- [x] No password storage
- [x] Input sanitization
- [ ] *(Optional)* Redis sessions
- [ ] *(Optional)* Custom domain

---

## 📞 Support

Nếu gặp vấn đề:
1. Kiểm tra [Render Status](https://status.render.com)
2. Xem [Render Docs](https://render.com/docs)
3. Tạo issue trên GitHub repo

---

Happy deploying! 🎉
