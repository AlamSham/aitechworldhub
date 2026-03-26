# Backend (Node.js + Express + MVC + MongoDB)

## Setup

1. Copy env:
   cp .env.example .env
2. Install deps:
   npm install
3. Run:
   npm run dev

## API

- GET /health
- POST /api/auth/register (header: `x-admin-setup-key`)
- POST /api/auth/login
- GET /api/auth/me (Bearer token)
- POST /api/sync/manual (Bearer token)
- GET /api/drafts (Bearer token)
- GET /api/drafts/:id (Bearer token)
- PATCH /api/drafts/:id (Bearer token)
- POST /api/images/cloudinary (Bearer token, `multipart/form-data`, field: `image`)

## Notes

- Cron auto-sync runs every `SYNC_INTERVAL_HOURS`.
- Drafts are created using RSS + OpenAI and saved with `status=draft`.
- `imageUrl` + `imagePublicId` store Cloudinary references (content stays lightweight).
- Set strong `JWT_ACCESS_SECRET` and `ADMIN_SETUP_KEY` in `.env`.
- RSS ingestion now applies strict relevance filtering for AI + China/US context + practical use cases.
- Tune filter strictness with `SOURCE_MIN_RELEVANCE_SCORE` (default `4`).
