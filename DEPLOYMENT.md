# StuSpace Deployment Guide

## Overview

StuSpace currently ships as:

- a Vite frontend built to `dist/`
- an Express backend in `server/`
- an optional Redis layer for session/cache behavior

Production backend entrypoint:

- `server/src/server.js`

Production app wiring:

- `server/src/app.js`

## Recommended Topology

The simplest production setup is:

- one Node web service serving both API and built frontend
- one Redis instance for cache and session support

This repo already supports that layout through:

- `npm run build`
- `npm start`
- `render.yaml`

## Supported Deployment Modes

### 1. Recommended: Single Node Service

Use one service that:

- builds the frontend to `dist/`
- starts the backend with `npm start`
- serves static frontend files from Express in production

Good fit for:

- Render
- Railway
- Fly.io
- a VPS with Node + reverse proxy

### 2. Split Frontend / Backend

You can also deploy:

- frontend on Vercel or Netlify
- backend on Render or Railway

If you split deployment, make sure:

- `CORS_ORIGIN` points to the frontend domain
- frontend API base URL points to the backend domain

## Required Environment Variables

At minimum, production should set:

```env
NODE_ENV=production
PORT=3001
REDIS_URL=rediss://...
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex-string>
CORS_ORIGIN=https://your-frontend-domain
```

Optional but useful:

```env
GITHUB_TOKEN=<optional-github-token>
UPSTASH_DAILY_COMMAND_LIMIT=10000
```

## Build And Start

Install dependencies:

```bash
npm install
npm --prefix server install
```

Build frontend:

```bash
npm run build
```

Start production server:

```bash
npm start
```

## Security Checklist

Before deploying publicly, make sure:

- HTTPS is enabled
- `.env` is not committed
- `CORS_ORIGIN` is narrowed to the real frontend domain
- `CREDENTIALS_ENCRYPTION_KEY` is set in production
- Redis is configured if you want stable session/cache behavior
- old debug artifacts under `server/docs/debug/` are not shipped around casually
- `/api/health` and `/api/stats` are monitored

## Verify After Deploy

Check these first:

- `GET /api/health`
- load `/`
- login flow
- schedule fetch
- LMS/deadline fetch if enabled

## Notes

- The repo still uses the current GitHub slug `student-schedule` in GitHub-facing integrations until the remote repository is renamed.
- For a Render-specific walkthrough, see `RENDER-DEPLOY.md`.
