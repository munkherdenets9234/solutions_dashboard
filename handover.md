# admin (travel agency admin) — handover (2026-10-01)

## Update 2026-10-02 (latest; supersedes the "uncommitted" status above)

- Branch `master`, clean, 6 commits unpushed. **Forgot-password page: committed (`ddce295`) and verified live** end to end (code arrives, reset works). The "Task 5 uncommitted / not clicked through" text above is out of date.
- **System > Translations (new):** list of 37 pages and an editor (EN/MN/KO side by side; string, string-list and object-list editors; a blank language means the shipped wording). `src/app/(dashboard)/translations/`, `src/components/admin/TranslationsEditor.tsx`, pure helpers in `src/lib/translations-edit.mjs` with tests (`node --test src/lib/translations-edit.test.mjs`). Identifier fields named exactly `key`, `id`, `icon` are read-only on stored items. The editor loads each entry's `base` and sends it back untouched on save (`94385a9`); if an old build saves, `base` is dropped (safe; `--sync` in the E&S site repo re-attaches it).
- Verified in the browser on 2026-10-02: list, editing a string, save, the public API shows it, reset drops it. Not exercised: adding/removing/reordering list items.
- Checks: `npx tsc --noEmit` clean; `npx eslint src` has a **pre-existing** error in `(dashboard)/tours/page.tsx:39`, so lint only touched files. There is no `npm test`; adding a script to `package.json` trips the pre-commit `npm audit` hook.
- E&S's subscription ends **2026-10-20**; after that saves return 402.

