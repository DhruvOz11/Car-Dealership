# Going live: Neon + Railway + Netlify

Realistic time budget: ~15 min database, ~25 min backend, ~15 min frontend, rest for
Google OAuth + fixing the one or two env-var typos everyone hits. Do them in this order —
each step needs the previous one's output.

## 1. Database — Neon (cloud Postgres, free tier)

1. https://neon.tech → sign up → **Create a project**.
2. Neon gives you a connection string immediately. Copy the **pooled** connection string
   (it will say "Pooled connection" — use this one, not the direct one, since Railway's
   backend will make short-lived connections). It looks like:
   `postgresql://user:password@ep-xxxx-pooler.region.aws.neon.tech/dbname?sslmode=require`
3. Save this — it's your `DATABASE_URL`.

## 2. Backend — Railway

1. https://railway.app → **New Project → Deploy from GitHub repo** → pick your repo.
2. Set the **root directory** to `backend` (Railway builds monorepos fine if you point it
   at the subfolder — under the service's **Settings → Root Directory**).
3. **Variables** tab — add:
   ```
   DATABASE_URL=<your Neon pooled connection string>
   JWT_SECRET=<any random string, 32+ chars — generate with: openssl rand -hex 32>
   NODE_ENV=production
   GOOGLE_CLIENT_ID=<from GOOGLE_AUTH_SETUP.md, if you added Google auth>
   ```
   Do **not** set `PORT` — Railway injects its own and your `env.ts` already falls back
   correctly.
4. **Settings → Deploy**: set the build command and start command if not auto-detected:
   - Build: `pnpm install && pnpm prisma generate && pnpm prisma migrate deploy && pnpm build`
   - Start: `pnpm start`
5. Deploy. Once it's up, Railway gives you a public URL like
   `https://backend-production-xxxx.up.railway.app`. Test it:
   ```bash
   curl https://your-backend.up.railway.app/api/vehicles
   ```
   You should get `[]` (empty array, no vehicles yet) — that confirms the DB connection
   and migrations ran.
6. **Fix CORS** — your `app.ts` currently only allows `http://localhost:5173`. Before
   deploying, change:
   ```ts
   app.use(cors({ origin: [\"http://localhost:5173\"] }));
   ```
   to:
   ```ts
   app.use(
     cors({
       origin: [\"http://localhost:5173\", process.env.FRONTEND_URL ?? \"\"].filter(Boolean),
     }),
   );
   ```
   and add `FRONTEND_URL=https://your-site.netlify.app` to Railway's variables once you
   have your Netlify URL from step 3.

## 3. Frontend — Netlify

1. https://app.netlify.com → **Add new site → Import an existing project** → your repo.
2. **Base directory**: `frontend`. **Build command**: `npm run build`. **Publish
   directory**: `frontend/dist`.
3. **Site settings → Environment variables** — add:
   ```
   VITE_API_BASE_URL=https://your-backend.up.railway.app/api
   VITE_GOOGLE_CLIENT_ID=<from GOOGLE_AUTH_SETUP.md>
   ```
4. Because this is a client-side router (React Router), add a redirect rule so deep
   links like `/admin` don't 404 on refresh. Create `frontend/public/_redirects` with:
   ```
   /*    /index.html   200
   ```
5. Deploy. Copy the Netlify URL and go back to Railway to set `FRONTEND_URL` (step 2.6)
   and to Google Cloud Console to add it as an authorized JavaScript origin (see
   `GOOGLE_AUTH_SETUP.md` step 3).
6. Redeploy the backend (Railway) after adding `FRONTEND_URL` so CORS picks it up.

## Order that avoids round-trips

Neon → Railway (backend) → note the Railway URL → Netlify (frontend, using that URL) →
note the Netlify URL → back to Railway to add `FRONTEND_URL` → back to Google Cloud
Console to whitelist the Netlify origin → redeploy backend once more.

## Smoke test once both are live

```bash
# Register
curl -X POST https://your-backend.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin","email":"admin@test.com","password":"password123"}'

# You'll get a USER role by default — promote yourself to ADMIN directly in
# Neon's SQL editor (Neon console → SQL Editor):
# UPDATE users SET role = 'ADMIN' WHERE email = 'admin@test.com';
```
Then open your Netlify URL, log in, and you should see the Admin link in the navbar.
