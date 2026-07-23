# Setting up Google Sign-In

This covers two things: (1) getting a real Google OAuth Client ID, and (2) the small
backend addition needed so your existing Express/Prisma API can verify Google tokens and
issue your own JWT (so the rest of your app — role checks, protected routes — doesn't
need to change at all).

## 1. Get a Google OAuth Client ID

1. Go to https://console.cloud.google.com/ and create a project (or pick an existing one).
2. In the left sidebar: **APIs & Services → OAuth consent screen**.
   - User type: **External** (unless you have a Workspace org).
   - Fill in app name, your email as support/developer contact.
   - Scopes: the defaults (`email`, `profile`, `openid`) are enough — don't add anything else.
   - Add your own email under **Test users** while the app is in "Testing" mode (fine for
     an interview/demo project — no need to submit for verification).
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Web application**.
   - **Authorized JavaScript origins** — add all of these:
     - `http://localhost:5173`
     - your Netlify URL once you have it, e.g. `https://autovault-demo.netlify.app`
   - You do **not** need a redirect URI for this flow (the frontend library handles it
     entirely client-side via a popup / One Tap).
4. Click Create. Copy the **Client ID** (looks like `xxxx.apps.googleusercontent.com`).
   You do **not** need the Client Secret for this flow — the frontend only ever sends the
   ID token, and the backend verifies it against Google's public keys.
5. Put the Client ID in:
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID`
   - `backend/.env` → `GOOGLE_CLIENT_ID` (used server-side to verify the token's audience)

## 2. Add the backend endpoint

The frontend calls `POST /api/auth/google` with `{ credential: "<google id token>" }` and
expects back the same `{ user, token }` shape your `/login` and `/register` endpoints
already return. Add the following to your existing backend:

**Install the verifier:**
```bash
cd backend
pnpm add google-auth-library
```

**`backend/src/services/auth.service.ts`** — add this alongside your existing
`registerUser`/`loginUser`:

```ts
import { OAuth2Client } from "google-auth-library";
import { env } from "../config/env.js";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

export const loginWithGoogle = async (idToken: string) => {
  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) {
    throw new Error("INVALID_GOOGLE_TOKEN");
  }

  // Find or create the user. Google-authenticated users don't have a local
  // password — store a random unusable hash so the column stays non-null.
  let user = await prisma.user.findUnique({ where: { email: payload.email } });
  if (!user) {
    const randomPassword = await bcrypt.hash(crypto.randomUUID(), SALT_ROUNDS);
    user = await prisma.user.create({
      data: {
        name: payload.name ?? payload.email.split("@")[0],
        email: payload.email,
        password: randomPassword,
        role: "USER",
      },
    });
  }

  const token = signJwt({ userId: user.id, role: user.role });
  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
};
```

Add the two missing imports at the top of that file (`import crypto from "node:crypto";`
sits alongside the existing `bcrypt` import).

**`backend/src/controllers/auth.controller.ts`** — add a controller:

```ts
export const google = async (req: Request, res: Response) => {
  const { credential } = req.body as { credential?: string };
  if (!credential) {
    return res.status(400).json({ error: "Missing Google credential" });
  }
  try {
    const result = await loginWithGoogle(credential);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(401).json({ error: "Google authentication failed" });
  }
};
```
(Import `loginWithGoogle` alongside your existing `loginUser`/`registerUser` import.)

**`backend/src/routes/auth.routes.ts`** — add one line:

```ts
router.post("/google", google);
```

**`backend/src/config/env.ts`** — add `GOOGLE_CLIENT_ID` to the Zod schema:

```ts
GOOGLE_CLIENT_ID: z.string().nonempty(),
```

**`backend/.env`** — add:
```env
GOOGLE_CLIENT_ID=xxxx.apps.googleusercontent.com
```

That's it — no schema migration needed, since Google users are just rows in your
existing `User` table with a role of `USER`.
