# MyBK Student Portal (TKB Smart)

Ứng dụng full-stack giúp sinh viên HCMUT quản lý thời khóa biểu, lịch thi, GPA, CTDT, DKMH, tin nhắn LMS và một số tiện ích học tập khác.

## Repo Layout

- `src/app/`: app shell, menu config, tab registry.
- `src/features/`: feature entrypoints cho Registration, Messages, Roadmap, Curriculum, Deadlines.
- `src/shared/`: shared hooks/ui/lib wrappers cho kiến trúc mới.
- `src/components/`: phần UI hiện có và compatibility stubs trong lúc migrate dần.
- `public/`: static assets dùng khi chạy app.
- `server/`: backend Express + Redis + test suite.
- Root configs: `package.json`, `vite.config.js`, `eslint.config.js`, `tailwind.config.js`, `render.yaml`.

Một số thư mục dữ liệu/crawl/backup ở root là dữ liệu cục bộ hoặc đầu vào xử lý riêng, không phải phần runtime chính của ứng dụng.

## Requirements

- Node.js 18+
- npm
- Redis cho backend nếu cần chạy flow đăng nhập/cache đầy đủ

## Install

```bash
npm install
cd server
npm install
cd ..
```

## Environment

Tạo `server/.env`:

```env
NODE_ENV=development
PORT=3001
REDIS_URL=redis://localhost:6379
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex-string>
UPSTASH_DAILY_COMMAND_LIMIT=10000
```

Tạo key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Development

Web chạy ở `http://localhost:5173`.

Backend chạy bằng entrypoint `server/src/server.js` và mặc định nghe ở `http://localhost:3001`.

```bash
npm run dev:web
npm run dev:server
```

Hoặc chạy cùng lúc:

```bash
npm run dev:all
```

`vite.config.js` hiện không tự mở browser để script `dev:all` chạy ổn định hơn trong môi trường local/sandbox.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | chạy Vite dev server |
| `npm run dev:web` | chạy frontend dev server |
| `npm run dev:server` | chạy backend bằng `npm --prefix server run dev` |
| `npm run dev:all` | chạy frontend + backend cùng lúc |
| `npm run lint:web` | lint active frontend source + web configs |
| `npm run lint:server` | lint backend source + tests |
| `npm run lint` | chạy cả web và server lint |
| `npm run test:server` | chạy Jest của backend theo `--runInBand` |
| `npm run build` | build frontend production bundle |
| `npm run preview` | preview bundle Vite |

## Architecture

```text
React/Vite frontend  ->  Express backend  ->  MyBK / DKMH / LMS
                                      |
                                      -> Redis / Upstash
```

Backend production mode có thể serve luôn frontend từ `dist/`.

## Quality Gates

Trước khi commit, nên chạy:

```bash
npm run lint
npm run build
npm run test:server
```

## Deployment

`render.yaml` hiện mô tả deploy kiểu một web service Node:

- build frontend ở root
- start backend qua root `npm start`
- backend sẽ serve static files từ `dist/` khi `NODE_ENV=production`

## Refactor Tracking

Tiến độ refactor hiện được track ở `REFACTOR_PROGRESS.md`.