- **Ports / how to start (2026-10-02):** tenantcore :8092, digitalservice :8080, travel admin :3001, inno dashboard :3011, carwash :8091, carwash-web :3002. The launch-config entry `eandstravelmongolia` serves 404 on every page (its `npm --prefix` form starts Next from the repo root): start the E&S site with `npm run dev -- -p 3000` from `eandstravelmongolia/`. Port 3000 may be another project; check the page title.
- **Pushing is blocked from this machine:** GitHub answers `Permission denied (publickey)` for `~/.ssh/id_ed25519`. Nothing from the 2026-10-01/02 sessions was pushed except what the user pushed themselves (tenantcore `backend-update` was merged as PR #1). Unpushed at last check: digitalservice 13, E&S site 7, travel admin 6, inno admin 6, inno site 1, carwash 1, carwash-web 1.
- **Production tenantcore** is `https://core-backend-5cjs.onrender.com`. Checked 2026-10-02: `/healthz` and `/readyz` 200, public API 200, admin routes 401 without a token, `POST /api/v1/admin/password-reset/request` is registered but answers **503** because `GMAIL_EMAIL`/`GMAIL_PASSWORD` are not set on Render (`/readyz` is `degraded`; `email` and `expiry_notice` are off). Set a Google **App Password** (16 lowercase letters) there, and `EXPIRY_NOTICE_EMAIL`.
- **Inno dashboard production 404 on password reset:** `POST <host>/admin/password-reset/request` (no `/api/v1`) is 404 on production, which is exactly the dashboard's error. The dashboard's server-side `API_URL` on Vercel must be `https://core-backend-5cjs.onrender.com/api/v1` (and `NEXT_PUBLIC_API_URL` the same); redeploy after changing. Not confirmed: the Vercel settings could not be seen.
- **Cancelled on 2026-10-02 (by the user, in tenantcore):** Nelson Travel and Bayan Bogd (Bayan Bogd is the tenant behind carwash/carwash-web). E&S Discovery Mongolia is still active and its subscription **ends 2026-10-20**: after that its writes (including saving translations) return 402 until renewed. Plan question still open: E&S is on `starter`, the assistant had set `travel-pro`; ask the user, change nothing unasked.
- **Credentials:** the user typed a password in chat for sign-in during the session. It is stored nowhere. Suggest changing it. Never print `.env`.

Work was **paused with uncommitted changes** because the session context was filling. The code typechecks and lints; it has **not been clicked through in a browser** and is **not committed**.

- Branch: `master`. Last commit: `803bdd6  some change` (nothing from this session is committed here).
- **Uncommitted** (all part of one feature, the forgot-password page):
  - `src/app/forgot-password/` — new: `page.tsx`, `actions.ts`, `ForgotPasswordForm.tsx`
  - `src/app/login/LoginForm.tsx` — the old `login/page.tsx`, moved with `git mv`, now takes a `notice` prop and has a "Forgot password?" link
  - `src/app/login/page.tsx` — new thin **server** page that reads `?reset=1` and passes the banner text down
  - `src/proxy.ts` — `PUBLIC_PATHS = {'/login','/forgot-password'}`; without this the new page redirects straight back to `/login`
- Checks run: `npx tsc --noEmit` exit 0; `npx eslint src/app/forgot-password src/app/login src/proxy.ts --max-warnings=0` exit 0.

## What this app is
The E&S Travel Mongolia tenant admin (Next.js, React 19, server actions, Tailwind with custom tokens such as `bg-canvas`, `bg-panel`, `text-status-cancelled-text`). Runs on **:3001** (launch config `admin`). It talks to **digitalservice** (`API_BASE_URL`, default `http://localhost:8080/api/v1`) with the tenant's `TENANT_API_KEY`, which is **server-side only**: `src/lib/api/client.ts` must only be imported from server code.

> `AGENTS.md` in sibling Next apps says this Next version has breaking changes; read `node_modules/next/dist/docs/` before inventing patterns, and prefer copying what existing pages here already do.

## The feature
Self-service "forgot password" for the travel admin's users, mirroring the core admin's. Spec and plan live in **tenantcore**:
- `tenantcore/docs/superpowers/specs/2026-10-01-tenant-user-password-reset-design.md`
- `tenantcore/docs/superpowers/plans/2026-10-01-tenant-user-password-reset.md` (this app is **Task 5**)

Behaviour: step 1 asks for an email and always answers with wording that is true whether or not the account exists; step 2 takes the 6-digit code and a new password; success redirects to `/login?reset=1`, which shows "Password changed". The code step is its own component (`CodeStep`) so one attempt's error cannot carry into the next. Mismatched or short passwords are caught **before** the request, because the code is burned after 5 wrong guesses. `503` shows "Email isn't set up on this server"; `429` shows "Too many attempts". The backend is `POST /password-reset/request` and `/confirm` in digitalservice (committed, `cd75030`).

## What is left (plan Task 5, steps 3–4)
1. Start digitalservice (**:8080**), tenantcore (**:8092**, for mail) and this app (**:3001**).
2. Click through, checking each of these:
   - `/login` shows "Forgot password?" and it leads to `/forgot-password` (signed out). An unknown address advances to the code step with the same wording as a real one.
   - Mismatched passwords show an error **without** a request (watch the digitalservice log).
   - A wrong code shows exactly "that code is not valid — request a new one".
   - "Use a different email or send a new code" then a fresh request shows **no stale error**.
   - `/login?reset=1` shows the "Password changed" banner.
3. Commit: `feat: add a forgot-password page to the travel admin`.
4. Then **digitalservice Task 6** (the live reset with a real email). Use a **throwaway tenant and user with the email `munkherdene@bdsec.mn`**. **Do not complete a reset for E&S's real admin** (`enkhjin.erdenebuyan@gmail.com`): it would change their real password.

## Known limits and gotchas
- A reset does not end sessions already signed in (stateless tokens).
- Mail depends on tenantcore's Gmail App Password being valid (it is, as of today) and on `TENANTCORE_URL`/`TENANTCORE_SERVICE_KEY` in **digitalservice's** `.env`. Check `GET localhost:8080/readyz` for `password_reset: true`.
- Style here is **single quotes, no semicolons**. The core admin (`innonomads/admin`) uses double quotes and semicolons; don't mix.
- The 401 handling in this app redirects to `/login`; the reset actions deliberately carry no token, so a wrong code stays on the page.
- Stale `admin_session` cookies are harmless but make `/login` redirect to `/` for signed-in users.
