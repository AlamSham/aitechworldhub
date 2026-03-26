# Frontend (Next.js 16 + Tailwind)

## Setup

1. Copy env:
   cp .env.example .env.local
2. Install deps:
   npm install
3. Run:
   npm run dev

## Key Routes

- `/` landing + latest published posts
- `/admin` admin login + dashboard
- `/admin/drafts/[id]` editor + image upload + publish
- `/posts` public published articles
- `/posts/[slug]` public article detail

## Notes

- Uses Tailwind CSS v4 (`@tailwindcss/postcss`).
- Admin auth token is stored in `localStorage`.
- Public pages fetch from backend `GET /api/public/posts` endpoints.
