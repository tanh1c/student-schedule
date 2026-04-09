# Backend Notes

Backend của project nằm trong `server/` và dùng Express + Redis.

## Entry Point

- Development: `server/src/server.js`
- App wiring: `server/src/app.js`

## Run

```bash
cd server
npm install
npm run dev
```

Backend mặc định chạy ở `http://localhost:3001`.

## Environment

Tạo `server/.env`:

```env
NODE_ENV=development
PORT=3001
REDIS_URL=redis://localhost:6379
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex-string>
UPSTASH_DAILY_COMMAND_LIMIT=10000
```

## Test

```bash
npm test -- --runInBand
```

## Structure

- `src/controllers/`: request handlers
- `src/routes/`: route definitions
- `src/services/`: MyBK, DKMH, LMS, Redis, session logic
- `src/middlewares/`: auth + error handling
- `src/utils/`: logger, masking, validation, AppError
- `tests/`: Jest tests

## Important Endpoints

- `GET /api/health`
- `GET /api/stats`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/student/info`
- `GET /api/student/schedule`
- `GET /api/dkmh/registration-periods`
- `GET /api/lms/messages`

Frontend local dev mặc định gọi backend qua Vite proxy từ `http://localhost:5173` sang `http://localhost:3001`.
