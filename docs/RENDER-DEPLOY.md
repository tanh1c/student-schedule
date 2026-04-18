# StuSpace on Render

## Recommended Setup

For the current repo, the cleanest Render setup is:

- one Render web service named `stuspace`
- one Redis instance, for example Upstash `stuspace-cache`

The repo already includes:

- `render.yaml`
- backend production static serving from `dist`
- `/api/health` for health checks

## 1. Prepare Redis

Create a Redis database and keep its connection string ready:

- Upstash is fine for small deployments
- use the `rediss://...` TLS URL in production

## 2. Connect The Repo

On Render:

1. Create a new web service
2. Connect this GitHub repo
3. If the GitHub repo has not been renamed yet, the slug may still be `student-schedule`
4. Prefer deploying from `main`

## 3. Use `render.yaml`

This repo already defines a Render blueprint in `render.yaml`.

Current default service naming:

- service name: `stuspace`

If you deploy manually instead of using the blueprint, match the same behavior:

- build command: install root + server deps, then `npm run build`
- start command: `npm start`

## 4. Required Environment Variables

Set these in Render:

```env
NODE_ENV=production
PORT=3001
REDIS_URL=rediss://...
CREDENTIALS_ENCRYPTION_KEY=<64-char-hex-string>
CORS_ORIGIN=https://your-render-domain-or-custom-domain
```

Optional:

```env
GITHUB_TOKEN=<optional-github-token>
UPSTASH_DAILY_COMMAND_LIMIT=10000
```

## 5. Deploy

After the service is created:

1. trigger the first deploy
2. wait for build and boot to finish
3. verify health and app load

Expected checks:

- `https://your-app.onrender.com/api/health`
- `https://your-app.onrender.com/`

## 6. Post-Deploy Checks

Verify:

- frontend loads correctly
- backend responds on `/api/health`
- login/session flow works
- schedule and LMS-backed flows still work
- Redis is connected if you expect cache/session persistence

## Operational Notes

- Render free tier may sleep after inactivity
- first request after sleep can be slow
- if Redis is unavailable, some flows may fall back less gracefully depending on the service path

## Cleanup Notes

Before shipping or sharing debugging artifacts, keep `server/docs/debug/` clean.

## Related Docs

- `../README.md`
- `DEPLOYMENT.md`
- `../server/README.md`
