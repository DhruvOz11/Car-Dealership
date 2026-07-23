# AutoVault — Frontend

React + TypeScript + Tailwind SPA for the Car Dealership Inventory System. Built against
the existing `incubyte/backend` API (Express + Prisma 7 + PostgreSQL).

## Run locally

```bash
npm install
cp .env.example .env
# edit .env — see below
npm run dev
```

Opens at `http://localhost:5173`.

## Environment variables (`.env`)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

- `VITE_API_BASE_URL` — your backend's base URL, **including `/api`**. Locally that's your
  backend's `PORT` from its own `.env`; once deployed, this becomes your Railway URL.
- `VITE_GOOGLE_CLIENT_ID` — see `GOOGLE_AUTH_SETUP.md` in this folder.

## What's included

- Email/password login + registration (matches the existing `/api/auth/register` and
  `/api/auth/login` endpoints exactly — no backend changes needed for these).
- "Continue with Google" on both Login and Register, which POSTs the Google ID token to
  `/api/auth/google`. **This endpoint doesn't exist on the backend yet** — see
  `GOOGLE_AUTH_SETUP.md`, which includes the exact code to add it.
- Guest-browsable inventory (matches the brief: viewing vehicles doesn't require login,
  only purchasing does).
- Admin dashboard (create/edit/delete/restock) gated by `role === "ADMIN"`.

## Deploying

See `DEPLOYMENT.md` for the full Railway (backend) + Netlify (frontend) + Neon (Postgres)
walkthrough.
