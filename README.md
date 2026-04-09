# TKB Smart

TKB Smart là workspace học tập dành cho sinh viên HCMUT, giúp gom các nhu cầu thường ngày vào một nơi: thời khóa biểu, lịch thi, CTĐT, GPA, roadmap học tập, ĐKMH, lịch giảng dạy và LMS.

## Highlights

- Thời khóa biểu cá nhân với dữ liệu MyBK và trải nghiệm xem lịch tối ưu cho cả desktop lẫn mobile
- Tin nhắn LMS và deadline LMS ngay trong app, có cache để dùng ổn định hơn
- Roadmap học tập để tự lên kế hoạch từng học kỳ, đặt aim GPA và ghi chú môn học
- CTĐT, GPA, ĐKMH và các tiện ích học tập khác trong cùng một giao diện

## Quick Start

Yêu cầu:

- Node.js 18+
- npm
- Redis nếu muốn chạy đầy đủ các flow backend/login/cache

Cài dependencies:

```bash
npm install
npm --prefix server install
```

Tạo `server/.env`:

```env
NODE_ENV=development
PORT=3001
REDIS_URL=redis://localhost:6379
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex-string>
UPSTASH_DAILY_COMMAND_LIMIT=10000
```

Tạo key mã hóa:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Chạy local:

```bash
npm run dev:all
```

Mặc định:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

Nếu cần chạy riêng:

```bash
npm run dev:web
npm run dev:server
```

## Scripts

- `npm run dev`: chạy Vite dev server
- `npm run dev:web`: chạy frontend
- `npm run dev:server`: chạy backend
- `npm run dev:all`: chạy frontend + backend cùng lúc
- `npm run lint`: lint toàn bộ source đang active
- `npm run test:server`: chạy test backend
- `npm run build`: build production cho frontend

## Project Structure

- `src/app`: app shell, menu config, tab registry
- `src/features`: các feature chính như Messages, Roadmap, Curriculum, Registration, Deadlines
- `src/shared`: shared UI, hooks, lib
- `server`: backend Express
- `public`: static assets

## Production Notes

Backend production có thể serve trực tiếp frontend từ `dist/`. File `render.yaml` là điểm bắt đầu tốt nếu bạn muốn deploy toàn app như một web service Node.

## Quality Check

Trước khi commit, nên chạy:

```bash
npm run lint
npm run build
npm run test:server
```

## Tracking

Tiến độ refactor hiện được ghi tại `REFACTOR_PROGRESS.md`.
